# Izveštaj migracije kataloga

## Podaci

Produkcioni API URL nije bio zapisan u repozitorijumu, a javni sajt tokom migracije nije mogao da vrati katalog. Zato postojeće produkcione cene i slugovi nisu mogli bezbedno da se eksportuju. Nijedna cena nije izmišljena: svih 20 proizvoda ima `priceRsd: null` i prikazuje „Cena na upit“.

Nazivi, vidljivi SKU brojevi i 20 postojećih lokalnih fotografija sačuvani su. Za sliku `Rođendanska kutija Radost.png` nije pretpostavljen SKU `NFL-BIR-002`; privremeno je korišćen eksplicitan `NFL-BIR-RADOST`. U repozitorijumu nema fotografije za mogući `NFL-ANN-006`, pa takav proizvod nije izmišljen.

- Ukupno proizvoda: **20**
- Sa potvrđenom cenom: **0**
- „Cena na upit“: **20**
- Sa lokalnom slikom: **20**
- Bez lokalne slike: **0**
- Nereferencirane fotografije proizvoda: **0**

## Mapiranje

Svaki proizvod trenutno referencira istoimeni postojeći PNG iz `public/proizvodi`. Fajlovi nisu konvertovani ili preimenovani u ovoj promeni zato što je zahtev bio da se ne kreiraju binarni fajlovi. Tekstualna jednokratna Sharp skripta je spremna za buduću, izričito odobrenu optimizaciju.

## Potrebna potvrda vlasnika

Pre gašenja starih servisa vlasnik treba da uporedi JSON sa poslednjim PostgreSQL eksportom i dopuni potvrđene cene, originalne slugove, varijante i eventualne javne poslovne podatke. Render treba ugasiti tek posle Netlify produkcionog QA-a i završnog backup-a baze.
