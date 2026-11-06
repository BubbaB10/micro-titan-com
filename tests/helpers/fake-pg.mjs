// In-memory stand-in for the `pg` module. recordDiscoveryCall and
// discoveryCallStatus import "pg" only after a database URL is set.
// Tests point that URL at a .invalid host and redirect the import
// here, so a query never leaves the process and no client row is
// written.

const queries = [];
const communicationRows = [];
let mode = "intake_missing";

export function setFakePgMode(next) {
  mode = next;
  queries.length = 0;
}

export function resetCommunicationLog() {
  communicationRows.length = 0;
}

export function communicationLogRows() {
  return communicationRows.map((row) => ({ ...row }));
}

function queryCommunicationLog(sql, params = []) {
  const text = String(sql).replace(/\s+/g, " ").trim();
  if (text.startsWith("INSERT INTO communication_log")) {
    const row = {
      id: `comm-${communicationRows.length + 1}`,
      twilio_sid: params[0],
      related_sid: params[1],
      kind: params[2],
      direction: params[3],
      from_number: params[4],
      to_number: params[5],
      body: params[6],
      media_count: params[7],
      status: params[8],
    };
    const conflict = communicationRows.find(
      (existing) => existing.twilio_sid === row.twilio_sid && existing.kind === row.kind,
    );
    if (conflict) return { rows: [] };
    communicationRows.push(row);
    return { rows: [{ id: row.id }] };
  }
  if (text.startsWith("SELECT id FROM communication_log")) {
    const found = communicationRows.find(
      (existing) => existing.twilio_sid === params[0] && existing.kind === params[1],
    );
    return { rows: found ? [{ id: found.id }] : [] };
  }
  if (text.includes("related_sid = $1")) {
    const n = communicationRows.filter(
      (existing) =>
        existing.kind === "missed_call_auto_text" &&
        existing.direction === "outbound" &&
        existing.status === "sent" &&
        existing.related_sid === params[0],
    ).length;
    return { rows: [{ n }] };
  }
  if (text.includes("CURRENT_DATE")) {
    const n = communicationRows.filter(
      (existing) =>
        existing.kind === "missed_call_auto_text" &&
        existing.direction === "outbound" &&
        existing.status === "sent",
    ).length;
    return { rows: [{ n }] };
  }
  if (text.includes("15 minutes")) {
    const n = communicationRows.filter(
      (existing) => existing.direction === "inbound" && existing.from_number === params[0],
    ).length;
    return { rows: [{ n }] };
  }
  throw new Error(`unexpected communication sql: ${text}`);
}

export function fakePgQueries() {
  return queries.map((query) => ({ sql: query.sql, params: query.params }));
}

export class Pool {
  constructor() {}

  async query(sql, params) {
    return queryCommunicationLog(sql, params);
  }

  async connect() {
    return {
      query: async (sql, params) => {
        const text = String(sql).replace(/\s+/g, " ").trim();
        queries.push({ sql: text, params });
        if (mode === "throw") {
          throw new Error("fake pg failure");
        }
        if (/^(BEGIN|COMMIT|ROLLBACK)$/i.test(text)) return { rows: [] };
        if (text.includes("FROM intakes")) {
          if (mode === "intake_missing") return { rows: [] };
          return {
            rows: [
              {
                id: "11111111-1111-1111-1111-111111111111",
                client_id: "22222222-2222-2222-2222-222222222222",
                status: "discovery_paid",
              },
            ],
          };
        }
        if (text.includes("WHERE session_key")) {
          if (mode === "already_exists") {
            return { rows: [{ id: "33333333-3333-3333-3333-333333333333" }] };
          }
          return { rows: [] };
        }
        if (text.startsWith("INSERT INTO discovery_calls")) {
          return { rows: [{ id: "44444444-4444-4444-4444-444444444444" }] };
        }
        if (text.startsWith("INSERT INTO audit_log")) return { rows: [] };
        if (text.startsWith("UPDATE intakes")) return { rows: [] };
        if (text.includes("FROM discovery_calls WHERE intake_id")) {
          if (mode === "status_found") {
            return {
              rows: [
                {
                  channel: "voice",
                  status: "completed",
                  recommendation: "approve",
                  recommendation_reason: "Client named the first job in their own words.",
                  transcript: [
                    {
                      speaker: "client",
                      text: "The patio, before the reunion — I am not asking for a summary.",
                      at: "2026-11-05T18:01:00Z",
                    },
                  ],
                  presentation_ref: null,
                },
              ],
            };
          }
          return { rows: [] };
        }
        throw new Error(`unexpected sql: ${text}`);
      },
      release() {},
    };
  }

  async end() {}
}
