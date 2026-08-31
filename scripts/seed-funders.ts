/**
 * Seed script — loads verified funders from seed/funders.json into Supabase,
 * removing any unverified funders from the database.
 *
 * Usage:
 *   npx tsx scripts/seed-funders.ts
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Load .env.local if present
const envPath = join(__dirname, "../.env.local");
if (existsSync(envPath)) {
  const envConfig = readFileSync(envPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*"(.*)"\s*$/) || line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface FunderSeed {
  name: string;
  description: string;
  amount_range: string;
  focus_tags: string[];
  application_type: string;
  eligibility_notes: string;
  application_url: string;
  region_restriction: string | null;
}

async function main() {
  console.log("Loading verified funders from seed/funders.json…");

  const raw = readFileSync(join(__dirname, "../seed/funders.json"), "utf-8");
  const funders: FunderSeed[] = JSON.parse(raw);

  console.log(`Found ${funders.length} verified funders. Cleaning up unverified database entries…`);

  const verifiedNames = funders.map((f) => f.name);

  // Delete funders not present in the verified list
  const { data: existingFunders } = await supabase.from("funders").select("id, name");
  if (existingFunders && existingFunders.length > 0) {
    const toDelete = existingFunders.filter((f) => !verifiedNames.includes(f.name)).map((f) => f.id);
    if (toDelete.length > 0) {
      console.log(`Removing ${toDelete.length} old/unverified funders…`);
      const { error: delErr } = await supabase.from("funders").delete().in("id", toDelete);
      if (delErr) {
        console.error("Error deleting old funders:", delErr.message);
      }
    }
  }

  console.log(`Upserting ${funders.length} verified funders…`);

  for (const funder of funders) {
    const { error } = await supabase.from("funders").upsert(
      {
        name: funder.name,
        description: funder.description,
        amount_range: funder.amount_range,
        focus_tags: funder.focus_tags,
        application_type: funder.application_type,
        eligibility_notes: funder.eligibility_notes,
        application_url: funder.application_url,
        region_restriction: funder.region_restriction,
      },
      { onConflict: "name" }
    );

    if (error) {
      console.error(`  ✗ ${funder.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${funder.name}`);
    }
  }

  console.log("\nDone seeding verified funders.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
