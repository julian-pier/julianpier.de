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
