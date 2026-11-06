// Test-only resolver: `import("pg")` loads the in-memory fake driver.
// The fake never opens a socket. Unit tests for the discovery routes
// use it so no live discovery row is written.
//
// Registering a hook replaces Node's default resolver, which otherwise
// adds the extensions Next and tsc leave off. This hook puts those two
// cases back and leaves every other import alone.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "pg") {
    return {
      url: new URL("./fake-pg.mjs", import.meta.url).href,
      shortCircuit: true,
    };
  }
  if (specifier === "next/server") {
    return nextResolve("next/server.js", context);
  }
  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    path.extname(specifier) === "" &&
    context.parentURL?.startsWith("file:")
  ) {
    const parentPath = fileURLToPath(context.parentURL);
    const candidate = path.resolve(path.dirname(parentPath), `${specifier}.ts`);
    if (fs.existsSync(candidate)) {
      return nextResolve(`${specifier}.ts`, context);
    }
  }
  return nextResolve(specifier, context);
}
