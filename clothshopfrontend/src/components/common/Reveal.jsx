import { useEffect } from "react";
import { Box } from "@mantine/core";
import { useIntersection, useReducedMotion } from "@mantine/hooks";

export default function Reveal({ children, ...props }) {
  const { ref, entry } = useIntersection({ threshold: 0.08 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!entry?.isIntersecting || reducedMotion) return;
    const animation = entry.target.animate(
      [
        { opacity: 0, transform: "translateY(20px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 650, easing: "ease-out" },
    );
    return () => animation.cancel();
  }, [entry?.isIntersecting, entry?.target, reducedMotion]);

  return (
    <Box ref={ref} {...props}>
      {children}
    </Box>
  );
}
