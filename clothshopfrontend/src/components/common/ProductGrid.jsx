import { Box, SimpleGrid, Skeleton } from "@mantine/core";
import ProductCard from "./ProductCard";
import ScrollReveal from "./ScrollReveal";

export default function ProductGrid({
  products = [],
  loading = false,
  placeholderCount = 4,
  onPreview,
  animate = false,
  cardProps,
  ...props
}) {
  const Root = animate ? ScrollReveal : SimpleGrid;
  return (
    <Root
      {...(animate && {
        component: SimpleGrid,
        stagger: true,
        animationKey: products.map((product) => product._id).join(","),
      })}
      cols={{ base: 1, xs: 2, md: 3, lg: 4 }}
      spacing={{ base: 16, md: 24 }}
      {...props}
    >
      {loading
        ? Array.from({ length: placeholderCount }, (_, index) => (
            <Box key={index}>
              <Skeleton style={{ aspectRatio: "3 / 4" }} />
              <Skeleton h={16} mt="md" w="75%" />
            </Box>
          ))
        : products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onPreview={onPreview}
              {...cardProps}
            />
          ))}
    </Root>
  );
}
