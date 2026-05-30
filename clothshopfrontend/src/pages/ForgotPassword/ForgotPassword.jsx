import React, { useState } from "react";
import {
  Box,
  Container,
  Card,
  TextInput,
  Button,
  Text,
  Group,
  Stack,
  Center,
  Image,
} from "@mantine/core";
import { Mail, ArrowRight } from "lucide-react";
import Logo from "../../assets/icons/LOGO_1.png";
import { useForgotPasswordMutation } from "../../redux/auth/authApi";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

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
    } catch (error) {
      toast.error("Failed to send reset link" || error.message);
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
            Enter your email address and we’ll send you OTP to reset your
            password.
          </Text>

          <Stack gap={20}>
            <TextInput
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              leftSection={<Mail size={18} color="#999" />}
            />

            <Button
              fullWidth
              size="lg"
              type="submit"
              disabled={!email || isLoading}
              variant={isLoading ? "light" : "filled"}
              loading={isLoading}
              onClick={handleSubmit}
            >
              Send OTP
            </Button>
          </Stack>

          <Group position="center" mt={20}>
            <Text size="sm" color="dimmed">
              We’ll email you instructions to recover your account.
            </Text>
          </Group>
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
