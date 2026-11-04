/**
 * Micro Titan Twilio outbound send — request builder only.
 *
 * The auth token appears ONLY in the Authorization header (Basic
 * auth, base64 of "accountSid:authToken"), never in the URL and
 * never in the request body. No secret is logged by this module,
 * and the caller must never log the built request's headers.
 * The only Twilio API call in this slice is this one Messages
 * create — one per missed-call auto-text, nothing else, no polling.
 */

export interface TwilioMessageRequest {
  url: string;
  method: "POST";
  headers: { Authorization: string; "Content-Type": string };
  body: string;
}

export function buildTwilioMessageRequest(
  accountSid: string,
  authToken: string,
  fromNumber: string,
  toNumber: string,
  body: string,
): TwilioMessageRequest {
  const credentials = Buffer.from(`${accountSid}:${authToken}`, "utf8").toString("base64");
  const params = new URLSearchParams({ From: fromNumber, To: toNumber, Body: body });
  return {
    url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  };
}

export async function sendTwilioMessage(
  accountSid: string,
  authToken: string,
  fromNumber: string,
  toNumber: string,
  body: string,
  fetchFn: typeof fetch = fetch,
): Promise<{ ok: boolean; messageSid: string | null }> {
  const req = buildTwilioMessageRequest(accountSid, authToken, fromNumber, toNumber, body);
  let res: Response;
  try {
    res = await fetchFn(req.url, { method: req.method, headers: req.headers, body: req.body });
  } catch {
    return { ok: false, messageSid: null };
  }
  if (!res.ok) return { ok: false, messageSid: null };
  try {
    const json = (await res.json()) as { sid?: unknown };
    return { ok: true, messageSid: typeof json.sid === "string" ? json.sid : null };
  } catch {
    return { ok: true, messageSid: null };
  }
}
