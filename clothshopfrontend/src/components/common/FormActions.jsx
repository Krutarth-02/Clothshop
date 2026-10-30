import { Button, Group } from "@mantine/core";

export default function FormActions({ actions = [], busy = false, ...props }) {
  return <Group justify="flex-end" {...props}>
    {actions.map(({ key, label, ...action }) => (
      <Button key={key || label} {...action} disabled={busy || action.disabled}>{label}</Button>
    ))}
  </Group>;
}
