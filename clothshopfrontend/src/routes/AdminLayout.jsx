import { createElement, useState } from "react";
import { ActionIcon, AppShell, Badge, Box, Burger, Button, Divider, Group, NavLink, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { LayoutDashboard, Package, Users, ShoppingBag, ShieldCheck, History, LogOut, ArrowUpRight, Search } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useLogoutAdminMutation } from "../redux/admin/adminApi";
import { api } from "../redux/api/api";
import UserAvatar from "../components/common/UserAvatar";
import BrandLogo from "../components/common/BrandLogo";

const links = [
  { label: "Ecommerce", to: "/admin", icon: LayoutDashboard, group: "DASHBOARDS" },
  { label: "Products", to: "/admin/products", icon: Package, group: "STORE MANAGEMENT" },
  { label: "Customers", to: "/admin/customers", icon: Users, group: "STORE MANAGEMENT" },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag, group: "STORE MANAGEMENT" },
  { label: "Activity log", to: "/admin/activity", icon: History, group: "ADMINISTRATION" },
  { label: "Administrators", to: "/admin/team", icon: ShieldCheck, group: "ADMINISTRATION", owner: true },
];

export default function AdminLayout() {
  const { admin } = useOutletContext();
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState("");
  const { pathname } = useLocation();
  const navigate = useNavigate(), dispatch = useDispatch();
  const [logout, { isLoading }] = useLogoutAdminMutation();
  async function signOut() {
    try {
      await logout().unwrap(); dispatch(api.util.resetApiState()); navigate("/admin/login", { replace: true });
    } catch (error) { toast.error(error?.data?.message || "Unable to sign out. Please retry."); }
  }
  return <AppShell header={{ height: 64 }} navbar={{ width: 214, breakpoint: "sm", collapsed: { mobile: !opened } }} padding={{ base: "md", lg: 22 }}>
    <AppShell.Header><Group h="100%" px={{ base: "md", sm: "xl" }} justify="space-between" wrap="nowrap">
      <Group wrap="nowrap"><Burger opened={opened} onClick={() => setOpened(!opened)} hiddenFrom="sm" size="sm" aria-label="Toggle admin navigation" />
        <Box w={{ base: 150, sm: 190 }}><BrandLogo iconSize={28} showTagline={false} /></Box>
      </Group>
      <Box component="form" visibleFrom="md" style={{ flex: 1, maxWidth: 360, marginRight: "auto" }} onSubmit={event => { event.preventDefault(); navigate(`/admin/products?search=${encodeURIComponent(search.trim())}`); }}>
        <TextInput size="xs" aria-label="Search products in admin" placeholder="Search products..." leftSection={<Search size={14} />} value={search} maxLength={100} onChange={event => setSearch(event.currentTarget.value)} />
      </Box>
      <Group gap="sm" wrap="nowrap"><ActionIcon component={Link} to="/admin/activity" variant="subtle" color="gray" aria-label="View recent activity"><History size={18} /></ActionIcon><Badge color="blue" variant="light" visibleFrom="sm">{admin.role === "superadmin" ? "Store owner" : "Administrator"}</Badge>
        <UserAvatar user={admin} size={36} radius="xl" /><Box visibleFrom="md"><Text size="sm" fw={600}>{admin.fullName}</Text><Text size="xs" c="dimmed">{admin.email}</Text></Box>
      </Group>
    </Group></AppShell.Header>
    <AppShell.Navbar p="md">
      <AppShell.Section grow component={ScrollArea}><Stack gap={27} mt="sm">{["DASHBOARDS", "STORE MANAGEMENT", "ADMINISTRATION"].map(group => <Box key={group}>
        <Text size="9px" c="dimmed" px="sm" mb="sm" style={{ letterSpacing: 1.3 }}>{group}</Text>
        <Stack gap={4}>{links.filter(link => link.group === group && (!link.owner || admin.role === "superadmin")).map(({ to, label, icon }) =>
          <NavLink key={to} component={Link} to={to} label={label} leftSection={createElement(icon, { size: 18 })} active={pathname === to}
            color="blue" onClick={() => setOpened(false)} styles={{ label: { fontSize: 12, fontWeight: 500 } }} style={{ borderRadius: 5, minHeight: 38 }} />
        )}</Stack></Box>)}</Stack>
      </AppShell.Section><AppShell.Section><Divider my="md" /><Stack gap="xs">
        <Button component={Link} to="/" variant="subtle" color="gray" rightSection={<ArrowUpRight size={16} />}>Visit storefront</Button>
        <Button variant="light" color="gray" leftSection={<LogOut size={16} />} loading={isLoading} onClick={signOut}>Sign out</Button>
      </Stack></AppShell.Section>
    </AppShell.Navbar>
    <AppShell.Main bg="var(--mantine-color-default-hover)" style={{ userSelect: "text" }}><Box maw={1540} mx="auto"><Outlet context={{ admin }} /></Box></AppShell.Main>
  </AppShell>;
}
