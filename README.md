# PepCare — Research-Use-Only storefront

A fast, animated, fully static storefront for **scientific / Research-Use-Only (RUO)** products
(research peptides, amino acids, reference standards, biochemical reagents). Built to deploy on
**GitHub Pages** with no build step.

> ⚗ **Compliance:** Every product is presented **For Research Use Only — not for human or veterinary
> consumption**. The site ships with full Terms, Privacy, Refund, Shipping, and a dedicated
> *Research Use Only & Acceptable Use* policy. Presenting your business accurately like this is what
> keeps a payment-processor merchant review from flagging **misrepresentation**.

## ✨ Features

- **No build step** — pure HTML/CSS/JS, deploys straight to GitHub Pages.
- **Rich motion** — animated molecular-constellation hero canvas, scroll reveals, animated counters,
  springy hovers, marquee, and a Duolingo/Zomato-style **fly-to-cart** delight.
- **Full storefront** — catalog with live **search / category filter / sort**, product detail pages,
  a **localStorage cart** with slide-out drawer, favourites, and a demo checkout.
- **Generative product art** — each compound gets a unique, deterministic molecule graphic, so the
  store looks rich with **zero image assets**.
- **Light & dark mode** (with system preference + manual toggle, no flash).
- **SEO-ready** — semantic HTML, Open Graph/Twitter cards, JSON-LD (Organization, Product, FAQPage),
  `sitemap.xml`, `robots.txt`, custom `404.html`.
- **Accessible & responsive** — skip link, focus states, ARIA, `prefers-reduced-motion`, 44px touch
  targets, mobile-first from 320px up.

## 📁 Structure

```
index.html              Home (hero, categories, featured, how-it-works, features, testimonials, CTA)
products.html           Catalog (search / filter / sort)
product.html            Product detail (?slug=...)
about.html  faq.html  contact.html  checkout.html
terms.html  privacy.html  refund.html  shipping.html  compliance.html   (generated from data)
404.html
assets/
  css/   tokens · base · components · animations · pages
  js/    icons · store · layout · cart · catalog · hero · checkout
  data/  products.json · content.json · legal.json
  img/   favicon.svg · og-image.svg · grid.svg
robots.txt · sitemap.xml · site.webmanifest · .nojekyll
```

## 🚀 Run locally

It's static, but the catalog uses `fetch()`, so use a tiny server (don't open via `file://`):

```bash
npx serve .
# or
python -m http.server 8080
```

Then open the printed URL.

## 🌐 Deploy to GitHub Pages (account: PepCare)

```bash
git init
git add -A
git commit -m "feat: PepCare RUO storefront"
gh repo create Sylrix/pepcare --public --source=. --remote=origin --push
gh api -X POST repos/Sylrix/pepcare/pages -f build_type=legacy -f 'source[branch]=main' -f 'source[path]=/'
```

Your site goes live at **https://sylrix.github.io/pepcare/** (first build takes ~1 min).

> If you use a different repo name or a custom domain, do a find-and-replace of
> `https://sylrix.github.io/pepcare/` across the `.html` files (canonical/OG tags) and
> `sitemap.xml` / `robots.txt`. For a custom domain, add a `CNAME` file containing the domain.

## 🛠 Customize

| Want to change… | Edit |
|---|---|
| Products / prices / specs | `assets/data/products.json` |
| Brand name & marketing copy | `assets/data/content.json` and the static copy in `index.html` / `about.html` |
| Legal text | `assets/data/legal.json`, then re-run the legal generator (see below) |
| Colors / fonts / spacing | `assets/css/tokens.css` |
| Logo | `assets/img/favicon.svg` + the inline `brandMark` in `assets/js/layout.js` |

Rebrand from "PepCare" by replacing the name in `assets/js/layout.js`, `index.html`,
`about.html`, and `assets/data/*.json`.

## 📧 Order email notifications (1-step setup)

Checkout emails every order to the store owner via [Web3Forms](https://web3forms.com) — no backend needed:

1. Go to **web3forms.com**, enter the inbox that should receive orders (`sujalparmar586@gmail.com`).
2. Copy the **Access Key** it emails you.
3. Paste it into `WEB3FORMS_ACCESS_KEY` near the top of `assets/js/checkout.js`.

Until the key is set, orders are captured and confirmed on-screen but **not** emailed.

## 💳 Going live with real payments

Checkout currently records the customer's **preferred payment method** and emails you the order so you
can send a secure payment link (a normal flow for high-risk research suppliers). For live card/UPI
charging:

1. Choose a **high-risk-friendly, PCI-compliant** gateway (Stripe/PayPal/Square prohibit research peptides).
2. **Declare the correct merchant category honestly** — the complete site + policies here support that
   and reduce *misrepresentation* risk.
3. Wire the gateway's hosted checkout / payment-link API into `checkout.js`.
4. Connect the contact form (`contact.html`) to a backend or the same Web3Forms key.

> Note: Google Shopping / Merchant Center will likely reject peptide SKUs under the **Healthcare &
> medicines** policy regardless of RUO labelling — the realistic channel is B2B sales to verified
> research institutions, not consumer Shopping ads.

## ⚠️ Data accuracy note

Catalog identifiers (CAS numbers, formulas, prices) are realistic sample data and should be
**verified against your actual lots and COAs** before going live.
