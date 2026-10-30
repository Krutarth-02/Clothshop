import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "./redux/store.js";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ColorSchemeScript />
    <Provider store={store}>
      {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      ) : <App />}
    </Provider>
  </React.StrictMode>,
);
