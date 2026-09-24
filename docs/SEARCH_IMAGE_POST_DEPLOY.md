# Google Search image QA posle objave

Google samostalno određuje izgled rezultata pretrage. Implementirani signali povećavaju tehničku podobnost za kvalitetne prikaze slika, ali ne garantuju prikaz četiri slike.

Posle produkcione objave:

1. U Google Search Console otvoriti **URL Inspection** za `https://cvecarairig.rs/`, pokrenuti **Test Live URL**, proveriti dostupnost i izabrati **Request indexing**.
2. Ponoviti pregled i zahtev za indeksiranje za stranice proizvoda `rodjendanska-kutija-pastel-deluxe`, `buket-sunce-za-rodjendan` i `premium-ruze-za-rodjendan`.
3. Poslati `https://cvecarairig.rs/sitemap.xml` i, ako Search Console prihvati zasebno slanje, `https://cvecarairig.rs/image-sitemap.xml`.
4. Direktno proveriti četiri istaknute PNG adrese: očekuju se HTTP 200, `Content-Type: image/png`, bez autentifikacije i petlje preusmerenja.
5. Pokrenuti Google Rich Results Test za nekoliko proizvoda i otkloniti kritične greške. Ne dodavati izmišljene vrednosti radi uklanjanja upozorenja za opciona polja.
6. Pratiti pokrivenost nakon ponovnog popisivanja. Ponovno popisivanje, obrada strukturiranih podataka i promena SERP prikaza mogu trajati od nekoliko dana do više nedelja.
