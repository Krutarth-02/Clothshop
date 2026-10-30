import { Box, Button, Divider, Paper, Stack, Text, Title } from "@mantine/core";
import { LogOut } from "lucide-react";
import UserAvatar from "./UserAvatar";

export default function AccountSidebar({
  user,
  items,
  active,
  onSelect,
  onSignOut,
  signingOut,
}) {
  return (
    <Paper
      component="aside"
      withBorder
      radius="md"
      p="lg"
      pos={{ base: "static", md: "sticky" }}
      top={110}
    >
      <Stack gap="md">
        <UserAvatar user={user} size={56} variant="light" />
        <Box style={{ overflowWrap: "anywhere" }}>
          <Title order={2} size={20} fw={600}>
            {user.fullName}
          </Title>
          <Text size="xs" c="dimmed" mt={4}>
            {user.email}
          </Text>
        </Box>
        <Divider my={4} />
        <Stack component="nav" aria-label="Profile sections" gap={6}>
          {items.map(({ value, label, icon }) => (
            <Button
              key={value}
              fullWidth
              variant={active === value ? "light" : "subtle"}
              color="dark"
              leftSection={icon}
              aria-current={active === value ? "page" : undefined}
              onClick={() => onSelect(value)}
              h={46}
              radius="sm"
              styles={{
                inner: { justifyContent: "flex-start" },
                label: { fontWeight: active === value ? 600 : 400 },
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>
        <Divider my={4} />
        <Button
          variant="subtle"
          color="gray"
          leftSection={<LogOut size={17} />}
          loading={signingOut}
          onClick={onSignOut}
          h={44}
          styles={{ inner: { justifyContent: "flex-start" } }}
        >
          Sign out
        </Button>
      </Stack>
    </Paper>
  );
}
