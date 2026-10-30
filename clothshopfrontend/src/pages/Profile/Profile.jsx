import LoadingState from "../../components/common/Loader";
import FormActions from "../../components/common/FormActions";
import AccountSidebar from "../../components/common/AccountSidebar";
import OrderHistory from "./OrderHistory";
import ErrorAlert from "../../components/common/ErrorAlert";
import { useState } from "react";
import { useFormik } from "formik";
import {
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Grid,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Link, useSearchParams } from "react-router-dom";
import { Package, Save, Trash2, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "../../redux/auth/authApi";
import DeleteAccountModal from "../../components/common/DeleteAccountModal";
import useAccountActions from "../../hooks/useAccountActions";

function ProfileContent({ user }) {
  const [params, setParams] = useSearchParams();
  const activeSection =
    params.get("section") === "orders" ? "orders" : "account";
  const selectSection = (section) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (section === "account") next.delete("section");
      else next.set("section", section);
      return next;
    });
  };
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState("");
  const { signOut, signingOut } = useAccountActions();
  const form = useFormik({
    initialValues: {
      fullName: user.fullName || "",
      phone: user.phone || "",
      city: user.city || "",
      country: user.country || "",
    },
    enableReinitialize: true,
    validate: (values) => {
      const errors = {};
      if (!values.fullName.trim()) errors.fullName = "Full name is required";
      return errors;
    },
    onSubmit: async (values) => {
      if (isLoading) return;
      setError("");
      try {
        const result = await updateProfile(values).unwrap();
        form.resetForm({
          values: {
            fullName: result.data.fullName || "",
            phone: result.data.phone || "",
            city: result.data.city || "",
            country: result.data.country || "",
          },
        });
        toast.success("Profile updated");
      } catch (failure) {
        setError(
          failure?.data?.message ||
            "Unable to save your profile. Please retry.",
        );
      }
    },
  });
  const field = (name) => ({
    name,
    value: form.values[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.touched[name] && form.errors[name],
    disabled: isLoading,
  });
  return (
    <>
      <Grid gutter={{ base: 24, lg: 40 }}>
        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
          <AccountSidebar
            user={user}
            active={activeSection}
            onSelect={selectSection}
            onSignOut={signOut}
            signingOut={signingOut}
            items={[
              {
                value: "account",
                label: "My Account",
                icon: <UserRound size={18} />,
              },
              {
                value: "orders",
                label: "Order History",
                icon: <Package size={18} />,
              },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
          {activeSection === "orders" ? (
            <OrderHistory />
          ) : (
            <Stack gap="xl">
              <Paper withBorder radius="md" p={{ base: 20, sm: 32 }}>
                <Title order={2} size={26} fw={500} mb="sm">
                  Personal details
                </Title>
                <Text size="sm" c="dimmed" mb="xl">
                  Keep your account details up to date.
                </Text>
                <form onSubmit={form.handleSubmit}>
                  <Stack gap="lg">
                    <ErrorAlert message={error} />
                    <TextInput
                      label="Full name"
                      autoComplete="name"
                      required
                      maxLength={200}
                      size="md"
                      {...field("fullName")}
                    />
                    <TextInput
                      label="Email address"
                      description="Your sign-in email."
                      value={user.email}
                      readOnly
                      size="md"
                    />
                    <TextInput
                      label="Phone number"
                      autoComplete="tel"
                      type="tel"
                      maxLength={100}
                      size="md"
                      {...field("phone")}
                    />
                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                      <TextInput
                        label="City"
                        autoComplete="address-level2"
                        maxLength={100}
                        size="md"
                        {...field("city")}
                      />
                      <TextInput
                        label="Country"
                        autoComplete="country-name"
                        maxLength={100}
                        size="md"
                        {...field("country")}
                      />
                    </SimpleGrid>
                    <FormActions
                      actions={[
                        {
                          label: "Save changes",
                          type: "submit",
                          color: "dark",
                          leftSection: <Save size={17} />,
                          loading: isLoading,
                          disabled: !form.dirty,
                        },
                      ]}
                    />
                  </Stack>
                </form>
              </Paper>
              <Paper withBorder radius="md" p={{ base: 20, sm: 32 }}>
                <Title order={2} size={23} fw={500} mb="sm">
                  Account management
                </Title>
                <>
                  <Text size="sm" c="dimmed" lh={1.8} mb="lg">
                    Permanently delete your account. Your password and a final
                    confirmation are required.
                  </Text>
                  <Button
                    variant="outline"
                    color="red"
                    leftSection={<Trash2 size={17} />}
                    onClick={() => setDeleteOpen(true)}
                  >
                    Delete account
                  </Button>
                </>
              </Paper>
            </Stack>
          )}
        </Grid.Col>
      </Grid>
      {deleteOpen && (
        <DeleteAccountModal
          email={user.email}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </>
  );
}

export default function Profile() {
  const { data, error, refetch } = useGetProfileQuery();
  return (
    <Container component="main" py={{ base: 32, md: 56 }} mih="65vh">
      <Breadcrumbs>
        <Anchor component={Link} to="/" size="sm" c="dimmed">
          Home
        </Anchor>
        <Text size="sm">My profile</Text>
      </Breadcrumbs>
      {error ? (
        <ErrorAlert title="Unable to load profile" onRetry={refetch} />
      ) : data?.data ? (
        <ProfileContent key={data.data._id} user={data.data} />
      ) : (
        <LoadingState label="Loading profile" minHeight={160} />
      )}
    </Container>
  );
}
