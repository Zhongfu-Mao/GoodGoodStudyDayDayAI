# R2 media delivery and cost guardrails

## Current delivery policy (2026-09-29)

The website remains on GitHub Pages. All radar MP3 audio and PDF decks are served from R2. Radar images referenced by a report within the previous calendar month stay in `public/` and travel with Pages; older referenced images move to R2. The cutoff is inclusive: on 2026-09-29, images referenced on or after 2026-08-29 stay local. Shared images use their latest referring report date. Undated shared artwork and podcast covers stay local.

The user authorized public access on 2026-09-29 after private staging. The `ggsdda-media` bucket's public development URL is enabled temporarily:

`https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev`

This is a deliberate temporary exception to the custom-domain guardrail. Cloudflare documents `r2.dev` as rate-limited and unsuitable for production; it lacks the custom-domain cache and WAF controls. A successful request is not a production reliability guarantee. No domain or paid Workers plan has been purchased.

- Standard storage; the staged inventory was about 4.65 GB including preserved legacy objects.
- CORS allows only GET/HEAD from `https://zhongfu-mao.github.io`, `http://localhost:4321`, and `http://127.0.0.1:4321`.
- Allowed request header: `Range`; exposed response headers: `Accept-Ranges`, `Content-Range`, `Content-Length`, `ETag`.
- Public Range responses for audio, PDF and images were verified on 2026-09-29.
- The historical `$1` alert has **not** been freshly verified. Alerts are notifications, not spending caps.
- Standard free tier: 10 GB-month storage, 1 million Class A and 10 million Class B operations per month; overages are billable. Current pricing: https://developers.cloudflare.com/r2/pricing/ . Public-access limitations: https://developers.cloudflare.com/r2/buckets/public-buckets/ .

## Safe staging and cutover

Only Git-tracked accepted media is staged; untracked corrected candidates/backups are not accepted publication assets. Staging preserves conflicting legacy objects under their original keys and records hash-versioned replacement keys. Never construct cutover URLs from filenames alone.

```sh
npm run assets:migrate:r2 -- --upload-only --manifest tmp/r2-migration/DATE/staged.json
npm run assets:migrate:r2 -- --upload-only --verify-only --manifest tmp/r2-migration/DATE/staged.json
node scripts/radar/cutover-assets-to-r2.mjs --manifest tmp/r2-migration/DATE/staged.json --as-of YYYY-MM-DD --public-base https://PUBLIC_HOST
# Review the dry-run counts, then repeat with --apply.
```

The cutover requires a completed, independently verified staging manifest. It hashes originals again, verifies every selected public object's size, ETag and CORS before modifying any content, rewrites exact local references using the manifest's actual keys, preserves audio sizes and feed GUIDs, and moves originals into ignored `.cache/r2-cutover/DATE/`. Original content snapshots are also retained there. Back up this cache before clearing local caches. The script does not push or rewrite Git history.

Repeat staging/verification/cutover when images age out of the retention window, using a new date and manifest after committing the previous cutover. This is an explicit maintenance operation, not a background scheduler or an R2 deletion lifecycle rule. Existing Git history still contains old media; removing current files reduces Pages output but does not shrink clone history.

After cutover, run the Pages-base-path build and relevant asset, podcast and deck preview tests. Old direct GitHub Pages asset URLs will cease working once removal is deployed; feed GUIDs remain stable, but podcast clients holding old enclosure URLs may need to refresh their feed.

## New media generation

Local `.env` explicitly opts into R2:

```sh
R2_ENABLED=1
# Temporary only, until a custom domain is connected:
ALLOW_R2_DEV_PUBLIC_BASE=1
```

New images stay local. The publishing helper uploads audio/PDF with checksum verification and preserves conflicting remote objects; verified originals go to ignored `.cache/r2-published/` so heavy media does not return to Pages. Keep credentials and `.env` out of Git. A machine without R2 credentials keeps local output and must stage/cut over before publishing heavy media.

`npm run check:r2-public-base` checks the opt-in configuration. `npm run audit:r2-public-urls` intentionally reports/fails on the temporary `r2.dev` references; do not silence this reminder by weakening the audit.

## Custom-domain follow-up and emergency stop

Connect a user-owned domain in the same Cloudflare account and attach a media hostname to this bucket. Verify CORS and Range behavior, configure caching and available abuse controls, replace the temporary host in content, update `R2_PUBLIC_BASE`, and remove `ALLOW_R2_DEV_PUBLIC_BASE`. Validate feeds and build again before disabling the development URL. Rules and thresholds must match the actual Cloudflare plan; do not assume all WAF features are available.

For unexpected public traffic or billable usage, disable Public Development URL under R2 > `ggsdda-media` > Settings. This immediately breaks media served through that host. Restoring Pages delivery requires restoring originals and source snapshots, rebuilding and deploying. Budget alerts do not automatically perform this stop.
