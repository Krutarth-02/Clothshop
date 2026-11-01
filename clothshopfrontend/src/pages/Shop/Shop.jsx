import { useState } from "react";
import { Anchor, Badge, Box, Breadcrumbs, Button, Container, Grid, Group, Pagination, Paper, Select, Stack, Text, Title } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { ArrowRight, SlidersHorizontal, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useGetProductsQuery } from "../../redux/auth/productApi";
import { productOptions } from "../../components/product/productOptions";
import ProductGrid from "../../components/common/ProductGrid";
import ProductPreview from "../../components/common/ProductPreview";
import ProductFilters from "../../components/common/ProductFilters";
import CommonDrawer from "../../components/common/CommonDrawer";
import ErrorAlert from "../../components/common/ErrorAlert";

const collectionDetails = {
  all: {
    title: "Shop clothing & accessories",
    label: "Shop All",
    description:
      "Browse clothing and accessories. Filter by size, colour and price to find your next favourite.",
  },
  new: {
    title: "Discover new arrivals",
    label: "New Arrivals",
    description:
      "Explore the latest additions to the collection, with the newest styles first.",
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
      "Explore men's clothing and find everyday favourites in your size and colour.",
    aliases: ["men", "mens", "men's"],
  },
  accessories: {
    title: "It's all in the details.",
    label: "Accessories",
    description: "Explore the finishing touches that make an outfit your own.",
    aliases: ["accessories", "accessory"],
  },
};

const pageSize = 12;
const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "2XL", "3XL", "4XL"];
const distinct = (values) => [...new Map(values.filter(Boolean).map((value) => [value.toLowerCase(), value])).values()];

export default function Shop({ collection = "all" }) {
  const content = collectionDetails[collection] || collectionDetails.all;
  const [searchParams, setSearchParams] = useSearchParams();
  const [preview, setPreview] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const { data, isLoading, isError, error, refetch } = useGetProductsQuery();
  const products = Array.isArray(data?.data) ? data.data : [];
  const collectionProducts = products.filter((product) => !content.aliases || content.aliases.includes(product.category?.trim().toLowerCase()));
  const options = {
    categories: distinct(collectionProducts.map((product) => product.category?.trim())).sort((a, b) => a.localeCompare(b)),
    sizes: distinct(collectionProducts.flatMap((product) => productOptions(product.size))).sort((a, b) => {
      const first = sizeOrder.indexOf(a.toUpperCase()), second = sizeOrder.indexOf(b.toUpperCase());
      if (first !== -1 || second !== -1) return (first === -1 ? 999 : first) - (second === -1 ? 999 : second);
      return a.localeCompare(b, undefined, { numeric: true });
    }),
    colours: distinct(collectionProducts.flatMap((product) => productOptions(product.color))).sort((a, b) => a.localeCompare(b)),
  };
  const priceLimit = Math.max(100, Math.ceil(collectionProducts.reduce((max, product) => Number.isFinite(product.price) ? Math.max(max, product.price) : max, collectionProducts.length ? 0 : 5000) / 100) * 100);
  const rawPrice = searchParams.get("maxPrice");
  const chosenPrice = rawPrice !== null && rawPrice !== "" ? Number(rawPrice) : priceLimit;
  const values = {
    q: searchParams.get("q") || "",
    category: searchParams.get("category") === "All" ? "" : searchParams.get("category") || "",
    size: searchParams.get("size") || "",
    colour: searchParams.get("colour") || "",
    maxPrice: Number.isFinite(chosenPrice) ? Math.min(priceLimit, Math.max(0, chosenPrice)) : priceLimit,
    minPrice: Math.max(0, Number(searchParams.get("minPrice")) || 0),
    inStock: searchParams.get("inStock") === "true",
  };
  const sort = searchParams.get("sort") || (collection === "new" ? "newest" : "featured");
  const query = values.q.trim().toLowerCase();
  const searchWords = query.replace(/\bt[ -]?shirts?\b/g, "t-shirt").replace(/shirts\b/g, "shirt").split(/\s+/).filter(Boolean);
  const filteredProducts = collectionProducts.filter((product) => {
    const colours = productOptions(product.color), sizes = productOptions(product.size);
    const searchText = [product.name, product.category, product.description, ...colours, ...sizes].join(" ").toLowerCase().replace(/\bt[ -]?shirts?\b/g, "t-shirt").replace(/shirts\b/g, "shirt");
    return (!values.category || product.category?.trim().toLowerCase() === values.category.toLowerCase()) &&
      searchWords.every((word) => searchText.includes(word)) &&
      (searchParams.get("searchBy") !== "name" || query.split(/\s+/).filter(Boolean).every((word) => product.name?.toLowerCase().includes(word))) &&
      (!values.size || sizes.some((size) => size.toLowerCase() === values.size.toLowerCase())) &&
      (!values.colour || colours.some((colour) => colour.toLowerCase() === values.colour.toLowerCase())) &&
      Number.isFinite(product.price) && product.price >= values.minPrice && product.price <= values.maxPrice &&
      (!values.inStock || (Number.isInteger(product.stock) && product.stock > 0));
  }).sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "name") return (a.name || "").localeCompare(b.name || "");
    if (sort === "newest") return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
    return 0;
  });
  const activeFilters = [
    ...(query ? [{ key: "q", label: values.q }] : []),
    ...["category", "size", "colour"].filter((key) => values[key]).map((key) => ({ key, label: values[key] })),
    ...(values.maxPrice < priceLimit ? [{ key: "maxPrice", label: "Up to \u20b9" + values.maxPrice.toLocaleString("en-IN") }] : []),
    ...(values.minPrice > 0 ? [{ key: "minPrice", label: "From \u20b9" + values.minPrice.toLocaleString("en-IN") }] : []),
    ...(values.inStock ? [{ key: "inStock", label: "In stock" }] : []),
  ];
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const requestedPage = Number(searchParams.get("page"));
  const page = Number.isFinite(requestedPage) ? Math.min(totalPages, Math.max(1, Math.floor(requestedPage))) : 1;
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  const updateFilter = (key, value) => setSearchParams((previous) => {
    const next = new URLSearchParams(previous);
    if (!value) next.delete(key); else next.set(key, value);
    if (key !== "page") next.delete("page");
    return next;
  }, { replace: key === "q" || key === "maxPrice", preventScrollReset: true });
  const clearFilters = () => setSearchParams((previous) => {
    const next = new URLSearchParams(previous);
    for (const key of ["q", "category", "size", "colour", "minPrice", "maxPrice", "inStock", "sort", "page"]) next.delete(key);
    return next;
  }, { preventScrollReset: true });
  const filterProps = { values, options, priceLimit, disabled: isLoading || isError, onChange: updateFilter, onClear: clearFilters };
  const needsLogin = error?.status === 401 || error?.status === 403;

  return (
    <Container component="main" py={{ base: 24, md: 36 }} mih="65vh" style={{ userSelect: "text", overflowWrap: "anywhere" }}>
      <Breadcrumbs mb={24} separator="/"><Anchor component={Link} to="/" size="sm" c="dimmed">Home</Anchor>{collection !== "all" && <Anchor component={Link} to="/shop" size="sm" c="dimmed">Shop</Anchor>}<Text size="sm">{content.label}</Text></Breadcrumbs>
      <Grid gutter={{ base: 24, lg: 28 }} align="flex-start">
        <Grid.Col span={{ md: 4, lg: 3 }} visibleFrom="md">
          <Paper component="aside" withBorder radius="md" p="lg" bg="var(--mantine-color-default-hover)" aria-label="Product filters">
            <ProductFilters {...filterProps} />
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
          <Box component="section" id="catalog-results" aria-label={content.label + " products"} style={{ scrollMarginTop: 110 }}>
            <Title order={1} fw={600} size="clamp(28px, 3.5vw, 40px)" mb={8} style={{ letterSpacing: "-.035em" }}>{content.label}</Title>
            <Text size="sm" c="dimmed" lh={1.7} mb="lg">{content.description}</Text>
            <Group justify="space-between" align="flex-end" mb="lg" gap="md">
              <Stack gap={10}>
                <Text size="sm" c="dimmed" aria-live="polite">{isLoading ? "Loading products..." : isError ? "Products could not load" : filteredProducts.length + (filteredProducts.length === 1 ? " result" : " results")}</Text>
                <Button hiddenFrom="md" variant="default" leftSection={<SlidersHorizontal size={16} />} onClick={() => setFiltersOpen(true)}>Filters{activeFilters.length ? " (" + activeFilters.length + ")" : ""}</Button>
              </Stack>
              <Select label="Sort by" aria-label="Sort products" value={sort} onChange={(value) => updateFilter("sort", value)} allowDeselect={false} w={{ base: 180, sm: 210 }}
                data={[{ value: "featured", label: "Featured" }, { value: "newest", label: "Newest first" }, { value: "price-asc", label: "Price: low to high" }, { value: "price-desc", label: "Price: high to low" }, { value: "name", label: "Name: A to Z" }]} />
            </Group>
            {activeFilters.length > 0 && <Group gap={8} mb="lg">{activeFilters.map((filter) => <Badge key={filter.key} variant="light" color="gray" size="lg" tt="none" style={{ height: "auto", paddingBlock: 5 }}>
              <Group component="span" gap={6} wrap="nowrap">{filter.label}<Button variant="transparent" color="gray" size="compact-xs" p={0} aria-label={"Remove " + filter.label + " filter"} onClick={() => updateFilter(filter.key, "")}><X size={13} /></Button></Group>
            </Badge>)}</Group>}
            {isLoading ? <ProductGrid loading placeholderCount={6} cols={{ base: 1, xs: 2, lg: 3 }} /> : isError ? (
              <ErrorAlert color="gray" title={needsLogin ? "Sign in to browse the collection" : "We couldn't load the collection"} onRetry={refetch} retryLabel="Try again">
                <Text size="sm">{needsLogin ? "Sign in to check the current products and availability." : "Please try again to load the latest pieces."}</Text>
                {needsLogin && <Button component={Link} to="/login" color="dark" mt="md">Sign in</Button>}
              </ErrorAlert>
            ) : visibleProducts.length ? (
              <><ProductGrid products={visibleProducts} onPreview={setPreview} cols={{ base: 1, xs: 2, lg: 3 }} spacing="lg" verticalSpacing={24} cardProps={{ withBorder: true }} />
                {totalPages > 1 && <Group justify="center" mt={32}><Pagination total={totalPages} value={page} siblings={0} color="dark" onChange={(value) => {
                  updateFilter("page", String(value));
                  document.getElementById("catalog-results")?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth" });
                }} /></Group>}
              </>
            ) : <Paper withBorder radius="md" ta="center" p={{ base: 24, md: 48 }}>
              <Title order={2} size={24} fw={500}>{activeFilters.length ? "No products match your filters." : "No products available right now."}</Title>
              <Text size="sm" c="dimmed" mt="sm">{activeFilters.length ? "Try another size, colour or price range, or clear all filters." : "Explore another category or check back for new arrivals."}</Text>
              {activeFilters.length > 0 && <Button variant="default" mt="lg" onClick={clearFilters}>Clear all filters</Button>}
            </Paper>}
            <Group gap="lg" mt={28}>{[{ to: "/shop", label: "All clothing" }, { to: "/women", label: "Women" }, { to: "/men", label: "Men" }, { to: "/accessories", label: "Accessories" }].map((link) => <Anchor key={link.to} component={Link} to={link.to} size="xs" c="dimmed">{link.label} <ArrowRight size={12} /></Anchor>)}</Group>
          </Box>
        </Grid.Col>
      </Grid>
      <CommonDrawer open={filtersOpen} handleClose={() => setFiltersOpen(false)} title="Filter products" position="left" width="min(22rem, 100vw)">
        <ProductFilters {...filterProps} />
        <Button fullWidth mt="xl" color="dark" onClick={() => setFiltersOpen(false)}>Show {filteredProducts.length} results</Button>
      </CommonDrawer>
      <ProductPreview product={preview} onClose={() => setPreview(null)} />
    </Container>
  );
}
