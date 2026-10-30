import { useState } from "react";
import { Alert, Anchor, Button, Group, Paper, SimpleGrid, Stack, Text, Textarea, TextInput, Title } from "@mantine/core";
import { Check, Send } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useSendContactMessageMutation } from "../../redux/contact/contactApi";

const emptyForm = { name: "", email: "", subject: "", message: "" };

export default function ContactForm() {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState("");
  const [sendMessage, { isLoading }] = useSendContactMessageMutation();
  const update = (field) => (event) => {
    const value = event.currentTarget.value;
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSuccess(false);
    setFailure("");
  };
  const submit = async (event) => {
    event.preventDefault();
    if (isLoading) return;
    setSuccess(false);
    setFailure("");
    const body = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
    const invalid = {};
    if (body.name.length < 2) invalid.name = "Enter your full name.";
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(body.email)) invalid.email = "Enter a valid email address.";
    if (body.subject.length < 3) invalid.subject = "Add a short subject.";
    if (body.message.length < 10) invalid.message = "Please include at least 10 characters.";
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    try {
      await sendMessage(body).unwrap();
      setValues(emptyForm);
      setSuccess(true);
      toast.success("Your message has been sent.");
    } catch (error) {
      setErrors(error?.data?.errors || {});
      setFailure(error?.data?.message || "Unable to send your message. Check your connection and try again.");
    }
  };

  return <Paper withBorder radius="md" p={{ base: 20, sm: 28 }}>
    <Stack gap="lg">
      <Stack gap={6}><Title order={2} fw={500} size={26}>Send us a message</Title><Text size="sm" c="dimmed">Have a product question or need help with your account? Tell us how we can help.</Text></Stack>
      {success && <Alert color="teal" icon={<Check size={18} />} title="Message sent" role="status">Thank you for getting in touch. Keep an eye on your email for a reply.</Alert>}
      {failure && <Alert color="red" title="Message not sent" role="alert">{failure}</Alert>}
      <form onSubmit={submit} noValidate aria-busy={isLoading}>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput label="Full name" name="name" autoComplete="name" required minLength={2} maxLength={80} value={values.name} onChange={update("name")} error={errors.name} disabled={isLoading} />
            <TextInput label="Email address" name="email" type="email" autoComplete="email" required maxLength={254} value={values.email} onChange={update("email")} error={errors.email} disabled={isLoading} />
          </SimpleGrid>
          <TextInput label="Subject" name="subject" required minLength={3} maxLength={120} placeholder="What would you like help with?" value={values.subject} onChange={update("subject")} error={errors.subject} disabled={isLoading} />
          <Textarea label="Message" name="message" required minLength={10} maxLength={5000} minRows={5} autosize maxRows={10} placeholder="Tell us about your question. For a purchase query, include the reference number." value={values.message} onChange={update("message")} error={errors.message} disabled={isLoading} />
          <Group justify="space-between"><Text size="xs" c="dimmed">Please don't include passwords, OTPs or card details.</Text><Text size="xs" c="dimmed">{values.message.length}/5000</Text></Group>
          <Text size="xs" c="dimmed">We'll use your name, email and message to respond to your enquiry. Read our <Anchor component={Link} to="/privacy" size="xs">privacy information</Anchor>.</Text>
          <Button type="submit" color="dark" loading={isLoading} leftSection={<Send size={16} />} style={{ alignSelf: "flex-start" }}>Send message</Button>
        </Stack>
      </form>
    </Stack>
  </Paper>;
}
