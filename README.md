# Online Cvećara Irig

Statički, mobilno prilagođen storefront za `cvecarairig.rs`. Next.js generiše kompletan sajt u `apps/web/out`, a Netlify ga objavljuje kao obične statičke fajlove.

## Arhitektura

- **Aplikacija:** Next.js App Router, TypeScript i Tailwind CSS u `apps/web`.
- **Izvor podataka:** Git verzionisani JSON fajlovi u `apps/web/data`.
- **Slike:** lokalni resursi u `apps/web/public/proizvodi`, koje u produkciji servira Netlify.
- **Poručivanje:** telefonom; nema onlajn checkout-a, korisničkih naloga ni admin panela.
- **Infrastruktura:** nema runtime backend-a, baze podataka, CMS-a ili udaljenog servisa za slike.

## Lokalni rad

Potrebni su Node.js 22 i npm.

```bash
cd apps/web
npm ci
npm run validate:catalog
npm run dev
```

Provere pre objave:

```bash
npm run validate:catalog
npm run lint
npm run type-check
npm run build
```

`npm run build` pravi statički `apps/web/out`. Katalog se validira i kao deo build komande, pa neispravni podaci ne mogu tiho proizvesti prazan sajt.

## Podešavanja

Javni identitet, telefon, e-pošta, radno vreme, područje i pravila dostave nalaze se u `apps/web/data/store.json`. Aplikaciji nisu potrebne runtime environment promenljive ni tajne.

Detaljan postupak održavanja kataloga nalazi se u [docs/CATALOG_MAINTENANCE.md](docs/CATALOG_MAINTENANCE.md), a stanje migracije slika i podataka u [docs/MIGRATION_REPORT.md](docs/MIGRATION_REPORT.md).
