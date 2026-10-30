import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useLogoutMutation } from "../redux/auth/authApi";
import { api } from "../redux/api/api";
import { clearCart, clearBuyNow } from "../redux/cart/cartSlice";

export default function useAccountActions() {
  const [logout, { isLoading: signingOut }] = useLogoutMutation();
  const dispatch = useDispatch(),
    navigate = useNavigate();
  const clearSession = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    dispatch(clearCart());
    dispatch(clearBuyNow());
    dispatch(api.util.resetApiState());
    navigate("/login", { replace: true });
  };
  const signOut = async () => {
    try {
      await logout().unwrap();
      clearSession();
      toast.success("Signed out");
    } catch (error) {
      if (error?.status === 401) clearSession();
      else
        toast.error(
          error?.data?.message || "Unable to sign out. Please try again.",
        );
    }
  };
  return { signOut, signingOut, clearSession };
}
