import { useState } from "react";
import {
  ActionIcon, Box, Button, Image, Modal,
  SimpleGrid, Text, Title, VisuallyHidden,
} from "@mantine/core";
import { X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useGetWelcomeCouponQuery,
  useDismissWelcomeCouponMutation,
} from "../../redux/coupons/couponApi";
import hero from "../../assets/hero.png";
import { useGetProfileQuery } from "../../redux/auth/authApi";

const statusLabels = {
  available: "Available",
  reserved: "In use",
  used: "Used",
};

function CouponCode({ coupon }) {
  const canCopy = coupon.status === "available";

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      toast.success("Coupon code copied");
    } catch {
      toast.error(`Copy this code manually: ${coupon.code}`);
    }
  }

  return (
    <Box
      component="button"
      type="button"
      onClick={copyCode}
      disabled={!canCopy}
      aria-label={canCopy ? `Copy coupon code ${coupon.code}` : `Coupon ${statusLabels[coupon.status]}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        width: "100%",
        padding: "17px 20px",
        border: "1px dashed #89847b",
        color: "#f4f1eb",
        background: "transparent",
        font: "inherit",
        letterSpacing: 2,
        textAlign: "left",
        cursor: canCopy ? "pointer" : "default",
        opacity: canCopy ? 1 : 0.55,
      }}
    >
      <span>{coupon.code}</span>
      <Text component="span" size="xs" c="#b8b4ae" tt="uppercase" style={{ letterSpacing: 1.5 }}>
        {canCopy ? "Tap to copy" : statusLabels[coupon.status]}
      </Text>
    </Box>
  );
}

function ShopCollectionButton({ onClick, disabled = false }) {
  return (
    <Button
      component={Link}
      to="/shop"
      onClick={onClick}
      disabled={disabled}
      fullWidth
      mt="xl"
      radius={0}
      variant="default"
      style={{
        "--button-bg": "#f3f0ea",
        "--button-hover": "#ded9d1",
        "--button-color": "#121110",
        "--button-hover-color": "#121110",
        minHeight: 60,
        height: "auto",
        padding: 16,
        border: 0,
        textTransform: "uppercase",
        letterSpacing: 1.4,
        fontSize: 12,
      }}
      styles={{ label: { whiteSpace: "normal", textAlign: "center" } }}
    >
      Shop the collection
    </Button>
  );
}

export default function WelcomeCoupon() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const { data: profile } = useGetProfileQuery(undefined, { skip: !userId });
  const firstLogin = Boolean(profile?.data?.firstLoginAt &&
    profile.data.firstLoginAt === profile.data.lastLoginAt);
  const { data } = useGetWelcomeCouponQuery(undefined, { skip: !userId || !firstLogin });
  const [dismissCoupon, { isLoading: isSaving }] = useDismissWelcomeCouponMutation();
  const [dismissedUserId, setDismissedUserId] = useState(null);
  const coupon = data?.data;
  const shouldShowPopup = Boolean(
    userId && firstLogin && coupon?.status === "available" && !coupon.seenAt && dismissedUserId !== userId,
  );

  async function dismissPopup({ shopAfterClosing = false } = {}) {
    if (isSaving) return;
    try {
      await dismissCoupon().unwrap();
      setDismissedUserId(userId);
      if (shopAfterClosing) navigate("/shop");
    } catch {
      toast.error("Could not save your coupon. Please try again.");
    }
  }

  function handleShopClick(event) {
    event.preventDefault();
    void dismissPopup({ shopAfterClosing: true });
  }

  return (
    <Modal
      opened={shouldShowPopup}
      onClose={() => void dismissPopup()}
      centered
      size={950}
      padding={0}
      radius={0}
      withCloseButton={false}
      title={<VisuallyHidden>Your welcome gift</VisuallyHidden>}
      overlayProps={{ backgroundOpacity: 0.6, blur: 5 }}
      styles={{
        header: { position: "absolute", minHeight: 0, padding: 0 },
        content: { background: "#121110", color: "#f4f1eb" },
        body: { padding: 0 },
      }}
    >
      {coupon && (
        <Box pos="relative">
          <ActionIcon
            pos="absolute"
            top={14}
            right={14}
            size={40}
            variant="transparent"
            color="#f4f1eb"
            bg="#121110"
            onClick={() => void dismissPopup()}
            disabled={isSaving}
            aria-label="Close welcome coupon"
            style={{ zIndex: 1 }}
          >
            <X size={20} />
          </ActionIcon>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={0}>
            <Image
              src={hero}
              alt="Discover the HIFASHOPNHUB clothing collection"
              h={{ base: 170, sm: "100%" }}
              mih={{ base: 0, sm: 490 }}
              fit="cover"
            />
            <Box px={{ base: 24, sm: 44 }} pt={{ base: 30, sm: 50 }} pb={{ base: 24, sm: 36 }}>
              <Text size="xs" mb="lg" style={{ letterSpacing: 2 }}>A WELCOME GIFT</Text>
              <Title order={2} fw={400} fz={{ base: 30, sm: 36 }} lh={1.18} mb="lg" style={{ letterSpacing: -1.3 }}>
                Ten percent off your first order
              </Title>
              <Text c="#b8b4ae" fz={{ base: 14, sm: 16 }} lh={1.7} mb="lg">
                A little something for your first find. Use your welcome code on your first order,
                and discover pieces that feel like you.
              </Text>
              <CouponCode coupon={coupon} />
              <ShopCollectionButton onClick={handleShopClick} disabled={isSaving} />
              <Text size="xs" c="#b8b4ae" mt="md">
                One use per account. Apply your code in your bag or at checkout.
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      )}
    </Modal>
  );
}
