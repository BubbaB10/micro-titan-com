// Vendored copy of the pure constants voice-bridge/server.mjs needs.
//
// app/lib/erm/voice-discovery.ts is the source of truth. This file
// exists so the Railway service (root directory /voice-bridge) does
// not import anything outside this folder. tests/voice-discovery.test.mjs
// asserts these values match the source of truth. Edit the TypeScript
// file first, then copy the values here.
//
// Gemini Live, re-checked 2026-11-06:
//   model id: https://ai.google.dev/gemini-api/docs/deprecations
//     and https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket
//   WebSocket URL: https://ai.google.dev/api/live
//   input MIME: https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket

export const GEMINI_LIVE_MODEL = "gemini-3.8-live";

export const GEMINI_LIVE_WS_URL_DEFAULT =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

export const GEMINI_INPUT_AUDIO_MIME = "audio/pcm;rate=16000";

export const VOICE_CALL_OPENING =
  "Before we start: I'm Micro Titan's agent, not a person. This call is recorded so we have an exact record of what you said, and I'll build your presentation from it. I can't promise a workflow, change a price, or move any money — if any of that comes up, I'll bring it to the team. Nothing moves to setup until you've seen your presentation and said go. Is that OK to continue?";

export const VOICE_CALL_AGENDA = [
  "Confirm what the intake said, in the client's words",
  "The discovery questions the intake did not answer — what breaks today, what done looks like, what would make it a hard no, what 90 days from now looks like if it works",
  "Confirm the hard nos — never spend money, send texts, or make calls without approval, and any the client adds",
  "Close: what happens next is the presentation, then the owner reviews it",
];

export const VOICE_BANNED_ACTIONS = [
  "promise_workflow",
  "promise_integration",
  "promise_timeline",
  "change_price",
  "offer_discount",
  "agree_scope",
  "spend_money",
  "send_text",
  "make_call",
  "move_to_setup",
];

/** Approved verbatim by Bubba 2026-11-06 ~18:27 CST. Copy of voice-discovery.ts. */
export const VOICE_HARD_STOP_WRAP_UP =
  "That's our time — I'll finish the presentation from what you've told me and the owner will review it. If anything is unfinished, I'll follow up by text.";
