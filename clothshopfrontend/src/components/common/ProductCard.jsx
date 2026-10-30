import { useState } from "react";
import { Box, Group, Image, Stack, Text, UnstyledButton } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { ArrowUpRight } from "lucide-react";

export default function ProductCard({ product, onPreview }) {
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  return (
    <UnstyledButton
      onClick={() => onPreview(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      w="100%"
      style={{
        minWidth: 0,
        overflowWrap: "anywhere",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        textAlign: "left",
      }}
      aria-label={`Preview ${product.name}`}
    >
      <Box
        bg="var(--mantine-color-default-hover)"
        pos="relative"
        style={{
          overflow: "hidden",
          aspectRatio: "3 / 4",
          width: "100%",
          flexShrink: 0,
        }}
      >
        <Image
          src={product.image || null}
          fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23e6e3dc'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%2364625d' font-family='sans-serif' font-size='14'%3EHIFASHOPNHUB%3C/text%3E%3C/svg%3E"
          alt={product.name}
          h="100%"
          loading="lazy"
          style={{
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: reducedMotion ? "none" : "transform 400ms ease",
          }}
        />
        <Text
          pos="absolute"
          bottom={12}
          right={12}
          bg="white"
          c="dark"
          px="sm"
          py={6}
          size="xs"
        >
          Quick look <ArrowUpRight size={12} aria-hidden="true" />
        </Text>
      </Box>
      <Stack gap={5} mt="md" w="100%">
        <Text size="xs" c="dimmed" lineClamp={1}>
          {product.category || "The collection"}
        </Text>
        <Group justify="space-between" gap={12} align="start" wrap="nowrap">
          <Text
            fw={500}
            size="sm"
            lineClamp={2}
            mih={40}
            style={{ flex: 1, minWidth: 0 }}
          >
            {product.name}
          </Text>
          <Text size="sm" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
            {typeof product.price === "number"
              ? `₹${product.price.toLocaleString("en-IN")}`
              : "Price unavailable"}
          </Text>
        </Group>
      </Stack>
    </UnstyledButton>
  );
}
