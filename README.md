# julianpier.de

Statische Website ohne Build-Schritt oder externe Abhängigkeiten.

## Cloudflare Workers Static Assets

Die öffentlich deploybaren Dateien liegen ausschließlich in `public/`. Die
Konfiguration in `wrangler.jsonc` veröffentlicht dieses Verzeichnis als
Cloudflare Workers Static Assets.

Deployment:

```sh
npx wrangler deploy
```

Die Telefonnummer wird zentral am Anfang von `public/assets/site.js` gepflegt.

## SEO und Indexierung

- Die kanonische Website ist `https://julianpier.de/`.
- `public/robots.txt` erlaubt das Crawling der öffentlichen Website und verweist
  auf `https://julianpier.de/sitemap.xml`.
- Die Sitemap enthält ausschließlich die öffentliche Startseite. Die
  Datenschutzseite ist bewusst mit `noindex, follow` gekennzeichnet.
- LIVA läuft separat unter `liva.julianpier.de`, ist nicht Teil dieses Deployments
  und muss dort eigenständig gegen Indexierung geschützt bleiben.

Nach dem Deployment sollte in Google Search Console die Property
`https://julianpier.de/` bestätigt, die Sitemap eingereicht und anschließend für
die Startseite eine Indexierung angefordert werden.

Die kanonische Host-Weiterleitung lässt sich nicht über die `_redirects`-Datei
von Workers Static Assets konfigurieren. In Cloudflare müssen daher zusätzlich
permanent eingerichtet werden:

- HTTP auf HTTPS für `julianpier.de`
- ein proxied DNS-Eintrag für `www.julianpier.de`
- eine `301`-Redirect-Regel von `www.julianpier.de/*` auf
  `https://julianpier.de/$1`
