import { useState } from "react";
import { useFormik } from "formik";
import {
  Alert,
  Anchor,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { LogOut, Save, ShoppingBag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "../../redux/auth/authApi";
import DeleteAccountModal from "../../components/common/DeleteAccountModal";
import useAccountActions from "../../hooks/useAccountActions";

function ProfileContent({ user }) {
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
        form.resetForm({ values: {
          fullName: result.data.fullName || "",
          phone: result.data.phone || "",
          city: result.data.city || "",
          country: result.data.country || "",
        } });
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
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder p="xl" radius="md">
            <Stack align="flex-start" gap="lg">
              <Avatar
                src={user.image || null}
                name={user.fullName}
                color="gray"
                variant="light"
                size={72}
                radius="xl"
              />
              <Box style={{ minWidth: 0, overflowWrap: "anywhere" }}>
                <Title order={2} size={24} fw={500}>
                  {user.fullName}
                </Title>
                <Text size="sm" c="dimmed" mt={6}>
                  {user.email}
                </Text>
              </Box>
              <Badge variant="light" color="gray">
                Customer account
              </Badge>
              <Button
                component={Link}
                to="/cart"
                fullWidth
                variant="default"
                leftSection={<ShoppingBag size={17} />}
              >
                View shopping bag
              </Button>
              <Button
                fullWidth
                variant="subtle"
                color="gray"
                leftSection={<LogOut size={17} />}
                loading={signingOut}
                onClick={signOut}
              >
                Sign out
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 8 }}>
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
                  {error && (
                    <Alert color="red" role="alert">
                      {error}
                    </Alert>
                  )}
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
                  <Group justify="flex-end">
                    <Button
                      type="submit"
                      color="dark"
                      leftSection={<Save size={17} />}
                      loading={isLoading}
                      disabled={!form.dirty}
                    >
                      Save changes
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>
            <Paper withBorder radius="md" p={{ base: 20, sm: 32 }}>
              <Title order={2} size={23} fw={500} mb="sm">
                Account management
              </Title>
              <>
                  <Text size="sm" c="dimmed" lh={1.8} mb="lg">
                    Permanently delete your account.
                    Your password and a final confirmation are required.
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
      <Text size="xs" c="dimmed" mb="sm" style={{ letterSpacing: 2 }}>
        YOUR CEVRALIQ
      </Text>
      <Title order={1} fw={500} size="clamp(30px, 4vw, 44px)" mb={32}>
        My profile
      </Title>
      {error ? (
        <Alert color="red" title="Unable to load profile">
          <Button variant="default" mt="md" onClick={refetch}>
            Retry
          </Button>
        </Alert>
      ) : data?.data ? (
        <ProfileContent key={data.data._id} user={data.data} />
      ) : (
        <Text c="dimmed">Loading profile...</Text>
      )}
    </Container>
  );
}
