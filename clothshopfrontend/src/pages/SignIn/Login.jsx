import { AuthField, AuthSubmit } from "../../components/common/AuthControls";
import { Text, Group, Stack, Anchor, Checkbox } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Lock, Mail } from "lucide-react";
// import { FaGoogle, FaFacebookF, FaApple } from "react-icons/fa";
// import { ActionIcon } from "@mantine/core";
import { useDispatch } from "react-redux";
import { api } from "../../redux/api/api";
import { useLoginMutation } from "../../redux/auth/authApi";
import AuthLayout from "../../components/common/AuthLayout";

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
          dispatch(api.util.resetApiState());
          await dispatch(
            api.util.upsertQueryData("getProfile", undefined, {
              data: res.data,
            }),
          );
          action.resetForm();
          navigate(res.data.role === "admin" ? "/admin" : "/home");
        } else {
          toast.error("Login failed");
        }
      } catch (error) {
        toast.error(error?.data?.message || error?.message || "Login failed");
      }
    },
  });

  return (
    <AuthLayout
      title="Welcome back."
      description="Your next great outfit is waiting. Sign in to your Cevraliq."
    >
      <form onSubmit={formik.handleSubmit}>
        <Stack gap={20}>
          <AuthField
            formik={formik}
            label="Email"
            name="email"
            autoComplete="email"
            icon={<Mail size={18} />}
          />

          <AuthField
            formik={formik}
            password
            label="Password"
            name="password"
            autoComplete="current-password"
            icon={<Lock size={18} />}
          />
          <Group justify="space-between" gap="sm">
            <Checkbox
              size="sm"

              label="Remember me"
              name="rememberMe"
              checked={formik.values.rememberMe}
              onChange={(event) =>
                formik.setFieldValue("rememberMe", event.currentTarget.checked)
              }
            />
            <Anchor component={Link} to="/forgot-password" ta="right" size="sm">
              Forgot password?
            </Anchor>
          </Group>

          <AuthSubmit
            variant={!formik.values.rememberMe ? "light" : "filled"}
            disabled={!formik.values.rememberMe}
            loading={isLoading}
          >
            Sign In
          </AuthSubmit>
        </Stack>
      </form>
      <Text size="xs" c="dimmed" mt="sm">
        Select Remember me to enable sign in.
      </Text>
      {/* Previous social sign-in UI (disabled).
      <Group justify="center" mt="sm">
        <ActionIcon disabled variant="default" aria-label="Google sign-in unavailable"><FaGoogle /></ActionIcon>
        <ActionIcon disabled variant="default" aria-label="Facebook sign-in unavailable"><FaFacebookF /></ActionIcon>
        <ActionIcon disabled variant="default" aria-label="Apple sign-in unavailable"><FaApple /></ActionIcon>
      </Group>
      */}
      <Text ta="center" size="sm" c="dimmed" mt="xl">
        New around here?{" "}
        <Anchor component={Link} to="/register" c="var(--mantine-color-text)">
          Create an account
        </Anchor>
      </Text>
    </AuthLayout>
  );
};

export default Login;
