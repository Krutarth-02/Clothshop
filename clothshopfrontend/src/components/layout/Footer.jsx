import { createElement } from "react";
import { Anchor, Box, Button, Container, Divider, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { ArrowRight, ArrowUp, CircleHelp, ShoppingBag, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "../common/BrandLogo";
import { footerGroups } from "../../data/guidance";

export default function Footer() {
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL;
  return (
    <Box component="footer" pt={{ base: 32, md: 44 }} pb={20} style={{ background: "#18201c", color: "#edf0e9" }}>
      <Container>
        <Group justify="space-between" align="center" gap="lg" mb={28}>
          <Anchor component={Link} to="/" c="inherit" underline="never" aria-label="HIFASHOPNHUB home"><BrandLogo /></Anchor>
          <Text size="sm" c="#b9c1b8" maw={380} lh={1.7}>Clothing and accessories for your everyday style. Explore the collection, find your fit and save your favourites.</Text>
        </Group>
        <Divider color="#354137" mb={28} />
        <Grid gutter={{ base: 24, md: 28 }}>
          {footerGroups.map((group) => <Grid.Col key={group.title} span={{ base: 6, sm: 3, lg: 2 }}>
            <Stack component="nav" aria-label={group.title} gap={2}>
              <Text size="xs" fw={600} c="#97a594" mb={12} style={{ letterSpacing: 1.3 }}>{group.title}</Text>
              {group.links.map((link) => <Anchor key={link.to} component={Link} to={link.to} c="#edf0e9" size="sm" underline="hover" py={8} style={{ display: "block", lineHeight: 1.5, overflowWrap: "anywhere" }}>{link.label}</Anchor>)}
            </Stack>
          </Grid.Col>)}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Box p={{ base: 20, lg: 24 }} style={{ background: "#222d25", border: "1px solid #3b493d", borderRadius: 12 }}>
              <Group gap={8} mb="md"><CircleHelp size={18} color="#d7c698" /><Text size="xs" fw={600} c="#d7c698" style={{ letterSpacing: 1.3 }}>NEW HERE? START HERE.</Text></Group>
              <Title order={3} size={23} fw={500} c="#f5f3ea" mb={10}>Need a little guidance?</Title>
              <Text size="sm" c="#c2cbbf" lh={1.8} mb="lg">Find answers about sizes, your shopping bag and your account. Our shopping guide helps you make the most of HIFASHOPNHUB.</Text>
              <Button component={Link} to="/how-to-shop" fullWidth color="gray" variant="white" radius="sm" rightSection={<ArrowRight size={16} />}>Explore the shopping guide</Button>
              {supportEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail) && <Anchor href={"mailto:" + supportEmail} c="#d7c698" size="sm" mt="md" display="block">{supportEmail}</Anchor>}
            </Box>
          </Grid.Col>
        </Grid>
        <Divider color="#354137" mt={32} mb={20} />
        <Group justify="space-between" gap="lg">
          <Group gap={{ base: 18, sm: 26 }}>
            {[
              { label: "Shopping bag", to: "/cart", icon: ShoppingBag },
              { label: "My Account", to: "/profile", icon: UserRound },
              { label: "Help Centre", to: "/help", icon: CircleHelp },
            ].map(({ label, to, icon }) => <Anchor key={to} component={Link} to={to} c="#d5dccf" size="xs" underline="hover" style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 36 }}>{createElement(icon, { size: 15, color: "#d7c698" })}{label}</Anchor>)}
          </Group>
          <Group gap="md">
            <Text size="xs" c="#b9c1b8">&copy; {new Date().getFullYear()} HIFASHOPNHUB. All rights reserved.</Text>
            <Anchor component="button" type="button" c="#d5dccf" size="xs" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 36 }}><ArrowUp size={14} />Top</Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
