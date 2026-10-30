import {
  Anchor,
  Box,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "react-router-dom";
import BrandLogo from "../common/BrandLogo";

const footerLinkGroups = [
  {
    title: "EXPLORE",
    links: [
      {
        label: "Home",
        to: "/",
      },
      {
        label: "Shop All",
        to: "/shop",
      },
      {
        label: "New Arrivals",
        to: "/new-arrivals",
      },
      {
        label: "Women",
        to: "/women",
      },
      {
        label: "Men",
        to: "/men",
      },
      {
        label: "Accessories",
        to: "/accessories",
      },
      {
        label: "About Us",
        to: "/about",
      },
    ],
  },
  {
    title: "YOUR HIFASHOPNHUB",
    links: [
      { to: "/cart", label: "Shopping bag" },
      {
        label: "Sign in",
        to: "/login",
      },
      {
        label: "Create account",
        to: "/register",
      },
      {
        label: "Password help",
        to: "/forgot-password",
      },
    ],
  },
];

export default function Footer() {
  return (
    <Box
      className="fashion-footer"
      component="footer"
      pt={{ base: 40, md: 65 }}
      pb={25}
      style={{
        background: "#1a1a1a",
        color: "#e0e0e0",
        overflow: "hidden",
      }}
    >
      <Container>
        <Grid
          gutter={{
            base: 35,
            md: 50,
          }}
        >
          <Grid.Col
            span={{
              base: 12,
              sm: 6,
              md: 4,
            }}
          >
            <Anchor
              component={Link}
              to="/"
              underline="never"
              c="#f3f0e8"
              aria-label="HIFASHOPNHUB home"
            >
              <BrandLogo />
            </Anchor>
            <Text size="sm" c="#aaa" lh={1.9} mt={23}>
              Premium fashion for the modern lifestyle.
              <br />
              Your style. Your story. Your HIFASHOPNHUB.
            </Text>
          </Grid.Col>
          {footerLinkGroups.map((group) => (
            <Grid.Col
              key={group.title}
              span={{
                base: 12,
                xs: 6,
                sm: 3,
                md: 2,
              }}
            >
              <Stack gap={12}>
                <Text size="xs" c="#deded1" mb={6} style={{ letterSpacing: 2 }}>
                  {group.title}
                </Text>
                {group.links.map((link) => (
                  <Anchor
                    key={link.label}
                    component={Link}
                    to={link.to}
                    c="#aaa"
                    size="sm"
                    underline="hover"
                    style={{
                      minHeight: 44,
                      display: "flex",
                      alignItems: "center",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {link.label}
                  </Anchor>
                ))}
              </Stack>
            </Grid.Col>
          ))}
          <Grid.Col
            span={{
              base: 12,
              md: 4,
            }}
          >
            <Text size="xs" c="#aaa" mb={18} style={{ letterSpacing: 2 }}>
              A PERSONAL PERSPECTIVE
            </Text>
            <Title order={3} size="28px" mb={20}>
              Make room
              <br />
              for something you.
            </Title>
            <Anchor
              component={Link}
              to="/register"
              c="#deded1"
              size="sm"
              underline="always"
              style={{
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Join HIFASHOPNHUB &nearr;
            </Anchor>
          </Grid.Col>
        </Grid>
        <Text
          aria-hidden="true"
          mt={30}
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "clamp(24px, 8.2vw, 150px)",
            lineHeight: 1.3,
            letterSpacing: "-.075em",
            opacity: 0.14,
            whiteSpace: "nowrap",
          }}
        >
          HIFASHOPNHUB.
        </Text>
        <Group
          justify="space-between"
          gap="md"
          mt={20}
          pt={25}
          style={{
            borderTop: "1px solid #444",
            color: "#999",
          }}
        >
          <Text size="xs">
            &copy;
            {new Date().getFullYear()}
            HIFASHOPNHUB. All rights reserved.
          </Text>
          <Anchor
            component="button"
            type="button"
            size="xs"
            c="#deded1"
            style={{ minHeight: 44 }}
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            Back to top
          </Anchor>
          {/* <Eyebrow size="8px" visibleFrom="sm">
            INDIVIDUAL BY DESIGN
          </Eyebrow> */}
        </Group>
      </Container>
    </Box>
  );
}
