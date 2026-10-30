import ErrorAlert from "../../components/common/ErrorAlert";
import { useState } from "react";
import {
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Group,
  Image,
  Pagination,
  Select,
  SimpleGrid,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { ArrowRight, Search, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useGetProductsQuery } from "../../redux/auth/productApi";
import ProductGrid from "../../components/common/ProductGrid";
import ProductPreview from "../../components/common/ProductPreview";
import Reveal from "../../components/common/Reveal";

const collectionDetails = {
  all: {
    title: "Find your everyday favourites.",
    label: "Shop All",
    description:
      "Explore every category, discover a fresh perspective, and find the pieces that feel like you.",
  },
  new: {
    title: "A fresh point of view.",
    label: "New Arrivals",
    description:
      "Discover the latest additions to HIFASHOPNHUB, with the newest pieces first.",
  },
  women: {
    title: "Your style. Your way.",
    label: "Women",
    description:
      "Explore the women's collection. Everyday favourites and fresh inspiration, all in one place.",
    aliases: ["women", "womens", "women's"],
  },
  men: {
    title: "Make the everyday yours.",
    label: "Men",
    description:
      "Discover the men's collection and bring a fresh perspective to your wardrobe.",
    aliases: ["men", "mens", "men's"],
  },
  accessories: {
    title: "It's all in the details.",
    label: "Accessories",
    description: "Explore the finishing touches that make an outfit your own.",
    aliases: ["accessories", "accessory"],
  },
};
const clothingCategories = [
  {
    label: "Women",
    to: "/women",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Men",
    to: "/men",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Accessories",
    to: "/accessories",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
  },
];

const pageSize = 16;

export default function Shop({ collection = "all" }) {
  const content = collectionDetails[collection];
  const [searchParams, setSearchParams] = useSearchParams();
  const [preview, setPreview] = useState(null);
  const reducedMotion = useReducedMotion();
  const { data, isLoading, isError, error, refetch } = useGetProductsQuery();
  const products = Array.isArray(data?.data) ? data.data : [];
  const category = searchParams.get("category") || "All";
  const search = searchParams.get("q") || "";
  const sort =
    searchParams.get("sort") || (collection === "new" ? "newest" : "featured");
  const categories = [
    ...new Map(
      products
        .filter((product) => product.category?.trim())
        .map((product) => [
          product.category.trim().toLowerCase(),
          product.category.trim(),
        ]),
    ).values(),
  ].sort((a, b) => a.localeCompare(b));
  const query = search.trim().toLowerCase();
  const filteredProducts = products
    .filter((product) => {
      const productCategory = product.category?.trim().toLowerCase() || "";
      const inCollection =
        !content.aliases || content.aliases.includes(productCategory);
      const inCategory =
        category === "All" || productCategory === category.toLowerCase();
      const matchesSearch =
        !query ||
        [product.name, product.description, product.category].some((value) =>
          value?.toLowerCase().includes(query),
        );
      return inCollection && inCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "newest")
        return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
      return 0;
    });
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const requestedPage = Number(searchParams.get("page")) || 1;
  const page = Math.min(totalPages, Math.max(1, Math.floor(requestedPage)));
  const visibleProducts = filteredProducts.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const needsLogin = error?.status === 401 || error?.status === 403;
  const updateFilter = (key, value) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (!value || (key === "category" && value === "All")) next.delete(key);
        else next.set(key, value);
        if (key !== "page") next.delete("page");
        return next;
      },
      { replace: key === "q", preventScrollReset: true },
    );
  };

  return (
    <Box
      component="main"
      style={{ userSelect: "text", overflowWrap: "anywhere" }}
    >
      <Box bg="var(--mantine-color-default-hover)">
        <Container
          py={{ base: 32, md: 56 }}
        >
          <Breadcrumbs
            separator="/"
            styles={{ breadcrumb: { whiteSpace: "normal" } }}
          >
            <Anchor component={Link} to="/" size="sm" c="dimmed">
              Home
            </Anchor>
            {collection !== "all" && (
              <Anchor component={Link} to="/shop" size="sm" c="dimmed">
                Shop
              </Anchor>
            )}
            <Text size="sm">{content.label}</Text>
          </Breadcrumbs>
          <Reveal>
            <Text size="xs" c="dimmed" mb="md" style={{ letterSpacing: 2 }}>
              {content.label.toUpperCase()} / HIFASHOPNHUB
            </Text>
            <Title
              order={1}
              fw={500}
              size="clamp(36px, 5vw, 64px)"
              lh={1.1}
              maw={800}
              style={{ letterSpacing: "-.05em" }}
            >
              {content.title}
            </Title>
            <Text mt="lg" maw={580} c="dimmed" lh={1.8}>
              {content.description}
            </Text>
          </Reveal>
        </Container>
      </Box>
      <Container
        py={{ base: 40, md: 60 }}
      >
        {collection === "all" && (
          <Reveal component="section" aria-label="Shop by collection" mb={48}>
            <Title order={2} size={26} fw={500} mb="xl">
              Shop by collection
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              {clothingCategories.map((card) => (
                <Anchor
                  key={card.to}
                  component={Link}
                  to={card.to}
                  underline="never"
                  c="var(--mantine-color-text)"
                >
                  <Box style={{ overflow: "hidden" }}>
                    <Image
                      src={card.image}
                      alt={`${card.label} collection`}
                      h={{ base: 220, sm: 190, lg: 250 }}
                      loading="lazy"
                    />
                  </Box>
                  <Group justify="space-between" mt="md" mih={44}>
                    <Text fw={500}>{card.label}</Text>
                    <ArrowRight size={18} />
                  </Group>
                </Anchor>
              ))}
            </SimpleGrid>
          </Reveal>
        )}
        <Box
          component="section"
          id="catalog-results"
          aria-label={`${content.label} products`}
          style={{ scrollMarginTop: 110 }}
        >
          <Group justify="space-between" align="end" gap="lg" mb="xl">
            <Box>
              <Title order={2} size={28} fw={500}>
                {collection === "all"
                  ? "All clothing & accessories"
                  : content.label}
              </Title>
              {!isLoading && !isError && (
                <Text size="sm" c="dimmed" mt="xs" aria-live="polite">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "piece" : "pieces"}
                </Text>
              )}
            </Box>
            {collection !== "all" && (
              <Anchor
                component={Link}
                to="/shop"
                c="var(--mantine-color-text)"
                size="sm"
                style={{
                  minHeight: 44,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Explore all collections <ArrowRight size={16} />
              </Anchor>
            )}
          </Group>
          {!isError && (
            <>
              <SimpleGrid cols={{ base: 1, sm: 2 }} mb="lg">
                <TextInput
                  label="Search this collection"
                  placeholder="Search clothing, categories…"
                  value={search}
                  onChange={(event) =>
                    updateFilter("q", event.currentTarget.value)
                  }
                  leftSection={<Search size={17} />}
                  size="md"
                  styles={{ input: { fontSize: 16 } }}
                />
                <Select
                  label="Sort by"
                  value={sort}
                  onChange={(value) => updateFilter("sort", value)}
                  allowDeselect={false}
                  size="md"
                  styles={{ input: { fontSize: 16 } }}
                  data={[
                    { value: "featured", label: "Featured" },
                    { value: "newest", label: "Newest first" },
                    { value: "price-asc", label: "Price: low to high" },
                    { value: "price-desc", label: "Price: high to low" },
                    { value: "name", label: "Name: A–Z" },
                  ]}
                />
              </SimpleGrid>
              {(collection === "all" || collection === "new") &&
                categories.length > 0 && (
                  <Group
                    gap="xs"
                    mb="xl"
                    aria-label="Filter by clothing category"
                  >
                    {["All", ...categories].map((item) => (
                      <Button
                        key={item}
                        variant={category === item ? "filled" : "default"}
                        color="dark"
                        radius={0}
                        mih={44}
                        aria-pressed={category === item}
                        onClick={() => updateFilter("category", item)}
                      >
                        {item === "All" ? "All categories" : item}
                      </Button>
                    ))}
                  </Group>
                )}
            </>
          )}
          {isLoading ? (
            <ProductGrid loading placeholderCount={8} spacing="lg" />
          ) : isError ? (
            <ErrorAlert
              color="gray"
              title={
                needsLogin
                  ? "Your collection is a sign-in away."
                  : "We couldn't load the collection."
              }
            >
              <Text size="sm" mb="lg">
                {needsLogin
                  ? "Sign in to browse products and explore the available clothing categories."
                  : "Please try again to load the latest pieces."}
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
            </ErrorAlert>
          ) : visibleProducts.length ? (
            <>
              <ProductGrid
                products={visibleProducts}
                onPreview={setPreview}
                verticalSpacing={32}
              />
              {totalPages > 1 && (
                <Group justify="center" mt={40}>
                  <Pagination
                    total={totalPages}
                    value={page}
                    siblings={0}
                    color="dark"
                    onChange={(value) => {
                      updateFilter("page", String(value));
                      document
                        .getElementById("catalog-results")
                        ?.scrollIntoView({
                          behavior: reducedMotion ? "instant" : "smooth",
                        });
                    }}
                  />
                </Group>
              )}
            </>
          ) : (
            <Box
              ta="center"
              p={{ base: 24, md: 48 }}
              bg="var(--mantine-color-default-hover)"
            >
              <Title order={3} fw={500}>
                {search || category !== "All"
                  ? "No pieces match these filters."
                  : "This collection is taking shape."}
              </Title>
              <Text c="dimmed" size="sm" mt="md">
                {search || category !== "All"
                  ? "Try another search or explore all available pieces."
                  : "Products will appear here as they are added to the collection."}
              </Text>
              {(search || category !== "All") && (
                <Button
                  mt="xl"
                  variant="default"
                  leftSection={<X size={16} />}
                  onClick={() => setSearchParams({})}
                >
                  Clear filters
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Container>
      <ProductPreview product={preview} onClose={() => setPreview(null)} />
    </Box>
  );
}
