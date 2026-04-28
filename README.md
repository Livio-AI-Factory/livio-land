# Livio Land

The marketplace where data center operators, powered-land owners, and hyperscalers / AI labs find each other.

- **Suppliers** list DC capacity (MW, tier, PUE, cooling, rate, network) or powered land (acres, MW, PPA status, interconnection stage, water, fiber).
- **Off-takers** search by MW / location / rate / interconnection, then ask questions publicly on each listing — water, condition, PPA, process stage, etc.

## Tech stack

- Next.js 14 (App Router, Server Actions)
- TypeScript + Tailwind CSS
- Prisma + SQLite (zero-config local DB)
- Iron-session cookie auth + bcrypt

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client + create DB + seed sample data
npx prisma generate
npm run setup

# 3. Run the dev server
npm run dev
```

Open http://localhost:3000.

### Demo accounts (password: `demo1234`)

| Email | Role |
| --- | --- |
| `ops@northstar-dc.com` | DC supplier (NorthStar Data Centers) |
| `land@texasgrid.com` | Land supplier (TexasGrid Holdings) |
| `deals@cascadepower.com` | Supplier (Cascade Power Partners) |
| `demo@offtaker.com` | Off-taker (Acme AI) |

## What's built

- **Landing page** with two-sided value prop and live stats.
- **Auth** — sign up / sign in / sign out with bcrypt-hashed passwords and iron-session cookies.
- **List DC capacity** form covering: title, location, total/available MW, availability date, rate, pricing model, contract term, tier, PUE, cooling, density, network, certs.
- **List powered land** form covering: acres, MW, utility, substation distance, PPA status & price, interconnection stage, expected energization, water, water notes, fiber, zoning, asking price, deal structure (sale/lease/JV).
- **Search & browse** for both DC and land with multi-field filters.
- **Listing detail pages** with all specs and a public Q&A thread.
- **Q&A** — one-click suggested questions (water, PPA, condition, interconnection, etc.) plus owner-replies.
- **Dashboard** showing your listings, question counts, and questions you've asked.

## Project structure

```
prisma/
  schema.prisma     # User / DC / Land / Question / Answer models
  seed.ts           # Sample listings & users
src/
  app/              # Next.js App Router pages
    page.tsx                      # Landing
    layout.tsx                    # Header / footer / nav
    auth/{signin,signup}/         # Auth pages
    dashboard/                    # User dashboard
    listings/
      dc/                         # Browse + detail for DC capacity
      land/                       # Browse + detail for powered land
      new/{dc,land}/              # Listing creation forms
  components/
    listing-form.tsx              # Reusable form primitives
    search-bar.tsx                # Filter form
    q-and-a.tsx                   # Question/answer UI
  lib/
    db.ts                         # Prisma client
    session.ts                    # iron-session helpers
    auth-actions.ts               # signup / signin / signout server actions
    listing-actions.ts            # CRUD + Q&A server actions
```

## Next steps to make this launch-ready

1. **Hosting** — Deploy to Vercel + Postgres (Neon/Supabase). Update `DATABASE_URL` and switch the Prisma `provider` to `postgresql`.
2. **Real email** — Add transactional email (Resend) for account verification and Q&A notifications.
3. **NDA / verified buyer flow** — Some suppliers won't want to publish exact PPA prices publicly; add a "request access" gate.
4. **Map view** — Add a Mapbox / Google Maps view for land listings.
5. **Saved searches & alerts** — Let off-takers subscribe to "new listings matching X MW in Y region."
6. **Messaging** — Direct (private) messaging in addition to public Q&A.
7. **Listing verification badges** — Verified utility letter, verified LGIA, verified water rights.
8. **Photos / documents** — Upload site photos, one-pagers, drone footage to listings.
