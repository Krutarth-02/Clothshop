import {
  Anchor,
  Box,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal";

export default function AuthLayout({ title, description, children }) {
  return (
    <Box
      component="main"
      style={{ userSelect: "text", overflowWrap: "anywhere" }}
      mih="100dvh"
      bg="var(--mantine-color-body)"
    >
      <Grid gutter={0} mih="100dvh">
        <Grid.Col
          span={{ base: 12, lg: 6 }}
          visibleFrom="lg"
          pos="relative"
          style={{ overflow: "hidden" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85"
            alt="Personal style, out in the city"
            h="100%"
            pos="absolute"
            style={{ inset: 0 }}
          />
          <Box
            pos="absolute"
            style={{
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.72))",
            }}
          />
          <Stack
            pos="relative"
            justify="space-between"
            mih="100dvh"
            p={{ base: 30, lg: 64 }}
            c="white"
          >
            <Anchor
              component={Link}
              to="/"
              c="white"
              underline="never"
              fw={700}
              size="xl"
            >
              Cevraliq.
            </Anchor>
            <Reveal>
              <Text size="xs" mb="lg" style={{ letterSpacing: 3 }}>
                INDIVIDUAL BY DESIGN
              </Text>
              <Title
                order={2}
                fw={500}
                size="clamp(40px, 5vw, 76px)"
                lh={1.05}
                style={{ letterSpacing: "-.05em" }}
              >
                Good style.
                <br />
                Great company.
              </Title>
              <Text mt="xl" maw={350} c="#e8e5dd" lh={1.8}>
                A little inspiration. A fresh perspective. A wardrobe that feels
                like you.
              </Text>
              <Group mt={45} gap="xs">
                <Text size="sm">Your next chapter starts here</Text>
                <ArrowUpRight size={18} />
              </Group>
            </Reveal>
            <Text size="xs" c="#e8e5dd">
              YOUR STYLE. YOUR STORY.
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }} style={{ minWidth: 0 }}>
          <Stack
            mih="100dvh"
            gap={0}
            p={{ base: 20, sm: 32, lg: 48 }}
            pb="max(20px, env(safe-area-inset-bottom))"
            justify="space-between"
          >
            <Anchor
              component={Link}
              to="/"
              c="dimmed"
              size="sm"
              w="100%"
              maw={440}
              mx="auto"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                minHeight: 44,
              }}
            >
              <ArrowLeft size={16} /> Back to Cevraliq
            </Anchor>
            <Reveal
              w="100%"
              maw={440}
              mx="auto"
              py={{ base: 24, sm: 40 }}
              style={{ minWidth: 0 }}
            >
              <Text size="xs" c="dimmed" mb="lg" style={{ letterSpacing: 2 }}>
                WELCOME TO YOUR CEVRALIQ
              </Text>
              <Title
                order={1}
                fw={500}
                size="clamp(30px, 4vw, 42px)"
                lh={1.15}
                mb="md"
                style={{ letterSpacing: "-.04em" }}
              >
                {title}
              </Title>
              <Text c="dimmed" size="sm" lh={1.8} mb={32}>
                {description}
              </Text>
              {children}
            </Reveal>
            <Text
              ta="center"
              size="xs"
              c="dimmed"
              w="100%"
              maw={440}
              mx="auto"
            >
              Cevraliq &copy; {new Date().getFullYear()} · Individual by
              design.
            </Text>
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
