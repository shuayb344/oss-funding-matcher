import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...vals] = trimmed.split("=");
      process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log("Checking funder_suggestions table in Supabase...");

  // Try to select from funder_suggestions
  const { data, error } = await supabase.from("funder_suggestions").select("id").limit(1);

  if (error) {
    console.log("funder_suggestions query returned error/not found:", error.message);
    console.log("Attempting SQL execution via rpc exec_sql if available...");
    const createSql = `
      create table if not exists funder_suggestions (
        id uuid primary key default gen_random_uuid(),
        submitted_by uuid references users(id),
        name text not null,
        description text,
        application_url text not null,
        focus_tags text[],
        notes text,
        status text default 'pending',
        created_at timestamptz default now()
      );
    `;
    const { error: rpcErr } = await supabase.rpc("exec_sql", { sql: createSql });
    if (rpcErr) {
      console.log("RPC exec_sql unavailable or failed:", rpcErr.message);
      console.log("Please ensure the table definition from schema.sql is executed in your Supabase SQL editor if not already present.");
    } else {
      console.log("Successfully created funder_suggestions table via RPC!");
    }
  } else {
    console.log("funder_suggestions table already exists and is accessible!");
  }
}

main().catch(console.error);
