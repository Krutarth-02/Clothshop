import React, { useState } from "react";
import {
  Box,
  Container,
  Card,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Group,
  Stack,
  Center,
  ActionIcon,
  Anchor,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { FaGoogle, FaFacebookF, FaApple } from "react-icons/fa";
import { useLoginMutation } from "../../redux/auth/authApi";
const Login = () => {
  const [login] = useLoginMutation();
  const navigate = useNavigate();

  const validate = (values) => {
    let errors = {};

    if (!values.email) {
      errors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email)
    ) {
      errors.email = "Invalid email address";
    }
    if (!values.password || values.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate,
    onSubmit: async (values, action) => {
      try {
        const res = await login(values).unwrap();
        
        if (res.data) {
          toast.success("Login successful");
          localStorage.setItem("userId", res.data._id);
          action.resetForm();
          navigate("/home");
        } else {
          toast.error("Login failed");
        }
      } catch (error) {
        toast.error(error.data.message || "Login failed");
      }
    },
  });

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
          {/* Login Icon */}
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
              <ArrowRight size={28} color="#333" strokeWidth={1.5} />
            </Box>
          </Center>

          {/* Heading */}
          <Text
            align="center"
            size="xl"
            weight={700}
            mb={12}
            style={{ fontSize: "24px", color: "#1a1a1a" }}
          >
            Sign in with email
          </Text>

          {/* Description */}
          <Text
            align="center"
            size="sm"
            color="dimmed"
            mb={30}
            style={{ fontSize: "14px", lineHeight: 1.5 }}
          >
            Make a new doc to bring your words, data, and teams together. For
            free
          </Text>

          {/* Form */}
          <form onSubmit={formik.handleSubmit}>
            <Stack gap={20}>
              {/* Email Input */}
              <TextInput
                placeholder="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                icon={<Mail size={18} color="#999" />}
                styles={{
                  input: {
                    backgroundColor: "#f0f0f0",
                    border: "none",
                    padding: "12px 16px 12px 42px",
                    fontSize: "14px",
                    "&:focus": {
                      backgroundColor: "#f0f0f0",
                      borderColor: "#999",
                    },
                  },
                }}
              />

              {/* Password Input */}
              <PasswordInput
                placeholder="Password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                icon={<Lock size={18} color="#999" />}
                styles={{
                  input: {
                    backgroundColor: "#f0f0f0",
                    border: "none",
                    padding: "12px 16px 12px 42px",
                    fontSize: "14px",
                    "&:focus": {
                      backgroundColor: "#f0f0f0",
                      borderColor: "#999",
                    },
                  },
                }}
              />

              {/* Forgot Password Link */}
              <Anchor
                component={Link}
                to="/forgot-password"
                align="right"
                size="sm"
                style={{ fontSize: "13px", color: "#333" }}
              >
                Forgot password?
              </Anchor>

              {/* Get Started Button */}
              <Button
                fullWidth
                size="lg"
                style={{
                  backgroundColor: "#1a1a1a",
                  fontSize: "15px",
                  fontWeight: 600,
                  padding: "12px 0",
                }}
                onClick={formik.handleSubmit}
              >
                Get Started
              </Button>
            </Stack>
          </form>

          {/* Divider */}
          <Group position="center" my={30} grow>
            <Box style={{ height: "1px", backgroundColor: "#ddd" }} />
            <Text size="xs" color="dimmed" style={{ whiteSpace: "nowrap" }}>
              Or sign in with
            </Text>
            <Box style={{ height: "1px", backgroundColor: "#ddd" }} />
          </Group>

          {/* Social Login Buttons */}
          <Group position="center" spacing="lg" grow={false}>
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
              }}
            >
              <FaGoogle size={20} color="#4285F4" />
            </ActionIcon>

            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
              }}
            >
              <FaFacebookF size={20} color="#1877F2" />
            </ActionIcon>

            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
              }}
            >
              <FaApple size={20} color="#000" />
            </ActionIcon>
          </Group>

          {/* Sign Up Link */}
          <Text align="center" size="sm" color="dimmed" mt={20}>
            Don't have an account?{" "}
            <Anchor component={Link} to="/register" weight={600} color="dark">
              Sign up
            </Anchor>
          </Text>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
