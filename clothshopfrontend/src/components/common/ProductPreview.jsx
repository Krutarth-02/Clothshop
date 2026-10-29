import {
  Badge,
  Button,
  Grid,
  Image,
  Modal,
  Stack,
  Text,
  Title,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductPreview({ product, onClose }) {
  const theme = useMantineTheme();
  const smallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  return (
    <Modal
      opened={Boolean(product)}
      onClose={onClose}
      title="A closer look"
      centered={!smallScreen}
      fullScreen={smallScreen}
      closeButtonProps={{ size: 44, "aria-label": "Close product preview" }}
      styles={{
        content: { maxHeight: "100dvh", overflowY: "auto" },
        body: {
          overflowWrap: "anywhere",
          paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        },
      }}
      size="lg"
    >
      {product && (
        <>
          <UnstyledButton
            component={Link}
            to={`/product/${encodeURIComponent(product._id)}`}
            onClick={onClose}
            w="100%"
            style={{ textAlign: "left", minWidth: 0 }}
            aria-label={`View full details for ${product.name}`}
          >
            <Grid gutter="xl">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Image
                  src={product.image || null}
                  alt={product.name}
                  h={{ base: 260, sm: 320 }}
                  fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23e6e3dc'/%3E%3C/svg%3E"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="md">
                  <Text size="xs" c="dimmed">
                    {product.category}
                  </Text>
                  <Title order={3}>{product.name}</Title>
                  <Text>
                    {typeof product.price === "number"
                      ? `₹${product.price.toLocaleString("en-IN")}`
                      : "Price unavailable"}
                  </Text>
                  <Text size="sm" c="dimmed" lh={1.8}>
                    {product.description}
                  </Text>
                  {product.size?.length > 0 && (
                    <Text size="sm">Sizes: {product.size.join(" · ")}</Text>
                  )}
                  {product.color?.length > 0 && (
                    <Text size="sm">Colours: {product.color.join(" · ")}</Text>
                  )}
                  {typeof product.stock === "number" && (
                    <Badge
                      color={product.stock > 0 ? "gray" : "red"}
                      variant="light"
                    >
                      {product.stock > 0 ? "In stock" : "Out of stock"}
                    </Badge>
                  )}
                </Stack>
              </Grid.Col>
            </Grid>
          </UnstyledButton>
          <Button
            component={Link}
            to={`/product/${encodeURIComponent(product._id)}`}
            onClick={onClose}
            color="dark"
            radius={0}
            fullWidth
            mt="xl"
            mih={48}
            rightSection={<ArrowUpRight size={18} />}
          >
            View full details
          </Button>
        </>
      )}
    </Modal>
  );
}
