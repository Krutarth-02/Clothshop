import React, { useState } from "react";
import {
  Box,
  Container,
  Card,
  Text,
  Button,
  Group,
  Stack,
  Center,
  PinInput,
  Image,
} from "@mantine/core";
import { ArrowRight, Mail } from "lucide-react";
import { useVerifyOtpMutation } from "../../redux/auth/authApi";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router";
import Logo from "../../assets/icons/LOGO_1.png";
const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const email = location.state?.email;
  const [verify,{isLoading}] = useVerifyOtpMutation();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await verify({ email, otp }).unwrap();
      toast.success(res.message);
      navigate("/reset-password",{ state: { email } });
    } catch (error) {
      toast.error("Failed to verify OTP");
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
              <Image src={Logo} alt="Logo" width={30} height={30} />
            </Box>
          </Center>

          <Text
            align="center"
            size="xl"
            weight={700}
            mb={12}
            style={{ fontSize: "24px", color: "#1a1a1a" }}
          >
            Verify OTP
          </Text>

          <Text
            align="center"
            size="sm"
            color="dimmed"
            mb={30}
            style={{ fontSize: "14px", lineHeight: 1.5 }}
          >
            Enter the 6-digit code sent to your email to verify your account.
          </Text>
          <Stack gap={30} align="center">
            <PinInput
              length={6}
              value={otp}
              onChange={setOtp}
              size="lg"
              style={{ justifyContent: "center" }}
            />

            <Button
              fullWidth
              size="lg"
              type="submit"
              loading={isLoading}
              disabled={otp.length !== 6}
              variant={otp.length !== 6 ? "light" : "filled"}
              onClick={handleSubmit}
            >
              Verify Code
            </Button>
          </Stack>

          <Group position="center" mt={20}>
            <Text size="sm" color="dimmed">
              Didn’t receive the code? Check your spam folder or request a new
              one.
            </Text>
          </Group>
        </Card>
      </Container>
    </Box>
  );
};

export default VerifyOtp;
