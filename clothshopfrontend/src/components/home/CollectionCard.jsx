import { useState } from "react";
import {
  Box,
  Group,
  Image,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CollectionCard({ collection, index }) {
  const [active, setActive] = useState(false);
  const reducedMotion = useReducedMotion();
  return (
    <UnstyledButton
      component={Link}
      to={collection.to}
      aria-label={`Explore ${collection.label.toLowerCase()}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <Box
        pos="relative"
        bg="#34372e"
        style={{ overflow: "hidden", aspectRatio: "4 / 5" }}
      >
        <Image
          src={collection.image}
          alt={`${collection.label} style inspiration`}
          h="100%"
          loading="lazy"
          style={{
            transform: active && !reducedMotion ? "scale(1.06)" : "scale(1)",
            transition: reducedMotion ? "none" : "transform 600ms ease",
          }}
        />
        <Box
          pos="absolute"
          style={{
            inset: 0,
            background: "linear-gradient(transparent 25%, rgba(0,0,0,.8))",
          }}
        />
        <Stack
          pos="absolute"
          bottom={24}
          left={24}
          right={24}
          c="white"
          gap={10}
        >
          <Text size="xs">0{index + 1} / THE EDIT</Text>
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <Title order={3} size="clamp(22px, 2.5vw, 30px)" fw={500}>
              {collection.label}
            </Title>
            <Box
              w={40}
              h={40}
              style={{
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                background: active ? "#e1e4c5" : "#ffffff20",
                color: active ? "#252820" : "white",
                transition: reducedMotion ? "none" : "background 200ms ease",
              }}
            >
              <ArrowUpRight size={21} />
            </Box>
          </Group>
          <Text size="sm" c="#e4e4dd">
            {collection.subtitle}
          </Text>
          <Text
            size="xs"
            pt={12}
            style={{ borderTop: "1px solid #ffffff50", letterSpacing: 1 }}
          >
            EXPLORE COLLECTION
          </Text>
        </Stack>
      </Box>
    </UnstyledButton>
  );
}
