import { AuthField, AuthSubmit } from "../../components/common/AuthControls";
import { Text, Stack, Anchor } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Lock, Mail, User, Phone } from "lucide-react";
import { useRegisterMutation } from "../../redux/auth/authApi";
import AuthLayout from "../../components/common/AuthLayout";

const Register = () => {
  const [register, { isLoading }] = useRegisterMutation();
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
    <AuthLayout
      title="Create your account."
      description="Join HIFASHOPNHUB to manage your profile and view your purchase information in one place."
    >
      <form onSubmit={formik.handleSubmit}>
        <Stack gap={20}>
          <AuthField
            formik={formik}
            label="Full Name"
            name="fullName"
            autoComplete="name"
            icon={<User size={18} />}
          />

          <AuthField
            formik={formik}
            label="Email"
            name="email"
            autoComplete="email"
            icon={<Mail size={18} />}
          />

          <AuthField
            formik={formik}
            label="Phone Number"
            name="phone"
            autoComplete="tel"
            icon={<Phone size={18} />}
          />

          <AuthField
            formik={formik}
            password
            label="Password"
            name="password"
            autoComplete="new-password"
            icon={<Lock size={18} />}
          />

          <AuthSubmit
            loading={formik.isSubmitting || isLoading}
            variant={formik.isSubmitting || isLoading ? "light" : "filled"}
          >
            Sign Up
          </AuthSubmit>
        </Stack>
      </form>
      <Text ta="center" size="sm" c="dimmed" mt="xl">
        Already part of the club?{" "}
        <Anchor component={Link} to="/login" c="var(--mantine-color-text)">
          Sign in
        </Anchor>
      </Text>
    </AuthLayout>
  );
};

export default Register;
