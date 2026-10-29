import { useLayoutEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Image,
  SimpleGrid,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import ScrollReveal from "../common/ScrollReveal";

export default function CollectionHero({ collections }) {
  const [selected, setSelected] = useState(0);
  const ref = useRef(null);
  const gesture = useRef(null);
  const reducedMotion = useReducedMotion();
  const current = collections[selected];
  const changeCollection = (direction) =>
    setSelected(
      (previous) =>
        (previous + direction + collections.length) % collections.length,
    );

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const context = gsap.context(() => {
      gsap.from("[data-hero-picture]", {
        opacity: 0.35,
        duration: 0.8,
        ease: "power2.out",
      });
      gsap.from("[data-hero-copy] > *", {
        y: 18,
        opacity: 0,
        stagger: 0.07,
        duration: 0.65,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
    }, ref);
    return () => context.revert();
  }, [selected, reducedMotion]);

  return (
    <Box
      ref={ref}
      component="section"
      aria-labelledby="hero-title"
      pos="relative"
      bg="#1c281f"
      c="white"
      style={{ overflow: "hidden", touchAction: "pan-y" }}
      onPointerDown={(event) => {
        if (event.pointerType === "touch" && !event.target.closest("a, button"))
          gesture.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        const start = gesture.current;
        gesture.current = null;
        if (!start) return;
        const x = event.clientX - start.x,
          y = event.clientY - start.y;
        if (Math.abs(x) > 60 && Math.abs(x) > Math.abs(y) * 1.5)
          changeCollection(x < 0 ? 1 : -1);
      }}
      onPointerCancel={() => {
        gesture.current = null;
      }}
    >
      <Box
        key={current.to}
        data-hero-picture
        pos="absolute"
        style={{ inset: 0 }}
      >
        <ScrollReveal
          component={Image}
          parallax
          src={current.image.replace("w=800", "w=1800")}
          alt={`${current.label} collection inspiration`}
          pos="absolute"
          h="115%"
          w="100%"
          style={{ top: "-7.5%", left: 0, objectPosition: "center 38%" }}
        />
      </Box>
      <Box
        pos="absolute"
        style={{
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(12,23,16,.88), rgba(12,23,16,.48) 60%, rgba(12,23,16,.25)), linear-gradient(0deg, rgba(12,23,16,.85), transparent 45%)",
        }}
      />
      <Container
        pos="relative"
        pt={{ base: 48, md: 88 }}
        pb={28}
      >
        <Group justify="space-between" mb={{ base: 30, md: 48 }}>
          <Text size="xs" c="#e1e4c5" style={{ letterSpacing: 3 }}>
            THE EVERYDAY, REIMAGINED
          </Text>
          <Text size="xs" visibleFrom="sm" style={{ letterSpacing: 2 }}>
            INDIVIDUAL BY DESIGN
          </Text>
        </Group>
        <Box data-hero-copy maw={690}>
          <Title
            id="hero-title"
            order={1}
            fw={500}
            size="clamp(42px, 7.5vw, 96px)"
            lh={1.02}
            mih={{ base: 100, sm: 150, md: 198 }}
            style={{ letterSpacing: "-.055em" }}
          >
            {current.headline}
            <br />
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                color: "#e1e4c5",
              }}
            >
              {current.accent}
            </span>
          </Title>
          <Text maw={380} mih={80} mt={24} c="#e8ebe3" lh={1.8}>
            {current.description}
          </Text>
          <Group mt={28} gap="lg">
            <Button
              component={Link}
              to={current.to}
              size="lg"
              radius={0}
              bg="#e1e4c5"
              c="#252820"
              rightSection={<ArrowUpRight size={19} />}
              w={{ base: "100%", xs: "auto" }}
              styles={{
                root: { height: "auto", minHeight: 50, paddingBlock: 12 },
                label: { whiteSpace: "normal" },
              }}
            >
              Shop {current.label}
            </Button>
            <Anchor
              component={Link}
              to="/new-arrivals"
              c="white"
              size="sm"
              underline="always"
              style={{
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Explore new arrivals
            </Anchor>
          </Group>
        </Box>
        <Group
          justify="space-between"
          mt={{ base: 36, md: 54 }}
          mb={16}
          gap="sm"
        >
          <Box>
            <Text size="10px" c="#e1e4c5" style={{ letterSpacing: 2 }}>
              CHOOSE YOUR PERSPECTIVE
            </Text>
            <Text size="xs" mt={5} aria-live="polite">
              {String(selected + 1).padStart(2, "0")} /{" "}
              {String(collections.length).padStart(2, "0")} — {current.label}
            </Text>
          </Box>
          <Group gap={4}>
            <ActionIcon
              aria-label="Previous collection"
              size={44}
              variant="transparent"
              c="white"
              onClick={() => changeCollection(-1)}
            >
              <ArrowLeft size={20} />
            </ActionIcon>
            <ActionIcon
              aria-label="Next collection"
              size={44}
              variant="transparent"
              c="white"
              onClick={() => changeCollection(1)}
            >
              <ArrowRight size={20} />
            </ActionIcon>
          </Group>
        </Group>
        <SimpleGrid
          cols={3}
          spacing={{ base: 8, sm: 16 }}
          role="group"
          aria-label="Choose a featured collection"
        >
          {collections.map((collection, index) => (
            <UnstyledButton
              key={collection.to}
              aria-pressed={selected === index}
              aria-label={`Show ${collection.label} collection`}
              onClick={() => setSelected(index)}
              p={{ base: 12, sm: 16 }}
              style={{
                border: `1px solid ${selected === index ? "#e1e4c5" : "#ffffff40"}`,
                background: selected === index ? "#e1e4c524" : "#111b1240",
                transition: reducedMotion
                  ? "none"
                  : "background 200ms ease, border-color 200ms ease",
              }}
            >
              <Group wrap="nowrap" gap="md">
                <Image
                  src={collection.image}
                  alt=""
                  w={44}
                  h={54}
                  visibleFrom="sm"
                />
                <Box style={{ minWidth: 0 }}>
                  <Text size="10px" c="#d1d8c8" mb={4}>
                    0{index + 1}
                  </Text>
                  <Text
                    size="clamp(11px, 1.2vw, 15px)"
                    fw={selected === index ? 600 : 400}
                  >
                    {collection.label}
                  </Text>
                  <Text size="xs" c="#d1d8c8" visibleFrom="md">
                    {collection.subtitle}
                  </Text>
                </Box>
              </Group>
            </UnstyledButton>
          ))}
        </SimpleGrid>
        <Group justify="space-between" mt={18} gap="sm">
          <Text size="10px" c="#d1d8c8">
            Your style. A different perspective.
          </Text>
          <Anchor
            href="#edit"
            c="white"
            size="xs"
            onClick={(event) => {
              const section = document.getElementById("edit");
              if (section) {
                event.preventDefault();
                section.scrollIntoView({
                  behavior: reducedMotion ? "instant" : "smooth",
                });
              }
            }}
            style={{
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Discover the edit <ArrowDown size={15} />
          </Anchor>
        </Group>
      </Container>
    </Box>
  );
}
