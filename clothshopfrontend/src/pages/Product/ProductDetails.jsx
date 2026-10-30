import ErrorAlert from "../../components/common/ErrorAlert";
import WishlistButton from "../../components/common/WishlistButton";
import { useState } from "react";
import {
  Accordion,
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Image,
  NumberInput,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ArrowLeft, Check, ShoppingBag, Zap } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  addToCart,
  createCartItem,
  setBuyNowItem,
} from "../../redux/cart/cartSlice";
import { useGetProductByIdQuery, useGetProductsQuery } from "../../redux/auth/productApi";
import ProductGrid from "../../components/common/ProductGrid";
import ProductPreview from "../../components/common/ProductPreview";
import SizeGuide from "../../components/product/SizeGuide";
import {
  productColor,
  productOptions,
} from "../../components/product/productOptions";

function SimilarProducts({ product }) {
  const [preview, setPreview] = useState(null);
  const category = typeof product.category === "string" ? product.category.trim().toLowerCase() : "";
  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(undefined, { skip: !category });
  const products = Array.isArray(data?.data) ? data.data : [];
  const colours = productOptions(product.color).map((value) => value.toLowerCase());
  const sizes = productOptions(product.size).map((value) => value.toLowerCase());
  const score = (item) =>
    (productOptions(item.color).some((value) => colours.includes(value.toLowerCase())) ? 2 : 0) +
    (productOptions(item.size).some((value) => sizes.includes(value.toLowerCase())) ? 1 : 0);
  const priceDistance = (item) => Number.isFinite(item.price) && Number.isFinite(product.price)
    ? Math.abs(item.price - product.price) : Infinity;
  const suggestions = products
    .filter((item) => item?._id && item._id !== product._id && typeof item.category === "string" && item.category.trim().toLowerCase() === category)
    .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || score(b) - score(a) || priceDistance(a) - priceDistance(b) || String(a._id).localeCompare(String(b._id)))
    .slice(0, 4);

  if (!category) return null;

  return <Box component="section" aria-labelledby="similar-products-title" mt={{ base: 48, md: 72 }} pt={{ base: 28, md: 40 }} style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
    <Group justify="space-between" align="flex-end" mb={24}>
      <Stack gap={8}>
        <Title id="similar-products-title" order={2} size="clamp(26px, 3vw, 34px)" fw={500}>You may also like</Title>
        <Text size="sm" c="dimmed">Similar finds from our {product.category} collection.</Text>
      </Stack>
      <Anchor component={Link} to={`/shop?category=${encodeURIComponent(product.category.trim())}`} size="sm" c="dimmed">View collection</Anchor>
    </Group>
    {isError ? <ErrorAlert title="Similar products couldn't load" message="Please try again to explore more from this collection." onRetry={refetch} />
      : isLoading || (isFetching && !data) ? <ProductGrid loading placeholderCount={4} />
      : suggestions.length ? <ProductGrid products={suggestions} onPreview={setPreview} cardProps={{ withBorder: true }} />
      : <Text size="sm" c="dimmed">More similar styles will appear here when available.</Text>}
    <ProductPreview product={preview} onClose={() => setPreview(null)} />
  </Box>;
}

function ProductContent({ product }) {
  const dispatch = useDispatch(),
    navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const colors = productOptions(product.color),
    sizes = productOptions(product.size);
  const [chosenColor, setChosenColor] = useState(colors[0] || "");
  const [chosenSize, setChosenSize] = useState(sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const color = colors.includes(chosenColor) ? chosenColor : colors[0] || "";
  const size = sizes.includes(chosenSize) ? chosenSize : sizes[0] || "";
  const stockKnown = typeof product.stock === "number";
  const available = Number.isInteger(product.stock) && product.stock > 0;
  const inCart = cartItems
    .filter((item) => item.productId === product._id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const remaining = available ? Math.max(0, product.stock - inCart) : 0;
  const quantityValid =
    Number.isInteger(quantity) && quantity > 0 && quantity <= product.stock;
  const validPrice =
    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    product.price >= 0;
  const canBuy = available && quantityValid && validPrice;
  const purchase = (buyNow) => {
    const item = createCartItem(product, color, size, quantity);
    if (!item) {
      toast.error("Check the selected options and quantity.");
      return;
    }
    if (buyNow) {
      dispatch(setBuyNowItem(item));
      navigate("/checkout?mode=buy-now");
    } else if (dispatch(addToCart(item)))
      toast.success("Added to your shopping bag");
    else
      toast.error(
        "That quantity exceeds the available stock, including items already in your bag.",
      );
  };

  return (
    <Grid gutter={{ base: 32, md: 56 }}>
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Box bg="var(--mantine-color-default-hover)">
          <Image
            src={product.image || null}
            alt={product.name}
            h={{ base: 360, sm: 480, lg: 580 }}
            fit="contain"
            fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Crect width='100%25' height='100%25' fill='%23e6e3dc'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%2364625d' font-family='sans-serif'%3EPhoto unavailable%3C/text%3E%3C/svg%3E"
          />
        </Box>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 5 }} style={{ minWidth: 0 }}>
        <Stack gap="xl">
          <Box>
            <Text c="dimmed" size="xs" mb="md" style={{ letterSpacing: 2 }}>
              {product.category || "THE COLLECTION"}
            </Text>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Title
              order={1}
              fw={500}
              size="clamp(30px, 3.5vw, 44px)"
              lh={1.15}
              style={{ letterSpacing: "-.03em" }}
            >
              {product.name}
            </Title>
            <WishlistButton product={product} style={{ flexShrink: 0 }} />
            </Group>
            <Text size="xl" fw={500} mt="lg">
              {typeof product.price === "number"
                ? `₹${product.price.toLocaleString("en-IN")}`
                : "Price unavailable"}
            </Text>
            <Badge
              color={stockKnown && product.stock <= 0 ? "red" : "gray"}
              variant="light"
              mt="md"
            >
              {stockKnown
                ? product.stock > 0
                  ? "In stock"
                  : "Out of stock"
                : "Stock not listed"}
            </Badge>
          </Box>
          <Text
            size="sm"
            lh={1.9}
            c="dimmed"
            style={{ whiteSpace: "pre-line" }}
          >
            {product.description || "Explore the photos and available options to find your preferred style."}
          </Text>
          <Divider />
          <Box>
            <Group justify="space-between" gap="sm" mb="md">
              <Text fw={500} size="sm">
                Colour {color && `— ${color}`}
              </Text>
            </Group>
            {colors.length ? (
              <Group
                gap="xs"
                role="group"
                aria-label="Available product colours"
              >
                {colors.map((option) => (
                  <Button
                    key={option}
                    variant={option === color ? "filled" : "default"}
                    color="dark"
                    radius={0}
                    mih={46}
                    h="auto"
                    py={10}
                    aria-pressed={option === color}
                    onClick={() => setChosenColor(option)}
                    leftSection={
                      <Box
                        w={18}
                        h={18}
                        style={{
                          borderRadius: "50%",
                          background: productColor(option) || "#aaa",
                          border: "1px solid #888",
                          flexShrink: 0,
                        }}
                      />
                    }
                    rightSection={option === color ? <Check size={15} /> : null}
                    styles={{ label: { whiteSpace: "normal" } }}
                  >
                    {option}
                  </Button>
                ))}
              </Group>
            ) : (
              <Text size="sm" c="dimmed">
                No colour options have been listed.
              </Text>
            )}
          </Box>
          <Box>
            <Group justify="space-between" gap="sm" mb="md">
            <Text fw={500} size="sm">
              Size {size && `— ${size}`}
            </Text>
            <SizeGuide product={product} onSelect={setChosenSize} />
            </Group>
            {sizes.length ? (
              <Group gap="xs" role="group" aria-label="Available product sizes">
                {sizes.map((option) => (
                  <Button
                    key={option}
                    variant={option === size ? "filled" : "default"}
                    color="dark"
                    radius={0}
                    mih={46}
                    aria-pressed={option === size}
                    onClick={() => setChosenSize(option)}
                  >
                    {option}
                  </Button>
                ))}
              </Group>
            ) : (
              <Text size="sm" c="dimmed">
                No size options have been listed.
              </Text>
            )}
          </Box>
          <Box p="md" bg="var(--mantine-color-default-hover)">
            <Text size="sm" aria-live="polite">
              {color || size
                ? `Your selection: ${[color, size].filter(Boolean).join(" / ")}`
                : "No colour or size options listed."}
            </Text>
            <Text size="xs" c="dimmed" mt="xs">
              Availability applies to this product across the listed options.
            </Text>
          </Box>
          <Box>
            <NumberInput
              label="Quantity"
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={available ? product.stock : 1}
              allowDecimal={false}
              allowNegative={false}
              clampBehavior="strict"
              disabled={!available}
              w={140}
              size="md"
              mb="lg"
              styles={{ input: { fontSize: 16 } }}
            />
            <Stack gap="sm">
              <Button
                color="dark"
                radius={0}
                size="lg"
                fullWidth
                leftSection={<ShoppingBag size={18} />}
                disabled={!canBuy || quantity > remaining}
                onClick={() => purchase(false)}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                color="gray"
                radius={0}
                size="lg"
                fullWidth
                leftSection={<Zap size={18} />}
                disabled={!canBuy}
                onClick={() => purchase(true)}
              >
                Buy Now
              </Button>
            </Stack>
            {available && remaining === 0 && (
              <Text size="xs" c="dimmed" mt="sm">
                All available units are already in your bag.{" "}
                <Anchor component={Link} to="/cart" size="xs">
                  View cart
                </Anchor>
              </Text>
            )}
            {!available && (
              <Text size="xs" c="dimmed" mt="sm">
                {stockKnown && product.stock <= 0
                  ? "This product is currently out of stock."
                  : "Stock availability needs to be confirmed before purchasing."}
              </Text>
            )}
          </Box>
          <Accordion variant="separated" defaultValue="information">
            <Accordion.Item value="information">
              <Accordion.Control>Product information</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Text size="sm">
                    Category: {product.category || "Not listed"}
                  </Text>
                  <Text size="sm">
                    Available colours: {colors.join(", ") || "Not listed"}
                  </Text>
                  <Text size="sm">
                    Available sizes: {sizes.join(", ") || "Not listed"}
                  </Text>
                  <Text size="sm">
                    Total stock:{" "}
                    {stockKnown ? `${product.stock} units` : "Not listed"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Product ID: {product._id}
                  </Text>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          <Button
            component={Link}
            to="/shop"
            variant="default"
            radius={0}
            mih={48}
            leftSection={<ArrowLeft size={17} />}
          >
            Continue exploring
          </Button>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const validId = /^[a-f\d]{24}$/i.test(id || "");
  const { currentData, isFetching, isError, error, refetch } =
    useGetProductByIdQuery(id, { skip: !validId });
  const product = currentData?.data;
  const needsLogin = error?.status === 401 || error?.status === 403;
  const loading = validId && isFetching && !product;
  const notFound =
    !validId || error?.status === 404 || (!isFetching && !isError && !product);

  return (
    <Container
      component="main"
      py={{ base: 32, md: 56 }}
      style={{ userSelect: "text", overflowWrap: "anywhere" }}
    >
      <Breadcrumbs
        mb={32}
        styles={{
          breadcrumb: { whiteSpace: "normal", minWidth: 0 },
          root: { flexWrap: "wrap" },
        }}
      >
        <Anchor component={Link} to="/" size="sm" c="dimmed">
          Home
        </Anchor>
        <Anchor component={Link} to="/shop" size="sm" c="dimmed">
          Shop
        </Anchor>
        <Text size="sm">{product?.name || "Product details"}</Text>
      </Breadcrumbs>
      {loading ? (
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Skeleton h={{ base: 360, md: 580 }} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack>
              <Skeleton h={40} />
              <Skeleton h={25} w="40%" />
              <Skeleton h={120} />
              <Skeleton h={48} />
            </Stack>
          </Grid.Col>
        </Grid>
      ) : notFound || isError ? (
        <ErrorAlert
          color="gray"
          title={
            notFound
              ? "Product not found"
              : needsLogin
                ? "Sign in to view this product"
                : "We couldn't load this product"
          }
        >
          <Text size="sm" mb="lg">
            {notFound
              ? "This product may no longer be available. Explore the collection for other pieces."
              : needsLogin
                ? "Your product catalogue requires an account. Sign in to see the full details."
                : "Please try again."}
          </Text>
          <Group>
            {needsLogin && (
              <Button component={Link} to="/login" color="dark">
                Sign in
              </Button>
            )}
            {!notFound && (
              <Button variant="default" onClick={refetch}>
                Try again
              </Button>
            )}
            <Button component={Link} to="/shop" variant="default">
              Back to shop
            </Button>
          </Group>
        </ErrorAlert>
      ) : product ? (
        <Box key={id}>
          <ProductContent product={product} />
          <SimilarProducts product={product} />
        </Box>
      ) : null}
    </Container>
  );
}
