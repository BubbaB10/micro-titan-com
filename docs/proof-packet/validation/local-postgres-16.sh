#!/bin/bash
# Throwaway local PostgreSQL 16 proof for migration 008.
# Not Neon. Creates proof_packet_throwaway, runs the cases, drops it.
# Rerun from the repo root: bash docs/proof-packet/validation/local-postgres-16.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DB="proof_packet_throwaway"
if [ "$(id -un)" = "postgres" ]; then
  PSQL=(psql)
else
  PSQL=(sudo -u postgres psql)
fi

psql_admin() { "${PSQL[@]}" -v ON_ERROR_STOP=1 "$@"; }
psql_db() { "${PSQL[@]}" -v ON_ERROR_STOP=1 -d "$DB" "$@"; }

echo "=== setup $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
psql_admin -c "DROP DATABASE IF EXISTS ${DB};" -c "CREATE DATABASE ${DB};"
psql_db <<'SQL'
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE intakes (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id),
  reference TEXT NOT NULL UNIQUE
);
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  client_id UUID NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  reference TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO clients (id, name) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'TEST Solo Example Co'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'TEST Other Co');
INSERT INTO intakes (id, client_id, reference) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'MT-20261107-TEST'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'MT-20261107-AB12'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'MT-20261108-TEST'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'MT-20261109-TEST'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'MT-20261110-TEST'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'MT-20261111-TEST');
SQL

echo "=== apply migration 008 ==="
psql_db -f "$ROOT/app/lib/erm/migrations/008-proof-packets.sql"
echo "FIRST_APPLY:$?"
echo "=== apply migration 008 again ==="
psql_db -f "$ROOT/app/lib/erm/migrations/008-proof-packets.sql"
echo "SECOND_APPLY:$?"

psql_db <<'SQL'
CREATE OR REPLACE FUNCTION expect_fail(label text, stmt text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE stmt;
  RAISE EXCEPTION 'EXPECTED REJECTION but statement succeeded: %', label;
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM LIKE 'EXPECTED REJECTION%' THEN
      RAISE;
    END IF;
    RAISE NOTICE 'PASS rejected [%]: %', label, SQLERRM;
END;
$$;

DO $$
DECLARE
  draft_id uuid := 'cccccccc-cccc-cccc-cccc-ccccccccccc1';
  other_id uuid := 'cccccccc-cccc-cccc-cccc-ccccccccccc2';
  signed_id uuid := 'cccccccc-cccc-cccc-cccc-ccccccccccc3';
  claim_on_draft uuid := 'dddddddd-dddd-dddd-dddd-ddddddddddd1';
  claim_on_signed uuid := 'dddddddd-dddd-dddd-dddd-ddddddddddd2';
  check_on_draft uuid := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1';
  check_on_signed uuid := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2';
BEGIN
  PERFORM expect_fail('client_id from a different intake', $f$
    INSERT INTO proof_packets (
      id, intake_id, client_id, reference, test, status, heading, intro, sections
    ) VALUES (
      'cccccccc-cccc-cccc-cccc-cccccccccc99',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
      'MT-20261107-TEST', true, 'draft', 'h', 'i', '{}'::jsonb
    )
  $f$);

  PERFORM expect_fail('reference from a different intake', $f$
    INSERT INTO proof_packets (
      id, intake_id, client_id, reference, test, status, heading, intro, sections
    ) VALUES (
      'cccccccc-cccc-cccc-cccc-cccccccccc98',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      'MT-20261107-AB12', false, 'draft', 'h', 'i', '{}'::jsonb
    )
  $f$);

  PERFORM expect_fail('test true on a non-TEST reference', $f$
    INSERT INTO proof_packets (
      id, intake_id, client_id, reference, test, status, heading, intro, sections
    ) VALUES (
      'cccccccc-cccc-cccc-cccc-cccccccccc97',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
      'MT-20261107-AB12', true, 'draft', 'h', 'i', '{}'::jsonb
    )
  $f$);

  PERFORM expect_fail('test false on a TEST reference', $f$
    INSERT INTO proof_packets (
      id, intake_id, client_id, reference, test, status, heading, intro, sections
    ) VALUES (
      'cccccccc-cccc-cccc-cccc-cccccccccc96',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      'MT-20261107-TEST', false, 'draft', 'h', 'i', '{}'::jsonb
    )
  $f$);

  INSERT INTO proof_packets (
    id, intake_id, client_id, reference, test, status, heading, intro, sections
  ) VALUES
    (draft_id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
     'MT-20261108-TEST', true, 'draft', 'OLD-HEAD', 'intro', '{"header":{},"not-proven":[]}'::jsonb),
    (other_id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
     'MT-20261107-AB12', false, 'draft', 'OTHER', 'intro', '{"header":{},"not-proven":[]}'::jsonb),
    (signed_id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
     'MT-20261109-TEST', true, 'draft', 'SIGN', 'intro', '{"header":{},"not-proven":[]}'::jsonb);
  RAISE NOTICE 'PASS matching draft inserts';

  INSERT INTO proof_packet_claims (id, packet_id, section, position, body, evidence) VALUES
    (claim_on_draft, draft_id, 'authorship', 1, '{"item":"draft"}'::jsonb, 'COMMIT:old'),
    (claim_on_signed, signed_id, 'authorship', 1, '{"item":"signed"}'::jsonb, 'COMMIT:signed');
  INSERT INTO proof_packet_checks (
    id, packet_id, position, check_text, method, result, evidence, not_run_reason, run_by_date
  ) VALUES
    (check_on_draft, draft_id, 1, 'draft check', 'look', 'PASS', 'LOG:draft', '', NULL),
    (check_on_signed, signed_id, 1, 'signed check', 'look', 'PASS', 'LOG:signed', '', NULL);

  UPDATE proof_packet_claims SET evidence = 'COMMIT:replaced' WHERE id = claim_on_draft;
  DELETE FROM proof_packet_checks WHERE id = check_on_draft;
  INSERT INTO proof_packet_checks (
    id, packet_id, position, check_text, method, result, evidence
  ) VALUES (
    check_on_draft, draft_id, 1, 'draft check', 'look', 'PASS', 'LOG:draft-again'
  );
  RAISE NOTICE 'PASS draft child replace';

  PERFORM expect_fail('reparent claim draft to other draft', format($f$
    UPDATE proof_packet_claims
       SET packet_id = '%s', position = 2, evidence = 'COMMIT:moved', body = '{"item":"moved"}'::jsonb
     WHERE id = '%s'
  $f$, other_id, claim_on_draft));

  PERFORM expect_fail('reparent check draft to other draft', format($f$
    UPDATE proof_packet_checks
       SET packet_id = '%s', position = 2, evidence = 'LOG:moved'
     WHERE id = '%s'
  $f$, other_id, check_on_draft));

  UPDATE proof_packets
     SET status = 'signed',
         signed_by = 'owner',
         owner_signed_at = timestamptz '2026-11-07 22:00:00+00',
         content_hash = repeat('ab', 32)
   WHERE id = signed_id;
  RAISE NOTICE 'PASS sign one packet';

  PERFORM expect_fail('reparent claim signed to draft', format($f$
    UPDATE proof_packet_claims
       SET packet_id = '%s', position = 3, evidence = 'COMMIT:escaped', body = '{"item":"escaped"}'::jsonb
     WHERE id = '%s'
  $f$, draft_id, claim_on_signed));

  PERFORM expect_fail('reparent check signed to draft', format($f$
    UPDATE proof_packet_checks
       SET packet_id = '%s', position = 3, evidence = 'LOG:escaped'
     WHERE id = '%s'
  $f$, draft_id, check_on_signed));

  PERFORM expect_fail('reparent claim draft to signed', format($f$
    UPDATE proof_packet_claims
       SET packet_id = '%s', position = 4, evidence = 'COMMIT:onto-signed'
     WHERE id = '%s'
  $f$, signed_id, claim_on_draft));

  PERFORM expect_fail('reparent check draft to signed', format($f$
    UPDATE proof_packet_checks
       SET packet_id = '%s', position = 4, evidence = 'LOG:onto-signed'
     WHERE id = '%s'
  $f$, signed_id, check_on_draft));

  PERFORM expect_fail('update signed claim', format($f$
    UPDATE proof_packet_claims SET evidence = 'COMMIT:changed' WHERE packet_id = '%s'
  $f$, signed_id));
  PERFORM expect_fail('delete signed claim', format($f$
    DELETE FROM proof_packet_claims WHERE packet_id = '%s'
  $f$, signed_id));
  PERFORM expect_fail('insert signed claim', format($f$
    INSERT INTO proof_packet_claims (packet_id, section, position, body, evidence)
    VALUES ('%s', 'timeline', 1, '{"stage":"x"}'::jsonb, 'ERM:intakes.TEST')
  $f$, signed_id));
  PERFORM expect_fail('update signed check', format($f$
    UPDATE proof_packet_checks SET method = 'changed' WHERE packet_id = '%s'
  $f$, signed_id));
  PERFORM expect_fail('delete signed check', format($f$
    DELETE FROM proof_packet_checks WHERE packet_id = '%s'
  $f$, signed_id));
  PERFORM expect_fail('insert signed check', format($f$
    INSERT INTO proof_packet_checks (packet_id, position, check_text, method, result, evidence)
    VALUES ('%s', 2, 'extra', 'look', 'PASS', 'LOG:extra')
  $f$, signed_id));
  PERFORM expect_fail('update signed packet', format($f$
    UPDATE proof_packets SET heading = 'changed' WHERE id = '%s'
  $f$, signed_id));
  PERFORM expect_fail('reopen signed packet', format($f$
    UPDATE proof_packets
       SET status = 'draft', signed_by = NULL, owner_signed_at = NULL, content_hash = NULL
     WHERE id = '%s'
  $f$, signed_id));
  PERFORM expect_fail('delete signed packet', format($f$
    DELETE FROM proof_packets WHERE id = '%s'
  $f$, signed_id));

  IF (SELECT evidence FROM proof_packet_claims WHERE id = claim_on_signed) IS DISTINCT FROM 'COMMIT:signed' THEN
    RAISE EXCEPTION 'signed claim evidence changed';
  END IF;
  IF (SELECT evidence FROM proof_packet_checks WHERE id = check_on_signed) IS DISTINCT FROM 'LOG:signed' THEN
    RAISE EXCEPTION 'signed check evidence changed';
  END IF;
  IF (SELECT evidence FROM proof_packet_claims WHERE id = claim_on_draft) IS DISTINCT FROM 'COMMIT:replaced' THEN
    RAISE EXCEPTION 'draft claim was disturbed';
  END IF;
  IF (SELECT count(*) FROM proof_packet_claims WHERE packet_id = signed_id) IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'signed claim count changed';
  END IF;
  IF (SELECT signed_by FROM proof_packets WHERE id = signed_id) IS DISTINCT FROM 'owner' THEN
    RAISE EXCEPTION 'signer changed';
  END IF;
  RAISE NOTICE 'PASS signed rows unchanged and draft row still editable';
END $$;
SQL

echo "=== snapshot: GET-style read versus draft save ==="
psql_db <<'SQL'
INSERT INTO proof_packets (
  id, intake_id, client_id, reference, test, status, heading, intro, sections
) VALUES (
  'cccccccc-cccc-cccc-cccc-ccccccccccc4',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  'MT-20261110-TEST', true, 'draft', 'OLD-HEAD', 'intro', '{"header":{},"not-proven":[]}'::jsonb
);
INSERT INTO proof_packet_claims (packet_id, section, position, body, evidence) VALUES (
  'cccccccc-cccc-cccc-cccc-ccccccccccc4', 'authorship', 1, '{"item":"snap"}'::jsonb, 'COMMIT:old'
);
SQL

psql_db -tA > /tmp/proof-packet-snap-reader.txt <<'SQL' &
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT heading || '|' || (
  SELECT evidence FROM proof_packet_claims
   WHERE packet_id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4'
) AS seen
FROM proof_packets
WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4';
SELECT pg_sleep(2);
SELECT heading || '|' || (
  SELECT evidence FROM proof_packet_claims
   WHERE packet_id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4'
) AS seen
FROM proof_packets
WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4';
COMMIT;
SQL
SNAP_PID=$!
sleep 0.4
psql_db <<'SQL'
BEGIN;
SELECT id FROM proof_packets WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4' FOR UPDATE;
UPDATE proof_packets SET heading = 'NEW-HEAD' WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4';
UPDATE proof_packet_claims
   SET evidence = 'COMMIT:new'
 WHERE packet_id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4';
COMMIT;
SQL
wait "$SNAP_PID"
echo "READER_OUTPUT:"
cat /tmp/proof-packet-snap-reader.txt
mapfile -t SEEN < <(awk '/OLD-HEAD|NEW-HEAD/{print}' /tmp/proof-packet-snap-reader.txt)
if [ "${#SEEN[@]}" -eq 2 ] && [ "${SEEN[0]}" = "OLD-HEAD|COMMIT:old" ] && [ "${SEEN[1]}" = "OLD-HEAD|COMMIT:old" ]; then
  echo "PASS open snapshot stayed wholly old"
else
  echo "FAIL snapshot mixed or moved: ${SEEN[*]:-empty}"
  exit 1
fi
AFTER="$(psql_db -tA -c "SELECT heading || '|' || (SELECT evidence FROM proof_packet_claims WHERE packet_id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4') FROM proof_packets WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4';")"
if [ "$AFTER" = "NEW-HEAD|COMMIT:new" ]; then
  echo "PASS later read is wholly new"
else
  echo "FAIL later read: $AFTER"
  exit 1
fi

echo "=== race: sign holds parent, then child insert ==="
psql_db <<'SQL'
INSERT INTO proof_packets (
  id, intake_id, client_id, reference, test, status, heading, intro, sections
) VALUES (
  'cccccccc-cccc-cccc-cccc-ccccccccccc5',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  'MT-20261111-TEST', true, 'draft', 'RACE', 'intro', '{"header":{},"not-proven":[]}'::jsonb
);
INSERT INTO proof_packet_claims (id, packet_id, section, position, body, evidence) VALUES (
  'dddddddd-dddd-dddd-dddd-ddddddddddd5',
  'cccccccc-cccc-cccc-cccc-ccccccccccc5', 'authorship', 1, '{"item":"race"}'::jsonb, 'COMMIT:race'
);
SQL

psql_db > /tmp/proof-packet-sign-first.txt <<'SQL' &
BEGIN;
SELECT id FROM proof_packets WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc5' FOR UPDATE;
SELECT pg_sleep(2);
UPDATE proof_packets
   SET status = 'signed',
       signed_by = 'owner',
       owner_signed_at = timestamptz '2026-11-07 22:00:00+00',
       content_hash = repeat('cd', 32)
 WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc5';
COMMIT;
SQL
SIGN_PID=$!
sleep 0.4
START=$(date +%s)
set +e
psql_db -c "INSERT INTO proof_packet_claims (packet_id, section, position, body, evidence) VALUES ('cccccccc-cccc-cccc-cccc-ccccccccccc5', 'timeline', 1, '{\"stage\":\"late\"}'::jsonb, 'ERM:intakes.LATE');" > /tmp/proof-packet-insert-wait.txt 2>&1
INSERT_CODE=$?
set -e
END=$(date +%s)
wait "$SIGN_PID"
ELAPSED=$((END - START))
if [ "$INSERT_CODE" -ne 0 ] && [ "$ELAPSED" -ge 1 ] && grep -q "signed proof packet is frozen" /tmp/proof-packet-insert-wait.txt; then
  echo "PASS sign-then-insert rejected after ${ELAPSED}s"
else
  echo "FAIL sign-then-insert code=$INSERT_CODE elapsed=$ELAPSED"
  cat /tmp/proof-packet-insert-wait.txt
  exit 1
fi
LEFT="$(psql_db -tA -c "SELECT status || '|' || signed_by || '|' || (SELECT count(*) FROM proof_packet_claims WHERE packet_id = 'cccccccc-cccc-cccc-cccc-ccccccccccc5') || '|' || (SELECT evidence FROM proof_packet_claims WHERE id = 'dddddddd-dddd-dddd-dddd-ddddddddddd5') FROM proof_packets WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc5';")"
if [ "$LEFT" = "signed|owner|1|COMMIT:race" ]; then
  echo "PASS sign-then-insert left the signed row unchanged"
else
  echo "FAIL sign-then-insert row: $LEFT"
  exit 1
fi

echo "=== race: child row lock first, then sign, then child update ==="
psql_db -c "INSERT INTO intakes (id, client_id, reference) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'MT-20261112-TEST');"
psql_db <<'SQL'
INSERT INTO proof_packets (
  id, intake_id, client_id, reference, test, status, heading, intro, sections
) VALUES (
  'cccccccc-cccc-cccc-cccc-ccccccccccc6',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  'MT-20261112-TEST', true, 'draft', 'RACE2', 'intro', '{"header":{},"not-proven":[]}'::jsonb
);
INSERT INTO proof_packet_claims (id, packet_id, section, position, body, evidence) VALUES (
  'dddddddd-dddd-dddd-dddd-ddddddddddd6',
  'cccccccc-cccc-cccc-cccc-ccccccccccc6', 'authorship', 1, '{"item":"race2"}'::jsonb, 'COMMIT:race2'
);
SQL

psql_db > /tmp/proof-packet-child-first.txt 2>&1 <<'SQL' &
BEGIN;
SELECT id FROM proof_packet_claims WHERE id = 'dddddddd-dddd-dddd-dddd-ddddddddddd6' FOR UPDATE;
SELECT pg_sleep(2);
UPDATE proof_packet_claims SET evidence = 'COMMIT:changed' WHERE id = 'dddddddd-dddd-dddd-dddd-ddddddddddd6';
COMMIT;
SQL
CHILD_PID=$!
sleep 0.4
psql_db <<'SQL'
UPDATE proof_packets
   SET status = 'signed',
       signed_by = 'owner',
       owner_signed_at = timestamptz '2026-11-07 22:00:00+00',
       content_hash = repeat('ef', 32)
 WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc6';
SQL
set +e
wait "$CHILD_PID"
CHILD_CODE=$?
set -e
if [ "$CHILD_CODE" -ne 0 ] && grep -q "signed proof packet is frozen" /tmp/proof-packet-child-first.txt; then
  echo "PASS child-lock-then-sign update rejected"
else
  echo "FAIL child-lock-then-sign code=$CHILD_CODE"
  cat /tmp/proof-packet-child-first.txt
  exit 1
fi
LEFT2="$(psql_db -tA -c "SELECT status || '|' || (SELECT evidence FROM proof_packet_claims WHERE id = 'dddddddd-dddd-dddd-dddd-ddddddddddd6') FROM proof_packets WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc6';")"
if [ "$LEFT2" = "signed|COMMIT:race2" ]; then
  echo "PASS child-lock-then-sign left the signed evidence unchanged"
else
  echo "FAIL child-lock-then-sign row: $LEFT2"
  exit 1
fi

echo "=== app sign rejects a different content hash with no write ==="
RESOLVER=/tmp/proof-packet-resolve-next.mjs
cat > "$RESOLVER" <<'JS'
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") return nextResolve("next/server.js", context);
  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    path.extname(specifier) === "" &&
    context.parentURL?.startsWith("file:")
  ) {
    const parentPath = fileURLToPath(context.parentURL);
    const candidate = path.resolve(path.dirname(parentPath), `${specifier}.ts`);
    if (fs.existsSync(candidate)) return nextResolve(`${specifier}.ts`, context);
  }
  return nextResolve(specifier, context);
}
JS

cat > /tmp/proof-packet-hash-check.mjs <<'JS'
import { register } from "node:module";
import { pathToFileURL } from "node:url";

await register(pathToFileURL("/tmp/proof-packet-resolve-next.mjs"));
const { POST, GET } = await import("/workspace/app/api/ops/proof-packet/route.ts");
const { POST: SIGN } = await import("/workspace/app/api/ops/proof-packet-sign/route.ts");
const { APPROVED_PROOF_PACKET_INTRO, approvedProofPacketHeading } = await import(
  "/workspace/app/lib/erm/proof-packet-store.ts"
);

const token = process.env.OPS_DASHBOARD_TOKEN;
const signing = process.env.OWNER_SIGNING_TOKEN;
const reference = "MT-20261107-TEST";
const sections = {
  header: {
    clientDisplayName: "TEST Solo Example Co",
    lane: "Solo entrepreneur",
    agent: "Grok Bot",
    agentAccountOwner: "Client (TEST Solo Example Co)",
    preparedBy: "Grok Bot (Micro Titan ops)",
    version: "v0",
  },
  authorship: [{
    item: "Reminder",
    writtenBy: "Grok Bot",
    mergedBy: "Owner",
    verifiedBy: "Owner review",
    evidence: "COMMIT:0000test",
  }],
  timeline: [],
  money: [],
  discovery: [],
  setup: [],
  access: [],
  checks: [{
    check: "Runs 5 days in a row",
    method: "Needs 5 days",
    result: "NOT_RUN",
    evidence: "LOG:routine-schedule@2026-11-07 16:00 CT",
    notRunReason: "Needs 5 weekday runs.",
    runByDate: "2026-11-12",
  }],
  "follow-ups": [],
  wording: [],
  "not-proven": ["Check 3 is not yet proven."],
};

function ops(url, method, body, extra) {
  const headers = { authorization: `Bearer ${token}` };
  if (extra) Object.assign(headers, extra);
  if (body) headers["content-type"] = "application/json";
  return new Request(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
}

const created = await POST(ops("http://localhost/api/ops/proof-packet", "POST", {
  reference,
  heading: approvedProofPacketHeading(reference),
  intro: APPROVED_PROOF_PACKET_INTRO,
  sections,
}));
if (created.status !== 200) {
  console.log("FAIL create", created.status, await created.text());
  process.exit(1);
}
const read = await GET(ops(`http://localhost/api/ops/proof-packet?reference=${reference}`, "GET"));
const readBody = await read.json();
const hash = readBody.packet.contentHash;
const mismatch = await SIGN(ops("http://localhost/api/ops/proof-packet-sign", "POST", {
  reference,
  signedBy: "owner",
  expectedHash: "0".repeat(64),
}, { "x-owner-signing-token": signing }));
console.log(`HASH_MISMATCH_STATUS ${mismatch.status}`);
const mismatchBody = await mismatch.json();
console.log(`HASH_MISMATCH_ERROR ${mismatchBody.error}`);
const signed = await SIGN(ops("http://localhost/api/ops/proof-packet-sign", "POST", {
  reference,
  signedBy: "client",
  expectedHash: hash,
}, { "x-owner-signing-token": signing }));
const signedBody = await signed.json();
console.log(`SIGN_STATUS ${signed.status}`);
console.log(`SIGN_HASH ${signedBody.contentHash}`);
console.log(`GET_HASH ${hash}`);
if (mismatch.status !== 409 || signed.status !== 200 || signedBody.contentHash !== hash) process.exit(1);
JS

sudo -u postgres env \
  PATH="$PATH" \
  OPS_DASHBOARD_TOKEN="local-ops-fixture" \
  OWNER_SIGNING_TOKEN="local-sign-fixture" \
  ERM_DATABASE_URL="postgresql://postgres@/proof_packet_throwaway?host=/var/run/postgresql" \
  node /tmp/proof-packet-hash-check.mjs
STORED="$(psql_db -tA -c "SELECT status || '|' || content_hash FROM proof_packets WHERE reference = 'MT-20261107-TEST';")"
echo "STORED_AFTER_SIGN $STORED"
case "$STORED" in
  signed\|[0-9a-f][0-9a-f][0-9a-f][0-9a-f]*) echo "PASS stored content hash is present and the row is signed" ;;
  *) echo "FAIL stored row $STORED"; exit 1 ;;
esac

echo "=== drop throwaway database ==="
psql_admin -c "DROP DATABASE ${DB};"
echo "DONE"
