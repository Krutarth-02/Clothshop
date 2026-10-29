import { useEffect, useState } from "react";
import {
  Alert,
  ActionIcon,
  TextInput,
  Anchor,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Image,
  SegmentedControl,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import {
  ArrowRight,
  ArrowUpRight,
  Layers,
  Leaf,
  Sparkles,
  Search,
  X,
} from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useGetProductsQuery } from "../../redux/auth/productApi";
import ProductGrid from "../../components/common/ProductGrid";
import ProductPreview from "../../components/common/ProductPreview";
import ScrollReveal from "../../components/common/ScrollReveal";
import CollectionHero from "../../components/home/CollectionHero";
import CollectionCard from "../../components/home/CollectionCard";
import EditFinder from "../../components/home/EditFinder";

const storyImage =
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80";

const clothingCategories = [
  {
    label: "Women",
    to: "/women",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    subtitle: "A little effortless.",
    headline: "Less ordinary.",
    accent: "More you.",
    description:
      "For slow mornings, spontaneous evenings, and everything in between. Find your everyday favourites.",
  },
  {
    label: "Men",
    to: "/men",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
    subtitle: "A new kind of classic.",
    headline: "Your rules.",
    accent: "Your style.",
    description:
      "A fresh take on the familiar. Discover the men's collection and make the everyday your own.",
  },
  {
    label: "Accessories",
    to: "/accessories",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
    subtitle: "It's all in the details.",
    headline: "Small details.",
    accent: "Big impact.",
    description:
      "The finishing touches that pull it all together. Explore accessories with a point of view.",
  },
];

const headingStyle = { letterSpacing: "-.055em", overflowWrap: "anywhere" };
const buttonStyles = {
  root: { height: "auto", minHeight: 48, paddingBlock: 12, maxWidth: "100%" },
  label: { whiteSpace: "normal", textAlign: "center" },
};
const filters = ["All", ...clothingCategories.map(({ label }) => label)];

function SectionHeading({ label, title, children }) {
  return (
    <Group justify="space-between" align="end" mb={32} gap="lg">
      <Box>
        <Text size="xs" c="dimmed" mb={12} style={{ letterSpacing: 2 }}>
          {label}
        </Text>
        <Title
          order={2}
          fw={500}
          size="clamp(30px, 4vw, 48px)"
          lh={1.1}
          style={headingStyle}
        >
          {title}
        </Title>
      </Box>
      {children}
    </Group>
  );
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const category = filters.includes(selectedCategory)
    ? selectedCategory
    : "All";
  const setCategory = (value) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value === "All") next.delete("category");
        else next.set("category", value);
        return next;
      },
      { preventScrollReset: true },
    );
  };
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, refetch } = useGetProductsQuery();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const products = Array.isArray(data?.data) ? data.data : [];
  const query = search.trim().toLowerCase();
  const matchingProducts = products
    .filter(
      (product) =>
        (category === "All" ||
          product.category?.toLowerCase() === category.toLowerCase()) &&
        (!query ||
          [product.name, product.description, product.category].some((value) =>
            value?.toLowerCase().includes(query),
          )),
    )
    .sort(
      (a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0),
    );
  const visibleProducts = matchingProducts.slice(0, 8);
  const needsLogin = error?.status === 401 || error?.status === 403;

  useEffect(() => {
    const section = location.hash.slice(1) || location.state?.section;
    if (section)
      document
        .getElementById(section)
        ?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth" });
  }, [location.key, location.hash, location.state, reducedMotion]);

  return (
    <Box
      component="main"
      style={{ userSelect: "text", overflowWrap: "anywhere" }}
    >
      <CollectionHero collections={clothingCategories} />

      <Container>
        <ScrollReveal
          component={SimpleGrid}
          stagger
          cols={{ base: 1, sm: 3 }}
          py={30}
          spacing="xl"
          style={{
            borderBottom: "1px solid var(--mantine-color-default-border)",
          }}
        >
          {[
            [
              <Layers size={24} strokeWidth={1.3} />,
              "A considered wardrobe",
              "Pieces that work together.",
            ],
            [
              <Sparkles size={24} strokeWidth={1.3} />,
              "Your everyday, elevated",
              "A fresh take on the familiar.",
            ],
            [
              <Leaf size={24} strokeWidth={1.3} />,
              "Style with intention",
              "Choose what feels like you.",
            ],
          ].map(([icon, title, subtitle]) => (
            <Group key={title} wrap="nowrap" gap="md">
              <ThemeIcon variant="transparent" c="dimmed" size={36}>
                {icon}
              </ThemeIcon>
              <Box style={{ minWidth: 0 }}>
                <Text size="sm" fw={500}>
                  {title}
                </Text>
                <Text size="xs" c="dimmed" mt={3}>
                  {subtitle}
                </Text>
              </Box>
            </Group>
          ))}
        </ScrollReveal>
        <ScrollReveal
          component="section"
          id="edit"
          py={{ base: 60, md: 90 }}
          style={{ scrollMarginTop: 105 }}
        >
          <SectionHeading
            label="FIND YOUR PERSPECTIVE"
            title="The everyday edit."
          >
            <Text c="dimmed" size="sm" maw={260}>
              Different moods. Endless possibilities.
              <br />
              Start with what speaks to you.
            </Text>
          </SectionHeading>
          <ScrollReveal
            component={SimpleGrid}
            stagger
            cols={{ base: 1, sm: 3 }}
            spacing={20}
          >
            {clothingCategories.map((collection, index) => (
              <CollectionCard
                key={collection.to}
                collection={collection}
                index={index}
              />
            ))}
          </ScrollReveal>
        </ScrollReveal>

        <ScrollReveal
          component="section"
          id="arrivals"
          pb={{ base: 60, md: 90 }}
          style={{ scrollMarginTop: 105 }}
        >
          <SectionHeading
            label="FRESH PERSPECTIVES"
            title="Meet your next favourites."
          >
            <Anchor
              component={Link}
              to="/shop"
              c="var(--mantine-color-text)"
              size="sm"
              underline="always"
              style={{
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Shop all pieces <ArrowUpRight size={16} />
            </Anchor>
          </SectionHeading>
          <Group justify="space-between" align="end" mb="lg" gap="lg">
            <Box style={{ flex: "1 1 280px", minWidth: 0 }}>
              <Text size="sm" fw={500} mb={8}>
                Choose your collection
              </Text>
              <SegmentedControl
                disabled={isError}
                value={category}
                onChange={setCategory}
                data={filters}
                radius={0}
                styles={{
                  root: {
                    display: "flex",
                    width: "100%",
                    maxWidth: 440,
                    overflowX: "auto",
                  },
                  control: { flex: "1 0 auto" },
                  label: { padding: "12px 10px" },
                }}
              />
            </Box>
            <TextInput
              label="Search new arrivals"
              placeholder="Search by name or category"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              disabled={isError}
              size="md"
              w={{ base: "100%", sm: 280 }}
              leftSection={<Search size={17} />}
              rightSection={
                search ? (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label="Clear product search"
                    onClick={() => setSearch("")}
                  >
                    <X size={16} />
                  </ActionIcon>
                ) : null
              }
              styles={{ input: { fontSize: 16 } }}
            />
          </Group>
          {!isLoading && !isError && (
            <Text size="xs" c="dimmed" mb="xl" aria-live="polite">
              {matchingProducts.length}{" "}
              {matchingProducts.length === 1 ? "piece" : "pieces"} found
              {matchingProducts.length > 8 ? " - showing the first 8" : ""}
            </Text>
          )}

          {isLoading ? (
            <ProductGrid loading />
          ) : isError ? (
            <Alert
              color="gray"
              title={
                needsLogin
                  ? "Your collection is a sign-in away."
                  : "The collection is taking a moment."
              }
            >
              <Text size="sm" mb="md">
                {needsLogin
                  ? "Sign in to explore the latest pieces and search the collection."
                  : "We couldn't load the latest pieces. Please try again."}
              </Text>
              <Group>
                {needsLogin && (
                  <Button component={Link} to="/login" color="dark" radius={0}>
                    Sign in
                  </Button>
                )}
                <Button variant="default" onClick={refetch}>
                  Try again
                </Button>
              </Group>
            </Alert>
          ) : visibleProducts.length ? (
            <ProductGrid
              animate
              products={visibleProducts}
              onPreview={setPreview}
            />
          ) : (
            <Box
              p={{ base: 24, sm: 40 }}
              bg="var(--mantine-color-default-hover)"
              ta="center"
            >
              <Title order={3} fw={500}>
                {search
                  ? "No pieces match your search."
                  : "Something good is on the way."}
              </Title>
              <Text size="sm" c="dimmed" mt="sm">
                {search
                  ? "Try a different search or clear your filters."
                  : category === "All"
                    ? "New arrivals will appear here as they join the collection."
                    : "There are no pieces in this edit yet. Explore the rest of the collection."}
              </Text>
              {(search || category !== "All") && (
                <Button
                  mt="lg"
                  variant="default"
                  onClick={() => {
                    setCategory("All");
                    setSearch("");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
          )}
        </ScrollReveal>
      </Container>

      <EditFinder collections={clothingCategories} />

      <Container>
        <ScrollReveal
          component="section"
          id="story"
          py={{ base: 60, md: 100 }}
          style={{ scrollMarginTop: 105 }}
        >
          <Grid gutter={{ base: 35, md: 80 }} align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box
                pos="relative"
                h={{ base: 320, md: 480 }}
                style={{ overflow: "hidden" }}
              >
                <ScrollReveal
                  component={Image}
                  parallax
                  src={storyImage}
                  alt="A considered collection of everyday clothing on a rail"
                  loading="lazy"
                  h="115%"
                  w="100%"
                  pos="absolute"
                  style={{ top: "-7.5%", left: 0 }}
                />
              </Box>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text size="xs" c="dimmed" mb={25} style={{ letterSpacing: 2 }}>
                OUR PERSPECTIVE
              </Text>
              <Title
                order={2}
                fw={500}
                size="clamp(36px, 4.5vw, 60px)"
                lh={1.08}
                style={headingStyle}
              >
                Clothes are personal.
                <br />
                <span
                  style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
                >
                  So are we.
                </span>
              </Title>
              <Text mt={25} c="dimmed" lh={1.9} maw={420}>
                We believe the best wardrobe is the one that feels like you. The
                pieces you reach for, live in, and make your own.
              </Text>
              <Text mt={15} c="dimmed" lh={1.9} maw={420}>
                Cevraliq is a space to explore your style, find a fresh point
                of view, and bring a little more intention to the everyday.
              </Text>
              <Anchor
                component={Link}
                to="/about"
                c="var(--mantine-color-text)"
                mt={30}
                display="inline-block"
                underline="always"
              >
                More about Cevraliq <ArrowUpRight size={15} />
              </Anchor>
            </Grid.Col>
          </Grid>
        </ScrollReveal>
        <ScrollReveal
          component="section"
          ta="center"
          py={{ base: 45, md: 65 }}
          mb={60}
          px={{ base: 20, md: 60 }}
          bg="var(--mantine-color-default-hover)"
        >
          <Text size="xs" c="dimmed" mb="lg" style={{ letterSpacing: 2 }}>
            LET'S STAY IN GOOD COMPANY
          </Text>
          <Title
            order={2}
            size="clamp(30px, 4vw, 46px)"
            fw={500}
            style={headingStyle}
          >
            A little style in your inbox.
          </Title>
          <Text c="dimmed" size="sm" mt="md" maw={430} mx="auto" lh={1.8}>
            Our newsletter is coming soon: new perspectives, fresh edits, and
            everyday inspiration.
          </Text>
          <Button
            component={Link}
            to="/register"
            color="dark"
            radius={0}
            size="md"
            mt="xl"
            rightSection={<ArrowRight size={17} />}
            w={{ base: "100%", sm: "auto" }}
            styles={buttonStyles}
          >
            Join the Cevraliq community
          </Button>
          <Text size="xs" c="dimmed" mt="md">
            Create your account today. Newsletter signup isn't available yet.
          </Text>
        </ScrollReveal>
      </Container>
      <ProductPreview product={preview} onClose={() => setPreview(null)} />
    </Box>
  );
}
