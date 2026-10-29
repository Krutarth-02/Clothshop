import {
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Grid,
  Group,
  Image,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { ArrowUpRight, Layers, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "../../components/common/Reveal";

export default function About() {
  return (
    <Box
      component="main"
      style={{ userSelect: "text", overflowWrap: "anywhere" }}
    >
      <Container
        py={{ base: 32, md: 56 }}
      >
        <Breadcrumbs>
          <Anchor component={Link} to="/" c="dimmed" size="sm">
            Home
          </Anchor>
          <Text size="sm">About Us</Text>
        </Breadcrumbs>
        <Reveal>
          <Text size="xs" c="dimmed" mb="lg" style={{ letterSpacing: 2 }}>
            ABOUT CEVRALIQ
          </Text>
          <Title
            order={1}
            fw={500}
            size="clamp(42px, 6vw, 80px)"
            lh={1.05}
            maw={800}
            style={{ letterSpacing: "-.05em" }}
          >
            Clothes are personal.
            <br />
            <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              So are we.
            </span>
          </Title>
          <Text c="dimmed" mt="xl" maw={580} lh={1.9}>
            A space to explore your style, find a fresh point of view, and bring
            a little more intention to the everyday.
          </Text>
        </Reveal>
        <Reveal py={{ base: 48, md: 80 }}>
          <Grid gutter={{ base: 32, md: 64 }} align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Image
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85"
                alt="Everyday clothing arranged on a rail"
                h={{ base: 300, md: 450 }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text size="xs" c="dimmed" mb="lg" style={{ letterSpacing: 2 }}>
                OUR PERSPECTIVE
              </Text>
              <Title order={2} fw={500} size="clamp(30px, 4vw, 46px)" lh={1.15}>
                A wardrobe that feels like you.
              </Title>
              <Text c="dimmed" mt="xl" lh={1.9}>
                We believe personal style starts with the pieces you reach for,
                live in, and make your own. Getting dressed is a chance to
                express who you are, wherever the day takes you.
              </Text>
              <Text c="dimmed" mt="md" lh={1.9}>
                At Cevraliq, you can explore clothing and accessories in one
                place, discover new arrivals, and find inspiration for your
                everyday wardrobe.
              </Text>
              <Button
                component={Link}
                to="/shop"
                color="dark"
                radius={0}
                mt="xl"
                mih={48}
                rightSection={<ArrowUpRight size={18} />}
              >
                Explore the collection
              </Button>
            </Grid.Col>
          </Grid>
        </Reveal>
        <Reveal
          component="section"
          pb={{ base: 48, md: 80 }}
          aria-label="What inspires Cevraliq"
        >
          <Text size="xs" c="dimmed" mb="lg" style={{ letterSpacing: 2 }}>
            INDIVIDUAL BY DESIGN
          </Text>
          <Title order={2} fw={500} size={32} mb={32}>
            Our approach to everyday style.
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {[
              [
                <UserRound size={26} strokeWidth={1.4} />,
                "Personal expression",
                "Start with what speaks to you. Build a wardrobe around your own taste and your everyday life.",
              ],
              [
                <Layers size={26} strokeWidth={1.4} />,
                "Everyday versatility",
                "Explore pieces that work together, from familiar favourites to something a little unexpected.",
              ],
              [
                <Sparkles size={26} strokeWidth={1.4} />,
                "Fresh inspiration",
                "Discover a new perspective through our clothing categories, accessories, and latest additions.",
              ],
            ].map(([icon, title, description]) => (
              <Box
                key={title}
                p={{ base: 24, md: 32 }}
                bg="var(--mantine-color-default-hover)"
              >
                {icon}
                <Title order={3} size={21} fw={500} mt="xl">
                  {title}
                </Title>
                <Text size="sm" c="dimmed" lh={1.8} mt="md">
                  {description}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Reveal>
      </Container>
      <Box bg="#e4e6d5" c="#252820" py={{ base: 40, md: 60 }}>
        <Container>
          <Group justify="space-between" gap="xl">
            <Box>
              <Text size="xs" mb="md" style={{ letterSpacing: 2 }}>
                YOUR NEXT CHAPTER
              </Text>
              <Title order={2} fw={500} size="clamp(30px, 4vw, 44px)">
                Find something that feels like you.
              </Title>
            </Box>
            <Button
              component={Link}
              to="/new-arrivals"
              color="dark"
              radius={0}
              mih={48}
              rightSection={<ArrowUpRight size={18} />}
            >
              Discover new arrivals
            </Button>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}
