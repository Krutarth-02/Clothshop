import ActionMenu, { ActionMenuItems } from "../common/ActionMenu";
import CommonDrawer from "../common/CommonDrawer";
import UserAvatar from "../common/UserAvatar";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetProfileQuery } from "../../redux/auth/authApi";
import { useGetNotificationsQuery } from "../../redux/notifications/notificationApi";
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
  Group,
  Indicator,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  Moon,
  Gift,
  LogOut,
  Trash2,
  ShoppingBag,
  SunMedium,
  User,
  X,
} from "lucide-react";
import BrandLogo from "../common/BrandLogo";
import NotificationDrawer from "./NotificationDrawer";
import DeleteAccountModal from "../common/DeleteAccountModal";
import useAccountActions from "../../hooks/useAccountActions";

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
  const signedIn = Boolean(localStorage.getItem("userId"));
  const {
    data: profile,
    isLoading: checkingAccount,
    error: profileError,
    refetch: retryProfile,
  } = useGetProfileQuery(undefined, { skip: !signedIn });
  const user = signedIn && !profileError ? profile?.data : null;
  const { signOut, signingOut } = useAccountActions();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: notifications } = useGetNotificationsQuery(undefined, {
    skip: !signedIn,
    pollingInterval: 60000,
    refetchOnMountOrArgChange: true,
  });
  const unreadCount = signedIn ? notifications?.unreadCount || 0 : 0;
  const { pathname } = useLocation();
  const theme = useMantineTheme();
  const desktop = useMediaQuery(`(min-width: ${theme.breakpoints.xl})`);
  const { gutter = { base: 16, sm: 24, lg: 40 } } = theme.other || {};

  const accountItems = user
    ? [
        { label: "My profile", to: "/profile", icon: <User size={17} /> },
        { label: "Shopping bag", to: "/cart", icon: <ShoppingBag size={17} /> },
        {
          label: "Notifications",
          icon: <Gift size={17} />,
          action: () => setNotificationsOpen(true),
        },
        {
          label: signingOut ? "Signing out..." : "Sign out",
          icon: <LogOut size={17} />,
          action: signOut,
        },
        {
          label: "Delete account",
          icon: <Trash2 size={17} />,
          danger: true,
          action: () => setDeleteOpen(true),
        },
      ]
    : signedIn
      ? checkingAccount
        ? []
        : [{ label: "Retry account", action: retryProfile }]
      : accountLinks;

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
            aria-label="HIFASHOPNHUB home"
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
          <Group
            gap={{ base: 4, sm: 8 }}
            wrap="nowrap"
            style={{ flexShrink: 0 }}
          >
            <Indicator
              disabled={!unreadCount}
              size={8}
              color="green"
              offset={7}
            >
              <ActionIcon
                variant="subtle"
                color="gray"
                size={44}
                aria-label={
                  unreadCount
                    ? `Notifications, ${unreadCount} unread`
                    : "Notifications"
                }
                aria-haspopup="dialog"
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setMenuOpen(false);
                  setNotificationsOpen(true);
                }}
              >
                <Bell size={20} />
              </ActionIcon>
            </Indicator>
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
              <ActionMenu width={230} radius="md" offset={8}
                items={accountItems} disabled={signingOut} onAction={() => setMenuOpen(false)}
                label={user ? user.fullName : signedIn ? "Checking your account" : "Your HIFASHOPNHUB"}
                target={<Button
                    variant="default"
                    color="gray"
                    size="sm"
                    radius="xl"
                    h={44}
                    pl={6}
                    pr={12}
                    styles={{
                      inner: { gap: 9 },
                      section: { marginInline: 0, flexShrink: 0 },
                      label: { fontSize: 13, fontWeight: 500, lineHeight: 1.2 },
                    }}
                    loading={signingOut || (signedIn && checkingAccount)}
                    leftSection={user ? (
                      <UserAvatar user={user}
                        size={32} radius="xl" color="gray" variant="light"
                        styles={{ root: { border: "1px solid var(--mantine-color-default-border)", background: "var(--mantine-color-default-hover)" }, placeholder: { fontSize: 13, fontWeight: 600 } }}
                        />
                    ) : <User size={18} />}
                    rightSection={<ChevronDown size={14} strokeWidth={1.7} color="var(--mantine-color-dimmed)" />}
                  >
                    {user ? "My account" : "Account"}
                  </Button>} />
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
      {deleteOpen && user && (
        <DeleteAccountModal
          email={user.email}
          onClose={() => setDeleteOpen(false)}
        />
      )}
      <NotificationDrawer
        open={notificationsOpen}
        handleClose={() => setNotificationsOpen(false)}
      />
      <CommonDrawer
        open={menuOpen && !desktop}
        handleClose={() => setMenuOpen(false)}
        title="HIFASHOPNHUB"
        width="min(24rem, 100vw)"
        position="right"
        overlayProps={{ backgroundOpacity: 0.35, blur: 3 }}
        closeButtonProps={{ size: 44, icon: <X size={18} />, "aria-label": "Close navigation" }}
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
            {user ? "MY ACCOUNT" : "ACCOUNT & HELP"}
          </Text>
          {user && (
            <Group wrap="nowrap">
              <UserAvatar user={user}
                size={40} radius="xl" color="gray" />
              <Text size="sm" style={{ overflowWrap: "anywhere" }}>{user.fullName}</Text>
            </Group>
          )}
          {signedIn && checkingAccount && (
            <Text size="sm" c="dimmed">
              Checking your account...
            </Text>
          )}
          <ActionMenuItems items={accountItems} mobile disabled={signingOut} onAction={() => setMenuOpen(false)} />
        </Stack>
      </CommonDrawer>
    </>
  );
}
