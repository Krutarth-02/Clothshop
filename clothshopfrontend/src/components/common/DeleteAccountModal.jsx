import ErrorAlert from "./ErrorAlert";
import CommonModal from "./Modal";
import { useState } from "react";
import {
  Alert,
  Anchor,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useDeleteAccountMutation } from "../../redux/auth/authApi";
import useAccountActions from "../../hooks/useAccountActions";
import AccountRecoveryModal from "./AccountRecoveryModal";

export default function DeleteAccountModal({ email, onClose }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [recovering, setRecovering] = useState(false);
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
  const { clearSession } = useAccountActions();
  const submit = async (event) => {
    event.preventDefault();
    if (isLoading || !password || confirmation !== "DELETE") return;
    setError("");
    try {
      await deleteAccount({ password, confirmation }).unwrap();
      onClose();
      clearSession();
      toast.success("Your account has been deleted");
    } catch (failure) {
      setError(
        failure?.data?.message ||
          "Unable to delete your account. Please try again.",
      );
    }
  };
  if (recovering) return <AccountRecoveryModal email={email}
    onClose={() => setRecovering(false)}
    onRecovered={(newPassword) => {
      setPassword(newPassword);
      setConfirmation("");
      setError("");
      setRecovering(false);
      toast.success("Password reset. Confirm below to delete your account.");
    }} />;
  return (
    <CommonModal
      onClose={onClose}
      busy={isLoading}
      title="Delete your account?"
      onSubmit={submit}
      actions={[
        { label: "Keep my account", variant: "default", onClick: onClose },
        { label: "Delete permanently", color: "red", type: "submit", loading: isLoading,
          disabled: !password || confirmation !== "DELETE", leftSection: <Trash2 size={16} /> },
      ]}
      closeButtonProps={{
        "aria-label": "Cancel account deletion",
      }}
    >
        <Stack gap="lg">
          <Alert color="red" title="This action is permanent">
            Your account will be removed. You will be
            signed out and your bag will be cleared on this device.
          </Alert>
          <Text size="sm" style={{ overflowWrap: "anywhere" }}>
            Account: <strong>{email}</strong>
          </Text>
          <ErrorAlert message={error} />
          <PasswordInput
            data-autofocus
            label="Current password"
            autoComplete="current-password"
            required
            maxLength={1024}
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            disabled={isLoading}
          />
          <TextInput
            label="Type DELETE to confirm"
            autoComplete="off"
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.currentTarget.value)}
            disabled={isLoading}
          />
          <Anchor component="button" type="button" size="sm" ta="left" disabled={isLoading}
            onClick={() => { setError(""); setRecovering(true); }}>Forgot password?</Anchor>
        </Stack>
    </CommonModal>
  );
}
