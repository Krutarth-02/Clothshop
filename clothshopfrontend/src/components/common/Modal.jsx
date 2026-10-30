import { Modal as MantineModal } from "@mantine/core";
import ErrorAlert from "./ErrorAlert";
import FormActions from "./FormActions";

export default function CommonModal({
  opened = true,
  onClose,
  title,
  children,
  busy = false,
  onSubmit,
  actions = [],
  error,
  closeOnEscape = true,
  closeOnClickOutside = true,
  closeButtonProps,
  centered = true,
  ...props
}) {
  const content = (
    <>
      <ErrorAlert message={error} mb="md" />
      {children}
      {actions.length > 0 && (
        <FormActions actions={actions} busy={busy} mt="lg" />
      )}
    </>
  );
  return (
    <MantineModal
      {...props}
      opened={opened}
      title={title}
      centered={centered}
      onClose={() => {
        if (!busy) onClose?.();
      }}
      closeOnEscape={!busy && closeOnEscape}
      closeOnClickOutside={!busy && closeOnClickOutside}
      closeButtonProps={{
        ...closeButtonProps,
        disabled: busy || closeButtonProps?.disabled,
      }}
    >
      {onSubmit ? <form onSubmit={(event) => {
        if (busy) { event.preventDefault(); return; }
        onSubmit(event);
      }}>{content}</form> : content}
    </MantineModal>
  );
}
