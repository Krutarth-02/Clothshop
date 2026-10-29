import {
  AuthSubmit,
  AuthBackLink,
  RecoveryPrompt,
} from "../../components/common/AuthControls";
import { useState } from "react";
import { Text, Stack, PinInput } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useVerifyOtpMutation } from "../../redux/auth/authApi";
import AuthLayout from "../../components/common/AuthLayout";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const email = location.state?.email;
  const [verify, { isLoading }] = useVerifyOtpMutation();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await verify({ email, otp }).unwrap();
      toast.success(res.message);
      navigate("/reset-password", { state: { email } });
    } catch {
      toast.error("Failed to verify OTP");
    }
  };

  if (!email) {
    return (
      <RecoveryPrompt
        title="Verify your email."
        description="Start password recovery with your email address so we can send you a verification code."
      >
        Send verification code
      </RecoveryPrompt>
    );
  }

  return (
    <AuthLayout
      title="Check your inbox."
      description="Enter the six-digit code sent to your email to continue resetting your password."
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (otp.length === 6 && !isLoading) handleSubmit();
        }}
      >
        <Stack gap={30} align="center">
          <PinInput
            length={6}
            value={otp}
            onChange={setOtp}
            size="md"
            ariaLabel="Verification code"
            getInputProps={(index) => ({
              "aria-label": `Code character ${index + 1} of 6`,
            })}
            styles={{
              root: {
                gap: "clamp(4px, 1.5vw, 10px)",
                width: "100%",
                maxWidth: 340,
              },
              pinInput: { flex: "1 1 0", minWidth: 0 },
              input: {
                width: "100%",
                minWidth: 0,
                minHeight: 44,
                fontSize: 16,
              },
            }}
          />

          <AuthSubmit
            loading={isLoading}
            disabled={otp.length !== 6}
            variant={otp.length !== 6 ? "light" : "filled"}
          >
            Verify Code
          </AuthSubmit>
        </Stack>
      </form>
      <Text size="xs" c="dimmed" mt="lg">
        No code yet? Check your spam folder.
      </Text>
      <AuthBackLink to="/forgot-password" mt="md">
        Request a new code
      </AuthBackLink>
    </AuthLayout>
  );
};

export default VerifyOtp;
