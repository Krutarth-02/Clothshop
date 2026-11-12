import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import {
  Alert, Anchor, Badge, Box, Button, Container, Divider, Grid, Group,
  Image, Radio, SimpleGrid, Stack, Stepper, Text, TextInput, Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { CreditCard, PackageCheck, Truck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearBuyNow, clearCart } from "../../redux/cart/cartSlice";
import { useGetWelcomeCouponQuery } from "../../redux/coupons/couponApi";
import { useGetProfileQuery } from "../../redux/auth/authApi";
import { useGetCheckoutDetailsQuery, useQuoteCheckoutMutation, useCreateCodOrderMutation } from "../../redux/payments/paymentApi";

const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2,
}).format(amount);

const addressFields = [
  { name: "fullName", label: "Full name", autoComplete: "shipping name", maxLength: 100 },
  { name: "phone", label: "Mobile number", autoComplete: "shipping tel-national", inputMode: "tel", maxLength: 10 },
  { name: "addressLine", label: "House, street and area", autoComplete: "shipping street-address", maxLength: 300 },
  { name: "city", label: "City", autoComplete: "shipping address-level2", maxLength: 100 },
  { name: "state", label: "State", autoComplete: "shipping address-level1", maxLength: 100 },
  { name: "postalCode", label: "PIN code", autoComplete: "shipping postal-code", inputMode: "numeric", maxLength: 6 },
];

function validateAddress(address) {
  const errors = {};
  for (const field of addressFields) {
    if (!address[field.name]?.trim()) errors[field.name] = `${field.label} is required.`;
  }
  if (!/^[6-9]\d{9}$/.test(address.phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (!/^[1-9]\d{5}$/.test(address.postalCode)) errors.postalCode = "Enter a valid 6-digit PIN code.";
  return errors;
}

function PaymentOptions() {
  return (
    <Radio.Group value="cod" label="Choose how to pay" description="Pay when your order arrives." size="md">
      <Stack mt="lg" gap="md">
        <Box p="lg" style={{ border: "1px solid var(--mantine-color-blue-5)", borderRadius: 8 }}>
          <Group justify="space-between">
            <Radio value="cod" label="Cash on delivery" description="Pay the delivery partner on arrival." />
            <Truck size={22} />
          </Group>
        </Box>
        {[
          ["upi", "UPI", "Google Pay, PhonePe and other UPI apps"],
          ["card", "Credit / debit card", "Visa, Mastercard and RuPay"],
          ["netbanking", "Net banking", "Pay using your bank account"],
        ].map(([value, label, description]) => (
          <Box key={value} p="lg" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: 8 }}>
            <Group justify="space-between">
              <Radio value={value} label={label} description={description} disabled />
              <Badge variant="light" color="gray">Coming soon</Badge>
            </Group>
          </Box>
        ))}
      </Stack>
    </Radio.Group>
  );
}

function OrderSummary({ quote }) {
  return (
    <Stack gap="sm">
      <Group justify="space-between"><Text>Subtotal</Text><Text>{money(quote.subtotal)}</Text></Group>
      {quote.couponCode && <Group justify="space-between"><Text size="sm">Welcome discount</Text><Text c="green">-{money(quote.discountAmount)}</Text></Group>}
      <Group justify="space-between"><Text>Delivery</Text><Text c="green">Free</Text></Group>
      <Divider />
      <Group justify="space-between"><Text fw={600}>Pay on delivery</Text><Text size="xl" fw={600}>{money(quote.totalAmount)}</Text></Group>
      <Text size="xs" c="dimmed">All amounts in INR. No payment is collected online.</Text>
    </Stack>
  );
}

export default function Checkout() {
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const compact = useMediaQuery("(max-width: 48em)");
  const cart = useSelector((state) => state.cart);
  const buyNow = params.get("mode") === "buy-now";
  const selectedItems = buyNow ? (cart.buyNow ? [cart.buyNow] : []) : cart.items;
  const [activeStep, setActiveStep] = useState(0);
  const { data: profile } = useGetProfileQuery();
  const { currentData: details, isFetching: isLoadingDetails, isError: detailsUnavailable } = useGetCheckoutDetailsQuery(profile?.data?._id, {
    skip: !profile?.data?._id || !selectedItems.length,
    refetchOnMountOrArgChange: true,
  });
  const [couponSelected, setCouponSelected] = useState(Boolean(params.get("coupon")));
  const [error, setError] = useState("");
  const [quote, setQuote] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [quoteCheckout, { isLoading: isQuoting }] = useQuoteCheckoutMutation();
  const [createCodOrder, { isLoading: isPlacing }] = useCreateCodOrderMutation();
  const submission = useRef(null);
  const submissionLock = useRef(false);
  const { data: couponData } = useGetWelcomeCouponQuery(undefined, { refetchOnMountOrArgChange: true });
  const coupon = couponData?.data;
  const busy = isQuoting || isPlacing;

  const editedFields = useRef(new Set());
  const formik = useFormik({
    initialValues: Object.fromEntries(addressFields.map(({ name }) => [name, ""])),
    validate: validateAddress,
    onSubmit: () => {
      setError("");
      setActiveStep(1);
    },
  });
  const { values: address, setValues } = formik;

  useEffect(() => {
    const saved = details?.data?.shippingAddress;
    if (!saved) return;
    // Preserve manual edits, including fields the user deliberately cleared.
    setValues((current) => Object.fromEntries(addressFields.map(({ name }) => [
      name, editedFields.current.has(name) ? current[name] : (saved[name] ?? ""),
    ])), true);
  }, [details, setValues]);

  async function reviewOrder() {
    if (busy || submissionLock.current) return;
    setError("");
    const checkout = {
      items: selectedItems.map(({ productId, quantity, color, size }) => ({ productId, quantity, color, size })),
      shippingAddress: address,
      paymentMethod: "cod",
      couponCode: couponSelected && coupon?.status === "available" ? coupon.code : "",
    };
    try {
      const response = await quoteCheckout(checkout).unwrap();
      setQuote(response.data);
      const previous = submission.current;
      // Keep the same request ID when reviewing an unchanged order after a retry.
      const unchanged = previous && JSON.stringify(previous.items) === JSON.stringify(checkout.items)
        && JSON.stringify(previous.shippingAddress) === JSON.stringify(checkout.shippingAddress)
        && previous.couponCode === checkout.couponCode
        && previous.expectedTotalPaise === response.data.totalPaise;
      submission.current = {
        ...checkout,
        expectedTotalPaise: response.data.totalPaise,
        requestId: unchanged ? previous.requestId : crypto.randomUUID(),
      };
      setActiveStep(2);
    } catch (failure) {
      setError(failure?.data?.message || "Could not check your order. Please try again.");
    }
  }

  async function placeOrder() {
    if (busy || submissionLock.current || !submission.current) return;
    submissionLock.current = true;
    setError("");
    try {
      // Reusing this request ID prevents duplicate orders after a network retry.
      const response = await createCodOrder(submission.current).unwrap();
      setConfirmedOrder(response.data);
      dispatch(buyNow ? clearBuyNow() : clearCart());
      setActiveStep(3);
    } catch (failure) {
      setError(failure?.data?.message || "We couldn't confirm the order. Retry this checkout to check its status.");
    } finally {
      submissionLock.current = false;
    }
  }

  if (!selectedItems.length && !confirmedOrder) {
    return <Container py={70}><Stack align="center"><Title order={1} size={30}>Your bag is empty</Title><Button component={Link} to="/shop">Explore the collection</Button></Stack></Container>;
  }

  return (
    <Container component="main" size="lg" py={{ base: 28, md: 56 }} style={{ userSelect: "text" }}>
      <Anchor component={Link} to="/cart" c="dimmed" size="sm">Back to your bag</Anchor>
      <Title order={1} fw={500} mt="md" mb={32}>Checkout</Title>
      <Box p={{ base: 18, md: 28 }} style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: 10 }}>
        <Stepper active={activeStep} orientation={compact ? "vertical" : "horizontal"} color="blue" allowNextStepsSelect={false}>
          <Stepper.Step label="First step" description="Delivery address" />
          <Stepper.Step label="Second step" description="Payment method" />
          <Stepper.Step label="Final step" description="Review & place order" />
        </Stepper>
      </Box>
      {error && <Alert color="red" title="Please check your order" mt="xl" role="alert">{error}</Alert>}

      {activeStep === 0 && (
        <Box component="form" onSubmit={formik.handleSubmit} noValidate mt={36} maw={760}>
          <Title order={2} size={24} fw={500} mb="sm">Where should we deliver?</Title>
          <Text size="sm" c="dimmed" mb="xl">Delivery is currently available within India.</Text>
          <Text size="sm" c="dimmed" mb="lg" role="status">
            {isLoadingDetails ? "Loading your saved details..." : detailsUnavailable
              ? "Saved details could not be loaded. You can enter your delivery details below."
              : "Available saved details are filled in. Check them and complete any missing fields."}
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {addressFields.map((field) => (
              <TextInput key={field.name} {...field} required value={address[field.name]}
                error={(formik.touched[field.name] || formik.submitCount > 0) && formik.errors[field.name]} size="md"
                onBlur={formik.handleBlur}
                onChange={(event) => {
                  editedFields.current.add(field.name);
                  formik.handleChange(event);
                }} />
            ))}
          </SimpleGrid>
          <TextInput label="Country" value="India" readOnly mt="lg" size="md" />
          <Button type="submit" mt="xl" size="md">Continue to payment</Button>
        </Box>
      )}

      {activeStep === 1 && (
        <Stack mt={36} maw={760} gap="xl">
          <Title order={2} size={24} fw={500}>Payment method</Title>
          <PaymentOptions />
          {coupon && (
            <Box p="lg" style={{ border: "1px dashed var(--mantine-color-default-border)", borderRadius: 8 }}>
              <Group justify="space-between">
                <Box><Text fw={500}>{coupon.code}</Text><Text size="sm" c="dimmed">10% welcome discount</Text></Box>
                <Button variant="default" disabled={coupon.status !== "available" || busy} onClick={() => setCouponSelected(!couponSelected)}>
                  {coupon.status !== "available" ? "Unavailable" : couponSelected ? "Remove coupon" : "Apply coupon"}
                </Button>
              </Group>
            </Box>
          )}
          <Group><Button variant="default" disabled={busy} onClick={() => setActiveStep(0)}>Back</Button><Button onClick={reviewOrder} loading={isQuoting}>Review order</Button></Group>
        </Stack>
      )}

      {activeStep === 2 && quote && (
        <Grid mt={36} gutter={32}>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Title order={2} size={24} fw={500} mb="xl">Review your order</Title>
            <Stack gap="lg">
              {quote.items.map((item, index) => (
                <Group key={`${item.productId}-${index}`} wrap="nowrap" align="start">
                  <Image src={item.image || null} alt={item.name} w={70} h={90} fit="cover" />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={500}>{item.name}</Text><Text size="sm" c="dimmed">{[item.color, item.size].filter(Boolean).join(" / ") || "Standard option"}</Text>
                    <Text size="sm">{item.quantity} x {money(item.unitPrice)}</Text>
                  </Box>
                  <Text size="sm">{money(item.lineTotal)}</Text>
                </Group>
              ))}
            </Stack>
            <Divider my="xl" />
            <Title order={3} size={18} mb="sm">Deliver to</Title>
            <Text>{quote.shippingAddress.fullName}</Text>
            <Text size="sm">{quote.shippingAddress.addressLine}</Text>
            <Text size="sm">{quote.shippingAddress.city}, {quote.shippingAddress.state} - {quote.shippingAddress.postalCode}</Text>
            <Text size="sm">{quote.shippingAddress.phone}</Text>
            <Button variant="subtle" mt="md" disabled={busy} onClick={() => setActiveStep(0)}>Edit delivery details</Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Box p="xl" bg="var(--mantine-color-default-hover)" style={{ borderRadius: 10 }}>
              <Group mb="xl"><CreditCard size={22} /><Title order={3} size={20}>Cash on delivery</Title></Group>
              <OrderSummary quote={quote} />
              <Button fullWidth size="md" mt="xl" loading={isPlacing} onClick={placeOrder}>Place COD order</Button>
              <Button fullWidth variant="default" mt="md" disabled={busy} onClick={() => setActiveStep(1)}>Back to payment</Button>
            </Box>
          </Grid.Col>
        </Grid>
      )}

      {activeStep === 3 && confirmedOrder && (
        <Stack align="center" ta="center" py={50} gap="lg" aria-live="polite">
          <PackageCheck size={56} color="var(--mantine-color-green-6)" />
          <Title order={2} fw={500}>Your order is confirmed</Title>
          <Text c="dimmed">Reference #{confirmedOrder._id.slice(-8).toUpperCase()}</Text>
          <Text>Pay {money(confirmedOrder.totalAmount)} when your order arrives.</Text>
          {confirmedOrder.couponCode && <Badge color="green">Welcome coupon used</Badge>}
          <Group><Button component={Link} to="/profile?section=orders" variant="default">View order history</Button><Button component={Link} to="/shop">Continue shopping</Button></Group>
        </Stack>
      )}
    </Container>
  );
}
