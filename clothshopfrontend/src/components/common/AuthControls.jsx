import { useEffect, useState } from "react";
import { GoogleLogin, useGoogleOAuth } from "@react-oauth/google";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import CommonModal from "./Modal";
import ErrorAlert from "./ErrorAlert";
import { ActionIcon, Anchor, Button, Group, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";

export const AuthField = ({
  formik,
  name,
  label,
  password = false,
  icon,
  ...props
}) => {
  const Field = password ? PasswordInput : TextInput;
  return (
    <Field
      size="md"
      styles={{ input: { fontSize: 16 } }}
      name={name}
      label={label}
      placeholder={label}
      leftSection={icon}
      {...(formik && {
        value: formik.values[name],
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
        error: formik.touched[name] && formik.errors[name],
      })}
      {...props}
    />
  );
};

export const AuthSubmit = (props) => {
  return (
    <Button
      fullWidth
      size="lg"
      radius={0}
      color="dark"
      type="submit"
      {...props}
    />
  );
};

export const AuthBackLink = ({
  to = "/login",
  children = "Back to sign in",
  ...props
}) => {
  return (
    <Anchor
      component={Link}
      to={to}
      c="dimmed"
      size="sm"
      mt="xl"
      display="block"
      {...props}
    >
      {children}
    </Anchor>
  );
};

export const RecoveryPrompt = ({ title, description, children }) => {
  return (
    <AuthLayout title={title} description={description}>
      <AuthSubmit
        component={Link}
        to="/forgot-password"
        type="button"
        styles={{
          root: { height: "auto", minHeight: 50, paddingBlock: 12 },
          label: { whiteSpace: "normal", textAlign: "center" },
        }}
      >
        {children}
      </AuthSubmit>
      <AuthBackLink />
    </AuthLayout>
  );
};

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
let facebookSdk;
const loadFacebook = () => {
  if (facebookSdk) return facebookSdk;
  facebookSdk = new Promise((resolve, reject) => {
    let timeout;
    let createdScript;
    const previousInit = window.fbAsyncInit;
    const cleanup = () => {
      clearTimeout(timeout);
      if (window.fbAsyncInit === ready) window.fbAsyncInit = previousInit;
    };
    const init = () => {
      if (!window.FB?.init) return;
      try {
        window.FB.init({
          appId: facebookAppId,
          version: import.meta.env.VITE_FACEBOOK_API_VERSION || "v24.0",
          cookie: false,
          xfbml: false
        });
        cleanup();
        resolve();
      } catch {
        cleanup();
        reject(new Error("Facebook SDK initialization failed. Check the app ID and API version."));
      }
    };
    const ready = () => {
      try {
        previousInit?.();
      } finally {
        init();
      }
    };
    if (window.FB) {
      init();
      return;
    }
    window.fbAsyncInit = ready;
    timeout = setTimeout(() => {
      cleanup();
      createdScript?.remove();
      reject(new Error("Facebook SDK could not load. Check your connection or blocked scripts, then retry."));
    }, 15000);
    const existingScript = document.querySelector('script[src="https://connect.facebook.net/en_US/sdk.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", init, {
        once: true
      });
      return;
    }
    const script = document.createElement("script");
    createdScript = script;
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = init;
    script.onerror = () => {
      cleanup();
      script.remove();
      reject(new Error("Facebook sign-in could not load. Check your connection or blocked scripts."));
    };
    document.head.appendChild(script);
  }).catch(error => {
    facebookSdk = undefined;
    throw error;
  });
  return facebookSdk;
};
function GoogleSignInButton({
  busy,
  onSuccess,
  onError
}) {
  const {
    scriptLoadedSuccessfully
  } = useGoogleOAuth();
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (scriptLoadedSuccessfully) return;
    const timer = setTimeout(() => setLoadTimedOut(true), 15000);
    return () => clearTimeout(timer);
  }, [scriptLoadedSuccessfully]);
  return <Stack gap="xs" align="center">
    <div title={scriptLoadedSuccessfully ? "Sign in with Google" : "Loading Google sign-in"} aria-busy={!scriptLoadedSuccessfully || busy} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} inert={busy ? true : undefined} style={{
      position: "relative",
      width: 44,
      height: 44,
      display: "grid",
      placeItems: "center",
      borderRadius: "50%",
      opacity: busy || !scriptLoadedSuccessfully ? 0.6 : 1,
      pointerEvents: busy || !scriptLoadedSuccessfully ? "none" : "auto",
      outline: focused ? "2px solid var(--mantine-color-blue-6)" : undefined,
      outlineOffset: 3
    }}>
      <GoogleLogin type="icon" theme="outline" size="large" shape="circle" auto_select={false} containerProps={{
        style: {
          position: "absolute",
          inset: 0,
          opacity: 0,
          zIndex: 1
        }
      }} onSuccess={onSuccess} onError={onError} />
      <FcGoogle size={36} aria-hidden="true" style={{
        pointerEvents: "none"
      }} />
    </div>
    {loadTimedOut && !scriptLoadedSuccessfully && <Text size="xs" c="red" role="alert" maw={220}>Google sign-in could not load. Check blocked scripts and reload this page.</Text>}
  </Stack>;
}

export function SocialSignIn({ busy = false, onSignIn }) {
  const [facebookReady, setFacebookReady] = useState(false);
  const [facebookError, setFacebookError] = useState("");
  const [message, setMessage] = useState("");
  const [linkRequest, setLinkRequest] = useState(null);
  const [accountPassword, setAccountPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pending = busy || submitting;
  useEffect(() => {
    if (!facebookAppId) return;
    let active = true;
    loadFacebook().then(() => { if (active) setFacebookReady(true); })
      .catch(error => { if (active) setFacebookError(error.message); });
    return () => { active = false; };
  }, []);
  const signIn = async (request, password) => {
    if (pending) return;
    setSubmitting(true);
    setMessage("");
    try {
      await onSignIn({ ...request, ...(password ? { accountPassword: password } : {}) });
      setLinkRequest(null);
      setAccountPassword("");
    } catch (error) {
      if (error?.data?.code === "ACCOUNT_LINK_REQUIRED") {
        setLinkRequest(request);
        setAccountPassword("");
      } else setMessage(error?.data?.message || error?.message || "Social sign-in failed. Please try again.");
    } finally { setSubmitting(false); }
  };
  const facebookLogin = () => {
    if (!facebookReady || pending) return;
    setMessage("");
    if (window.location.protocol !== "https:") {
      setMessage("Facebook login requires an HTTPS URL allowed in your Meta app's JavaScript SDK settings.");
      return;
    }
    try {
      window.FB.login(response => {
        const accessToken = response.authResponse?.accessToken;
        if (accessToken) void signIn({ facebookAuth: true, accessToken });
        else setMessage("Facebook sign-in was cancelled or email access was not granted.");
      }, { scope: "public_profile,email", return_scopes: true });
    } catch { setMessage("Facebook sign-in could not open. Allow popups and try again."); }
  };
  return <>
    <Stack gap="sm">
      <ErrorAlert message={!linkRequest ? message : null} />
      <Group justify="center" gap="xl">
        {googleClientId ? <GoogleSignInButton busy={pending} onSuccess={response => {
          if (response.credential) void signIn({ googleAuth: true, credential: response.credential });
          else setMessage("Google did not return a sign-in credential. Please retry.");
        }} onError={() => setMessage("Google sign-in failed. Check the authorized origin in Google Cloud and try again.")} /> :
          <ActionIcon variant="transparent" size={44} disabled aria-label="Google sign-in unavailable"><FcGoogle size={36} /></ActionIcon>}
        <ActionIcon variant="transparent" size={44} radius="xl" aria-label="Sign in with Facebook" onClick={facebookLogin}
          disabled={pending || !facebookReady} loading={Boolean(facebookAppId) && !facebookReady && !facebookError}>
          <FaFacebook size={36} color="#1877f2" />
        </ActionIcon>
      </Group>
      {facebookError && <><ErrorAlert message={facebookError} /><Button variant="subtle" disabled={pending} onClick={() => {
        setFacebookError("");
        loadFacebook().then(() => setFacebookReady(true)).catch(error => setFacebookError(error.message));
      }}>Retry Facebook</Button></>}
    </Stack>
    <CommonModal opened={Boolean(linkRequest)} busy={pending} title="Connect your account" onClose={() => {
      setLinkRequest(null); setAccountPassword(""); setMessage("");
    }}>
      <form onSubmit={event => { event.preventDefault(); if (linkRequest && accountPassword) void signIn(linkRequest, accountPassword); }}>
        <Stack>
          <Text size="sm">Confirm your existing account password to connect this sign-in method.</Text>
          <ErrorAlert message={message} />
          <PasswordInput label="Account password" autoComplete="current-password" required maxLength={72}
            value={accountPassword} disabled={pending} onChange={event => setAccountPassword(event.currentTarget.value)} />
          <Anchor component={Link} to="/forgot-password" size="sm">Forgot password?</Anchor>
          <Button type="submit" color="dark" loading={pending} disabled={!accountPassword}>Connect and sign in</Button>
        </Stack>
      </form>
    </CommonModal>
  </>;
}
