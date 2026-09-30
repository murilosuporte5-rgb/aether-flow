import fs from "node:fs";
const status = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const url = status.API_URL;
if (!url || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname))
  throw new Error("QA must use a loopback Supabase URL.");
const publicKey = status.PUBLISHABLE_KEY || status.ANON_KEY;
if (!publicKey) throw new Error("Local publishable/anon key missing.");
// This output is redirected only to ignored .env.local, never to public logs.
process.stdout.write("NEXT_PUBLIC_SUPABASE_URL=" + url + "\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=" + publicKey + "\n");
