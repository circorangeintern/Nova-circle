import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "@posthog/react";

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  person_profiles: "identified_only",
  capture_pageview: true,
});

export default function PostHogProvider({ children }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
