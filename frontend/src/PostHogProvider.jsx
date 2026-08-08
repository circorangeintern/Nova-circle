import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "@posthog/react";

// PostHog project token — public client-side key, safe to hardcode.
// The env var is kept as a named constant for clarity; it resolves to the
// literal string at Vite build time, so even if env substitution fails the
// hardcoded fallback guarantees initialisation.
const POSTHOG_KEY =
  import.meta.env.VITE_POSTHOG_KEY || "phc_AA9Czh9NRZPyjKhSq2jvEHSzBxUXgxeXwgFUkZaQ5bog";
const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

posthog.init(POSTHOG_KEY, {
  api_host: POSTHOG_HOST,
  // Create person profiles for every visitor (not just identified ones) so
  // anonymous sessions also appear in the live view.
  person_profiles: "always",
  // SPA pageviews are fired manually in App.jsx on every route change.
  capture_pageview: false,
  capture_pageleave: true,
  // Capture clicks and input interactions that do not have a dedicated
  // product event. PostHog automatically masks sensitive form fields.
  autocapture: true,
  rageclick: true,
  capture_performance: true,
  disable_session_recording: false,
  // Enable verbose console output so you can confirm events are dispatched.
  // Remove or set to false once you've verified live events are arriving.
  loaded: (ph) => {
    if (import.meta.env.DEV) ph.debug();
    console.log("[PostHog] Initialised — key:", POSTHOG_KEY.slice(0, 12) + "…");
  },
});

export default function PostHogProvider({ children }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

