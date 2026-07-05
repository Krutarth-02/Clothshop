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
  ActionIcon,
  Anchor,
  Image,
  Checkbox,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Lock, Mail } from "lucide-react";
import { FaGoogle, FaFacebookF, FaApple } from "react-icons/fa";
import { useLoginMutation } from "../../redux/auth/authApi";
import { useGoogleLogin } from "@react-oauth/google";
import Logo from "../../assets/icons/LOGO_1.png";
import axios from "axios";
const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  // const googleLogin = useGoogleLogin({
  //   onSuccess: async (tokenResponse) => {
  //     try {
  //       const googleUser = await axios.get(
  //         "https://www.googleapis.com/oauth2/v3/userinfo",
  //         {
  //           headers: {
  //             Authorization: `Bearer ${tokenResponse.access_token}`,
  //           },
  //         },
  //       );

  //       const { email, name, picture } = googleUser.data;

  //       const res = await login({
  //         email,
  //         name,
  //         picture,
  //         googleAuth: true,
  //       }).unwrap();

  //       if (res.message) {
  //         toast.success("Google Login Successful");
  //         localStorage.setItem("userId", res.data._id);
  //         navigate("/home");
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       toast.error("Google Login Failed");
  //     }
  //   },
  // });
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
      rememberMe: false,
    },
    validate,
    onSubmit: async (values, action) => {
      try {
        const res = await login(values).unwrap();
        if (res.data) {
          toast.success(res.message);
          localStorage.setItem("userId", res.data._id);
          action.resetForm();
          navigate("/home");
        } else {
          toast.error("Login failed");
        }
      } catch (error) {
        toast.error(error?.data?.message || error?.message || "Login failed");
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
          {/* LOGO */}

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

          {/* HEADING */}

          <Text
            ta="center"
            size="xl"
            fw={700}
            mb={12}
            style={{
              fontSize: "24px",
              color: "#1a1a1a",
            }}
          >
            Sign in with email
          </Text>

          <Text
            ta="center"
            size="sm"
            c="dimmed"
            mb={30}
            style={{
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            Make a new doc to bring your words, data, and teams together.
          </Text>

          {/* FORM */}

          <form onSubmit={formik.handleSubmit}>
            <Stack gap={20}>
              <TextInput
                placeholder="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                leftSection={<Mail size={18} />}
              />

              <PasswordInput
                placeholder="Password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                leftSection={<Lock size={18} />}
              />
              <Box style={{ display: "flex", justifyContent: "space-between" }}>
                <Checkbox
                  size="sm"
                  mr="xl"
                  label="Remember me"
                  name="rememberMe"
                  checked={formik.values.rememberMe}
                  onChange={(event) =>
                    formik.setFieldValue(
                      "rememberMe",
                      event.currentTarget.checked,
                    )
                  }
                  styles={{ input: { cursor: "pointer" } }}
                />
                <Anchor
                  component={Link}
                  to="/forgot-password"
                  ta="right"
                  size="sm"
                >
                  Forgot password?
                </Anchor>
              </Box>

              <Button
                fullWidth
                size="lg"
                type="submit"
                variant={!formik.values.rememberMe ? "light" : "filled"}
                disabled={!formik.values.rememberMe}
                loading={isLoading}
              >
                Sign In
              </Button>
            </Stack>
          </form>
          <Group justify="center" my={30}>
            <Text size="xs" c="dimmed">
              Or sign in with
            </Text>
          </Group>
          <Group justify="center">
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              onClick={() => googleLogin()}
              p={5}
            >
              {/* <FaGoogle size={20} color="#4285F4" /> */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
                <path
                  fill="#fff"
                  d="M44.59 4.21a63.28 63.28 0 004.33 120.9 67.6 67.6 0 0032.36.35 57.13 57.13 0 0025.9-13.46 57.44 57.44 0 0016-26.26 74.33 74.33 0 001.61-33.58H65.27v24.69h34.47a29.72 29.72 0 01-12.66 19.52 36.16 36.16 0 01-13.93 5.5 41.29 41.29 0 01-15.1 0A37.16 37.16 0 0144 95.74a39.3 39.3 0 01-14.5-19.42 38.31 38.31 0 010-24.63 39.25 39.25 0 019.18-14.91A37.17 37.17 0 0176.13 27a34.28 34.28 0 0113.64 8q5.83-5.8 11.64-11.63c2-2.09 4.18-4.08 6.15-6.22A61.22 61.22 0 0087.2 4.59a64 64 0 00-42.61-.38z"
                />
                <path
                  fill="#e33629"
                  d="M44.59 4.21a64 64 0 0142.61.37 61.22 61.22 0 0120.35 12.62c-2 2.14-4.11 4.14-6.15 6.22Q95.58 29.23 89.77 35a34.28 34.28 0 00-13.64-8 37.17 37.17 0 00-37.46 9.74 39.25 39.25 0 00-9.18 14.91L8.76 35.6A63.53 63.53 0 0144.59 4.21z"
                />
                <path
                  fill="#f8bd00"
                  d="M3.26 51.5a62.93 62.93 0 015.5-15.9l20.73 16.09a38.31 38.31 0 000 24.63q-10.36 8-20.73 16.08a63.33 63.33 0 01-5.5-40.9z"
                />
                <path
                  fill="#587dbd"
                  d="M65.27 52.15h59.52a74.33 74.33 0 01-1.61 33.58 57.44 57.44 0 01-16 26.26c-6.69-5.22-13.41-10.4-20.1-15.62a29.72 29.72 0 0012.66-19.54H65.27c-.01-8.22 0-16.45 0-24.68z"
                />
                <path
                  fill="#319f43"
                  d="M8.75 92.4q10.37-8 20.73-16.08A39.3 39.3 0 0044 95.74a37.16 37.16 0 0014.08 6.08 41.29 41.29 0 0015.1 0 36.16 36.16 0 0013.93-5.5c6.69 5.22 13.41 10.4 20.1 15.62a57.13 57.13 0 01-25.9 13.47 67.6 67.6 0 01-32.36-.35 63 63 0 01-23-11.59A63.73 63.73 0 018.75 92.4z"
                />
              </svg>
            </ActionIcon>

            {/* <ActionIcon variant="default" size="lg" radius="md" p={5} onClick={() => handleFacebookLogin(facebookResponse)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
                <rect
                  fill="#3d5a98"
                  x="4.83"
                  y="4.83"
                  width="118.35"
                  height="118.35"
                  rx="6.53"
                  ry="6.53"
                />
                <path
                  fill="#fff"
                  d="M86.48 123.17V77.34h15.38l2.3-17.86H86.48v-11.4c0-5.17 1.44-8.7 8.85-8.7h9.46v-16A126.56 126.56 0 0091 22.7c-13.62 0-23 8.3-23 23.61v13.17H52.62v17.86H68v45.83z"
                />
              </svg>
            </ActionIcon> */}

            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              // onClick={facebookLogin}
            >
              <FaFacebookF size={20} color="#1877F2" />
            </ActionIcon>

            <ActionIcon variant="default" size="lg" radius="md">
              <FaApple size={20} color="#000" />
            </ActionIcon>
          </Group>

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
