import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Image,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  ArrowUpRight,
  Boxes,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  Tags,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import BrandLogo from "../../components/common/BrandLogo";
import {
  useGetProfileQuery,
  useLogoutMutation,
} from "../../redux/auth/authApi";
import {
  useGetAdminProductsQuery,
  useDeleteAdminProductMutation,
} from "../../redux/admin/adminApi";
import { api } from "../../redux/api/api";
import ProductEditor from "./ProductEditor";

const money = (value) =>
  typeof value === "number"
    ? "\u20b9" + value.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : "Not set";

export default function AdminDashboard() {
  const { data: profile } = useGetProfileQuery();
  const { data, isLoading, isFetching, error, refetch } =
    useGetAdminProductsQuery();
  const [removeProduct, { isLoading: deleting }] =
    useDeleteAdminProductMutation();
  const [logout, { isLoading: signingOut }] = useLogoutMutation();
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [editor, setEditor] = useState(null);
  const [removing, setRemoving] = useState(null);
  const dispatch = useDispatch(),
    navigate = useNavigate();
  const products = Array.isArray(data?.data) ? data.data : [];
  const categories = [
    ...new Set([
      "Women",
      "Men",
      "Accessories",
      ...products.map((product) => product.category).filter(Boolean),
    ]),
  ];
  const knownStock = (product) =>
    Number.isSafeInteger(product.stock) && product.stock >= 0;
  const matches = products.filter((product) => {
    const match = [product.name, product.category].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    );
    const stockMatch =
      stockFilter === "all" ||
      (stockFilter === "low" &&
        knownStock(product) &&
        product.stock > 0 &&
        product.stock <= 5) ||
      (stockFilter === "out" && product.stock === 0) ||
      (stockFilter === "unset" && !knownStock(product));
    return match && stockMatch;
  });
  const signOut = async () => {
    try {
      await logout().unwrap();
      localStorage.removeItem("userId");
      dispatch(api.util.resetApiState());
      navigate("/login", { replace: true });
    } catch {
      toast.error("Unable to sign out. Please try again.");
    }
  };
  const confirmDelete = async () => {
    try {
      await removeProduct(removing._id).unwrap();
      setRemoving(null);
      toast.success("Product deleted");
    } catch (failure) {
      toast.error(failure?.data?.message || "Unable to delete product");
    }
  };
  const statistics = [
    [<Package size={20} strokeWidth={1.5} />, "Products", products.length],
    [
      <Boxes size={20} strokeWidth={1.5} />,
      "Units available",
      products.reduce(
        (sum, product) => sum + (knownStock(product) ? product.stock : 0),
        0,
      ),
    ],
    [
      <TriangleAlert size={20} strokeWidth={1.5} />,
      "Low stock",
      products.filter(
        (product) =>
          knownStock(product) && product.stock > 0 && product.stock <= 5,
      ).length,
    ],
    [
      <Tags size={20} strokeWidth={1.5} />,
      "Categories",
      new Set(products.map((product) => product.category).filter(Boolean)).size,
    ],
  ];
  const editable = !error && !isLoading;
  return (
    <Box mih="100dvh" bg="var(--mantine-color-default-hover)">
      <Box
        component="header"
        bg="var(--mantine-color-body)"
        style={{
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Container py="md">
          <Group justify="space-between" gap="md">
            <Group gap="lg">
              <Anchor
                component={Link}
                to="/"
                c="var(--mantine-color-text)"
                underline="never"
                aria-label="Cevraliq home"
              >
                <BrandLogo />
              </Anchor>
              <Badge variant="light" color="gray">
                Store admin
              </Badge>
            </Group>
            <Group gap="xs">
              <Button
                component={Link}
                to="/"
                variant="subtle"
                color="gray"
                rightSection={<ArrowUpRight size={16} />}
              >
                View store
              </Button>
              <Button
                variant="default"
                leftSection={<LogOut size={16} />}
                loading={signingOut}
                onClick={signOut}
              >
                Sign out
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>
      <Container component="main" py={{ base: 32, md: 48 }}>
        <Group justify="space-between" align="flex-end" mb="xl">
          <Box>
            <Text size="xs" c="dimmed" mb="sm" style={{ letterSpacing: 2 }}>
              CEVRALIQ / STORE MANAGEMENT
            </Text>
            <Title order={1} fw={500} size="clamp(30px, 4vw, 44px)">
              Your store, at a glance.
            </Title>
            <Text c="dimmed" size="sm" mt="sm">
              Welcome, {profile?.data?.fullName || "admin"}. Manage your
              catalogue and keep your inventory up to date.
            </Text>
          </Box>
          <Button
            color="dark"
            leftSection={<Plus size={18} />}
            disabled={!editable}
            onClick={() => setEditor({})}
          >
            Add product
          </Button>
        </Group>
        {error ? (
          <Alert
            color="red"
            title={
              error.status === 403
                ? "Administrator access required"
                : "Unable to load your store"
            }
            mb="xl"
          >
            <Text size="sm">
              {error.data?.message || "Check your connection and try again."}
            </Text>
            {error.status !== 403 && (
              <Button mt="md" variant="default" onClick={refetch}>
                Retry
              </Button>
            )}
          </Alert>
        ) : (
          <>
            <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="lg" mb={32}>
              {statistics.map(([icon, label, value]) => (
                <Paper key={label} p="xl" withBorder radius="md">
                  <Group justify="space-between" mb="lg">
                    <Text size="sm" c="dimmed">
                      {label}
                    </Text>
                    {icon}
                  </Group>
                  {isLoading ? (
                    <Skeleton h={36} w={70} />
                  ) : (
                    <Text size="32px" fw={600} lh={1}>
                      {value.toLocaleString("en-IN")}
                    </Text>
                  )}
                </Paper>
              ))}
            </SimpleGrid>
            <Paper withBorder radius="md" p={{ base: 16, sm: 24 }}>
              <Group justify="space-between" align="center" mb="lg">
                <Box>
                  <Title order={2} size={24} fw={500}>
                    Product inventory
                  </Title>
                  <Text size="xs" c="dimmed" mt={5}>
                    {isFetching
                      ? "Updating catalogue..."
                      : matches.length + " products shown"}
                  </Text>
                </Box>
                <Group gap="sm" style={{ flex: "1 1 380px", maxWidth: 560 }}>
                  <TextInput
                    aria-label="Search product inventory"
                    placeholder="Search products or categories"
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    leftSection={<Search size={16} />}
                    style={{ flex: "1 1 220px", minWidth: 0 }}
                  />
                  <Select
                    aria-label="Filter by inventory status"
                    value={stockFilter}
                    onChange={setStockFilter}
                    allowDeselect={false}
                    data={[
                      { value: "all", label: "All stock" },
                      { value: "low", label: "Low stock (1-5)" },
                      { value: "out", label: "Out of stock" },
                      { value: "unset", label: "Stock not set" },
                    ]}
                    style={{ flex: "1 1 170px", minWidth: 0 }}
                  />
                </Group>
              </Group>
              {isLoading ? (
                <Stack>
                  {[1, 2, 3, 4].map((row) => (
                    <Skeleton key={row} h={64} />
                  ))}
                </Stack>
              ) : matches.length ? (
                <Table.ScrollContainer minWidth={760}>
                  <Table
                    verticalSpacing="md"
                    horizontalSpacing="sm"
                    highlightOnHover
                    aria-label="Store product inventory"
                  >
                    <Table.Thead>
                      <Table.Tr>
                        {[
                          "Product",
                          "Category",
                          "Price",
                          "Stock",
                          "Actions",
                        ].map((label) => (
                          <Table.Th key={label}>{label}</Table.Th>
                        ))}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {matches.map((product) => (
                        <Table.Tr key={product._id}>
                          <Table.Td>
                            <Group wrap="nowrap">
                              <Image
                                src={product.image || null}
                                alt=""
                                w={48}
                                h={60}
                                radius="sm"
                                fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='60'%3E%3Crect width='100%25' height='100%25' fill='%23e6e3dc'/%3E%3C/svg%3E"
                              />
                              <Box maw={260}>
                                <Anchor
                                  component={Link}
                                  to={"/product/" + product._id}
                                  c="var(--mantine-color-text)"
                                  size="sm"
                                >
                                  {product.name}
                                </Anchor>
                              </Box>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {product.category || "Uncategorised"}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" style={{ whiteSpace: "nowrap" }}>
                              {money(product.price)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              variant="light"
                              color={
                                !knownStock(product)
                                  ? "gray"
                                  : product.stock === 0
                                    ? "red"
                                    : product.stock <= 5
                                      ? "orange"
                                      : "green"
                              }
                            >
                              {knownStock(product)
                                ? product.stock + " units"
                                : "Not set"}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={4} wrap="nowrap">
                              <ActionIcon
                                size={40}
                                variant="subtle"
                                color="gray"
                                aria-label={"Edit " + product.name}
                                onClick={() => setEditor(product)}
                              >
                                <Pencil size={17} />
                              </ActionIcon>
                              <ActionIcon
                                size={40}
                                variant="subtle"
                                color="red"
                                aria-label={"Delete " + product.name}
                                onClick={() => setRemoving(product)}
                              >
                                <Trash2 size={17} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              ) : (
                <Stack align="center" ta="center" py={48}>
                  <Package size={32} strokeWidth={1.4} />
                  <Title order={3} size={22}>
                    {products.length
                      ? "No matching products"
                      : "Your catalogue starts here"}
                  </Title>
                  <Text c="dimmed" size="sm">
                    {products.length
                      ? "Try a different search or stock filter."
                      : "Add your first product to make it available in the store."}
                  </Text>
                </Stack>
              )}
            </Paper>
            <Text size="xs" c="dimmed" mt="lg">
              Inventory counts use the current catalogue. Low stock means 1-5
              units. Products with stock not set are excluded from unit totals.
            </Text>
          </>
        )}
      </Container>
      {editor && (
        <ProductEditor
          key={editor._id || "new"}
          product={editor}
          categories={categories}
          onClose={() => setEditor(null)}
        />
      )}
      <Modal
        opened={Boolean(removing)}
        onClose={() => !deleting && setRemoving(null)}
        centered
        title="Delete this product?"
        closeOnClickOutside={!deleting}
        closeOnEscape={!deleting}
        closeButtonProps={{ disabled: deleting }}
      >
        <Text size="sm">
          Remove {removing?.name} from the catalogue? This permanently deletes
          the product. Existing cart entries will be marked unavailable.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button
            variant="default"
            disabled={deleting}
            onClick={() => setRemoving(null)}
          >
            Cancel
          </Button>
          <Button color="red" loading={deleting} onClick={confirmDelete}>
            Delete product
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
