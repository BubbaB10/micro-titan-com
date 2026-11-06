// In-memory stand-in for the `pg` module. recordDiscoveryCall and
// discoveryCallStatus import "pg" only after a database URL is set.
// Tests point that URL at a .invalid host and redirect the import
// here, so a query never leaves the process and no client row is
// written.

const queries = [];
let mode = "intake_missing";

export function setFakePgMode(next) {
  mode = next;
  queries.length = 0;
}

export function fakePgQueries() {
  return queries.map((query) => ({ sql: query.sql, params: query.params }));
}

export class Pool {
  constructor() {}

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
