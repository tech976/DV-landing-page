# DigiVeritaz — Performance Marketing Audit Landing Page

Mobile-first lead funnel for DigiVeritaz's free performance marketing audit.
Visitors answer one question per screen (goal, industry, budget, channels,
problem, timeline, website, callback slot, contact details) and book a callback.

## Structure

```
index.html       Page markup — one <section class="screen"> per step
css/styles.css   All styles (tokens, layout, form, buttons)
js/app.js        Step navigation, validation and lead submission
```

Plain HTML/CSS/JS — no build step or dependencies.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Receiving leads — DigiVeritaz CRM

Completed submissions POST straight to the CRM's website-lead webhook
(`POST https://crm.digiveritaz.tech/api/website/lead`). Sent as `text/plain`
with `{mode:"no-cors"}` to avoid a CORS preflight, so the shared secret travels
in the request body.

**Before going live**, in `js/app.js` set:

```js
var WEBHOOK_SECRET = "PASTE_WEBSITE_LEAD_SECRET_HERE"; // = the CRM's WEBSITE_LEAD_SECRET
```

⚠ This is a client-side page, so the secret is visible in the page source. It
only authorises creating website leads. To hide it, relay through a Google
Apps Script instead (point `WEBHOOK_URL` at the script and move the secret into
the script).

The CRM maps the funnel onto its lead schema (`fullname, email, phone, budget,
services[], message, _source, _page, status`); the quiz answers (goal,
industry, timeline, callback window, website, WhatsApp opt-in) are folded into
`message`. Ad attribution (every `utm_*`, `gclid`, `fbclid`, `gbraid`, `wbraid`
in the landing URL, plus referrer and device) is captured automatically, and
leads are deduped by phone/email. They land in the CRM Leads inbox as source
**Website**, form **Performance Audit funnel**.

## Flow notes

- Picking **"Just exploring"** on the timeline step ends the form and sends
  the visitor to the website instead of asking for contact details.
- Phone must be a 10-digit Indian mobile starting 6–9; pasted numbers with
  `+91` or a leading `0` are cleaned automatically.
