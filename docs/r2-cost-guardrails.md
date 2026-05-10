# R2 Cost Guardrails

This project treats public R2 media as a low-budget, fail-closed surface. The goal is to keep podcast audio, radar infographics, and cover art available without leaving a runaway billing path open.

Current default: keep public podcast media on GitHub Pages. Use R2 only after a custom Cloudflare media domain, cache rules, and rate limits are ready.

## Current Dashboard State

- R2 bucket: `ggsdda-media`
- Budget alert: `R2 emergency budget alert - $1`
- Public development URL: disabled
- Custom R2 domain: not connected yet
- Cloudflare zone/domain: none found in the dashboard

GitHub Pages feed and media URLs are the active public podcast delivery path.

## Guardrail 0: R2 Is Explicit Opt-In

Radar generation keeps media on GitHub Pages unless local `.env` explicitly contains:

```bash
R2_ENABLED=1
```

Leave `R2_ENABLED` unset or `0` while this project is still in the low-traffic interest-project phase.

## Guardrail 1: Custom Domain Before Production

Do not use `r2.dev` as the long-term public media host. Cloudflare documents `r2.dev` as a non-production development URL, and Cache/WAF/Bot controls require a custom domain.

Once a Cloudflare zone exists in this account:

1. Add a media hostname, for example `media.example.com`.
2. Connect `media.example.com` to the `ggsdda-media` bucket in R2 settings.
3. Update local `.env` only:

   ```bash
   R2_ENABLED=1
   R2_PUBLIC_BASE=https://media.example.com
   ```

4. Dry-run the URL rewrite:

   ```bash
   npm run assets:migrate:r2 -- --dry-run --public-base https://media.example.com
   ```

5. Run the real migration with the same custom domain.
6. Verify no `r2.dev` URLs remain:

   ```bash
   npm run audit:r2-public-urls
   ```

7. Keep the R2 public development URL disabled.

## Guardrail 2: Cache Rules

After the custom domain is active, create a Cache Rule for the media hostname.

Recommended match expression:

```text
http.host eq "media.example.com" and (
  starts_with(http.request.uri.path, "/audio/radar/") or
  starts_with(http.request.uri.path, "/images/radar/") or
  http.request.uri.path eq "/images/podcast-cover.jpg"
)
```

Recommended settings:

- Cache eligibility: Eligible for cache
- Edge TTL: ignore origin cache-control and cache for 30 days
- Browser TTL: 1 day for `podcast-cover.jpg`; 7 to 30 days for versioned episode media

If cover art becomes versioned, raise the browser TTL to match the other immutable assets.

## Guardrail 3: Budget Alerts

The dashboard has a `$1` budget alert. This is intentionally tiny: it should fire while there is still time to react.

Budget alerts are only notifications; they do not stop traffic or cap spend. Treat any alert email as an incident:

1. Check R2 and cache analytics.
2. If traffic looks abusive, enable the emergency kill switch below.
3. Only then investigate whether the threshold should be raised.

## Guardrail 4: WAF And Rate Limiting

After the custom domain is active, add rate limiting rules for the media hostname.

Start conservative:

```text
http.host eq "media.example.com" and starts_with(http.request.uri.path, "/audio/radar/")
```

- Characteristic: IP
- Period: 10 minutes
- Threshold: 60 requests
- Action: Block
- Mitigation timeout: 10 minutes

Add a second rule for image paths:

```text
http.host eq "media.example.com" and (
  starts_with(http.request.uri.path, "/images/radar/") or
  http.request.uri.path eq "/images/podcast-cover.jpg"
)
```

- Characteristic: IP
- Period: 10 minutes
- Threshold: 120 requests
- Action: Block
- Mitigation timeout: 10 minutes

Keep these rules scoped to the media hostname so normal site browsing is not affected.

## Local Fail-Closed Checks

R2 publishing is disabled unless `R2_ENABLED=1`. When enabled, the R2 helper refuses to generate new public URLs if `R2_PUBLIC_BASE` points to `r2.dev`. This blocks accidental future publishing through the development URL.

Emergency override:

```bash
ALLOW_R2_DEV_PUBLIC_BASE=1 npm run assets:migrate:r2
```

Use the override only when deliberately migrating away from `r2.dev`, and do not commit secrets or local `.env` values.

Useful checks:

```bash
npm run check:r2-public-base
npm run audit:r2-public-urls
```

`audit:r2-public-urls` should pass while podcast media is served from GitHub Pages or a future custom media domain.

## Emergency Kill Switch

If an attack or runaway usage starts before custom-domain controls exist and R2 public access has been re-enabled:

1. Go to R2 > `ggsdda-media` > Settings.
2. Disable the Public Development URL.
3. Accept that podcast/media URLs using `r2.dev` will stop working.

After the custom domain is active, prefer a WAF block rule on the media hostname so the bucket settings can remain stable.
