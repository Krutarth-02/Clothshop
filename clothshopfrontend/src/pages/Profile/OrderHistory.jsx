import {
  Anchor,
  Badge,
  Button,
  Divider,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Package, RefreshCw, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetPaymentsQuery } from "../../redux/auth/authApi";
import ErrorAlert from "../../components/common/ErrorAlert";
import LoadingState from "../../components/common/Loader";

const money = (amount) =>
  typeof amount === "number" && Number.isFinite(amount)
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(amount)
    : "Unavailable";
const statuses = {
  pending: { label: "Payment pending", color: "orange" },
  paid: { label: "Paid", color: "green" },
  failed: { label: "Payment failed", color: "red" },
  refunded: { label: "Refunded", color: "blue" },
};

export default function OrderHistory() {
  const { data, isLoading, isFetching, error, refetch } = useGetPaymentsQuery(
    undefined,
    { refetchOnMountOrArgChange: true },
  );
  const records = Array.isArray(data?.data) ? data.data : [];
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={5}>
          <Title order={2} size={26} fw={500}>
            Order History
          </Title>
          <Text size="sm" c="dimmed">
            View your purchase references, payment amounts and status.
          </Text>
        </Stack>
        <Button
          variant="default"
          size="xs"
          leftSection={<RefreshCw size={14} />}
          onClick={refetch}
          loading={isFetching}
        >
          Refresh
        </Button>
      </Group>
      {error ? (
        <ErrorAlert
          title="Unable to load order history"
          message="Please try again when your connection is available."
          onRetry={refetch}
        />
      ) : isLoading || (isFetching && !data) ? (
        <LoadingState label="Loading order history" minHeight={240} />
      ) : !records.length ? (
        <Paper withBorder radius="md" p={{ base: 24, sm: 48 }}>
          <Stack align="center" ta="center" gap="md">
            <ThemeIcon size={64} radius="xl" variant="light" color="gray">
              <Package size={30} strokeWidth={1.4} />
            </ThemeIcon>
            <Title order={3} size={23} fw={500}>
              No orders yet
            </Title>
            <Text size="sm" c="dimmed" maw={350}>
              There are no purchases to show for this account. Explore the
              collection and save your favourites for later.
            </Text>
            <Button
              component={Link}
              to="/shop"
              color="dark"
              leftSection={<ShoppingBag size={16} />}
            >
              Explore the collection
            </Button>
          </Stack>
        </Paper>
      ) : (
        records.map((payment) => {
          const status = statuses[payment.status] || {
            label: "Status unavailable",
            color: "gray",
          };
          const products = Array.isArray(payment.productId)
            ? payment.productId
            : [];
          const createdAt = new Date(payment.createdAt);
          return (
            <Paper
              key={payment._id}
              withBorder
              radius="md"
              p={{ base: 18, sm: 24 }}
            >
              <Group justify="space-between" align="flex-start" gap="sm">
                <Stack gap={4}>
                  <Text fw={600} size="sm">
                    Reference #{String(payment._id).slice(-8).toUpperCase()}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {Number.isNaN(createdAt.getTime())
                      ? "Date unavailable"
                      : createdAt.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                  </Text>
                </Stack>
                <Badge color={status.color} variant="light">
                  {status.label}
                </Badge>
              </Group>
              <Divider my="md" />
              <Stack gap="md">
                {products.length ? (
                  products.map((product, index) => {
                    const available =
                      product && typeof product === "object" && product._id;
                    return (
                      <Group
                        key={available ? `${product._id}-${index}` : index}
                        wrap="nowrap"
                        gap="md"
                      >
                        <Image
                          src={available ? product.image : null}
                          alt={available ? product.name : "Unavailable product"}
                          w={54}
                          h={68}
                          radius="sm"
                          style={{ flexShrink: 0 }}
                          fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='54' height='68'%3E%3Crect width='100%25' height='100%25' fill='%23e6e3dc'/%3E%3C/svg%3E"
                        />
                        <Stack gap={4} style={{ minWidth: 0 }}>
                          {available ? (
                            <Anchor
                              component={Link}
                              to={`/product/${product._id}`}
                              c="var(--mantine-color-text)"
                              size="sm"
                              fw={500}
                            >
                              {product.name}
                            </Anchor>
                          ) : (
                            <Text size="sm" c="dimmed">
                              Product no longer available
                            </Text>
                          )}
                          {available && product.category && (
                            <Text size="xs" c="dimmed">
                              {product.category}
                            </Text>
                          )}
                        </Stack>
                      </Group>
                    );
                  })
                ) : (
                  <Text size="sm" c="dimmed">
                    Product details are no longer available.
                  </Text>
                )}
              </Stack>
              <Divider my="md" />
              <Group justify="space-between" gap="md">
                <Text size="xs" c="dimmed">
                  {payment.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : payment.paymentMethod === "online"
                      ? "Online payment"
                      : "Payment method unavailable"}
                </Text>
                <Stack gap={2} align="flex-end">
                  <Text size="xs" c="dimmed">
                    Total amount
                  </Text>
                  <Text fw={600}>{money(payment.totalAmount)}</Text>
                </Stack>
              </Group>
            </Paper>
          );
        })
      )}
    </Stack>
  );
}
