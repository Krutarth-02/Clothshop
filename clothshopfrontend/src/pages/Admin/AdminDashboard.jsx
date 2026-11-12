import { useState } from "react";
import { ActionIcon, Anchor, Badge, Box, Button, Grid, Group, Image, Paper, Progress, Select, SimpleGrid, Stack, Table, Text, ThemeIcon, Title } from "@mantine/core";
import { ArrowUpRight, CalendarDays, MoreHorizontal, RefreshCw, ShoppingBag, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useGetAdminDashboardQuery } from "../../redux/admin/adminApi";
import LoadingState from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import ActionMenu from "../../components/common/ActionMenu";

const money = amount => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);
const palette = ["#4285f4", "#22c5d6", "#f6bd16", "#8a6df1"];
const monthLabel = month => new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" });

function MiniTrend({ values, color = "#4285f4" }) {
  const maximum = Math.max(1, ...values);
  const points = values.map((value, index) => `${index * 240 / Math.max(1, values.length - 1)},${46 - value / maximum * 40}`).join(" ");
  return <svg viewBox="0 0 240 52" width="100%" height="48" aria-hidden="true" style={{ display: "block" }}>
    <polygon points={`0,52 ${points} 240,52`} fill={color} opacity="0.055" />
    <polyline points={points} stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round" />
  </svg>;
}

function CollectionsChart({ months }) {
  const maximum = Math.max(1, ...months.map(row => row.amount));
  const points = months.map((row, index) => ({ ...row, x: 38 + index * 590 / Math.max(1, months.length - 1), y: 156 - row.amount / maximum * 125 }));
  const curve = points.map((point, index) => {
    if (!index) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1], middle = (previous.x + point.x) / 2;
    return `C ${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}`;
  }).join(" ");
  return <Box style={{ overflowX: "auto" }} mt="md">
    <svg viewBox="0 0 660 198" style={{ width: "100%", minWidth: 390, display: "block" }} role="img" aria-label="Monthly collected payments in INR">
      <defs><linearGradient id="collections-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4285f4" stopOpacity="0.22" /><stop offset="100%" stopColor="#4285f4" stopOpacity="0.01" /></linearGradient></defs>
      {[31, 73, 115, 156].map((y, index) => <g key={y}><line x1="38" x2="640" y1={y} y2={y} stroke="var(--mantine-color-default-border)" strokeDasharray="3 5" /><text x="30" y={y + 3} textAnchor="end" fontSize="8" fill="var(--mantine-color-dimmed)">{new Intl.NumberFormat("en-IN", { notation: "compact" }).format(maximum * (3 - index) / 3)}</text></g>)}
      {points.length > 0 && <><path d={`${curve} L ${points.at(-1).x} 156 L 38 156 Z`} fill="url(#collections-area)" /><path d={curve} stroke="#4285f4" strokeWidth="2" fill="none" />
        {points.map(point => <g key={point.month}><circle cx={point.x} cy={point.y} r="3" fill="#4285f4" tabIndex={0}><title>{`${point.month}: ${money(point.amount)}`}</title></circle><text x={point.x} y="181" textAnchor="middle" fontSize="9" fill="var(--mantine-color-dimmed)">{monthLabel(point.month)}</text></g>)}
      </>}
    </svg>
  </Box>;
}

function SectionHeading({ title, children }) {
  return <Group justify="space-between" gap="xs" mb="md"><Text fw={600} size="sm">{title}</Text>{children}</Group>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("12");
  const { data, isLoading, isFetching, error, refetch } = useGetAdminDashboardQuery(undefined, { refetchOnMountOrArgChange: true, pollingInterval: 60000 });
  if (isLoading) return <LoadingState label="Loading store overview" />;
  if (error) return <ErrorAlert title="Dashboard could not load" message={error?.data?.message || "Please retry."} onRetry={refetch} />;
  const stats = data?.data || {}, months = stats.months || [];
  const metrics = [
    { label: "Total revenue", value: money(stats.revenue), field: "amount", color: palette[0], description: "Collected payments" },
    { label: "Total customers", value: stats.customers || 0, field: "customers", color: palette[1], description: "First-login trend" },
    { label: "Total orders", value: stats.orders || 0, field: "orders", color: "#8a6df1", description: "Confirmed purchases" },
  ];
  const popular = stats.popularProducts || [], popularTotal = popular.reduce((total, row) => total + row.quantity, 0);
  const donut = popular.map((row, index) => {
    const start = popular.slice(0, index).reduce((total, product) => total + product.quantity, 0) / Math.max(1, popularTotal) * 360;
    return `${palette[index]} ${start}deg ${start + row.quantity / Math.max(1, popularTotal) * 360}deg`;
  });
  const refunded = stats.payments?.find(row => row._id === "refunded")?.amount || 0;
  const largestOrderMonth = Math.max(1, ...months.map(row => row.orders || 0));
  const yearlyOrders = months.reduce((total, row) => total + (row.orders || 0), 0);
  return <Stack gap={18}>
    <Group justify="space-between"><Box><Title order={1} fw={600} size={22}>Ecommerce</Title><Text size="xs" c="dimmed" mt={3}>Your store performance at a glance.</Text></Box><Group gap="sm"><Text size="xs" c="dimmed" visibleFrom="sm">Dashboard / Ecommerce</Text><ActionIcon variant="default" size="lg" aria-label="Refresh dashboard" loading={isFetching} onClick={refetch}><RefreshCw size={15} /></ActionIcon></Group></Group>

    <Grid gutter={18}>
      <Grid.Col span={{ base: 12, lg: 8 }}><Stack gap={18} h="100%">
        <SimpleGrid cols={{ base: 1, xs: 3 }} spacing={14}>{metrics.map(metric => {
          const current = months.at(-1)?.[metric.field] || 0, previous = months.at(-2)?.[metric.field] || 0;
          const change = previous ? `${((current - previous) / previous * 100).toFixed(1)}%` : current ? "New" : "—";
          return <Paper key={metric.label} withBorder radius="sm" p="md"><Text size="xs" c="dimmed">{metric.label}</Text><Group gap={7} align="center" mt={8}><Text fw={600} size="22px">{metric.value}</Text><Badge size="xs" color={metric.field === "customers" ? "cyan" : "blue"} variant="light">{change}</Badge></Group><Text size="10px" c="dimmed" mt={2}>{metric.description}</Text><Box mt={10}><MiniTrend values={months.map(row => row[metric.field] || 0)} color={metric.color} /></Box></Paper>;
        })}</SimpleGrid>
        <Paper withBorder radius="sm" p="lg" style={{ flex: 1 }}><SectionHeading title="Analytics"><Group gap={7}><Badge variant="light" color="gray" size="sm" leftSection={<CalendarDays size={12} />}>Collections</Badge><Select aria-label="Analytics time range" size="xs" w={145} value={period} onChange={value => value && setPeriod(value)} data={[{ value: "12", label: "Last 12 months" }, { value: "6", label: "Last 6 months" }]} allowDeselect={false} /></Group></SectionHeading><CollectionsChart months={months.slice(-Number(period))} /><Text size="10px" c="dimmed">Paid payments by collection date · INR · UTC</Text></Paper>
      </Stack></Grid.Col>
      <Grid.Col span={{ base: 12, lg: 4 }}><Stack gap={14} h="100%">
        <Paper withBorder radius="sm" p="lg" style={{ overflow: "hidden", minHeight: 203, background: "radial-gradient(circle at 100% 0%, var(--mantine-color-blue-light), var(--mantine-color-body) 75%)" }}>
          <Box p="lg" my={8} c="white" style={{ borderRadius: 12, transform: "rotate(-6deg)", background: "linear-gradient(115deg,#73acfa,#3d7fea 65%,#2f67d9)", boxShadow: "0 12px 25px rgba(43,104,210,.22)" }}>
            <Group justify="space-between"><Text size="xs" c="white" opacity={0.9}>Store collections</Text><Group gap={0} aria-hidden="true"><Box w={23} h={23} bg="#795ff0" style={{ borderRadius: "50%", opacity: 0.85 }} /><Box w={23} h={23} bg="#b2dcff" ml={-9} style={{ borderRadius: "50%", opacity: 0.8 }} /></Group></Group>
            <Text fw={600} size="28px" c="white" mt={8}>{money(stats.revenue)}</Text><Wallet size={24} style={{ marginTop: 16, opacity: 0.9 }} /><Group justify="space-between" mt={8}><Text size="9px" c="white" style={{ letterSpacing: 1.5 }}>HIFASHOPNHUB</Text><Text size="10px" c="white">INR</Text></Group>
          </Box>
        </Paper>
        {[{ label: "Collected payments", amount: stats.revenue, color: "cyan", note: "Successfully paid", icon: Wallet }, { label: "Refunded payments", amount: refunded, color: "pink", note: "Recorded refunds", icon: ShoppingBag }].map(card => <Paper key={card.label} withBorder radius="sm" p="md"><SectionHeading title={card.label}><Text size="10px" c="dimmed">All time</Text></SectionHeading><Group gap="sm"><ThemeIcon color={card.color} variant="filled" radius="sm" size={35}>{card.icon === Wallet ? <Wallet size={18} /> : <ShoppingBag size={18} />}</ThemeIcon><Box><Text fw={600} size="lg">{money(card.amount)}</Text><Text size="10px" c="dimmed">{card.note}</Text></Box></Group></Paper>)}
      </Stack></Grid.Col>
    </Grid>

    <Grid gutter={18}>
      <Grid.Col span={{ base: 12, lg: 4 }}><Paper withBorder radius="sm" p="lg" h="100%"><SectionHeading title="Recent orders"><Anchor component={Link} to="/admin/orders" size="10px">View all</Anchor></SectionHeading><Stack gap="md">
        {(stats.recentOrders || []).map(order => <Group key={order._id} wrap="nowrap" gap="sm"><Image src={order.items?.[0]?.image || null} alt="" w={39} h={44} radius="sm" /><Box style={{ flex: 1, minWidth: 0 }}><Anchor component={Link} to={`/admin/orders?search=${encodeURIComponent(order.shippingAddress?.fullName || "")}`} size="xs" fw={500} lineClamp={1}>{order.items?.[0]?.name || `Order #${order._id.slice(-6)}`}</Anchor><Text size="10px" c="dimmed">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {order.shippingAddress?.fullName || "Customer"}</Text></Box><Text size="xs" fw={600}>{money(order.totalAmount)}</Text></Group>)}
        {!stats.recentOrders?.length && <Text size="xs" c="dimmed" py={45} ta="center">New orders will appear here.</Text>}
      </Stack></Paper></Grid.Col>
      <Grid.Col span={{ base: 12, lg: 8 }}><Paper withBorder radius="sm" p="lg" h="100%"><SectionHeading title="Stock report"><Badge size="xs" variant="light" color="gray">{stats.products || 0} products</Badge></SectionHeading><Table.ScrollContainer minWidth={520}><Table verticalSpacing="sm" horizontalSpacing="xs"><Table.Thead><Table.Tr><Table.Th>Product</Table.Th><Table.Th>Product ID</Table.Th><Table.Th>Price</Table.Th><Table.Th>Status</Table.Th><Table.Th>Stock</Table.Th><Table.Th>Action</Table.Th></Table.Tr></Table.Thead><Table.Tbody>
        {(stats.stockReport || []).map(product => <Table.Tr key={product._id}><Table.Td><Group wrap="nowrap" gap={8}><Image src={product.image || null} alt="" w={25} h={29} radius={3} /><Text size="xs" lineClamp={1}>{product.name}</Text></Group></Table.Td><Table.Td><Text size="10px" c="dimmed">#{product._id.slice(-6).toUpperCase()}</Text></Table.Td><Table.Td><Text size="xs">{money(product.price)}</Text></Table.Td><Table.Td><Badge size="xs" color={product.stock > 5 ? "teal" : product.stock ? "orange" : "pink"} variant="light">{product.stock > 5 ? "In stock" : product.stock ? "Low stock" : "Out of stock"}</Badge></Table.Td><Table.Td><Text size="xs">{product.stock || 0}</Text></Table.Td><Table.Td><ActionMenu width={160} items={[{ label: "Manage product", action: () => navigate(`/admin/products?search=${encodeURIComponent(product.name)}`) }]} target={<ActionIcon size="sm" variant="subtle" color="gray" aria-label={`Actions for ${product.name}`}><MoreHorizontal size={16} /></ActionIcon>} /></Table.Td></Table.Tr>)}
      </Table.Tbody></Table></Table.ScrollContainer>{!stats.stockReport?.length && <Text size="xs" c="dimmed" ta="center" py={40}>Add products to see your stock report.</Text>}</Paper></Grid.Col>
    </Grid>

    <Grid gutter={18}>
      <Grid.Col span={{ base: 12, md: 4 }}><Paper withBorder radius="sm" p="lg" h="100%"><SectionHeading title="Active customers"><Badge size="xs" color="teal" variant="light">30 days</Badge></SectionHeading><Text size="26px" fw={600}>{stats.activeCustomers || 0}</Text><Text size="10px" c="dimmed" mb="lg">Customers who signed in · {stats.customers || 0} total customers</Text><Stack gap="md">
        {(stats.customerCountries || []).map((country, index) => <Box key={country._id || index}><Group justify="space-between" mb={5}><Group gap={7}><Badge variant="light" color="gray" size="xs">{(country._id || "NA").slice(0, 2).toUpperCase()}</Badge><Text size="xs">{country._id || "Not specified"}</Text></Group><Text size="10px" c="dimmed">{country.count}</Text></Group><Progress value={country.count / Math.max(1, stats.activeCustomers || 0) * 100} size={4} color={palette[index]} /></Box>)}
        {!stats.customerCountries?.length && <Text size="xs" c="dimmed" py="md">Customer activity will appear here.</Text>}
      </Stack></Paper></Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}><Paper withBorder radius="sm" p="lg" h="100%"><SectionHeading title="Most popular items"><Text size="10px" c="dimmed">Units ordered</Text></SectionHeading><Group justify="center" my="lg"><Box w={126} h={126} p={18} style={{ borderRadius: "50%", background: donut.length ? `conic-gradient(${donut.join(",")})` : "var(--mantine-color-default-border)", boxShadow: "0 5px 12px rgba(60,75,110,.08)" }}><Stack h="100%" align="center" justify="center" gap={0} bg="var(--mantine-color-body)" style={{ borderRadius: "50%" }}><Text size="xl" fw={600}>{popularTotal}</Text><Text size="9px" c="dimmed">TOP ITEMS</Text></Stack></Box></Group><SimpleGrid cols={2} spacing="md">{popular.map((product, index) => <Group key={product._id} wrap="nowrap" gap={7}><ThemeIcon size={25} variant="light" color={palette[index]} radius="sm"><ShoppingBag size={13} /></ThemeIcon><Box style={{ minWidth: 0 }}><Text size="xs" fw={600}>{product.quantity} units</Text><Text size="9px" c="dimmed" lineClamp={1}>{product.name}</Text></Box></Group>)}</SimpleGrid>{!popular.length && <Text size="xs" c="dimmed" ta="center">Popular items appear after confirmed orders.</Text>}</Paper></Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}><Paper withBorder radius="sm" p="lg" h="100%"><SectionHeading title="Order overview"><Text size="10px" c="dimmed">12 months</Text></SectionHeading><Group gap={10} align="end" justify="space-between" h={88} px="xs" mt="md" mb="lg">{months.map(row => <Box key={row.month} style={{ flex: 1 }} h="100%"><Stack h="100%" justify="end" align="center" gap={5}><Box component="span" w={5} h={row.orders ? `${Math.max(8, (row.orders || 0) / largestOrderMonth * 70)}px` : 2} bg="#4285f4" title={`${row.month}: ${row.orders || 0} orders`} style={{ borderRadius: 6, opacity: row.orders ? 1 : 0.18 }} /><Text size="7px" c="dimmed">{monthLabel(row.month).slice(0, 1)}</Text></Stack></Box>)}</Group><Text ta="center" fw={600} size="26px">{yearlyOrders}</Text><Text ta="center" c="dimmed" size="10px">Confirmed orders in the last twelve months</Text><Stack gap={8} mt="lg">{["paid", "pending", "failed", "refunded"].map((status, index) => <Group key={status} justify="space-between"><Group gap={7}><Box w={5} h={5} bg={palette[index]} style={{ borderRadius: "50%" }} /><Text size="xs" tt="capitalize">{status} payments</Text></Group><Text size="xs" c="dimmed">{stats.payments?.find(row => row._id === status)?.count || 0}</Text></Group>)}</Stack></Paper></Grid.Col>
    </Grid>
    <Group justify="space-between"><Text size="10px" c="dimmed">© {new Date().getFullYear()} HIFASHOPNHUB. Store workspace · Live database figures.</Text><Button component={Link} to="/admin/activity" variant="subtle" size="xs" rightSection={<ArrowUpRight size={12} />}>Review activity log</Button></Group>
  </Stack>;
}
