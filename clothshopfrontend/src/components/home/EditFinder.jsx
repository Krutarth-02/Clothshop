import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Group,
  Image,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "../common/ScrollReveal";

export default function EditFinder({ collections }) {
  const [selected, setSelected] = useState(0);
  const [sort, setSort] = useState("newest");
  const current = collections[selected];
  return (
    <Box component="section" bg="#e4e6d5" c="#252820" py={{ base: 40, md: 64 }}>
      <Container>
        <Grid gutter={{ base: 32, md: 64 }} align="center">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <ScrollReveal
              animationKey={current.to}
              style={{ overflow: "hidden" }}
            >
              <Image
                src={current.image}
                alt={`${current.label} collection inspiration`}
                h={{ base: 240, sm: 320, md: 440 }}
                loading="lazy"
              />
            </ScrollReveal>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="lg">
              <Text size="xs" style={{ letterSpacing: 2 }}>
                A LITTLE MORE PERSONAL
              </Text>
              <Title
                order={2}
                fw={500}
                size="clamp(32px, 4.5vw, 56px)"
                lh={1.1}
                style={{ letterSpacing: "-.04em" }}
              >
                Build your own edit.
              </Title>
              <Text size="sm" lh={1.8} maw={450}>
                Choose a collection and how you'd like to explore it. Your next
                perspective starts here.
              </Text>
              <Box>
                <Text size="sm" fw={500} mb="sm">
                  01 / Choose your collection
                </Text>
                <SimpleGrid cols={3} spacing="xs">
                  {collections.map((collection, index) => (
                    <Button
                      key={collection.to}
                      variant={selected === index ? "filled" : "outline"}
                      color="dark"
                      radius={0}
                      mih={48}
                      px={8}
                      aria-pressed={selected === index}
                      onClick={() => setSelected(index)}
                      styles={{
                        label: {
                          whiteSpace: "normal",
                          fontSize: "clamp(11px, 1.1vw, 14px)",
                        },
                      }}
                    >
                      {collection.label}
                    </Button>
                  ))}
                </SimpleGrid>
              </Box>
              <Select
                label="02 / How do you want to explore?"
                value={sort}
                onChange={setSort}
                allowDeselect={false}
                data={[
                  { value: "newest", label: "Show me the newest pieces" },
                  { value: "price-asc", label: "Start with lower prices" },
                  { value: "price-desc", label: "Start with higher prices" },
                  { value: "name", label: "Browse by name: A–Z" },
                ]}
                size="md"
                styles={{ input: { fontSize: 16 } }}
              />
              <Group gap="xs" aria-live="polite">
                <Check size={16} />
                <Text size="xs">
                  {current.label} selected. You can change filters in the
                  collection.
                </Text>
              </Group>
              <Button
                component={Link}
                to={`${current.to}?sort=${sort}`}
                color="dark"
                radius={0}
                size="lg"
                rightSection={<ArrowUpRight size={19} />}
                styles={{
                  root: { height: "auto", minHeight: 50, paddingBlock: 12 },
                  label: { whiteSpace: "normal" },
                }}
              >
                Explore my edit
              </Button>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
