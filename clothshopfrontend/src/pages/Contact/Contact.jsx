import { Anchor, Box, Breadcrumbs, Button, Container, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { CircleHelp, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import ContactForm from "./ContactForm";

export default function Contact() {
  const email = import.meta.env.VITE_SUPPORT_EMAIL;
  const phone = import.meta.env.VITE_SUPPORT_PHONE;
  return <Container component="main" py={{ base: 28, md: 48 }} mih="65vh">
    <Breadcrumbs mb={28}><Anchor component={Link} to="/" size="sm" c="dimmed">Home</Anchor><Text size="sm">Contact Us</Text></Breadcrumbs>
    <Grid gutter={{ base: 28, md: 56 }}>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="lg">
          <Box><Text size="xs" c="dimmed" mb="sm" style={{ letterSpacing: 2 }}>GET IN TOUCH</Text><Title order={1} size="clamp(30px, 4vw, 42px)" fw={500}>Contact Us</Title></Box>
          <Text size="sm" c="dimmed" lh={1.8}>Questions about a product or your account? Send us a message and we'll reply to the email address you provide.</Text>
          <Box><Text fw={600} size="sm" mb={6}>Help with a purchase</Text><Text size="sm" c="dimmed" lh={1.8}>Include your purchase reference and product name so we can understand your enquiry.</Text></Box>
          {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <Group gap="xs"><Mail size={17} /><Anchor href={`mailto:${email}`} size="sm" c="inherit">{email}</Anchor></Group>}
          {phone && /^[+\d\s()-]{7,25}$/.test(phone) && <Group gap="xs"><Phone size={17} /><Anchor href={`tel:${phone.replace(/[^+\d]/g, "")}`} size="sm" c="inherit">{phone}</Anchor></Group>}
          <Button component={Link} to="/faq" variant="default" leftSection={<CircleHelp size={17} />} style={{ alignSelf: "flex-start" }}>Browse FAQs</Button>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8 }}><ContactForm /></Grid.Col>
    </Grid>
  </Container>;
}
