import { Tooltip } from "@chakra-ui/react";

const Tooltipwrapper = ({ children, content }) => {
  return (
    <Tooltip.Root
      content={content}
      showArrow
      positioning={{ placement: "top-start" }}
    >
      <Tooltip.Trigger>{children}</Tooltip.Trigger>
    </Tooltip.Root>
  );
};

export default Tooltipwrapper;
