import { ActionIcon } from "@mantine/core";
import { Heart } from "lucide-react";

const WishlistButton = ({ product, ...props }) => {
  const saved = false;
  const saving = false;
  const label = `${saved ? "Remove" : "Save"} ${product?.name || "product"} ${saved ? "from" : "to"} wishlist`;
  return <ActionIcon variant="default" radius="xl" size={40} color={saved ? "red" : "gray"}
    aria-label={label} title={label} aria-pressed={saved} {...props} disabled={saving || props.disabled} loading={saving}
    onClick={(event) => event.stopPropagation()}>
    <Heart size={19} fill={saved ? "#e03131" : "none"} color={saved ? "#e03131" : "currentColor"} />
  </ActionIcon>;
};

export default WishlistButton;
