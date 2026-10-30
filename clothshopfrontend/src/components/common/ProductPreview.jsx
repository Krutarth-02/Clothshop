import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActionIcon, Anchor, Badge, Box, Button, Group, Image, NumberInput, Stack, Text, Title } from "@mantine/core";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Star, X, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useGetProductByIdQuery } from "../../redux/auth/productApi";
import { addToCart, createCartItem, setBuyNowItem } from "../../redux/cart/cartSlice";
import { productColor, productOptions } from "../product/productOptions";
import CommonModal from "./Modal";
import WishlistButton from "./WishlistButton";
import ErrorAlert from "./ErrorAlert";

const accent = "#263c35";
const money = (price) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(price);

function PreviewContent({ product, onClose, checking, verified, error, onRetry }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const colours = productOptions(product.color), sizes = productOptions(product.size);
  const [chosenColour, setColour] = useState(colours[0] || "");
  const [chosenSize, setSize] = useState(sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [chosenImage, setImage] = useState(0);
  const colour = colours.includes(chosenColour) ? chosenColour : colours[0] || "";
  const size = sizes.includes(chosenSize) ? chosenSize : sizes[0] || "";
  const images = [...new Set([product.image, ...(Array.isArray(product.images) ? product.images.map((image) => typeof image === "string" ? image : image?.url) : [])].filter((image) => typeof image === "string" && image.trim()))];
  const imageIndex = Math.min(chosenImage, Math.max(0, images.length - 1));
  const available = Number.isInteger(product.stock) && product.stock > 0;
  const inCart = cartItems.filter((item) => item.productId === product._id).reduce((sum, item) => sum + item.quantity, 0);
  const remaining = available ? Math.max(0, product.stock - inCart) : 0;
  const validPrice = typeof product.price === "number" && Number.isFinite(product.price) && product.price >= 0;
  const canBuy = verified && available && validPrice && Number.isInteger(quantity) && quantity > 0 && quantity <= product.stock;
  const canAdd = canBuy && quantity <= remaining;
  const onSale = validPrice && Number.isFinite(product.originalPrice) && product.originalPrice > product.price;
  const hasRating = Number.isFinite(product.rating) && product.rating >= 0 && product.rating <= 5;
  const purchase = (buyNow) => {
    if (buyNow ? !canBuy : !canAdd) return;
    const item = createCartItem(product, colour, size, quantity);
    if (!item) { toast.error("Check your options and quantity."); return; }
    if (buyNow) {
      dispatch(setBuyNowItem(item));
      onClose();
      navigate("/checkout?mode=buy-now");
    } else if (dispatch(addToCart(item))) toast.success("Added to your shopping bag");
    else toast.error("That quantity exceeds the available stock in your bag.");
  };

  return <Box>
    <Box pos="relative" style={{ overflow: "hidden", background: "var(--mantine-color-default-hover)" }}>
      <Image src={images[imageIndex] || null} alt={product.name} w="100%" h="clamp(240px, 40dvh, 360px)" fit="cover" style={{ display: "block", objectPosition: "center" }}
        fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='460' height='360'%3E%3Cpath d='M170 215l38-44 27 26 22-29 36 47H170z' fill='%238b9691'/%3E%3C/svg%3E" />
      {onSale && <Badge pos="absolute" top={14} left={14} color="red" radius="xl" size="sm">{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF</Badge>}
      <WishlistButton product={product} size={30} style={{ position: "absolute", right: 48, top: 12, background: "#fff", color: accent, border: "none", boxShadow: "0 2px 8px #263c3512" }} />
      <ActionIcon pos="absolute" right={12} top={12} variant="white" color="dark" size={30} radius="xl" aria-label="Close product preview" onClick={onClose}><X size={16} /></ActionIcon>
      {images.length > 1 && <>
        <ActionIcon pos="absolute" top="45%" left={8} size={28} variant="white" color="dark" radius="xl" aria-label="Previous product image" onClick={() => setImage((imageIndex - 1 + images.length) % images.length)}><ChevronLeft size={17} /></ActionIcon>
        <ActionIcon pos="absolute" top="45%" right={8} size={28} variant="white" color="dark" radius="xl" aria-label="Next product image" onClick={() => setImage((imageIndex + 1) % images.length)}><ChevronRight size={17} /></ActionIcon>
        <Group pos="absolute" left={14} bottom={10} gap={1}>{images.map((image, index) => <ActionIcon key={image} size={18} variant="transparent" aria-label={`Show product image ${index + 1}`} aria-pressed={imageIndex === index} onClick={() => setImage(index)}><Box w={5} h={5} bg={imageIndex === index ? "#fff" : "#ffffff70"} style={{ borderRadius: "50%" }} /></ActionIcon>)}</Group>
      </>}
    </Box>
    <Stack gap={12} p={18}>
      <ErrorAlert title={error ? "Unable to check this product" : null} message={error ? error?.data?.message || "Please retry to confirm current price and stock." : null} onRetry={onRetry} />
      <Stack gap={5}>
        <Text size="9px" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: 1.2 }}>{product.category || "The collection"}</Text>
        <Title order={2} size={21} fw={700} lh={1.2} style={{ letterSpacing: "-.025em" }}>{product.name}</Title>
        {product.description && <Text size="xs" c="dimmed" lh={1.6} lineClamp={2}>{product.description}</Text>}
      </Stack>
      {hasRating && <Group gap={6}>
        <Group gap={2} aria-label={`Rated ${product.rating.toFixed(1)} out of 5`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} fill={index < Math.round(product.rating) ? "#d4a94c" : "none"} color="#d4a94c" />)}</Group>
        <Text size="10px" c="dimmed">{product.rating.toFixed(1)}{Number.isInteger(product.reviewCount) ? ` (${product.reviewCount} reviews)` : ""}</Text>
      </Group>}
      {sizes.length > 0 && <Group gap={8} align="center">
        <Text size="10px" fw={600} c="dimmed" tt="uppercase" w={35}>Size</Text>
        <Group gap={5} role="group" aria-label="Select a size">{sizes.map((option) => <Button key={option} size="compact-xs" radius="sm" h={27} miw={29} variant={option === size ? "light" : "default"} color={accent} disabled={!verified} aria-pressed={option === size} onClick={() => setSize(option)}>{option}</Button>)}</Group>
      </Group>}
      {colours.length > 0 && <Group gap={8} align="center">
        <Text size="10px" fw={600} c="dimmed" tt="uppercase" w={35}>Color</Text>
        <Group gap={5} role="group" aria-label="Select a colour">{colours.map((option) => {
          const swatch = productColor(option);
          return <ActionIcon key={option} size={24} radius="xl" variant="transparent" disabled={!verified} aria-label={`Select ${option}`} title={option} aria-pressed={option === colour}
            onClick={() => setColour(option)} style={{ border: option === colour ? `2px solid ${accent}` : "2px solid transparent" }}>
            <Box w={16} h={16} bg={swatch || "var(--mantine-color-default-hover)"} style={{ borderRadius: "50%", border: "1px solid var(--mantine-color-default-border)", display: "grid", placeItems: "center" }}>{!swatch && <Text size="7px">{option.slice(0, 2)}</Text>}</Box>
          </ActionIcon>;
        })}</Group>
        <Text size="10px" c="dimmed">{colour}</Text>
      </Group>}
      <Group justify="space-between" align="center" gap={8} mt={1}>
        <Group gap={8} align="baseline"><Text size={26} fw={700} lh={1.1} style={{ letterSpacing: "-.04em" }}>{validPrice ? money(product.price) : "Price unavailable"}</Text>{onSale && <Text size="xs" c="dimmed" td="line-through">{money(product.originalPrice)}</Text>}</Group>
        <Badge variant="light" size="xs" color={verified && available ? "green" : verified ? "red" : "gray"}>{checking ? "Checking" : !verified ? "Unconfirmed" : available ? "In stock" : "Sold out"}</Badge>
      </Group>
      {verified && available && quantity > remaining && <Text size="10px" c="dimmed">{remaining ? `You can add ${remaining} more to your bag.` : "The available quantity is already in your bag."} Buy Now uses a separate selection.</Text>}
      <Group gap={8} wrap="nowrap" align="stretch">
        <Group gap={0} wrap="nowrap" style={{ flexShrink: 0, border: "1px solid var(--mantine-color-default-border)", borderRadius: 8, paddingInline: 3 }}>
          <ActionIcon variant="transparent" color="gray" size={27} disabled={!verified || !available || quantity <= 1} aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, (Number(quantity) || 1) - 1))}><Minus size={13} /></ActionIcon>
          <NumberInput aria-label="Product quantity" value={quantity} onChange={setQuantity} min={1} max={available ? product.stock : 1} allowDecimal={false} allowNegative={false} disabled={!verified || !available} hideControls size="xs" w={30} styles={{ input: { textAlign: "center", paddingInline: 0, border: 0, background: "transparent", fontWeight: 600 } }} />
          <ActionIcon variant="transparent" color="gray" size={27} disabled={!verified || !available || quantity >= product.stock} aria-label="Increase quantity" onClick={() => setQuantity(Math.min(product.stock, (Number(quantity) || 1) + 1))}><Plus size={13} /></ActionIcon>
        </Group>
        <Button color={accent} autoContrast radius="md" size="sm" h={40} px={10} leftSection={<ShoppingBag size={15} />} disabled={!canAdd} loading={checking} onClick={() => purchase(false)} style={{ flex: 1 }}>Add to Cart</Button>
      </Group>
      <Group justify="space-between" gap={8}>
        <Anchor component={Link} to={`/product/${product._id}`} onClick={onClose} size="11px" c="dimmed">Product details</Anchor>
        <Button variant="subtle" color={accent} size="compact-xs" leftSection={<Zap size={12} />} disabled={!canBuy} onClick={() => purchase(true)}>Buy Now</Button>
        {inCart > 0 && <Anchor component={Link} to="/cart" onClick={onClose} size="11px" c="dimmed">View bag ({inCart})</Anchor>}
      </Group>
    </Stack>
  </Box>;
}

export default function ProductPreview({ product, onClose }) {
  const { data, isFetching, error, refetch } = useGetProductByIdQuery(product?._id, { skip: !product?._id, refetchOnMountOrArgChange: true });
  const live = product && data?.data?._id === product._id ? data.data : product;
  return <CommonModal opened={Boolean(product)} onClose={onClose} centered size={460} radius={18} padding={0} withCloseButton={false} aria-label="Product preview"
    styles={{ content: { maxHeight: "calc(100dvh - 24px)", border: "1px solid var(--mantine-color-default-border)", boxShadow: "0 24px 70px rgba(0,0,0,.22)" }, body: { padding: 0, overflowWrap: "anywhere" } }}>
    {product && <PreviewContent key={product._id} product={live} onClose={onClose} checking={isFetching}
      verified={Boolean(data?.data?._id === product._id && !isFetching && !error)} error={error} onRetry={refetch} />}
  </CommonModal>;
}
