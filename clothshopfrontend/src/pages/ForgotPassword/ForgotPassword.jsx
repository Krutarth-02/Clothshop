import {
  AuthField,
  AuthSubmit,
  AuthBackLink,
} from "../../components/common/AuthControls";
import { useState } from "react";
import { Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Mail } from "lucide-react";

import { useForgotPasswordMutation } from "../../redux/auth/authApi";
import AuthLayout from "../../components/common/AuthLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [forgotpassword, { isLoading }] = useForgotPasswordMutation();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await forgotpassword({ email }).unwrap();
      if (res.message) {
        toast.success("Reset link sent to your email");
        navigate("/verify-otp", { state: { email } });
        setEmail("");
      } else {
        toast.error("Failed to send reset link");
      }
    } catch {
      toast.error("Failed to send reset link");
    }
  };

  return (
    <AuthLayout
      title="A fresh start."
      description="Enter your email and we will send a code to help you get back in."
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (email && !isLoading) handleSubmit();
        }}
      >
        <Stack gap={20}>
          <AuthField
            autoComplete="email"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            icon={<Mail size={18} color="#999" />}
          />

          <AuthSubmit
            disabled={!email || isLoading}
            variant={isLoading ? "light" : "filled"}
            loading={isLoading}
          >
            Send OTP
          </AuthSubmit>
        </Stack>
      </form>
      <AuthBackLink />
    </AuthLayout>
  );
};

export default ForgotPassword;
