import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetProfileQuery } from "../../redux/auth/authApi";
import { selectCartCount } from "../../redux/cart/cartSlice";
import { useMediaQuery } from "@mantine/hooks";
import { Link, useLocation } from "react-router-dom";
import {
  ActionIcon,
  Anchor,
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  Indicator,
  Menu,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  ArrowUpRight,
  ChevronDown,
  Moon,
  ShoppingBag,
  SunMedium,
  User,
} from "lucide-react";
import BrandLogo from "../common/BrandLogo";

const shopLinks = [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "Shop All",
    to: "/shop",
  },
  {
    label: "New Arrivals",
    to: "/new-arrivals",
  },
  {
    label: "Women",
    to: "/women",
  },
  {
    label: "Men",
    to: "/men",
  },
  {
    label: "Accessories",
    to: "/accessories",
  },
  {
    label: "About Us",
    to: "/about",
  },
];
const accountLinks = [
  {
    label: "Sign in",
    to: "/login",
  },
  {
    label: "Create account",
    to: "/register",
  },
  {
    label: "Forgot password",
    to: "/forgot-password",
  },
  {
    label: "Verify code",
    to: "/verify-otp",
  },
  {
    label: "Reset password",
    to: "/reset-password",
  },
];

export default function Navbar({ colorScheme, toggleColorScheme }) {
  const cartCount = useSelector(selectCartCount);
  const { data: profile } = useGetProfileQuery(undefined, {
    skip: !localStorage.getItem("userId"),
  });
  const isAdmin = profile?.data?.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const theme = useMantineTheme();
  const desktop = useMediaQuery(`(min-width: ${theme.breakpoints.xl})`);
  const { gutter = { base: 16, sm: 24, lg: 40 } } = theme.other || {};

  return (
    <>
      <Group justify="center" gap={15} px={20} py={9} bg="#1a1a1a" c="#f8f9fa">
        <Text size="10px">A wardrobe that tells your story.</Text>
        <Anchor
          component={Link}
          to="/new-arrivals"
          size="10px"
          c="#e3e4c9"
          style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          Shop new arrivals <ArrowUpRight size={12} />
        </Anchor>
      </Group>
      <Box
        component="header"
        pos="sticky"
        top={0}
        style={{
          zIndex: 100,
          background: "var(--mantine-color-body)",
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Group
          component="nav"
          aria-label="Main navigation"
          justify="space-between"
          wrap="nowrap"
          gap={12}
          px={gutter}
          maw={theme.other.contentWidth}
          mx="auto"
          mih={{ base: 72, lg: 85 }}
        >
          <Anchor
            component={Link}
            to="/"
            underline="never"
            c="var(--mantine-color-text)"
            aria-label="Cevraliq home"
            style={{
              flexShrink: 0,
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <BrandLogo />
          </Anchor>
          <Group gap={16} visibleFrom="xl" wrap="nowrap">
            {shopLinks.map((link) => (
              <Anchor
                key={link.label}
                component={Link}
                to={link.to}
                aria-current={pathname === link.to ? "page" : undefined}
                fw={pathname === link.to ? 700 : 400}
                size="13px"
                c="var(--mantine-color-text)"
                underline="hover"
                style={{ whiteSpace: "nowrap" }}
              >
                {link.label}
              </Anchor>
            ))}
          </Group>
          <Group gap={8} wrap="nowrap" style={{ flexShrink: 0 }}>
            <Indicator
              label={cartCount > 99 ? "99+" : cartCount}
              disabled={!cartCount}
              size={18}
              color="dark"
              offset={5}
            >
              <ActionIcon
                component={Link}
                to="/cart"
                variant="subtle"
                color="gray"
                size={44}
                aria-label={`Shopping cart, ${cartCount} items`}
              >
                <ShoppingBag size={20} />
              </ActionIcon>
            </Indicator>
            <ActionIcon
              visibleFrom="xs"
              variant="subtle"
              color="gray"
              size={44}
              aria-label={`Switch to ${colorScheme === "dark" ? "light" : "dark"} theme`}
              onClick={toggleColorScheme}
            >
              {colorScheme === "dark" ? (
                <SunMedium size={19} />
              ) : (
                <Moon size={19} />
              )}
            </ActionIcon>
            <Box visibleFrom="xl">
              <Menu position="bottom-end" width={230} shadow="md" withinPortal>
                <Menu.Target>
                  <Button
                    variant="subtle"
                    color="gray"
                    size="compact-sm"
                    leftSection={<User size={18} />}
                    rightSection={<ChevronDown size={14} />}
                  >
                    Account &amp; Help
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Your Cevraliq</Menu.Label>
                  {isAdmin && (
                    <Menu.Item component={Link} to="/admin">
                      Store dashboard
                    </Menu.Item>
                  )}
                  {accountLinks.slice(0, 2).map((link) => (
                    <Menu.Item key={link.to} component={Link} to={link.to}>
                      {link.label}
                    </Menu.Item>
                  ))}
                  <Menu.Divider />
                  <Menu.Label>Password recovery</Menu.Label>
                  {accountLinks.slice(2).map((link) => (
                    <Menu.Item key={link.to} component={Link} to={link.to}>
                      {link.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </Box>
            <Burger
              opened={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              hiddenFrom="xl"
              size="sm"
              w={44}
              h={44}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            />
          </Group>
        </Group>
      </Box>
      <Drawer
        opened={menuOpen && !desktop}
        onClose={() => setMenuOpen(false)}
        title="Cevraliq"
        size="min(24rem, 100vw)"
        position="right"
        overlayProps={{ backgroundOpacity: 0.35, blur: 3 }}
        closeButtonProps={{ size: 44, "aria-label": "Close navigation" }}
        styles={{
          body: { paddingBottom: "max(24px, env(safe-area-inset-bottom))" },
        }}
      >
        <Stack
          component="nav"
          id="mobile-navigation"
          aria-label="Mobile navigation"
          gap="lg"
          py="md"
        >
          <Text size="xs" c="dimmed" style={{ letterSpacing: 2 }}>
            SHOP &amp; DISCOVER
          </Text>
          {shopLinks.map((link) => (
            <Anchor
              key={link.label}
              component={Link}
              to={link.to}
              aria-current={pathname === link.to ? "page" : undefined}
              fw={pathname === link.to ? 700 : 400}
              onClick={() => setMenuOpen(false)}
              size="lg"
              c="var(--mantine-color-text)"
              underline="hover"
              style={{ display: "block", paddingBlock: 10, minHeight: 44 }}
            >
              <Group justify="space-between">
                {link.label}
                <ArrowUpRight size={18} />
              </Group>
            </Anchor>
          ))}
          <Divider />
          <Anchor
            component={Link}
            to="/cart"
            onClick={() => setMenuOpen(false)}
            c="var(--mantine-color-text)"
            size="lg"
            style={{
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <ShoppingBag size={19} /> Shopping bag ({cartCount})
          </Anchor>
          <Button
            hiddenFrom="xs"
            variant="default"
            onClick={toggleColorScheme}
            leftSection={
              colorScheme === "dark" ? (
                <SunMedium size={18} />
              ) : (
                <Moon size={18} />
              )
            }
            mih={44}
          >
            Switch to {colorScheme === "dark" ? "light" : "dark"} theme
          </Button>
          <Divider />
          <Text size="xs" c="dimmed" style={{ letterSpacing: 2 }}>
            ACCOUNT &amp; HELP
          </Text>
          {isAdmin && (
            <Anchor
              component={Link}
              to="/admin"
              onClick={() => setMenuOpen(false)}
              c="var(--mantine-color-text)"
              fw={600}
              py="sm"
            >
              Store dashboard
            </Anchor>
          )}
          {accountLinks.map((link) => (
            <Anchor
              key={link.to}
              component={Link}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              size="sm"
              c="var(--mantine-color-text)"
              underline="hover"
              style={{ display: "block", paddingBlock: 12, minHeight: 44 }}
            >
              <Group justify="space-between">
                {link.label}
                <ArrowUpRight size={16} />
              </Group>
            </Anchor>
          ))}
        </Stack>
      </Drawer>
    </>
  );
}
