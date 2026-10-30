import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Image, Tooltip, UnstyledButton } from "@mantine/core";
import { gsap } from "gsap";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetProductsQuery } from "../../redux/auth/productApi";
import { toggleWishlist } from "../../redux/wishlist/wishlistSlice";
import ProductPreview from "../common/ProductPreview";
import { filterRikProducts, parseRikCommand, resolveRikProduct } from "./rikCommands";

const emptyProducts = [];
const notify = (message) => toast(message, { id: "rik-status", duration: 4000 });
function releaseRecognition(recognition) {
  if (!recognition) return;
  recognition.onstart = null;
  recognition.onend = null;
  recognition.onresult = null;
  recognition.onerror = null;
  recognition.abort();
}

export default function RikAssistant({ colorScheme, toggleColorScheme }) {
  const [enabled, setEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [preview, setPreview] = useState(null);
  const [resultIds, setResultIds] = useState([]);
  const recognitionRef = useRef(null);
  const wantedRef = useRef(false);
  const restartRef = useRef(null);
  const handlerRef = useRef(null);
  const avatarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const saved = useSelector((state) => state.wishlist.items);
  const { data, isFetching, isError, refetch } = useGetProductsQuery(undefined, { skip: !enabled });
  const products = Array.isArray(data?.data) ? data.data : emptyProducts;
  const results = resultIds.map((id) => products.find((product) => product._id === id)).filter(Boolean);

  useEffect(() => {
    if (enabled) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const avatar = avatarRef.current;
      if (!avatar) return;
      const movement = gsap.timeline({ repeat: -1, repeatDelay: 20, defaults: { ease: "sine.inOut" } });
      gsap.set(avatar, { transformOrigin: "50% 75%" });
      movement.to(avatar, { y: -8, rotation: -7, duration: 0.45 })
        .to(avatar, { y: -4, rotation: 7, duration: 0.55 })
        .to(avatar, { y: -7, rotation: -5, duration: 0.55 })
        .to(avatar, { y: -3, rotation: 4, duration: 0.5 })
        .to(avatar, { y: 0, rotation: 0, duration: 0.55 });
      const pauseWhenHidden = () => movement.paused(document.hidden);
      document.addEventListener("visibilitychange", pauseWhenHidden);
      pauseWhenHidden();
      return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
    });
    return () => media.revert();
  }, [enabled]);

  const stop = useCallback(() => {
    wantedRef.current = false;
    clearTimeout(restartRef.current);
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    releaseRecognition(recognition);
    setListening(false);
    setEnabled(false);
  }, []);

  const openProduct = useCallback((product, type) => {
    if (type === "preview") { setPreview(product); notify(`Preview: ${product.name}`); }
    else { setPreview(null); navigate(`/product/${product._id}`); notify(`Opened ${product.name}.`); }
  }, [navigate]);

  const execute = useCallback((transcript) => {
    const command = parseRikCommand(transcript);
    // Ordinary conversation must never trigger an action or show feedback.
    if (command.type === "ignored") return;
    if (command.type === "stop") { stop(); notify("Rik microphone off."); return; }
    if (command.type === "help" || command.type === "unknown") { notify('Say "Hey Rik, show blue shirt under 1000" or "Hey Rik, open my cart".'); return; }
    if (command.type === "closePreview") { setPreview(null); notify("Preview closed."); return; }
    if (command.type === "theme") { if ((colorScheme || "light") !== command.mode) toggleColorScheme(); notify(`${command.mode} mode enabled.`); return; }
    if (command.type === "navigate") { setPreview(null); navigate(command.to); notify("Opened the requested page."); return; }
    if (isFetching && !data) { notify("Products are loading. Repeat your command in a moment."); return; }
    if (isError) { refetch(); notify("Retrying products. Please repeat your command in a moment."); return; }
    if (command.type === "search") {
      const matches = filterRikProducts(products, command.filters);
      setResultIds(matches.map((product) => product._id));
      setPreview(null);
      navigate(`/shop?${new URLSearchParams(command.filters)}`);
      notify(matches.length ? `Found ${matches.length} products. Say "Hey Rik, open first product preview".` : "No matching products. Try another colour, size or budget.");
      return;
    }
    const currentId = preview?._id || location.pathname.match(/^\/product\/([a-f\d]{24})$/i)?.[1];
    const matches = resolveRikProduct(command, products, results, currentId);
    if (!matches.length) { notify("Product not found. Search first, then say its name or result number."); return; }
    if (matches.length > 1) {
      setResultIds(matches.map((product) => product._id));
      setPreview(null);
      navigate(`/shop?${new URLSearchParams({ rikIds: matches.map((product) => product._id).join(",") })}`);
      notify(`Found ${matches.length} matches. Say "Hey Rik, open first product preview" or specify another number.`);
      return;
    }
    if (command.type === "save") {
      if (!saved.some((item) => item._id === matches[0]._id)) dispatch(toggleWishlist(matches[0]));
      notify(`${matches[0].name} is saved in your wishlist.`);
    } else openProduct(matches[0], command.type);
  }, [colorScheme, toggleColorScheme, stop, navigate, isFetching, data, isError, refetch, products, results, preview, location.pathname, saved, dispatch, openProduct]);

  useEffect(() => { handlerRef.current = execute; }, [execute]);
  useEffect(() => {
    const pauseWhenHidden = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      wantedRef.current = false;
      clearTimeout(restartRef.current);
      releaseRecognition(recognitionRef.current);
      recognitionRef.current = null;
    };
  }, [stop]);

  const start = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { notify("Voice recognition isn't supported in this browser. Try a browser with speech recognition enabled."); return; }
    if (!window.isSecureContext) { notify("Open the website on localhost or HTTPS to use the microphone."); return; }
    stop();
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = false;
    wantedRef.current = true;
    setEnabled(true);
    notify("Starting Rik. Allow microphone access if asked. Your browser may process speech online.");
    recognition.onstart = () => {
      if (!wantedRef.current || recognitionRef.current !== recognition) return;
      setListening(true);
    };
    recognition.onresult = (event) => {
      if (!wantedRef.current || recognitionRef.current !== recognition) return;
      for (let index = event.resultIndex; index < event.results.length; index++) {
        if (event.results[index].isFinal) handlerRef.current?.(event.results[index][0].transcript);
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      stop();
      const errors = { "not-allowed": "Allow microphone access in browser site settings, then click Rik again.", "service-not-allowed": "Speech recognition is blocked by this browser.", "audio-capture": "No microphone found. Connect one and click Rik again.", network: "Speech recognition couldn't connect. Check your internet and click Rik again.", "language-not-supported": "This browser couldn't recognise the selected speech language." };
      notify(errors[event.error] || "Voice recognition stopped. Click Rik to try again.");
    };
    recognition.onend = () => {
      setListening(false);
      if (wantedRef.current && !document.hidden) restartRef.current = setTimeout(() => {
        if (!wantedRef.current || recognitionRef.current !== recognition) return;
        try { recognition.start(); } catch { stop(); notify("Click Rik to continue listening."); }
      }, 600);
    };
    try { recognition.start(); } catch { stop(); notify("Unable to start the microphone. Click Rik to try again."); }
  };

  const label = listening ? 'Listening: say "Hey Rik...". Click to stop.' : enabled ? "Starting microphone. Click to cancel." : "Click Rik to start voice commands";
  return <>
    <Tooltip label={label} position="left" withArrow>
      <UnstyledButton pos="fixed" right={{ base: 12, sm: 24 }} bottom={16} w={76} h={70} onClick={() => { if (enabled) { stop(); notify("Rik microphone off."); } else start(); }} aria-label={label} aria-pressed={enabled}
        style={{ zIndex: 190, borderRadius: 30, display: "grid", placeItems: "center", filter: "drop-shadow(0 5px 10px rgba(0,0,0,.22))", outlineOffset: 4 }}>
        <Image ref={avatarRef} src={import.meta.env.BASE_URL + "rik-avatar.svg"} alt="" w={76} h={69} draggable={false} />
        {enabled && <Box pos="absolute" right={0} bottom={2} w={17} h={17} bg={listening ? "teal.5" : "yellow.5"} style={{ borderRadius: "50%", border: "3px solid var(--mantine-color-body)", boxShadow: "0 0 0 3px #40c9ba30" }} />}
      </UnstyledButton>
    </Tooltip>
    <ProductPreview product={preview} onClose={() => setPreview(null)} />
  </>;
}
