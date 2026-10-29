import { Group, Image, Stack, Text } from "@mantine/core";

export default function BrandLogo() {
  return (
    <Group gap={10} wrap="nowrap" aria-hidden="true">
      <Image
        src={import.meta.env.BASE_URL + "brand-mark.svg"}
        alt=""
        w={{ base: 34, sm: 40 }}
        h={{ base: 34, sm: 40 }}
        style={{ flexShrink: 0 }}
      />
      <Stack gap={4}>
        <Text
          fw={600}
          size="clamp(17px, 2vw, 20px)"
          lh={1}
          style={{ letterSpacing: "-.04em", whiteSpace: "nowrap" }}
        >
          Cevraliq
        </Text>
        <Text
          size="7px"
          fw={500}
          lh={1}
          style={{ letterSpacing: ".18em", whiteSpace: "nowrap", opacity: .7 }}
        >
          WEAR YOUR STORY
        </Text>
      </Stack>
    </Group>
  );
}
