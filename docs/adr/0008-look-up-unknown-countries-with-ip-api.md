---
status: deprecated
---

# Look up a buyer's country with ip-api.com when the request does not carry one

> **Deprecated.** The ip-api.com lookup has been removed. `resolveCountry` now reads only the `CF-IPCountry` header (and the dev override). When the country is unknown, the buyer is charged full price, so a page never waits on a network call. We chose the option listed below as rejected: occasionally overcharging a buyer whose country is unknown costs less than adding latency to the course list, purchase and lesson pages, depending on a plain-HTTP endpoint, and living with its 45 requests-a-minute limit. Don't bring back a per-request geo-IP lookup without solving those problems.

Purchasing-power prices depend on the buyer's country. Behind Cloudflare the request carries it in the `CF-IPCountry` header, but not every request comes through Cloudflare. When the header is missing, `resolveCountry` looks up the first `X-Forwarded-For` address on ip-api.com's free endpoint, and only falls back to full price if that lookup fails.

## Considered Options

- **Bundle a MaxMind GeoLite2 database.** Rejected: it needs a licence key, a download of tens of megabytes, and an update every month.
- **Charge full price whenever the country is unknown.** Rejected: it overcharges exactly the learners purchasing-power pricing is for.

## Consequences

The course list, the purchase page and every lesson page for a discounted purchase can wait on a network call. The free endpoint is plain HTTP and limited to 45 requests a minute.
