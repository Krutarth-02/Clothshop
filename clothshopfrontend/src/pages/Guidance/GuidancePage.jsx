import { createElement, useEffect, useState } from "react";
import {
  Accordion,
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Grid,
  Group,
  List,
  NavLink,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  Mail,
  Package,
  Phone,
  Ruler,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { footerGroups, guidancePages } from "../../data/guidance";

const topicIcons = {
  "/how-to-shop": ShoppingBag,
  "/size-guide": Ruler,
  "/security": ShieldCheck,
  "/shipping": Package,
  "/faq": CircleHelp,
};
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL;
const supportPhone = import.meta.env.VITE_SUPPORT_PHONE;

function ContactActions() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {[
        {
          title: "My Account",
          description: "Manage your profile and view purchase and payment information.",
          to: "/profile",
          icon: UserRound,
        },
        {
          title: "Password Help",
          description: "Recover access using your registered email.",
          to: "/forgot-password",
          icon: ShieldCheck,
        },
        ...(supportEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)
          ? [
              {
                title: "Email us",
                description: supportEmail,
                href: `mailto:${supportEmail}`,
                icon: Mail,
              },
            ]
          : []),
        ...(supportPhone && /^[+\d\s()-]{7,25}$/.test(supportPhone)
          ? [
              {
                title: "Call us",
                description: supportPhone,
                href: `tel:${supportPhone.replace(/[^+\d]/g, "")}`,
                icon: Phone,
              },
            ]
          : []),
      ].map(({ title, description, to, href, icon }) => (
        <Paper key={title} withBorder radius="md" p="lg">
          <Group mb="sm">
            {createElement(icon, { size: 20 })}
            <Text fw={600}>{title}</Text>
          </Group>
          <Text size="sm" c="dimmed" mb="md" lh={1.7}>
            {description}
          </Text>
          <Anchor {...(to ? { component: Link, to } : { href })} size="sm">
            {to ? "Open guide" : "Get in touch"} &rarr;
          </Anchor>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

function MeasurementGuide() {
  const [unit, setUnit] = useState("cm");
  const [measurement, setMeasurement] = useState("");
  const converted =
    typeof measurement === "number"
      ? unit === "cm"
        ? measurement / 2.54
        : measurement * 2.54
      : null;
  return (
    <Stack gap="lg">
      <Paper withBorder p="lg" radius="md">
        <Title order={2} size={22} fw={500} mb="md">
          How to take measurements
        </Title>
        <Table.ScrollContainer minWidth={420}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Measurement</Table.Th>
                <Table.Th>Where to measure</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {[
                [
                  "Chest / bust",
                  "Around the fullest part, keeping the tape horizontal.",
                ],
                [
                  "Waist",
                  "Around your natural waist, without holding your breath.",
                ],
                ["Hips", "Around the widest part of your hips and seat."],
                [
                  "Inside leg",
                  "From the crotch seam to the hem of trousers that fit you well.",
                ],
                [
                  "Shoulder width",
                  "Across a flat garment, from one shoulder seam to the other.",
                ],
                [
                  "Sleeve length",
                  "Along the sleeve from the shoulder seam to the cuff.",
                ],
              ].map(([name, description]) => (
                <Table.Tr key={name}>
                  <Table.Td fw={500}>{name}</Table.Td>
                  <Table.Td>{description}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
      <Paper withBorder p="lg" radius="md">
        <Title order={2} size={22} fw={500} mb={6}>
          Centimetres or inches?
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          Convert your measurement before comparing it with product information.
        </Text>
        <Group align="flex-end">
          <NumberInput
            label="Your measurement"
            value={measurement}
            onChange={setMeasurement}
            min={0}
            max={1000}
            decimalScale={2}
            style={{ flex: "1 1 180px" }}
          />
          <SegmentedControl
            aria-label="Measurement unit"
            value={unit}
            onChange={setUnit}
            data={[
              { label: "cm", value: "cm" },
              { label: "inches", value: "in" },
            ]}
          />
        </Group>
        <Text mt="md" fw={500} role="status">
          {converted === null
            ? "Enter a measurement to convert it."
            : `${measurement} ${unit === "cm" ? "cm" : "inches"} = ${converted.toFixed(2)} ${unit === "cm" ? "inches" : "cm"}`}
        </Text>
      </Paper>
    </Stack>
  );
}

function Sitemap() {
  const groups = [
    {
      title: "Explore the collection",
      links: [
        { label: "Home", to: "/" },
        { label: "Shop All", to: "/shop" },
        { label: "New Arrivals", to: "/new-arrivals" },
        { label: "Women", to: "/women" },
        { label: "Men", to: "/men" },
        { label: "Accessories", to: "/accessories" },
        { label: "About Us", to: "/about" },
      ],
    },
    {
      title: "Your account",
      links: [
        { label: "My Account", to: "/profile" },
        { label: "Order History", to: "/profile?section=orders" },
        { label: "Shopping bag", to: "/cart" },
        { label: "Sign in", to: "/login" },
        { label: "Create account", to: "/register" },
      ],
    },
    ...footerGroups.filter((group) => group.title !== "ABOUT US"),
  ];
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
      {groups.map((group) => (
        <Paper key={group.title} withBorder p="lg" radius="md">
          <Text fw={600} mb="md">
            {group.title}
          </Text>
          <Stack gap="xs">
            {group.links.map((link) => (
              <Anchor
                key={link.to}
                component={Link}
                to={link.to}
                size="sm"
                py={5}
              >
                {link.label}
              </Anchor>
            ))}
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

export default function GuidancePage({ page }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  useEffect(() => {
    const previous = document.title;
    document.title = `${page.title} | HIFASHOPNHUB`;
    return () => {
      document.title = previous;
    };
  }, [page.title]);
  const questions = (page.questions || []).filter((item) =>
    item.join(" ").toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <Box
      component="main"
      style={{ userSelect: "text", overflowWrap: "anywhere" }}
    >
      <Box
        py={{ base: 30, md: 48 }}
        bg="var(--mantine-color-default-hover)"
        style={{
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Container>
          <Breadcrumbs mb="lg">
            <Anchor component={Link} to="/" size="sm" c="dimmed">
              Home
            </Anchor>
            {page.path !== "/help" && (
              <Anchor component={Link} to="/help" size="sm" c="dimmed">
                Help Centre
              </Anchor>
            )}
            <Text size="sm">{page.title}</Text>
          </Breadcrumbs>
          <Text size="xs" c="dimmed" mb="sm" style={{ letterSpacing: 2 }}>
            HIFASHOPNHUB GUIDANCE
          </Text>
          <Title
            order={1}
            size="clamp(30px, 4vw, 48px)"
            fw={500}
            mb="md"
            style={{ letterSpacing: "-.035em" }}
          >
            {page.title}
          </Title>
          <Text c="dimmed" maw={680} lh={1.8}>
            {page.summary}
          </Text>
        </Container>
      </Box>
      <Container py={{ base: 28, md: 44 }}>
        <Select
          hiddenFrom="md"
          label="Choose a help topic"
          mb="xl"
          value={page.path}
          onChange={(value) => {
            if (value) navigate(value);
          }}
          allowDeselect={false}
          data={guidancePages.map((guide) => ({
            value: guide.path,
            label: guide.title,
          }))}
        />
        <Grid gutter={{ base: 28, lg: 48 }}>
          <Grid.Col span={3} visibleFrom="md">
            <Paper
              component="nav"
              aria-label="Help topics"
              withBorder
              radius="md"
              p="sm"
              pos="sticky"
              top={110}
              style={{ maxHeight: "calc(100dvh - 140px)", overflowY: "auto" }}
            >
              <Text
                size="xs"
                fw={600}
                c="dimmed"
                px="sm"
                py="md"
                style={{ letterSpacing: 1 }}
              >
                HOW CAN WE HELP?
              </Text>
              {guidancePages.map((guide) => (
                <NavLink
                  key={guide.path}
                  component={Link}
                  to={guide.path}
                  label={guide.title}
                  active={page.path === guide.path}
                  color="dark"
                  py="sm"
                />
              ))}
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Stack gap={32} maw={820}>
              {(page.sections || []).map((section, index) => (
                <Box
                  component="section"
                  key={section.title}
                  aria-labelledby={`guide-section-${index}`}
                >
                  <Title
                    id={`guide-section-${index}`}
                    order={2}
                    size={23}
                    fw={500}
                    mb="md"
                  >
                    {section.title}
                  </Title>
                  <Stack gap="sm">
                    {section.paragraphs?.map((paragraph) => (
                      <Text key={paragraph} size="sm" c="dimmed" lh={1.9}>
                        {paragraph}
                      </Text>
                    ))}
                    {section.bullets && (
                      <List
                        spacing="sm"
                        size="sm"
                        styles={{
                          item: {
                            lineHeight: 1.8,
                            color: "var(--mantine-color-dimmed)",
                          },
                        }}
                      >
                        {section.bullets.map((item) => (
                          <List.Item key={item}>{item}</List.Item>
                        ))}
                      </List>
                    )}
                  </Stack>
                </Box>
              ))}
              {page.type === "hub" && (
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {guidancePages
                    .filter((guide) =>
                      [
                        "/how-to-shop",
                        "/payments",
                        "/shipping",
                        "/cancellation-returns",
                        "/size-guide",
                        "/clothing-care",
                        "/faq",
                        "/contact",
                      ].includes(guide.path),
                    )
                    .map((guide) => {
                      const Icon = topicIcons[guide.path] || BookOpen;
                      return (
                        <Paper key={guide.path} withBorder p="lg" radius="md">
                          <ThemeIcon
                            variant="light"
                            color="gray"
                            size={40}
                            radius="md"
                            mb="md"
                          >
                            <Icon size={21} />
                          </ThemeIcon>
                          <Text fw={600} mb={7}>
                            {guide.title}
                          </Text>
                          <Text size="sm" c="dimmed" lh={1.7} mb="md">
                            {guide.summary}
                          </Text>
                          <Anchor component={Link} to={guide.path} size="sm">
                            Read guide &rarr;
                          </Anchor>
                        </Paper>
                      );
                    })}
                </SimpleGrid>
              )}
              {page.type === "size" && <MeasurementGuide />}
              {page.type === "contact" && <ContactActions />}
              {page.type === "sitemap" && <Sitemap />}
              {page.type === "faq" && (
                <Stack gap="lg">
                  <TextInput
                    aria-label="Search frequently asked questions"
                    placeholder="Search questions about your bag, account or payment..."
                    leftSection={<Search size={17} />}
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                  />
                  {questions.length ? (
                    <Accordion variant="separated" radius="md">
                      {questions.map(([question, answer]) => (
                        <Accordion.Item key={question} value={question}>
                          <Accordion.Control>{question}</Accordion.Control>
                          <Accordion.Panel>
                            <Text size="sm" c="dimmed" lh={1.9}>
                              {answer}
                            </Text>
                          </Accordion.Panel>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  ) : (
                    <Text c="dimmed">
                      No matching questions. Try another phrase or open Contact
                      & account help.
                    </Text>
                  )}
                </Stack>
              )}
              {page.path !== "/help" && (
                <Paper
                  p="lg"
                  radius="md"
                  bg="var(--mantine-color-default-hover)"
                >
                  <Group justify="space-between" gap="md">
                    <Stack gap={4}>
                      <Text fw={600}>Looking for something else?</Text>
                      <Text size="sm" c="dimmed">
                        Explore all our shopping and account guides.
                      </Text>
                    </Stack>
                    <Button
                      component={Link}
                      to="/help"
                      variant="default"
                      rightSection={<ArrowRight size={15} />}
                    >
                      Help Centre
                    </Button>
                  </Group>
                </Paper>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
