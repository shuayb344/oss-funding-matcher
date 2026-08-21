# Show HN: OSS Funding Matcher — Find real funding for your open source project

**URL:** [oss-funding-matcher.vercel.app](https://oss-funding-matcher.vercel.app)

---

Hey HN,

I built a tool that helps open source maintainers find and apply for real funding.

**The problem:** Under 10% of widely-used open source projects have any funding model. Meanwhile, there are 43+ active funding programs (GitHub Secure Open Source Fund, Spotify FOSS Fund, NLnet, CZI, etc.) that most maintainers don't know about or don't know they qualify for.

**What it does:**
1. You sign in with GitHub (read-only access to public repos)
2. We analyze your repos using a JS reimplementation of OpenSSF's criticality scoring methodology
3. AI matches your projects against 18+ verified funding programs with honest reasoning
4. You get a tailored pitch draft — copy, edit, and send it yourself

**Tech stack:** Next.js 16, Supabase (Postgres), Auth.js, GitHub OAuth. Fully free — no credit card required for any part of the stack.

**Key design decisions:**
- Criticality scoring reimplemented in JS (the original is a Go CLI — awkward for serverless)
- Honest framing: we don't auto-submit applications. Most funders use nomination or open calls, so we give you a ready-to-send pitch, not a false promise
- For nomination-based funders (Spotify, Microsoft), we frame the output as "here's a case you can send to someone who works there" rather than pretending there's a submit button

**What I'd love feedback on:**
- Is the scoring methodology useful or should I show more/fewer factors?
- Are there funding programs I'm missing?
- Is the "honest framing" for nomination-based funders actually useful or just confusing?

**What's NOT built yet:**
- Public shareable pages for individual repos (coming soon)
- More detailed scoring breakdowns per repo
- Integration with oss.fund's full directory

Built this because I kept seeing maintainers of critical infrastructure projects saying "I had no idea this grant existed." The information is out there — it just needs to be surfaced.

---

*Source code will be open-sourced after initial launch feedback.*
