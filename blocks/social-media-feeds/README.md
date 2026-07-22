# Social Media Feeds

Displays a combined, filterable, searchable feed of YouTube videos, Facebook posts,
and Instagram posts.

## Architecture

API tokens must never live in `social-media-feeds.js` — anything in that file ships
to every visitor's browser and is readable via View Source / the Network tab.

Instead:

1. A scheduled GitHub Action (`.github/workflows/social-media-feed.yml`) runs
   `tools/social-media-feed/fetch-feeds.mjs` **once an hour** (and on manual
   `workflow_dispatch`).
2. That script calls the YouTube/Facebook/Instagram APIs server-side, using
   tokens from GitHub Actions Secrets, and writes the combined result to
   `social-media-feed.json` at the repo root, then commits it.
3. `social-media-feeds.js` only ever fetches `/social-media-feed.json` — a
   plain static file, no secrets involved.

This means the feed updates itself with **zero manual work** as long as the
secrets below stay valid. The only thing that ever needs human attention is
renewing the Facebook/Instagram token (see **Maintenance** below).

## Required GitHub Actions secrets

Add these under **Settings → Secrets and variables → Actions → Repository secrets**:

| Secret | What it is |
| --- | --- |
| `YOUTUBE_API_KEY` | Google Cloud Console → APIs & Services → Credentials. Restricted to "YouTube Data API v3". **Never expires.** |
| `YOUTUBE_CHANNEL_ID` | The channel's ID (starts with `UC...`, 24 characters) — not a handle or URL. Find it via View Source on the channel page, search for `"channelId"`. |
| `FB_PAGE_ID` | Numeric Facebook Page ID (currently `433485486688506`). Must match **exactly** — a wrong value produces a misleading `(#100) Tried accessing nonexisting field (posts)` error instead of a clear "wrong ID" error. |
| `FB_PAGE_ACCESS_TOKEN` | Page Access Token — see below. Expires periodically, needs renewal. |
| `IG_USER_ID` | Instagram Business Account ID linked to the Page (currently `@scherzo_krakow`). |
| `IG_ACCESS_TOKEN` | Same value as `FB_PAGE_ACCESS_TOKEN` — one token covers both, since it carries both Page and Instagram permissions. |

## Maintenance — how you'll know something needs attention

The workflow **fails loudly** (red ❌ run, and GitHub's default failure email)
if the Facebook or Instagram token stops working — it doesn't fail silently.
You don't need to proactively check anything on a schedule; just act when you
get that email. The feed itself keeps serving the last good data (and other
sources like YouTube keep updating) even while one source is broken.

When you get that email:

1. Go to **Actions → Update Social Media Feed**, open the failed run, and
   read the error in the "Fetch social media feeds" step — it'll say which
   source failed and why (e.g. Facebook token expired).
2. Regenerate the token following the steps below and update the GitHub
   secret.
3. Re-run the workflow (`Run workflow` button) to confirm it's fixed.

## Getting/renewing the Facebook + Instagram token

The token is a **Page Access Token** derived from a long-lived User Access
Token belonging to an admin of the Facebook Page (currently Kazimierz
Borowicz, who also administers the linked Instagram account). It needs the
`pages_show_list`, `pages_read_engagement`, and `instagram_business_basic`
permissions.

1. **developers.facebook.com/tools/explorer** → select the app **"scherzo
   integracje"**.
2. **User or Page → Get User Access Token** → check all three permissions
   above → **Generate Access Token** → confirm as the Page admin.
3. Copy the short-lived token. Exchange it for a long-lived one (App ID/Secret
   are under the app's **Settings → Basic** — never paste the secret anywhere
   but your own browser address bar):
   ```
   https://graph.facebook.com/v23.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}
   ```
4. Paste the resulting long-lived token into the Explorer's Access Token
   field, run `me/accounts`, and copy the `access_token` next to the Page —
   that's the new Page Access Token.
5. Update both `FB_PAGE_ACCESS_TOKEN` and `IG_ACCESS_TOKEN` GitHub secrets
   with this value, then re-run the workflow.

### Why not a System User token (which never expires)?

That's the ideal long-term setup, but it requires the Page to live inside a
Business Manager portfolio the token-generating account fully controls. Ours
is owned by a separate portfolio ("Zespół Placówek Oświatowych Scherzo w
Krakowie") and cross-portfolio access requests got stuck pending approval.
Worth revisiting later if someone gets full admin access to that portfolio —
until then, the personal long-lived token above is the pragmatic path.

## Running the fetch manually

Go to **Actions → Update Social Media Feed → Run workflow** to refresh the
feed on demand.

## Local testing

```bash
YOUTUBE_API_KEY=... YOUTUBE_CHANNEL_ID=... FB_PAGE_ID=... FB_PAGE_ACCESS_TOKEN=... \
IG_USER_ID=... IG_ACCESS_TOKEN=... node tools/social-media-feed/fetch-feeds.mjs
```

This writes `social-media-feed.json`, which you can inspect directly. Check
its `errors` array — it lists any source that failed, even though the script
still exits successfully when run with no secrets at all (only a genuine API
error triggers the failing exit code used by the GitHub Action).
