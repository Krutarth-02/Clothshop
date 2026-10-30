import { useState } from "react";
import { ActionIcon, Anchor, Box, Group, Image, Loader, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { ArrowUpRight, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useGetProductsQuery } from "../../redux/auth/productApi";
import CommonModal from "../common/Modal";
import ErrorAlert from "../common/ErrorAlert";
import { productOptions } from "../product/productOptions";

function matchingProducts(products, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return products.filter((product) => {
    if (!product?._id || typeof product.name !== "string") return false;
    const text = [product.name, product.category, product.description, ...productOptions(product.color), ...productOptions(product.size)].filter(Boolean).join(" ").toLowerCase();
    return words.every((word) => text.includes(word));
  }).sort((a, b) => Number(b.name.toLowerCase().startsWith(query.trim().toLowerCase())) - Number(a.name.toLowerCase().startsWith(query.trim().toLowerCase())));
}

export default function ProductSearch({ onOpen, iconSize = 44 }) {
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(undefined, { skip: !opened });
  const products = Array.isArray(data?.data) ? data.data : [];
  const matches = matchingProducts(products, query);
  const close = () => { setOpened(false); setQuery(""); };
  const viewAll = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    close();
  };

  return <>
    <ActionIcon variant="subtle" color="gray" size={iconSize} aria-label="Search products" aria-haspopup="dialog" aria-expanded={opened} onClick={() => { onOpen?.(); setOpened(true); }}><Search size={20} /></ActionIcon>
    <CommonModal opened={opened} onClose={close} centered={false} yOffset="clamp(24px, 12vh, 120px)" size={640} radius="md" padding={0} withCloseButton={false}
      aria-label="Search products" overlayProps={{ backgroundOpacity: 0.25, blur: 10 }}
      styles={{ content: { background: "var(--mantine-color-body)", boxShadow: "0 24px 80px rgba(0,0,0,.2)", border: "1px solid var(--mantine-color-default-border)" }, body: { padding: 0 } }}>
      <Box p={{ base: 14, sm: 20 }}>
        <Group justify="space-between" mb="sm"><Text size="10px" c="dimmed" style={{ letterSpacing: 1.5 }}>FIND YOUR NEXT FAVOURITE</Text><ActionIcon variant="subtle" color="gray" size={30} onClick={close} aria-label="Close product search"><X size={18} /></ActionIcon></Group>
        <form onSubmit={viewAll}>
          <TextInput data-autofocus aria-label="Search by product name, category, colour or size" placeholder="Search products…" value={query} onChange={(event) => setQuery(event.currentTarget.value)}
            leftSection={<Search size={20} />} leftSectionWidth={42} rightSection={isFetching ? <Loader size={16} color="gray" /> : query ? <ActionIcon variant="subtle" color="gray" aria-label="Clear search" onClick={() => setQuery("")}><X size={17} /></ActionIcon> : null}
            styles={{ input: { height: 54, fontSize: "clamp(18px, 3vw, 24px)", borderRadius: 6, background: "transparent" } }} />
        </form>
        <Box mt="sm" aria-live="polite"><Text size="xs" c="dimmed">{!query.trim() ? "Search by name, category, colour or size." : isLoading ? "Searching products…" : isError ? "Search is temporarily unavailable." : matches.length ? `${matches.length} matching ${matches.length === 1 ? "product" : "products"}` : `No products found for “${query.trim()}”. Try another name or category.`}</Text></Box>
        {isError ? <ErrorAlert mt="md" title="Products couldn't load" message="Retry to search the collection." onRetry={refetch} /> : query.trim() && !isLoading && matches.length > 0 && <>
          <ScrollArea.Autosize mah="min(40dvh, 320px)" mt="sm" type="auto" offsetScrollbars>
            <Stack gap={0} component="ul" m={0} p={0} style={{ listStyle: "none" }}>
              {matches.slice(0, 12).map((product) => <Box component="li" key={product._id} style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                <Anchor component={Link} to={`/product/${product._id}`} onClick={close} c="var(--mantine-color-text)" underline="never" display="block" py="sm">
                  <Group wrap="nowrap" gap="md">
                    <Image src={product.image || null} alt="" w={56} h={68} radius="sm" fit="cover" loading="lazy" fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='68'%3E%3Crect width='100%25' height='100%25' fill='%23e6e3dc'/%3E%3C/svg%3E" />
                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}><Text fw={500} size="sm" lineClamp={2}>{product.name}</Text><Text c="dimmed" size="xs">{product.category || "The collection"}</Text>{Number.isFinite(product.price) && <Text size="sm">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}</Text>}</Stack>
                    <ArrowUpRight size={18} style={{ flexShrink: 0 }} aria-hidden="true" />
                  </Group>
                </Anchor>
              </Box>)}
            </Stack>
          </ScrollArea.Autosize>
          <Anchor component={Link} to={`/shop?q=${encodeURIComponent(query.trim())}`} onClick={close} display="inline-block" mt="lg" size="sm" c="var(--mantine-color-text)">View all results →</Anchor>
        </>}
      </Box>
    </CommonModal>
  </>;
}
