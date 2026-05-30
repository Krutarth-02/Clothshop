import React, { useState } from "react";
import {
  Box,
  Container,
  Card,
  PasswordInput,
  Button,
  Text,
  Stack,
  Center,
  Image,
} from "@mantine/core";
import { ArrowRight, Lock } from "lucide-react";
import { useResetPasswordMutation } from "../../redux/auth/authApi";
import Logo from "../../assets/icons/LOGO_1.png";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router";
const ResetPassword = () => {
  const [password, setNewPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  console.log(email);

  const [resetpassword, { isLoading }] = useResetPasswordMutation();
  console.log(password);

  const handleSubmit = async () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }

    try {
      const res = await resetpassword({
        email,
        password,
      }).unwrap();

      toast.success(res.message);

      setNewPassword("");

      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reset password");
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #a8d8f0 0%, #c5e3f6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Container size={420}>
        <Card
          shadow="lg"
          radius="xl"
          p={40}
          style={{
            backgroundColor: "#f8f9fa",
            border: "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          <Center mb={30}>
            <Box
              style={{
                width: 60,
                height: 60,
                borderRadius: "12px",
                backgroundColor: "#e8f0f7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image src={Logo} alt="Logo" />
            </Box>
          </Center>

          <Text
            align="center"
            size="xl"
            weight={700}
            mb={12}
            style={{ fontSize: "24px", color: "#1a1a1a" }}
          >
            Reset your password
          </Text>

          <Text
            align="center"
            size="sm"
            color="dimmed"
            mb={30}
            style={{ fontSize: "14px", lineHeight: 1.5 }}
          >
            Enter your new password and confirm it to finish resetting your
            account.
          </Text>

          <Stack gap={20}>
            <PasswordInput
              placeholder="New password"
              value={password}
              onChange={(event) => setNewPassword(event.currentTarget.value)}
              leftSection={<Lock size={18} color="#999" />}
            />

            <Button
              fullWidth
              size="lg"
              type="submit"
              disabled={!password}
              variant={!password ? "light" : "filled"}
              onClick={handleSubmit}
              loading={isLoading}
            >
              Save password
            </Button>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default ResetPassword;
