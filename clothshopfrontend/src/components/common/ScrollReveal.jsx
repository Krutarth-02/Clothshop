import { useLayoutEffect, useRef } from "react";
import { Box } from "@mantine/core";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollReveal({
  children,
  stagger = false,
  parallax = false,
  animationKey,
  ...props
}) {
  const ref = useRef(null);
  const tweenRef = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 48em)",
      },
      ({ conditions }) => {
        if (!conditions.motion) return;
        const node = ref.current;
        if (parallax) {
          if (conditions.desktop)
            gsap.fromTo(
              node,
              { yPercent: -4, scale: 1.04 },
              {
                yPercent: 4,
                scale: 1.01,
                ease: "none",
                scrollTrigger: {
                  trigger: node.parentElement,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                  invalidateOnRefresh: true,
                },
              },
            );
          return;
        }
        const targets = stagger ? Array.from(node.children) : node;
        tweenRef.current = gsap.from(targets, {
          opacity: 0,
          y: conditions.desktop ? 28 : 16,
          duration: 0.75,
          ease: "power2.out",
          stagger: stagger ? 0.1 : 0,
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: node, start: "top 90%", once: true },
        });
        return () => {
          tweenRef.current = null;
        };
      },
      ref,
    );
    return () => media.revert();
  }, [stagger, parallax, animationKey]);

  return (
    <Box
      ref={ref}
      onFocusCapture={() => tweenRef.current?.progress(1)}
      {...props}
    >
      {children}
    </Box>
  );
}
