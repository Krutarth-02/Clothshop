import {
  AuthField,
  AuthSubmit,
  AuthBackLink,
  RecoveryPrompt,
} from "../../components/common/AuthControls";
import { useState } from "react";
import { Stack } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Lock } from "lucide-react";

import { useResetPasswordMutation } from "../../redux/auth/authApi";
import AuthLayout from "../../components/common/AuthLayout";

const ResetPassword = () => {
  const [password, setNewPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  const [resetpassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }

    try {
      const res = await resetpassword({
        email,
        password,
        resetToken,
      }).unwrap();

      toast.success(res.message);

      setNewPassword("");

      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reset password");
    }
  };

  if (!email || !resetToken) {
    return (
      <RecoveryPrompt
        title="Recover your account."
        description="Enter your email and verify the code we send before choosing a new password."
      >
        Start password recovery
      </RecoveryPrompt>
    );
  }

  return (
    <AuthLayout
      title="Back to a good place."
      description="Choose a new password to finish recovering your HIFASHOPNHUB account."
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (password && !isLoading) handleSubmit();
        }}
      >
        <Stack gap={20}>
          <AuthField
            password
            autoComplete="new-password"
            label="New password"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(event) => setNewPassword(event.currentTarget.value)}
            icon={<Lock size={18} color="#999" />}
          />

          <AuthSubmit
            disabled={!password}
            variant={!password ? "light" : "filled"}

            loading={isLoading}
          >
            Save password
          </AuthSubmit>
        </Stack>
      </form>
      <AuthBackLink />
    </AuthLayout>
  );
};

export default ResetPassword;
