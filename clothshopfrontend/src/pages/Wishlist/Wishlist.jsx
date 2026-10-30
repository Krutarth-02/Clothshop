import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Anchor, Breadcrumbs, Button, Container, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { clearWishlist, selectWishlistItems } from "../../redux/wishlist/wishlistSlice";
import { useGetProductsQuery } from "../../redux/auth/productApi";
import ProductGrid from "../../components/common/ProductGrid";
import ProductPreview from "../../components/common/ProductPreview";
import ErrorAlert from "../../components/common/ErrorAlert";

export default function Wishlist() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);
  const [preview, setPreview] = useState(null);
  const { data, isLoading, isFetching, error, refetch } = useGetProductsQuery(undefined, { skip: !items.length, refetchOnMountOrArgChange: true });
  const products = Array.isArray(data?.data) ? data.data : [];
  const savedProducts = items.map((item) => products.find((product) => product._id === item._id) || { ...item, stock: 0, unavailable: true });
  return <Container component="main" py={{ base: 28, md: 48 }} mih="65vh" style={{ overflowWrap: "anywhere" }}>
    <Breadcrumbs><Anchor component={Link} to="/" size="sm" c="dimmed">Home</Anchor><Text size="sm">Wishlist</Text></Breadcrumbs>
    <Group justify="space-between" align="flex-start" mb={32}>
      <Text size="sm" c="dimmed">{items.length} saved {items.length === 1 ? "product" : "products"}. Kept on this browser for your next visit.</Text>
      {items.length > 0 && <Button variant="subtle" color="gray" leftSection={<Trash2 size={16} />} onClick={() => dispatch(clearWishlist())}>Clear wishlist</Button>}
    </Group>
    {!items.length ? <Paper withBorder radius="md" p={{ base: 28, md: 56 }}><Stack align="center" ta="center" gap="lg">
      <ThemeIcon size={68} radius="xl" variant="light" color="red"><Heart size={30} strokeWidth={1.5} /></ThemeIcon>
      <Title order={2} size={26} fw={500}>Save something you love.</Title><Text size="sm" c="dimmed" maw={380}>Tap the heart on a product to keep it here. Open a saved product to choose your size and add it to your bag.</Text>
      <Button component={Link} to="/shop" color="dark" leftSection={<ShoppingBag size={17} />}>Explore the collection</Button>
    </Stack></Paper> : error ? <ErrorAlert title="Your saved products could not load" onRetry={refetch}>
      <Text size="sm">Your wishlist is still saved. Retry to check current product prices and availability.</Text>
      {(error.status === 401 || error.status === 403) && <Button component={Link} to="/login" color="dark" mt="md">Sign in</Button>}
    </ErrorAlert> : isLoading || (isFetching && !data) ? <ProductGrid loading placeholderCount={Math.min(items.length, 4)} />
      : <ProductGrid products={savedProducts} onPreview={setPreview} cardProps={{ withBorder: true }} />}
    <ProductPreview product={preview} onClose={() => setPreview(null)} />
  </Container>;
}
