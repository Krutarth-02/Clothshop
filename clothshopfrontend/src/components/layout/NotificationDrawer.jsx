import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Anchor,
  Box,
  Button,
  Menu,
  Skeleton,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  useComputedColorScheme,
} from "@mantine/core";
import {
  Bell,
  Check,
  Gift,
  MoreHorizontal,
  ShoppingBag,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import CommonDrawer from "../common/CommonDrawer";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useDismissNotificationMutation,
} from "../../redux/notifications/notificationApi";

function relativeTime(value) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

const NotificationDrawer = ({ open, handleClose }) => {
  const colorScheme = useComputedColorScheme("light");
  const [activeTab, setActiveTab] = useState("all");
  const signedIn = Boolean(localStorage.getItem("userId"));
  const { data, isLoading, isFetching, error, refetch } =
    useGetNotificationsQuery(undefined, {
      skip: !open || !signedIn,
      refetchOnMountOrArgChange: true,
    });
  const [markRead, { isLoading: marking }] = useMarkNotificationReadMutation();
  const [dismiss, { isLoading: dismissing }] = useDismissNotificationMutation();
  const notifications = data?.data || [];
  const filteredNotifications = notifications.filter((notification) =>
    activeTab === "all" ||
    (activeTab === "read" ? Boolean(notification.readAt) : !notification.readAt),
  );
  const busy = marking || dismissing;
  const run = async (mutation, id) => {
    try {
      await mutation(id).unwrap();
    } catch (failure) {
      toast.error(
        failure?.data?.message ||
          "Unable to update notifications. Please retry.",
      );
    }
  };

  return (
    <CommonDrawer
      open={open}
      handleClose={handleClose}
      title="Your notifications"
      width="min(24rem, 100vw)"
    >
      {!signedIn ? (
        <Stack align="center" ta="center" py={40}>
          <ThemeIcon size={56} radius="xl" variant="light" color="gray">
            <Gift size={26} />
          </ThemeIcon>
          <Title order={2} size={24} fw={500}>
            A little something for you.
          </Title>
          <Text size="sm" c="dimmed">
            Sign in to see your personal offers and store updates.
          </Text>
          <Button
            component={Link}
            to="/login"
            color="dark"
            onClick={handleClose}
          >
            Sign in
          </Button>
        </Stack>
      ) : error ? (
        <Alert color="red" title="Notifications could not load">
          <Text size="sm">
            Please try again when your connection is available.
          </Text>
          <Button variant="default" mt="md" onClick={refetch}>
            Retry
          </Button>
        </Alert>
      ) : isLoading || (isFetching && !data) ? (
        <Stack aria-label="Loading notifications">
          {[1, 2, 3].map((id) => (
            <Skeleton key={id} h={100} />
          ))}
        </Stack>
      ) : (
        <Tabs value={activeTab} onChange={setActiveTab} style={{ marginInline: "calc(-1 * var(--mantine-spacing-md))" }}>
          <Tabs.List grow style={{ minHeight: 46, flexWrap: "nowrap" }} aria-label="Filter notifications">
            {["all", "read", "unread"].map((tab) => (
              <Tabs.Tab key={tab} value={tab} style={{ minHeight: 46, padding: "12px 16px", fontSize: "var(--mantine-font-size-sm)", fontWeight: 500, lineHeight: 1.4 }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value={activeTab}>
            {filteredNotifications.map((notification) => {
              const Icon =
                notification.type === "offer"
                  ? Gift
                  : notification.type === "order"
                    ? ShoppingBag
                    : Bell;
              const unread = !notification.readAt;
              // Notification links must stay within the storefront.
              const safeLink =
                /^\/(?!\/)/.test(notification.link || "") &&
                !/[\\\s]/.test(notification.link);
              return (
                <Box
                  component="article"
                  key={notification._id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "17px 12px 17px 22px",
                    borderBottom: "1px solid var(--mantine-color-default-border)",
                    background: unread
                      ? colorScheme === "dark" ? "var(--mantine-color-dark-5)" : "var(--mantine-color-blue-0)"
                      : "var(--mantine-color-body)",
                  }}
                >
                  <Box style={{ flexShrink: 0, paddingTop: 3 }}>
                    <Icon size={22} strokeWidth={1.8} />
                  </Box>
                  <Box style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>
                    <Text size="sm" fw={500} lh={1.45}>
                      {notification.title}
                    </Text>
                    <Text size="xs" c="dimmed" mt={3}>
                      {unread && (
                        <Text
                          component="span"
                          fw={600}
                          c="var(--mantine-color-text)"
                          size="xs"
                        >
                          New ·{" "}
                        </Text>
                      )}
                      <time
                        dateTime={notification.createdAt}
                        title={new Date(notification.createdAt).toLocaleString(
                          "en-IN",
                        )}
                      >
                        {relativeTime(notification.createdAt)}
                      </time>
                    </Text>
                    {notification.message && (
                      <Text
                        size="xs"
                        c="dimmed"
                        mt={7}
                        lh={1.6}
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {notification.message}
                      </Text>
                    )}
                    {safeLink && (
                      <Anchor
                        component={Link}
                        to={notification.link}
                        onClick={handleClose}
                        size="xs"
                        mt={7}
                        display="block"
                      >
                        {notification.linkLabel || "View details"}
                      </Anchor>
                    )}
                  </Box>
                  <Menu
                    position="bottom-end"
                    withinPortal
                    shadow="md"
                    width={165}
                  >
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        aria-label={`Options for ${notification.title}`}
                        disabled={busy}
                      >
                        <MoreHorizontal size={19} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<Check size={15} />}
                        disabled={!unread || busy}
                        onClick={() => run(markRead, notification._id)}
                      >
                        Mark as read
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<X size={15} />}
                        color="red"
                        disabled={busy}
                        onClick={() => run(dismiss, notification._id)}
                      >
                        Cancel
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Box>
              );
            })}
            {filteredNotifications.length === 0 && (
              <Stack align="center" ta="center" py={48}>
                <ThemeIcon size={56} radius="xl" variant="light" color="gray">
                  <Bell size={25} />
                </ThemeIcon>
                <Title order={2} size={24} fw={500}>
                  {activeTab === "all" ? "You're all caught up." : `No ${activeTab} notifications.`}
                </Title>
                <Text size="sm" c="dimmed">
                  {activeTab === "all" ? "Your offers and store updates will appear here." : `Your ${activeTab} notifications will appear here.`}
                </Text>
              </Stack>
            )}
          </Tabs.Panel>
        </Tabs>
      )}
    </CommonDrawer>
  );
};

export default NotificationDrawer;
