import ErrorAlert from "../../components/common/ErrorAlert";
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  changeBuyNowQuantity,
  changeCartQuantity,
  clearBuyNow,
  clearCart,
  removeCartItem,
} from "../../redux/cart/cartSlice";
import { useGetProductsQuery } from "../../redux/auth/productApi";
import { productOptions } from "../../components/product/productOptions";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

export default function Cart({ checkout = false }) {
  const dispatch = useDispatch(),
    navigate = useNavigate();
  const [params] = useSearchParams();
  const cart = useSelector((state) => state.cart);
  const buyNow = checkout && params.get("mode") === "buy-now";
  const items = buyNow ? (cart.buyNow ? [cart.buyNow] : []) : cart.items;
  const { data, isFetching, isError, error, refetch } = useGetProductsQuery(
    undefined,
    { skip: !items.length, refetchOnMountOrArgChange: true },
  );
  const products = Array.isArray(data?.data) ? data.data : [];
  const checked = Boolean(data) && !isFetching && !isError;
  const lines = items.map((item) => {
    const product = products.find((entry) => entry._id === item.productId);
    const stock =
      Number.isInteger(product?.stock) && product.stock >= 0
        ? product.stock
        : null;
    const totalQuantity = items
      .filter((entry) => entry.productId === item.productId)
      .reduce((sum, entry) => sum + entry.quantity, 0);
    const colors = productOptions(product?.color),
      sizes = productOptions(product?.size);
    const validPrice =
      typeof product?.price === "number" &&
      Number.isFinite(product.price) &&
      product.price >= 0;
    let issue = "";
    if (checked) {
      if (!product) issue = "This product is no longer available.";
      else if (!validPrice) issue = "A current price isn't available.";
      else if (stock === null)
        issue = "Stock availability hasn't been confirmed.";
      else if (totalQuantity > stock)
        issue =
          stock === 0
            ? "This product is out of stock."
            : `Only ${stock} units are available across colours and sizes. Reduce the quantity.`;
      else if (
        (colors.length ? !colors.includes(item.color) : Boolean(item.color)) ||
        (sizes.length ? !sizes.includes(item.size) : Boolean(item.size))
      )
        issue =
          "This colour or size is no longer listed. Choose your options again.";
    }
    return {
      ...item,
      product,
      stock,
      issue,
      price: validPrice ? product.price : item.price,
      maxQuantity:
        stock === null ? 0 : Math.max(0, stock - totalQuantity + item.quantity),
    };
  });
  const issues = lines.some((line) => line.issue);
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal =
    lines.reduce(
      (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
      0,
    ) / 100;
  const canContinue = checked && !issues && items.length > 0;
  const needsLogin = error?.status === 401 || error?.status === 403;
  const updateQuantity = (line, next) => {
    if (!checked || line.stock === null) return;
    dispatch(
      buyNow
        ? changeBuyNowQuantity({ quantity: next, stock: line.stock })
        : changeCartQuantity({
            key: line.key,
            quantity: next,
            stock: line.stock,
          }),
    );
  };

  return (
    <Container
      component="main"
      py={{ base: 32, md: 56 }}
      mih="60vh"
      style={{ userSelect: "text", overflowWrap: "anywhere" }}
    >
      <Breadcrumbs mb={32}>
        <Anchor component={Link} to="/" size="sm" c="dimmed">
          Home
        </Anchor>
        <Anchor component={Link} to="/shop" size="sm" c="dimmed">
          Shop
        </Anchor>
        <Text size="sm">{checkout ? "Checkout review" : "Cart"}</Text>
      </Breadcrumbs>
      <Group justify="space-between" mb={32} gap="md">
        <Box>
          <Text size="sm" c="dimmed">
            {quantity} {quantity === 1 ? "item" : "items"}
            {buyNow
              ? " in your Buy Now selection. Your cart is unchanged."
              : " · saved on this browser."}
          </Text>
        </Box>
        {!checkout && items.length > 0 && (
          <Button
            variant="subtle"
            color="gray"
            leftSection={<Trash2 size={16} />}
            onClick={() => dispatch(clearCart())}
          >
            Clear bag
          </Button>
        )}
      </Group>
      {!items.length ? (
        <Stack align="center" ta="center" py={60} gap="lg">
          <ShoppingBag size={48} strokeWidth={1.2} />
          <Title order={2} fw={500} size={28}>
            {checkout
              ? "Nothing to review yet."
              : "Your bag is waiting for a little inspiration."}
          </Title>
          <Text size="sm" c="dimmed">
            Explore the collection and choose something that feels like you.
          </Text>
          <Button
            component={Link}
            to="/shop"
            color="dark"
            radius={0}
            size="md"
            rightSection={<ArrowRight size={17} />}
          >
            Explore the collection
          </Button>
        </Stack>
      ) : (
        <>
          {isError && (
            <ErrorAlert
              color="gray"
              title={
                needsLogin
                  ? "Sign in to check availability"
                  : "We couldn't check the latest prices and stock"
              }
              mb="xl"
            >
              <Text size="sm" mb="md">
                Your saved selection is still here. Reconnect before continuing.
              </Text>
              <Group>
                {needsLogin && (
                  <Button component={Link} to="/login" color="dark">
                    Sign in
                  </Button>
                )}
                <Button variant="default" onClick={refetch}>
                  Try again
                </Button>
              </Group>
            </ErrorAlert>
          )}
          {checkout && (
            <Alert color="gray" title="Checkout review" mb="xl">
              <Text size="sm">
                Check your sizes, colours and quantities below. Orders and
                payments are currently unavailable. Your selection is saved
                without placing an order.
              </Text>
            </Alert>
          )}
          <Grid gutter={{ base: 32, md: 48 }}>
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="xl">
                {lines.map((line) => (
                  <Box
                    key={line.key}
                    pb="xl"
                    style={{
                      borderBottom:
                        "1px solid var(--mantine-color-default-border)",
                    }}
                  >
                    <Group
                      wrap="nowrap"
                      align="start"
                      gap={{ base: 16, sm: 24 }}
                    >
                      <Anchor
                        component={Link}
                        to={`/product/${line.productId}`}
                        style={{ flexShrink: 0 }}
                      >
                        <Image
                          src={line.product?.image || line.image || null}
                          alt={line.product?.name || line.name}
                          w={{ base: 82, sm: 120 }}
                          h={{ base: 112, sm: 155 }}
                          fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='155'%3E%3Crect width='100%25' height='100%25' fill='%23e6e3dc'/%3E%3C/svg%3E"
                        />
                      </Anchor>
                      <Stack gap="sm" style={{ minWidth: 0, flex: 1 }}>
                        <Group
                          justify="space-between"
                          align="start"
                          gap="xs"
                          wrap="nowrap"
                        >
                          <Anchor
                            component={Link}
                            to={`/product/${line.productId}`}
                            c="var(--mantine-color-text)"
                            fw={500}
                            size="sm"
                            style={{ flex: 1, minWidth: 0 }}
                          >
                            {line.product?.name || line.name}
                          </Anchor>
                          <ActionIcon
                            aria-label={`Remove ${line.name} from ${buyNow ? "checkout" : "cart"}`}
                            variant="subtle"
                            color="gray"
                            size={44}
                            onClick={() =>
                              dispatch(
                                buyNow
                                  ? clearBuyNow()
                                  : removeCartItem(line.key),
                              )
                            }
                          >
                            <Trash2 size={17} />
                          </ActionIcon>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {[
                            line.color && `Colour: ${line.color}`,
                            line.size && `Size: ${line.size}`,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "Standard option"}
                        </Text>
                        <Text size="sm">{money(line.price)} each</Text>
                        <Group justify="space-between" gap="md">
                          <Group
                            gap={8}
                            wrap="nowrap"
                            aria-label={`Quantity for ${line.name}`}
                          >
                            <ActionIcon
                              size={38}
                              variant="default"
                              aria-label={`Decrease quantity of ${line.name}`}
                              disabled={
                                !checked ||
                                line.quantity <= 1 ||
                                line.stock === null
                              }
                              onClick={() =>
                                updateQuantity(line, line.quantity - 1)
                              }
                            >
                              <Minus size={15} />
                            </ActionIcon>
                            <Text ta="center" w={28} aria-live="polite">
                              {line.quantity}
                            </Text>
                            <ActionIcon
                              size={38}
                              variant="default"
                              aria-label={`Increase quantity of ${line.name}`}
                              disabled={
                                !checked ||
                                Boolean(line.issue) ||
                                line.quantity >= line.maxQuantity
                              }
                              onClick={() =>
                                updateQuantity(line, line.quantity + 1)
                              }
                            >
                              <Plus size={15} />
                            </ActionIcon>
                          </Group>
                          <Text size="sm" fw={600}>
                            {money(
                              (Math.round(line.price * 100) * line.quantity) /
                                100,
                            )}
                          </Text>
                        </Group>
                        {line.issue && (
                          <Text size="xs" c="red" role="status">
                            {line.issue}{" "}
                            <Anchor
                              component={Link}
                              to={`/product/${line.productId}`}
                              size="xs"
                            >
                              View product
                            </Anchor>
                          </Text>
                        )}
                      </Stack>
                    </Group>
                  </Box>
                ))}
              </Stack>
              <Anchor
                component={Link}
                to="/shop"
                size="sm"
                c="var(--mantine-color-text)"
                mt="xl"
                style={{
                  minHeight: 44,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ArrowLeft size={16} /> Continue shopping
              </Anchor>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Box
                p={{ base: 24, md: 28 }}
                bg="var(--mantine-color-default-hover)"
                pos={{ base: "static", lg: "sticky" }}
                top={110}
              >
                <Title order={2} fw={500} size={24} mb="xl">
                  Your summary
                </Title>
                <Group justify="space-between" mb="md">
                  <Text size="sm">Items</Text>
                  <Text size="sm">{quantity}</Text>
                </Group>
                <Group justify="space-between" mb="md">
                  <Text size="sm">Estimated subtotal</Text>
                  <Text size="lg" fw={600}>
                    {money(subtotal)}
                  </Text>
                </Group>
                <Text c="dimmed" size="xs" lh={1.7}>
                  Product subtotal only. Checkout is currently available for
                  review. Items in your bag are not reserved.
                </Text>
                <Divider my="xl" />
                {isFetching ? (
                  <Badge color="gray" variant="light" mb="md">
                    Checking availability…
                  </Badge>
                ) : checked && !issues ? (
                  <Text c="dimmed" size="xs" mb="md">
                    Prices and availability are up to date.
                  </Text>
                ) : null}
                {checkout ? (
                  <Button disabled fullWidth radius={0} size="md">
                    Ordering currently unavailable
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (canContinue) navigate("/checkout");
                    }}
                    disabled={!canContinue}
                    loading={isFetching}
                    color="dark"
                    fullWidth
                    radius={0}
                    size="md"
                    rightSection={<ArrowRight size={17} />}
                  >
                    Proceed to checkout
                  </Button>
                )}
                {issues && (
                  <Text size="xs" c="red" mt="md">
                    Update the highlighted items before continuing.
                  </Text>
                )}
                {checkout && (
                  <Button
                    component={Link}
                    to="/cart"
                    fullWidth
                    variant="default"
                    radius={0}
                    mt="md"
                  >
                    View shopping bag
                  </Button>
                )}
              </Box>
            </Grid.Col>
          </Grid>
        </>
      )}
    </Container>
  );
}
