// In-memory stand-in for the `pg` module. recordDiscoveryCall and
// discoveryCallStatus import "pg" only after a database URL is set.
// Tests point that URL at a .invalid host and redirect the import
// here, so a query never leaves the process and no client row is
// written.

const queries = [];
const communicationRows = [];
const proofPackets = [];
const proofClaims = [];
const proofChecks = [];
let mode = "intake_missing";
let proofPacketSeq = 1;

export function setFakePgMode(next) {
  mode = next;
  queries.length = 0;
  proofPackets.length = 0;
  proofClaims.length = 0;
  proofChecks.length = 0;
  proofPacketSeq = 1;
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

function proofPacketQuery(text, params = []) {
  if (text.startsWith("SELECT id, status FROM proof_packets WHERE intake_id")) {
    const found = proofPackets.find((row) => row.intake_id === params[0]);
    return { rows: found ? [{ id: found.id, status: found.status }] : [] };
  }
  if (text.startsWith("SELECT id, status, test, heading, intro, sections, signed_by, owner_signed_at")) {
    const found = proofPackets.find((row) => row.intake_id === params[0]);
    return { rows: found ? [{ ...found, sections: found.sections }] : [] };
  }
  if (text.startsWith("SELECT id, reference, test, status, heading, intro, sections")) {
    const found = proofPackets.find((row) => row.reference === params[0]);
    return { rows: found ? [{ ...found, sections: found.sections }] : [] };
  }
  if (text.startsWith("INSERT INTO proof_packets")) {
    if (proofPackets.some((row) => row.intake_id === params[0] || row.reference === params[2])) {
      throw new Error("duplicate proof packet");
    }
    const row = {
      id: `packet-${proofPacketSeq++}`,
      intake_id: params[0],
      client_id: params[1],
      reference: params[2],
      test: params[3] === true,
      status: "draft",
      heading: params[4],
      intro: params[5],
      sections: JSON.parse(params[6]),
      owner_signed_at: null,
      signed_by: null,
      created_at: "2026-11-07T16:00:00.000Z",
      updated_at: "2026-11-07T16:00:00.000Z",
    };
    proofPackets.push(row);
    return { rows: [{ id: row.id, test: row.test }] };
  }
  if (text.startsWith("UPDATE proof_packets") && text.includes("status = 'draft'") && text.includes("heading = $1")) {
    const row = proofPackets.find((existing) => existing.id === params[4] && existing.status === "draft");
    if (!row) return { rows: [] };
    row.heading = params[0];
    row.intro = params[1];
    row.sections = JSON.parse(params[2]);
    row.test = params[3] === true;
    row.updated_at = "2026-11-07T16:05:00.000Z";
    return { rows: [{ id: row.id, test: row.test }] };
  }
  if (text.startsWith("UPDATE proof_packets") && text.includes("status = 'signed'")) {
    const row = proofPackets.find((existing) => existing.id === params[1] && existing.status === "draft");
    if (!row) return { rows: [] };
    row.status = "signed";
    row.signed_by = params[0];
    row.owner_signed_at = "2026-11-07T22:00:00.000Z";
    row.updated_at = "2026-11-07T22:00:00.000Z";
    return {
      rows: [
        {
          id: row.id,
          test: row.test,
          signed_by: row.signed_by,
          owner_signed_at: row.owner_signed_at,
        },
      ],
    };
  }
  if (text.startsWith("DELETE FROM proof_packet_claims")) {
    for (let i = proofClaims.length - 1; i >= 0; i -= 1) {
      if (proofClaims[i].packet_id === params[0]) proofClaims.splice(i, 1);
    }
    return { rows: [] };
  }
  if (text.startsWith("DELETE FROM proof_packet_checks")) {
    for (let i = proofChecks.length - 1; i >= 0; i -= 1) {
      if (proofChecks[i].packet_id === params[0]) proofChecks.splice(i, 1);
    }
    return { rows: [] };
  }
  if (text.startsWith("INSERT INTO proof_packet_claims")) {
    const evidence = String(params[4] ?? "");
    if (evidence.trim().length === 0) throw new Error("claim evidence check");
    proofClaims.push({
      packet_id: params[0],
      section: params[1],
      position: params[2],
      body: params[3],
      evidence,
    });
    return { rows: [] };
  }
  if (text.startsWith("INSERT INTO proof_packet_checks")) {
    const evidence = String(params[5] ?? "");
    if (evidence.trim().length === 0) throw new Error("check evidence check");
    if (params[4] === "NOT_RUN") {
      const reason = String(params[6] ?? "");
      if (reason.trim().length === 0 || params[7] == null || params[7] === "") {
        throw new Error("not_run check");
      }
    }
    proofChecks.push({
      packet_id: params[0],
      position: params[1],
      check_text: params[2],
      method: params[3],
      result: params[4],
      evidence,
      not_run_reason: params[6],
      run_by_date: params[7],
    });
    return { rows: [] };
  }
  throw new Error(`unexpected proof packet sql: ${text}`);
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
        if (text.startsWith("INSERT INTO audit_log")) return { rows: [] };
        if (text.includes("proof_packet")) return proofPacketQuery(text, params);
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
