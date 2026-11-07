# Micro Titan voice bridge — Twilio Media Streams ↔ Gemini Live

Standalone Node process, no dependencies (Node 24+). It is the live
audio half of voice discovery (design §4–§5); the control plane —
guardrail script, consent gate, 20-minute hard stop, transcript
validation — is `app/lib/erm/voice-discovery.ts`, and the record it
posts back to is the PR #34 discovery record shape.

The constants this process speaks from are copied into
`guardrails.mjs` so a Railway service rooted at `/voice-bridge` does
not import the Next app. `app/lib/erm/voice-discovery.ts` stays the
source of truth; a test asserts the copies match.

## Status

- **Host: Railway**, as its own service, root directory
  `/voice-bridge`. This repo does not create that service, does not
  set its secrets, and does not point a Twilio webhook at it.
- **No call has been made by any Micro Titan agent, on any route.**
  The first proof must be a TEST call to a test number, after the
  service is up and `GET /health` is ok. Do not offer a call to a
  real client before that proof.
- Inbound calls on `/api/twilio/webhook` stay rejected. The TwiML
  route `/api/twilio/voice-discovery` is off unless
  `VOICE_DISCOVERY_ENABLED=true`.

Gemini Live, re-checked 2026-11-06 against the current Google docs
(still unproven on a live call in this stack):

- Model id: `gemini-3.8-live`. Setup sends `models/gemini-3.8-live`.
  Sources: [Live API models / deprecations](https://ai.google.dev/gemini-api/docs/deprecations),
  [websocket getting started](https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket).
- WebSocket URL (no API key):
  `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`
  Source: [Live API websocket reference](https://ai.google.dev/api/live).
  `GEMINI_LIVE_WS_URL` overrides this. The key goes in the
  `x-goog-api-key` header, not the URL.
- Audio in: raw 16-bit little-endian PCM, 16 kHz, MIME
  `audio/pcm;rate=16000`, sent as `realtimeInput.audio` (`mediaChunks`
  is deprecated). Audio out: raw 16-bit little-endian PCM, 24 kHz,
  on `serverContent.modelTurn.parts[].inlineData`.
- Transcription: `inputAudioTranscription: {}` and
  `outputAudioTranscription: {}` on setup. Transcripts arrive as
  `serverContent.inputTranscription.text` and
  `serverContent.outputTranscription.text`.
- The client waits for `setupComplete` before sending audio.

## Deploy on Railway

Create a service from this repo. Do not put secrets in the repo.

| Setting | Value |
| --- | --- |
| Root Directory | `/voice-bridge` |
| Start command | `npm start` (`node server.mjs`) |
| Health check path | `/health` |
| Node | `>=24` (`engines` in `package.json`; Railway should use that) |

`GET /health` returns `{"ok":true,"service":"micro-titan-voice-bridge"}`.
The process listens on `process.env.PORT`, then `VOICE_BRIDGE_PORT`,
then `8080`, and binds `0.0.0.0`. Railway sets `PORT`.

### Environment variables (this service)

| Name | Required | Secret |
| --- | --- | --- |
| `GEMINI_API_KEY` | yes | **secret** |
| `GEMINI_VOICE_NAME` | no | not a secret — prebuilt Live voice. Default `Sulafat` (Warm). Unknown names fall back to the default. |
| `OPS_DASHBOARD_TOKEN` | yes | **secret** — bearer token for `POST /api/ops/discovery-voice-complete` |
| `ERM_API_BASE_URL` | yes | not a secret — origin of the Next app, e.g. `https://micro-titan.com` |
| `GEMINI_LIVE_WS_URL` | no | not a secret — override only. Default is the URL above. Do not put the API key in this URL. |
| `PORT` | set by Railway | not a secret |
| `VOICE_BRIDGE_PORT` | no | not a secret — used only when `PORT` is unset |
| `TWILIO_ACCOUNT_SID` | no | not a secret — account identifier, only for the hard-stop hang-up |
| `TWILIO_AUTH_TOKEN` | no | **secret** — only for the hard-stop hang-up. Without it the bridge logs that hang-up must come from the TwiML side. |
| `VOICE_BRIDGE_STREAM_SECRET` | yes | **secret** — HMAC key for `streamToken`. The process exits on startup if this is unset. The same value must be in the shell that runs `scripts/voice-test-call.mjs`, and on the Next app if `VOICE_DISCOVERY_ENABLED=true`. |

### Next.js app (not this Railway service)

The TwiML route runs in the Next app. Leave it off until a TEST call.

| Name | Required to turn voice on | Secret |
| --- | --- | --- |
| `VOICE_DISCOVERY_ENABLED` | must be the exact string `true` | not a secret. Unset, `false`, `1`, and `TRUE` keep the route off. |
| `VOICE_BRIDGE_HOST` | yes, once the flag is on | not a secret — Railway hostname only, no `wss://` and no path |
| `TWILIO_AUTH_TOKEN` | yes, once the flag is on | **secret** — verifies `X-Twilio-Signature`. Already used by `/api/twilio/webhook`. |
| `ERM_DATABASE_URL` | yes, once the flag is on | **secret** — the route will not open a stream unless it can read the intake. `ERM_DATABASE_DATABASE_URL` is the existing Neon fallback. |
| `VOICE_BRIDGE_STREAM_SECRET` | yes, once the flag is on | **secret** — same value as on the Railway service. The route will not emit TwiML without it. |

## Run locally (TEST only)

```sh
GEMINI_API_KEY=dummy \
ERM_API_BASE_URL=http://127.0.0.1:9 \
OPS_DASHBOARD_TOKEN=dummy \
VOICE_BRIDGE_STREAM_SECRET=dummy \
PORT=8080 \
node voice-bridge/server.mjs
```

`GET /health` returns `{"ok":true,"service":"micro-titan-voice-bridge"}`.
Twilio connects to `wss://<host>/twilio-stream` with no query string.
`reference`, `sessionKey`, `consentAt`, and `streamToken` arrive in
the `start` event's `customParameters`. Gemini opens only after the
token matches. A `start` that does not arrive within 5 seconds is
rejected.

## What it does

- Twilio μ-law 8 kHz → PCM 16 kHz → Gemini Live; Gemini PCM 24 kHz
  → PCM 8 kHz → μ-law → Twilio (`voice-bridge/audio.mjs`).
- Collects Gemini input/output transcription into transcript turns
  (agent / client, in order, with timestamps).
- Enforces the 20-minute hard stop: at 1200 seconds it speaks the
  approved wrap-up line, then ends the call.
- On end, POSTs the transcript to the Next app's owner route
  `POST /api/ops/discovery-voice-complete`, which records it in the
  ERM via `recordDiscoveryCall` (channel `voice`, format `call`).
  No audio is stored, sent to the ERM, or logged — only the
  provider's recording reference, if one is supplied.
- If the client does not answer, the session ends as `no_answer`.
  No repeated dialling. The one-text follow-up is approved wording
  in `voice-discovery.ts` (Bubba 2026-11-06 ~18:27 CST), and nothing
  here sends it.

## First test call

The bridge is deployed at `voice-bridge-production-5a71.up.railway.app`.
Set `VOICE_BRIDGE_STREAM_SECRET` on that service (it will not boot
without it), and export the same value in the shell below. The bridge
does not look up the ERM before it connects. The transcript is stored
only if that reference already exists in `intakes`.

`scripts/voice-test-call.mjs` builds one outbound call with inline
TwiML straight to this host. It does not change the Twilio console
and it does not enable `VOICE_DISCOVERY_ENABLED`. Without `--confirm`
it prints the plan and exits before any Twilio request.

```sh
TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_PHONE_NUMBER=+1... \
VOICE_BRIDGE_STREAM_SECRET=... \
node scripts/voice-test-call.mjs --to +1... --reference MT-20261107-TEST
```

Add `--confirm` only when that plan is the call you mean to place.
`/api/twilio/webhook` stays the inbound reject route.

## What still needs the owner

1. **Place the TEST call** with the command above, to the owner's own
   phone, after a TEST intake row exists if the transcript should be
   kept. This repo does not place that call.
2. **Consent wording** — the call opening, booking consent, wrap-up,
   and no-answer lines are approved verbatim and are used exactly.
   Nothing sends the no-answer text. TCPA / consent wording is not
   legal advice and has not been reviewed by counsel.
