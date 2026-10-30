import { Alert, Button } from "@mantine/core";

export default function ErrorAlert({ message, title, children, onRetry, retryLabel = "Retry", color = "red", ...props }) {
  if (!message && !title && !children) return null;
  return <Alert color={color} title={title} role="alert" {...props}>
    {message || children}
    {onRetry && <Button variant="default" mt="md" onClick={onRetry}>{retryLabel}</Button>}
  </Alert>;
}
