import { useEffect, useState } from "react";
import { ActionIcon, Anchor, Box, Group, Image, Loader, Overlay, Paper, Portal, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { ArrowUpRight, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDebouncedValue, useFocusReturn, useFocusTrap } from "@mantine/hooks";
import { useSearchProductsInfiniteQuery } from "../../redux/auth/productApi";
import ErrorAlert from "../common/ErrorAlert";

export default function ProductSearch({ onOpen, iconSize = 44 }) {
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState("");
  const focusTrapRef = useFocusTrap(opened);
  useFocusReturn({ opened });
  useEffect(() => {
    if (!opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [opened]);
  const [keyword] = useDebouncedValue(query.trim(), 250);
  const navigate = useNavigate();
  const { currentData: data, isFetching, isError, isFetchNextPageError, hasNextPage, fetchNextPage, refetch } = useSearchProductsInfiniteQuery(keyword, { skip: !opened || !keyword });
  const waiting = query.trim() !== keyword;
  const matches = waiting ? [] : [...new Map((data?.pages || []).flatMap((page) => page.data || []).map((product) => [product._id, product])).values()];
  const total = data?.pages?.[0]?.total || 0;
  const isLoading = Boolean(query.trim()) && (waiting || (isFetching && !data));
  const resultsUrl = `/shop?${new URLSearchParams({ q: query.trim(), searchBy: "name" })}`;
  const loadMore = () => { if (!waiting && hasNextPage && !isFetching && !isFetchNextPageError) fetchNextPage(); };
  const close = () => { setOpened(false); setQuery(""); };
  const viewAll = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(resultsUrl);
    close();
  };

  return <>
    <ActionIcon variant="subtle" color="gray" size={iconSize} aria-label="Search products" aria-haspopup="dialog" aria-expanded={opened} onClick={() => { onOpen?.(); setOpened(true); }}><Search size={20} /></ActionIcon>
    {opened && <Portal><Box pos="fixed" inset={0} style={{ zIndex: 300 }} onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}>
      <Overlay fixed blur={8} backgroundOpacity={0.18} zIndex={0} onClick={close} aria-hidden="true" />
      <Box ref={focusTrapRef} pos="absolute" top="clamp(68px, 12vh, 110px)" left="50%" w="min(560px, calc(100vw - 28px))" style={{ transform: "translateX(-50%)", zIndex: 1 }} role="dialog" aria-modal="true" aria-label="Search products">
        <form onSubmit={viewAll} role="search">
          <TextInput data-autofocus aria-label="Search by product name" placeholder="Search by product name…" maxLength={120} value={query} onChange={(event) => setQuery(event.currentTarget.value)}
            leftSection={<Search size={18} />} leftSectionWidth={38} rightSectionWidth={isFetching ? 66 : 38} rightSection={<Group gap={4} wrap="nowrap">{isFetching && <Loader size={14} color="gray" />}<ActionIcon variant="subtle" color="gray" size={28} aria-label="Close product search" onClick={close}><X size={16} /></ActionIcon></Group>}
            styles={{ input: { height: 44, fontSize: 16, borderRadius: 10, background: "var(--mantine-color-body)", boxShadow: "0 8px 28px #0002" } }} />
        </form>
        {query.trim() && <Paper mt={8} p={12} radius={10} withBorder shadow="lg" style={{ maxHeight: "calc(100dvh - 190px)", overflowY: "auto" }}>
        <Box aria-live="polite"><Text size="xs" c="dimmed">{isLoading ? "Searching products…" : isError && !matches.length ? "Search is temporarily unavailable." : matches.length ? `${matches.length} of ${total} matching ${total === 1 ? "product" : "products"}` : `No products found for “${query.trim()}”. Try another product name.`}</Text></Box>
        {query.trim() && !waiting && isError && !matches.length ? <ErrorAlert mt="md" title="Products couldn't load" message="Retry to search the collection." onRetry={refetch} /> : query.trim() && !isLoading && matches.length > 0 && <>
          <ScrollArea.Autosize key={keyword} mah="min(40dvh, 320px)" mt="sm" type="auto" offsetScrollbars onBottomReached={loadMore}>
            <Stack gap={0} component="ul" m={0} p={0} style={{ listStyle: "none" }}>
              {matches.map((product) => <Box component="li" key={product._id} style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                <Anchor component={Link} to={`/product/${product._id}`} onClick={close} c="var(--mantine-color-text)" underline="never" display="block" py={8}>
                  <Group wrap="nowrap" gap="sm">
                    <Image src={product.image || null} alt="" w={40} h={48} radius="sm" fit="cover" loading="lazy" fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='68'%3E%3Crect width='100%25' height='100%25' fill='%23e6e3dc'/%3E%3C/svg%3E" />
                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}><Text fw={500} size="sm" lineClamp={1}>{product.name}</Text>{Number.isFinite(product.price) && <Text c="dimmed" size="xs">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}</Text>}</Stack>
                    <ArrowUpRight size={18} style={{ flexShrink: 0 }} aria-hidden="true" />
                  </Group>
                </Anchor>
              </Box>)}
            </Stack>
            {isFetching && <Group justify="center" py="md" role="status"><Loader size="sm" color="gray" /><Text size="xs" c="dimmed">Loading more products…</Text></Group>}
            {isFetchNextPageError && <ErrorAlert mt="sm" title="More products couldn't load" onRetry={() => fetchNextPage()} />}
            {!hasNextPage && <Text size="xs" c="dimmed" ta="center" py="sm">All matching products are shown.</Text>}
          </ScrollArea.Autosize>
          <Group justify="space-between" mt="sm">
            <Anchor component={Link} to={resultsUrl} onClick={close} size="sm" c="var(--mantine-color-text)">View all results →</Anchor>
            {hasNextPage && !isFetchNextPageError && <Anchor component="button" type="button" size="xs" c="dimmed" disabled={isFetching} onClick={loadMore}>Load next 5</Anchor>}
          </Group>
        </>}
        </Paper>}
      </Box>
    </Box></Portal>}
  </>;
}
