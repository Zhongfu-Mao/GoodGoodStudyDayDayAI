# AI Radar Audit Logs

This directory stores non-public audit evidence for AI Radar production runs.
These files are for traceability only and must not be copied into public Markdown.

Each daily run should create `YYYY-MM-DD.json` with:

- `date`, `cadence`, `langPair`
- `sourceVisits`: every active source checked, access route, status, and failure reason if any
- `candidateItems`: discovered candidates, discovery source, canonical URL, decision, and rejection reason
- `publishedItems`: final item order, public source label, discovery source, canonical URL, section
- `dedupe`: previous-day/window checks and any allowed follow-up rationale
- `newsletter`: Gmail/public confirmation route, subject/title, public link, and read-state action
- `validation`: command results for newsletter/source/schema/dedupe/build checks

Do not include Gmail message IDs, `mail.google.com` URLs, local browser state paths, auth state, or NotebookLM notebook IDs unless the user explicitly requests a private forensic export.

