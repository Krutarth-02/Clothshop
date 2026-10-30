import ErrorAlert from "../../components/common/ErrorAlert";
import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { AuthField, AuthSubmit } from "../../components/common/AuthControls";
import { ActionIcon, Box, Button, Divider, PasswordInput, Text, Group, Stack, Anchor, Checkbox } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Lock, Mail } from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { api } from "../../redux/api/api";
import { useLoginMutation } from "../../redux/auth/authApi";
import AuthLayout from "../../components/common/AuthLayout";
import CommonModal from "../../components/common/Modal";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
let facebookSdk;
function loadFacebook() {
  if (facebookSdk) return facebookSdk;
  facebookSdk = new Promise((resolve, reject) => {
    const init = () => {
      if (!window.FB) { reject(new Error("Facebook sign-in could not load.")); return; }
      window.FB.init({ appId: facebookAppId, version: import.meta.env.VITE_FACEBOOK_API_VERSION || "v24.0", cookie: false, xfbml: false });
      resolve();
    };
    if (window.FB) { init(); return; }
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    const timeout = setTimeout(() => { script.remove(); reject(new Error("Facebook sign-in timed out. Please retry.")); }, 15000);
    script.onload = () => { clearTimeout(timeout); init(); };
    script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error("Facebook sign-in could not load. Check your connection or browser settings.")); };
    document.head.appendChild(script);
  }).catch((error) => { facebookSdk = undefined; throw error; });
  return facebookSdk;
}

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [facebookReady, setFacebookReady] = useState(false);
  const [googleFocused, setGoogleFocused] = useState(false);
  const [facebookError, setFacebookError] = useState("");
  const [socialError, setSocialError] = useState("");
  const [linkRequest, setLinkRequest] = useState(null);
  const [accountPassword, setAccountPassword] = useState("");
  useEffect(() => {
    if (!facebookAppId) return;
    let active = true;
    loadFacebook().then(() => { if (active) setFacebookReady(true); })
      .catch((error) => { if (active) setFacebookError(error.message); });
    return () => { active = false; };
  }, []);
  const finishLogin = async (res) => {
    if (!res.data?._id) throw new Error("Login failed");
    localStorage.setItem("userId", res.data._id);
    localStorage.setItem("role", res.data.role);
    dispatch(api.util.resetApiState());
    await dispatch(api.util.upsertQueryData("getProfile", undefined, { data: res.data }));
    toast.success(res.message);
    navigate("/home");
  };
  const validate = (values) => {
    let errors = {};

    if (!values.email) {
      errors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email)
    ) {
      errors.email = "Invalid email address";
    }
    if (!values.password || values.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }
    return errors;
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validate,
    onSubmit: async (values, action) => {
      try {
        const res = await login(values).unwrap();
        await finishLogin(res);
        action.resetForm();
      } catch (error) {
        toast.error(error?.data?.message || error?.message || "Login failed");
      }
    },
  });

  const socialLogin = async (request, password) => {
    if (isLoading) return;
    setSocialError("");
    try {
      const res = await login({ ...request, accountPassword: password, rememberMe: formik.values.rememberMe }).unwrap();
      await finishLogin(res);
    } catch (error) {
      if (error?.data?.code === "ACCOUNT_LINK_REQUIRED") {
        setLinkRequest(request);
        setAccountPassword("");
      } else setSocialError(error?.data?.message || error?.message || "Social sign-in failed. Please try again.");
    }
  };
  const facebookLogin = () => {
    if (!facebookReady || isLoading) return;
    setSocialError("");
    try {
      window.FB.login((response) => {
        const accessToken = response.authResponse?.accessToken;
        if (accessToken) void socialLogin({ facebookAuth: true, accessToken });
        else setSocialError("Facebook sign-in was cancelled or email access was not granted.");
      }, { scope: "public_profile,email", return_scopes: true });
    } catch { setSocialError("Facebook sign-in could not open. Allow popups and try again."); }
  };

  return (
    <AuthLayout
      compact
      title="Welcome back."
      description="Sign in to manage your account and continue exploring HIFASHOPNHUB."
    >
      <form onSubmit={formik.handleSubmit}>
        <Stack gap={14}>
          <AuthField
            formik={formik}
            label="Email"
            name="email"
            autoComplete="email"
            icon={<Mail size={18} />}
          />

          <AuthField
            formik={formik}
            password
            label="Password"
            name="password"
            autoComplete="current-password"
            icon={<Lock size={18} />}
          />
          <Group justify="space-between" gap="sm">
            <Checkbox
              size="sm"

              label="Remember me"
              name="rememberMe"
              checked={formik.values.rememberMe}
              onChange={(event) =>
                formik.setFieldValue("rememberMe", event.currentTarget.checked)
              }
            />
            <Anchor component={Link} to="/forgot-password" ta="right" size="sm">
              Forgot password?
            </Anchor>
          </Group>

          <AuthSubmit
            size="md"
            variant={!formik.values.rememberMe ? "light" : "filled"}
            disabled={!formik.values.rememberMe}
            loading={isLoading}
          >
            Sign In
          </AuthSubmit>
        </Stack>
      </form>
      <Text size="xs" c="dimmed" mt={6}>
        Select Remember me to enable sign in.
      </Text>
      <Divider label="Or continue with" labelPosition="center" my={12} />
      <Stack gap={6}>
        <ErrorAlert message={!linkRequest ? socialError : null} />
        <Group justify="center" gap={32}>
        {googleClientId ? (
          <Box aria-busy={isLoading} title="Sign in with Google"
            onFocus={() => setGoogleFocused(true)} onBlur={() => setGoogleFocused(false)}
            style={{ position: "relative", width: 44, height: 44, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "50%", outline: googleFocused ? "2px solid var(--mantine-color-blue-6)" : undefined, outlineOffset: 3, pointerEvents: isLoading ? "none" : "auto", opacity: isLoading ? 0.6 : 1 }}>
            <GoogleLogin type="icon" theme="outline" size="large" shape="circle" auto_select={false}
              containerProps={{ style: { opacity: 0 } }}
              onSuccess={(response) => {
                if (response.credential) void socialLogin({ googleAuth: true, credential: response.credential });
                else setSocialError("Google did not return a sign-in credential. Please retry.");
              }}
              onError={() => setSocialError("Google sign-in failed. Please try again.")} />
            <FcGoogle size={40} aria-hidden="true" style={{ position: "absolute", pointerEvents: "none" }} />
          </Box>
        ) : <ActionIcon variant="transparent" size={44} disabled aria-label="Google sign-in unavailable"><FcGoogle size={40} /></ActionIcon>}
        <ActionIcon variant="transparent" size={44} radius="xl" aria-label="Sign in with Facebook" title="Sign in with Facebook"
          onClick={facebookLogin} disabled={isLoading || !facebookReady}
          loading={Boolean(facebookAppId) && !facebookReady && !facebookError}
          style={{ opacity: isLoading || !facebookReady ? 0.5 : 1 }}>
          <FaFacebook size={40} color="#1877f2" />
        </ActionIcon>
        </Group>
        {facebookError && <>
          <Text size="xs" c="red" role="alert">{facebookError}</Text>
          <Button variant="subtle" onClick={() => {
            setFacebookError("");
            loadFacebook().then(() => setFacebookReady(true)).catch((error) => setFacebookError(error.message));
          }}>Retry Facebook</Button>
        </>}
        {isLoading && <Text size="xs" c="dimmed" ta="center" role="status">Signing you in...</Text>}
      </Stack>
      <CommonModal opened={Boolean(linkRequest)} busy={isLoading} title="Connect your account"
        onClose={() => { setLinkRequest(null); setAccountPassword(""); setSocialError(""); }}
        >
        <form onSubmit={(event) => { event.preventDefault(); if (linkRequest && accountPassword) void socialLogin(linkRequest, accountPassword); }}>
          <Stack>
            <Text size="sm">This email already has an account. Confirm your existing password to connect this sign-in method.</Text>
            <ErrorAlert message={socialError} />
            <PasswordInput label="Account password" autoComplete="current-password" required maxLength={72} value={accountPassword} disabled={isLoading} onChange={(event) => setAccountPassword(event.currentTarget.value)} />
            <Anchor component={Link} to="/forgot-password" size="sm">Forgot password?</Anchor>
            <Button type="submit" color="dark" loading={isLoading} disabled={!accountPassword}>Connect and sign in</Button>
          </Stack>
        </form>
      </CommonModal>
      <Text ta="center" size="sm" c="dimmed" mt={16}>
        New around here?{" "}
        <Anchor component={Link} to="/register" c="var(--mantine-color-text)">
          Create an account
        </Anchor>
      </Text>
    </AuthLayout>
  );
};

export default Login;
