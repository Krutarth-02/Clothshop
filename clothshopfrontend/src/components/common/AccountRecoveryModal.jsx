import ErrorAlert from "./ErrorAlert";
import CommonModal from "./Modal";
import { useState } from "react";
import {
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "../../redux/auth/authApi";

export default function AccountRecoveryModal({ email, onClose, onRecovered }) {
  const [step, setStep] = useState("email");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [sendOtp, { isLoading: sending }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();
  const busy = sending || verifying || resetting;
  const send = async () => {
    setError("");
    try {
      await sendOtp({ email }).unwrap();
      setOtp("");
      setStep("otp");
    } catch (failure) {
      setError(failure?.data?.message || "Unable to send code. Please retry.");
    }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (step === "email") {
      await send();
      return;
    }
    try {
      if (step === "otp") {
        const result = await verifyOtp({ email, otp }).unwrap();
        setResetToken(result.resetToken);
        setStep("password");
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        if (
          password.length < 8 ||
          new TextEncoder().encode(password).length > 72
        ) {
          setError("Use at least 8 characters and at most 72 bytes.");
          return;
        }
        await resetPassword({ email, password, resetToken }).unwrap();
        onRecovered(password);
      }
    } catch (failure) {
      setError(
        failure?.data?.message ||
          "Unable to recover your account. Please retry.",
      );
    }
  };
  return (
    <CommonModal
      onClose={onClose}
      busy={busy}
      onSubmit={submit}
      actions={[
        { label: "Back", variant: "default", onClick: onClose },
        { label: step === "email" ? "Send verification code" : step === "otp" ? "Verify OTP" : "Save password and continue",
          type: "submit", color: "dark", loading: busy,
          disabled: step === "otp" ? otp.length !== 6 : step === "password" ? !password || !confirmPassword : !email },
      ]}
      title={
        step === "email"
          ? "Forgot password?"
          : step === "otp"
            ? "Verify your email"
            : "Reset password"
      }
    >
        <Stack gap="lg">
          <Text size="sm" c="dimmed">
            Reset your password, then return to confirm account deletion.
          </Text>
          <TextInput label="Account email" value={email || ""} readOnly />
          <ErrorAlert message={error} />
          {step === "email" && (
            <Text size="sm">
              We will send a six-digit verification code to your account email.
            </Text>
          )}
          {step === "otp" && (
            <>
              <TextInput
                data-autofocus
                label="Verification code"
                description="The code expires in 5 minutes."
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                value={otp}
                onChange={(event) =>
                  setOtp(event.currentTarget.value.replace(/\D/g, ""))
                }
                disabled={busy}
              />
              <Button variant="subtle" onClick={send} disabled={busy}>
                Resend code
              </Button>
            </>
          )}
          {step === "password" && (
            <>
              <PasswordInput
                data-autofocus
                label="New password"
                description="At least 8 characters."
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                disabled={busy}
              />
              <PasswordInput
                label="Confirm new password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.currentTarget.value)
                }
                disabled={busy}
              />
              <Button variant="subtle" onClick={send} disabled={busy}>
                Request a new verification code
              </Button>
            </>
          )}
        </Stack>
    </CommonModal>
  );
}
