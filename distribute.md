# Eventer — Campus Beta Distribution Guide

How to ship Eventer to Dartmouth students as a **quick internal campus beta** — not a public App Store / Play Store launch.

Eventer is an **Expo SDK 56** mobile app (`com.eventer.app`). Testers install real iOS/Android builds; they do **not** use Expo Go for this beta.

**Related docs:** [README.md](README.md) (app ↔ API contract), [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/), [EAS Build](https://docs.expo.dev/build/introduction/), [Internal distribution](https://docs.expo.dev/build/internal-distribution/), [EAS Submit / TestFlight](https://docs.expo.dev/submit/introduction/).

---

## 1. Strategy (recommended)

| Platform | Method | Why |
| -------- | ------ | --- |
| **Android** | EAS **internal** build → **APK** install link | Fastest path; no Play Store required |
| **iOS** | EAS **production**/store build → **TestFlight** | Works for many campus testers without collecting UDIDs |
| **Discovery** | One **landing page** + QR codes | Single place for “Install on iOS / Android” |

**Avoid for a broad campus beta:**

- **Expo Go** — fine for developers, not a product install
- **iOS Ad Hoc only** — capped at 100 devices/year; every new phone needs registration + a rebuild
- **Direct public IPA download** — not a viable install path for normal users
- **Public App Store / Play Store** — right for a later full launch, extra review and metadata work

If you can only ship one platform first: **Android APK this week**, then add **TestFlight** once the Apple Developer account is ready.

---

## 2. Prerequisites

### Accounts & cost (approximate)

| Account | Needed for | Notes |
| ------- | ---------- | ----- |
| [Expo](https://expo.dev) account | EAS Build, install URLs | Free tier is enough to start |
| [Apple Developer Program](https://developer.apple.com/programs/) (~$99/year) | iOS TestFlight or Ad Hoc | **Required for any real iOS beta** |
| [App Store Connect](https://appstoreconnect.apple.com) app record | TestFlight | Bundle ID must match `com.eventer.app` |
| Google Play Console (~one-time fee) | Optional for beta | **Not required** if you only ship APKs |
| Domain / static hosting | Landing page | GitHub Pages, Cloudflare Pages, Netlify, Vercel, etc. |

### Project identifiers (already in `app.json`)

| Field | Value |
| ----- | ----- |
| App name | Eventer |
| Expo slug | `eventer` |
| iOS bundle ID | `com.eventer.app` |
| Android package | `com.eventer.app` |
| App version | `1.0.0` |

### Backend (blocking)

Phones on campus Wi‑Fi or cellular **cannot** reach `localhost`. Before any beta build:

1. Host the Eventer backend with a public **HTTPS** URL (e.g. `https://api.example.com`).
2. Confirm `GET https://…/api/events/` returns JSON from a phone browser or `curl`.
3. Bake that URL into the native build via `EXPO_PUBLIC_API_URL` (see §4). Values are **embedded at build time** — changing `.env` locally does not update an already-installed APK/IPA.

Also set a production [Stadia Maps](https://client.stadiamaps.com/dashboard/) key as `EXPO_PUBLIC_STADIA_API_KEY` so map tiles work for testers.

---

## 3. Week-one checklist

Use this as the ordered runbook:

1. [ ] Host API on HTTPS; verify from a phone network
2. [ ] Create Expo account; install EAS CLI; log in
3. [ ] Run `eas build:configure` (creates `eas.json` — none exists in the repo yet)
4. [ ] Add build profiles + env vars for preview/beta (§4)
5. [ ] (iOS) Enroll in Apple Developer; create App Store Connect app for `com.eventer.app`
6. [ ] Build Android internal APK; smoke-test on a physical device
7. [ ] Build iOS → submit to TestFlight; invite first internal testers
8. [ ] Publish a one-page beta site with both install links + QR (§7)
9. [ ] Invite a small wave first (e.g. 20–50 students); collect bug reports
10. [ ] Rebuild when API URL, map key, or critical fixes change

---

## 4. EAS setup

Docs target: [Configure with eas.json](https://docs.expo.dev/build/eas-json/).

### 4.1 Install and configure

```bash
npm install -g eas-cli
eas login
cd /path/to/Eventer_Frontend
eas build:configure
```

That creates `eas.json` at the project root. Link the project to an Expo project when prompted.

### 4.2 Suggested `eas.json` for campus beta

After `eas build:configure`, adjust profiles toward something like:

```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://YOUR-PRODUCTION-API.example.com",
        "EXPO_PUBLIC_STADIA_API_KEY": "YOUR_STADIA_KEY"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://YOUR-PRODUCTION-API.example.com",
        "EXPO_PUBLIC_STADIA_API_KEY": "YOUR_STADIA_KEY"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Profile roles**

| Profile | Use |
| ------- | --- |
| `development` | Dev client for engineers (optional for campus beta) |
| `preview` | **Android beta APK** + optional iOS Ad Hoc (`distribution: "internal"`) |
| `production` | **iOS → TestFlight / App Store** via EAS Submit (store-signed binary) |

**Secrets tip:** Prefer [EAS environment variables / secrets](https://docs.expo.dev/eas/environment-variables/) over committing API keys in `eas.json`. Do not commit real Stadia keys to git.

`EXPO_PUBLIC_*` vars are read by the app via `process.env` (see `src/api/client.ts`, `src/config/mapConfig.ts`), with fallbacks from `app.json` → `expo.extra`.

### 4.3 Optional: restrict who can open install URLs

By default, EAS **internal** build URLs are open to anyone with the link. For a tighter campus beta, disable **Unauthenticated access to internal builds** in the Expo project settings so only signed-in Expo accounts on your team can open them. Then host the APK yourself on the landing page if students should install without Expo logins.

---

## 5. Android campus beta (APK)

### 5.1 Build

```bash
eas build --platform android --profile preview
```

With `"distribution": "internal"`, EAS produces an **APK** (directly installable). Confirm the profile uses APK (`buildType: "apk"` or the internal-distribution default) — **AAB** is for Play Store, not email/QR sideloading.

### 5.2 Share with testers

1. When the build finishes, EAS shows a **install page URL**.
2. Put that URL (or a hosted copy of the `.apk`) on the landing page as **Download for Android**.
3. Optional: download the artifact from the Expo dashboard and upload to Google Drive / campus CDN if you want a stable non-Expo URL.

### 5.3 Install instructions (for students)

1. Open the Android link on the phone (not a laptop).
2. If prompted, allow **Install unknown apps** / installs from the browser.
3. Open the downloaded APK and install.
4. Launch **Eventer**; confirm events load (API + network OK).

### 5.4 Smoke-test before inviting campus

- [ ] Cold start → onboarding or main map
- [ ] Events list loads from production API
- [ ] Map tiles render (Stadia key)
- [ ] Tap marker → preview sheet
- [ ] Set reminder / hide event (local features)
- [ ] Airplane mode → cached data / “Last updated” behavior

---

## 6. iOS campus beta

You need an **Apple Developer** account. Two options:

| Option | Scale | Friction | Recommendation |
| ------ | ----- | -------- | -------------- |
| **TestFlight** | Up to ~10k external testers | App Store Connect setup; short Beta App Review for external groups | **Preferred for campus** |
| **Ad Hoc (EAS internal)** | ≤ 100 devices/year | Collect UDID per device; rebuild/resign when devices change | Tiny closed group only |

### 6.1 TestFlight (recommended)

1. In [App Store Connect](https://appstoreconnect.apple.com), create an app with bundle ID **`com.eventer.app`**.
2. Build a store-ready iOS binary:

   ```bash
   eas build --platform ios --profile production
   ```

3. Submit to App Store Connect (uploads to TestFlight; does **not** publish on the public App Store):

   ```bash
   eas submit --platform ios --latest
   ```

   Or build + submit in one step:

   ```bash
   eas build --platform ios --profile production --auto-submit
   ```

4. Wait for Apple processing (often ~10–15 minutes; can be longer).
5. In TestFlight:
   - **Internal testing** — App Store Connect users on your team (up to 100); available immediately after processing
   - **External testing** — Public/invite link for students; may require a short **Beta App Review** the first time
6. Copy the **public TestFlight link** onto the landing page as **Install on iOS**.

**Student install steps:** Install **TestFlight** from the App Store → open your link → Install Eventer → open and accept test invites if prompted.

Docs: [EAS Submit](https://docs.expo.dev/submit/introduction/), [Submit to Apple](https://docs.expo.dev/submit/ios/).

### 6.2 Ad Hoc / EAS internal (small group only)

Use only if TestFlight is impossible and the tester set is tiny.

```bash
eas device:create    # each tester registers device (QR / URL)
eas device:list
eas build --platform ios --profile preview   # distribution: internal
```

- Only devices registered **at build time** can install.
- Adding a phone later → register device → **new build** or `eas build:resign` with refreshed ad hoc profile.
- New/renewed Apple memberships: Apple may take **24–72 hours** before a newly registered device works in profiles.

Docs: [Internal distribution](https://docs.expo.dev/build/internal-distribution/).

---

## 7. Campus landing page

Testers should not need GitHub or Expo accounts (except if you locked internal build URLs). Ship a **single page**:

### Content

- App name / short pitch (campus events on a map)
- **Install on iOS** → TestFlight URL
- **Download for Android** → EAS APK page or direct `.apk`
- Optional: known issues, version/`build` number, how to report bugs (email, Discord, Form)
- Optional: “Requires Dartmouth network?” — only if your API is campus-IP-restricted (prefer public HTTPS so testers off-campus still work)

### Hosting options

| Host | Fit |
| ---- | --- |
| GitHub Pages / Cloudflare Pages / Netlify / Vercel | Static HTML; free SSL |
| Google Sites | Fastest non-code page |
| EAS Hosting | Better if you later ship an Expo Router **web** app; not required for a pure download page |

### QR codes

Generate QR codes pointing at the **landing page** (not separate posters for iOS vs Android). Put them on dining hall posters, group chats, Dartmouth App group, etc.

### Security / tone

- Label clearly as **beta** — expect crashes; ask for feedback
- Cap the first invite list so feedback is readable
- Do not put secrets (Stadia keys, admin URLs) on the public page

---

## 8. Releasing updates during the beta

| Change type | What to do |
| ----------- | ---------- |
| JS/UI fix only | New EAS Build for each platform (or add [EAS Update](https://docs.expo.dev/eas-update/introduction/) later for OTA JS updates) |
| `EXPO_PUBLIC_*` or native config | **Must rebuild** — env is baked into the binary |
| Backend-only fix | Redeploy API; usually **no** app rebuild if the contract is unchanged |
| New Android APK | Replace link / notify testers to reinstall |
| New iOS build | Upload to TestFlight; testers update via TestFlight |

Bump `expo.version` / build numbers when you want testers to distinguish builds (`app.json` version is currently `1.0.0`).

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| App installs but no events | Wrong or unreachable `EXPO_PUBLIC_API_URL` | Rebuild with HTTPS API; test URL on phone |
| Map blank / tiles fail | Missing/invalid Stadia key | Set `EXPO_PUBLIC_STADIA_API_KEY` and rebuild |
| Android “blocked” install | Unknown-sources policy | Allow installs for that browser/files app |
| iOS Ad Hoc “Unable to install” | Device UDID not in profile | `eas device:create` + rebuild/resign |
| TestFlight build missing | Processing / wrong ASC app | Check App Store Connect → TestFlight; confirm bundle ID |
| Build fails on credentials | First-time signing | Run interactive `eas build` and let EAS manage credentials |
| Works on Wi‑Fi, fails on LTE | API only allows campus IPs | Open API to the public internet (or VPN) for beta |

---

## 10. What this beta is *not*

- Not a substitute for Apple/Google **store review** for a public campus-wide App Store listing
- Not Expo Go / Metro QR for end users
- Not a desktop download site — Eventer is a **mobile** app; the “site” only hosts **install links**

---

## 11. Later: public store launch (out of scope for quick beta)

When you leave campus beta:

1. Fill App Store / Play listing metadata, screenshots, privacy answers
2. Use `production` profile; Android **AAB** for Play; iOS store build for App Review
3. Point the landing page CTAs at official store badges
4. Keep the same bundle IDs (`com.eventer.app`) so upgrades stay contiguous

---

## 12. Command cheat sheet

```bash
# One-time
npm install -g eas-cli
eas login
eas build:configure

# Android beta APK
eas build --platform android --profile preview

# iOS → TestFlight path
eas build --platform ios --profile production
eas submit --platform ios --latest
# or: eas build --platform ios --profile production --auto-submit

# iOS Ad Hoc devices (small group only)
eas device:create
eas device:list
eas build --platform ios --profile preview
```

---

## 13. Owner checklist before “open beta” message

- [ ] Production API up; sample events present
- [ ] Android APK installed on at least one physical phone
- [ ] iOS available on TestFlight (or Ad Hoc devices registered)
- [ ] Landing page live with both links + QR
- [ ] Feedback channel decided
- [ ] Message draft: what Eventer is, how to install, that it’s a beta

When those are green, send the landing-page link to the first campus wave.
