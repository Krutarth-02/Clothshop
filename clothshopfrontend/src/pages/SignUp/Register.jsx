import React from "react";
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
  Anchor,
  Image,
} from "@mantine/core";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User, Phone } from "lucide-react";
import { useRegisterMutation } from "../../redux/auth/authApi";
import Logo from "../../assets/icons/LOGO_1.png";

const Register = () => {
  const [register,{isLoading}] = useRegisterMutation();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
    },
    validate: (values) => {
      const errors = {};
      if (!values.fullName) {
        errors.fullName = "Full name is required";
      }
      if (!values.email) {
        errors.email = "Email is required";
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
      ) {
        errors.email = "Invalid email address";
      }
      if (!values.phone) {
        errors.phone = "Phone number is required";
      }
      if (!values.password) {
        errors.password = "Password is required";
      }
      return errors;
    },
    onSubmit: async (values, action) => {
      const res = await register(values).unwrap();
      console.log(res);
      
      if (res.message) {
        toast.success(res.message);
        action.resetForm();
        navigate("/login");
      } else {
        toast.error("Registration failed");
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
        <Card shadow="lg" radius="xl" p={40}>
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
            Create your account
          </Text>

          <Text
            align="center"
            size="sm"
            color="dimmed"
            mb={30}
            style={{ fontSize: "14px", lineHeight: 1.5 }}
          >
            Join now to manage orders, save favorites, and shop faster.
          </Text>

          <form onSubmit={formik.handleSubmit}>
            <Stack gap={20}>
              <TextInput
                placeholder="Full Name"
                name="fullName"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                leftSection={<User size={18} />}
                error={formik.touched.fullName && formik.errors.fullName}
                styles={{
                  input: {
                    backgroundColor: "#f0f0f0",
                    border: "none",
                    padding: "12px 16px 12px 42px",
                    fontSize: "14px",
                  },
                }}
              />

              <TextInput
                placeholder="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                leftSection={<Mail size={18} />}
                error={formik.touched.email && formik.errors.email}
                styles={{
                  input: {
                    backgroundColor: "#f0f0f0",
                    border: "none",
                    padding: "12px 16px 12px 42px",
                    fontSize: "14px",
                  },
                }}
              />

              <TextInput
                placeholder="Phone Number"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                leftSection={<Phone size={18} />}
                error={formik.touched.phone && formik.errors.phone}
                styles={{
                  input: {
                    backgroundColor: "#f0f0f0",
                    border: "none",
                    padding: "12px 16px 12px 42px",
                    fontSize: "14px",
                  },
                }}
              />

              <PasswordInput
                placeholder="Password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                leftSection={<Lock size={18} />}
                error={formik.touched.password && formik.errors.password}
                styles={{
                  input: {
                    backgroundColor: "#f0f0f0",
                    border: "none",
                    padding: "12px 16px 12px 42px",
                    fontSize: "14px",
                  },
                }}
              />

              <Button
                fullWidth
                size="lg"
                type="submit"
                loading={formik.isSubmitting || isLoading}  
                variant={formik.isSubmitting || isLoading ? "light" : "filled"}
              >
                Sign Up
              </Button>
            </Stack>
          </form>

          <Text align="center" size="sm" color="dimmed" mt={20}>
            Already have an account?{" "}
            <Anchor component={Link} to="/login" weight={600} color="dark">
              Sign in
            </Anchor>
          </Text>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;
