import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { theme } from "../theme.js";
// import { GoogleOAuthProvider } from "@react-oauth/google";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ColorSchemeScript />
    <Provider store={store}>
      {/* <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}> */}
      <MantineProvider theme={theme}>
        <App />
      </MantineProvider>
      {/* </GoogleOAuthProvider> */}
     </Provider>
  </React.StrictMode>,
);
