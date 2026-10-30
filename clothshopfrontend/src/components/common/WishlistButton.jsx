import { ActionIcon } from "@mantine/core";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { selectWishlistItems, toggleWishlist } from "../../redux/wishlist/wishlistSlice";

export default function WishlistButton({ product, ...props }) {
  const dispatch = useDispatch();
  const saved = useSelector(selectWishlistItems).some((item) => item._id === product?._id);
  const label = `${saved ? "Remove" : "Save"} ${product?.name || "product"} ${saved ? "from" : "to"} wishlist`;
  return <ActionIcon variant="default" radius="xl" size={40} color={saved ? "red" : "gray"}
    aria-label={label} title={label} aria-pressed={saved} {...props}
    onClick={(event) => {
      event.stopPropagation();
      dispatch(toggleWishlist(product));
      toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
    }}>
    <Heart size={19} fill={saved ? "#e03131" : "none"} color={saved ? "#e03131" : "currentColor"} />
  </ActionIcon>;
}
