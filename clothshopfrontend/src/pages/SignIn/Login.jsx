import { storeSessionHints } from "../../redux/api/baseQueryWithAuth";
import { AuthField, AuthSubmit, SocialSignIn } from "../../components/common/AuthControls";
import { Divider, Text, Group, Stack, Anchor, Checkbox } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Lock, Mail } from "lucide-react";
import { useDispatch } from "react-redux";
import { api } from "../../redux/api/api";
import { useLoginMutation } from "../../redux/auth/authApi";
import AuthLayout from "../../components/common/AuthLayout";

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const finishLogin = async (res) => {
    if (!res.data?._id) throw new Error("Login failed");
    storeSessionHints(res.data);
    dispatch(api.util.resetApiState());
    await dispatch(api.util.upsertQueryData("getProfile", undefined, { data: res.data }));
    toast.success(res.message);
    navigate("/home");
  };
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
        await finishLogin(res);
        action.resetForm();
      } catch (error) {
        toast.error(error?.data?.message || error?.message || "Login failed");
      }
    },
  });

  return (
    <AuthLayout
      compact
      title="Welcome back."
      description="Sign in to manage your account and continue exploring HIFASHOPNHUB."
    >
      <form onSubmit={formik.handleSubmit}>
        <Stack gap={14}>
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
            size="md"
            variant={!formik.values.rememberMe ? "light" : "filled"}
            disabled={!formik.values.rememberMe}
            loading={isLoading}
          >
            Sign In
          </AuthSubmit>
        </Stack>
      </form>
      <Text size="xs" c="dimmed" mt={6}>
        Select Remember me to enable sign in.
      </Text>
      <Divider label="Or continue with" labelPosition="center" my={12} />
      <SocialSignIn busy={isLoading || formik.isSubmitting} onSignIn={async request => {
        const response = await login({ ...request, rememberMe: formik.values.rememberMe }).unwrap();
        await finishLogin(response);
      }} />
      <Text ta="center" size="sm" c="dimmed" mt={16}>
        New around here?{" "}
        <Anchor component={Link} to="/register" c="var(--mantine-color-text)">
          Create an account
        </Anchor>
      </Text>
    </AuthLayout>
  );
};

export default Login;
