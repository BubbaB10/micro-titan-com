# Micro Titan voice bridge — Twilio Media Streams ↔ Gemini Live

Standalone Node process, no dependencies (Node 24+). It is the live
audio half of voice discovery (design §4–§5); the control plane —
guardrail script, consent gate, 20-minute hard stop, transcript
validation — is `app/lib/erm/voice-discovery.ts`, and the record it
posts back to is the PR #34 discovery record shape.

## Status — NOT deployed, NOT hosted, no call made

- This process exists as code only. **No host has been chosen for
  it, no account has been created, and no paid add-on has been
  added.** Vercel serverless cannot hold a live voice session, so
  this cannot run on the current stack. Choosing a host is a
  decision for the owner (Bubba), not a thing this slice does.
- **No call has been made by any Micro Titan agent, on any route.**
  The first proof must be a TEST call to a test number, after the
  bridge is hosted and verified locally. Do not offer a call to a
  real client before that proof.
- The Gemini Live message shapes in `server.mjs` (setup,
  realtimeInput, serverContent transcription) are per the Gemini
  Live API docs as cited in the design doc, and are **unproven in
  this stack** — re-check them against the live docs before the
  first test call. The Gemini Live WebSocket URL is env-provided
  (`GEMINI_LIVE_WS_URL`), not hardcoded, for exactly that reason.
  The model name (`gemini-3.8-live`) is as given in the design doc;
  re-check it too.

## Run locally (TEST only)

```sh
GEMINI_API_KEY=... \
GEMINI_LIVE_WS_URL=wss://... \
ERM_API_BASE_URL=https://micro-titan.com \
OPS_DASHBOARD_TOKEN=... \
VOICE_BRIDGE_PORT=8080 \
node voice-bridge/server.mjs
```

`GET /health` returns `{"ok":true,"service":"micro-titan-voice-bridge"}`.
Twilio Media Streams connect to `wss://<host>/twilio-stream?reference=MT-...&sessionKey=...&consentAt=...`.

Optional, only for hanging the call up from the bridge at the hard
stop: `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN`. Without them the
bridge logs that the hang-up must come from the TwiML side.

## What it does

- Twilio μ-law 8 kHz → PCM 16 kHz → Gemini Live; Gemini PCM 24 kHz
  → PCM 8 kHz → μ-law → Twilio (`voice-bridge/audio.mjs`).
- Collects Gemini input/output transcription into transcript turns
  (agent / client, in order, with timestamps).
- Enforces the 20-minute hard stop: at 1200 seconds it speaks the
  draft wrap-up line, then ends the call.
- On end, POSTs the transcript to the Next app's owner route
  `POST /api/ops/discovery-voice-complete`, which records it in the
  ERM via `recordDiscoveryCall` (channel `voice`, format `call`).
  No audio is stored, sent to the ERM, or logged — only the
  provider's recording reference, if one is supplied.
- If the client does not answer, the session ends as `no_answer`.
  No repeated dialling. The one-text follow-up is a DRAFT in
  `voice-discovery.ts`, not approved wording, and nothing here sends
  it.

## What still needs the owner

1. **A host for this process** — a small always-on host with its
   own env/secrets and monitoring. This is the real build cost of
   voice discovery, not the per-minute price (a 20-minute call is
   under $1 in telephony + model at Oct 2026 list prices, plus
   recording — see `estimateVoiceCallCostUsd` in
   `app/lib/erm/voice-discovery.ts`; list prices, not a bill).
2. **The TwiML slice** — the owner route that returns the TwiML
   starting the `<Stream>` to this bridge, with the intake
   reference and session key in the stream URL. It does not exist
   yet; a call cannot reach the bridge without it.
3. **Consent wording** — the call opening and booking consent lines
   are APPROVED VERBATIM and are used exactly. The wrap-up and
   no-answer lines are DRAFTS and need the owner's approval before
   use with a client. TCPA / consent wording is not legal advice
   and has not been reviewed by counsel.
