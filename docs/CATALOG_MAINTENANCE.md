# Održavanje kataloga

## Dodavanje proizvoda

1. Pripremite kvadratnu izvornu fotografiju i optimizujte je lokalno:
   ```bash
   cd apps/web
   node scripts/optimize-product-images.mjs /putanja/izvor.png public/proizvodi/nfl-sku-001.webp
   ```
2. Koristite kratak ASCII naziv bez razmaka, dijakritike i znakova interpunkcije. Preporuka je malo slovo SKU-a, npr. `nfl-bir-013.webp`.
3. Dodajte objekat u `data/products.json`. Svaki aktivan proizvod mora imati potvrđenu pozitivnu prodajnu cenu. `priceRsd` je ceo broj u dinarima, na primer `8990` znači 8.990 RSD; nemojte koristiti `null`. Proizvod bez potvrđene cene ne objavljujte: postavite `"active": false` dok cena ne bude određena.
4. Postavite `image` na lokalnu putanju, npr. `/proizvodi/nfl-bir-013.webp`, i koristite postojeći `categoryId` iz `categories.json`.
5. Pokrenite:
   ```bash
   npm run validate:catalog
   npm run lint
   npm run type-check
   npm run build
   ```
6. Proverite stranicu proizvoda, zatim commit i push. Netlify automatski objavljuje novi statički build.

Optimizacija slika nije deo produkcionog builda. Skripta koristi najdužu stranicu do 1200 px, WebP kvalitet 83 i zadržava odnos stranica.

## Izmena i privremeno isključivanje

- Sačuvajte postojeći `slug` da indeksirani URL ostane stabilan.
- Cene su dinari, ne pare.
- `compareAtPriceRsd` ostavite `null` osim kada postoji stvarno i trenutno važeće poređenje redovne i snižene cene.
- Za privremeno uklanjanje postavite `"active": false`; proizvod tada nije u katalogu, sitemap-u niti statičkim rutama.
- Podatke o prodavnici menjajte isključivo u `data/store.json`.
