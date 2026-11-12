import { useFormik } from "formik";
import { Alert, Anchor, Badge, Button, Stack, Text } from "@mantine/core";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGetAdminSessionQuery, useLoginAdminMutation } from "../../redux/admin/adminApi";
import { api } from "../../redux/api/api";
import AuthLayout from "../../components/common/AuthLayout";
import { AuthField } from "../../components/common/AuthControls";
import LoadingState from "../../components/common/Loader";

export default function AdminLogin() {
  const { data, error: sessionError, isLoading } = useGetAdminSessionQuery(undefined, { refetchOnMountOrArgChange: true });
  const [login, { error, isLoading: signingIn }] = useLoginAdminMutation();
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validate: values => {
      const errors = {};
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter your administrator email.";
      if (!values.password) errors.password = "Enter your password.";
      return errors;
    },
    onSubmit: async values => {
      try {
        const response = await login(values).unwrap();
        dispatch(api.util.invalidateTags(["AdminData"]));
        await dispatch(api.util.upsertQueryData("getAdminSession", undefined, response));
      } catch { /* Server errors are displayed below. */ }
    },
  });
  if (isLoading) return <LoadingState label="Checking admin session" />;
  if (data?.data && !sessionError) return <Navigate to="/admin" replace />;
  return <AuthLayout compact title="Your store. Your workspace." description="Sign in to manage your catalog, customers and daily operations.">
    <Badge color="blue" variant="light" leftSection={<ShieldCheck size={13} />} mb="xl">ADMIN ACCESS</Badge>
    {error && <Alert color="red" title="Sign-in unsuccessful" mb="lg">{error?.data?.message || "Unable to reach the server. Please retry."}</Alert>}
    <form onSubmit={formik.handleSubmit} noValidate><Stack gap="lg">
      <AuthField formik={formik} name="email" label="Admin email" type="email" autoComplete="username" icon={<Mail size={18} />} maxLength={200} />
      <AuthField formik={formik} name="password" label="Password" password autoComplete="current-password" icon={<Lock size={18} />} />
      <Button type="submit" size="lg" color="blue" loading={signingIn}>Sign in to workspace</Button>
    </Stack></form>
    <Text size="xs" c="dimmed" mt="lg">Only authorized administrators can access this workspace. Contact the store owner if you need access.</Text>
    <Anchor component={Link} to="/" size="sm" c="dimmed" mt="lg" display="block">Back to storefront</Anchor>
  </AuthLayout>;
}
