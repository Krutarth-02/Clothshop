import { Anchor, Button, PasswordInput, TextInput } from "@mantine/core";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";

export const AuthField = ({
  formik,
  name,
  label,
  password = false,
  icon,
  ...props
}) => {
  const Field = password ? PasswordInput : TextInput;
  return (
    <Field
      size="md"
      styles={{ input: { fontSize: 16 } }}
      name={name}
      label={label}
      placeholder={label}
      leftSection={icon}
      {...(formik && {
        value: formik.values[name],
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
        error: formik.touched[name] && formik.errors[name],
      })}
      {...props}
    />
  );
};

export const AuthSubmit = (props) => {
  return (
    <Button
      fullWidth
      size="lg"
      radius={0}
      color="dark"
      type="submit"
      {...props}
    />
  );
};

export const AuthBackLink = ({
  to = "/login",
  children = "Back to sign in",
  ...props
}) => {
  return (
    <Anchor
      component={Link}
      to={to}
      c="dimmed"
      size="sm"
      mt="xl"
      display="block"
      {...props}
    >
      {children}
    </Anchor>
  );
};

export const RecoveryPrompt = ({ title, description, children }) => {
  return (
    <AuthLayout title={title} description={description}>
      <AuthSubmit
        component={Link}
        to="/forgot-password"
        type="button"
        styles={{
          root: { height: "auto", minHeight: 50, paddingBlock: 12 },
          label: { whiteSpace: "normal", textAlign: "center" },
        }}
      >
        {children}
      </AuthSubmit>
      <AuthBackLink />
    </AuthLayout>
  );
};
