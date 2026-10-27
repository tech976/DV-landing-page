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

## Receiving leads

Leads are only logged to the browser console until a webhook is set.
In `js/app.js`, set `WEBHOOK_URL` to a Google Apps Script, Zapier, Make or CRM
endpoint. The lead is POSTed as JSON (sent as `text/plain` to avoid CORS
preflight) with these fields:

`source, submitted_at, goal, industry, monthly_budget, platforms, problem,
timeline, website_or_instagram, callback_slot, first_name, last_name, phone,
email, whatsapp_opt_in, page`

## Flow notes

- Picking **"Just exploring"** on the timeline step ends the form and sends
  the visitor to the website instead of asking for contact details.
- Phone must be a 10-digit Indian mobile starting 6–9; pasted numbers with
  `+91` or a leading `0` are cleaned automatically.
