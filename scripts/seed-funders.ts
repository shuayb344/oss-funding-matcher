/**
 * Seed script — loads funders from seed/funders.json into Supabase.
 *
 * Usage:
 *   npx tsx scripts/seed-funders.ts
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

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
  console.log("Loading funders from seed/funders.json…");

  const raw = readFileSync(join(__dirname, "../seed/funders.json"), "utf-8");
  const funders: FunderSeed[] = JSON.parse(raw);

  console.log(`Found ${funders.length} funders. Upserting…`);

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

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
