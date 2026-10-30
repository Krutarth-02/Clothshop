import { Group, Image, Stack, Text } from "@mantine/core";

export default function BrandLogo({ iconSize = { base: 34, sm: 40 }, showTagline = true, ...props }) {
  return (
    <Group gap={10} wrap="nowrap" aria-hidden="true" {...props}>
      <Image
        src={import.meta.env.BASE_URL + "brand-mark.svg"}
        alt=""
        w={iconSize}
        h={iconSize}
        style={{ flexShrink: 0 }}
      />
      <Stack gap={4}>
        <Text
          fw={700}
          size="clamp(12px, 1.2vw, 17px)"
          lh={1}
          style={{ letterSpacing: "-.025em", whiteSpace: "nowrap" }}
        >
          HIFASHOPNHUB
        </Text>
        {showTagline && <Text
          size="7px"
          fw={500}
          lh={1}
          style={{ letterSpacing: ".18em", whiteSpace: "nowrap", opacity: .7 }}
        >
          WEAR YOUR STORY
        </Text>}
      </Stack>
    </Group>
  );
}
