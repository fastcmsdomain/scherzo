# Social Media Board / Tablica Social Media (Facebook + Instagram)

Ten plik opisuje blok **Social Media Board** dla **AEM Edge Delivery Services (EDS)** z authoringiem w **Google Drive (Google Docs)**.

This file documents the **Social Media Board** block for **AEM Edge Delivery Services (EDS)** with **Google Drive (Google Docs)** authoring.

---

## Co robi ten blok? / What does this block do?

- Wyświetla siatkę (grid) postów z **Facebooka** i **Instagrama**.
- Ma **filtrowanie**, **wyszukiwarkę** i przycisk **“Load more”**.
- Pobiera dane wyłącznie z Twojego **server-side proxy** (bez tokenów po stronie przeglądarki).

- Renders a grid “board” of **Facebook** + **Instagram** posts.
- Includes **filters**, **search**, and **load more** pagination.
- Fetches data only from your **server-side proxy** (no tokens in the browser).

> Ważne / Important: **Nigdy** nie wywołuj Meta Graph API bezpośrednio z frontend JS i **nigdy** nie umieszczaj tokenów w Google Docs ani w kodzie bloku.

---

## Autorowanie w Google Docs / Authoring in Google Docs

### 1) Wstaw tabelę 2‑kolumnową / Insert a 2‑column table

1. Utwórz tabelę w Google Docs z **2 kolumnami** i co najmniej **2 wierszami**.
2. W pierwszym wierszu (nagłówek tabeli) wpisz: `Social Media Board`.
3. W kolejnych wierszach podaj konfigurację jako **klucz / wartość**.

1. Create a Google Docs table with **2 columns** and at least **2 rows**.
2. In the first row (table header) type: `Social Media Board`.
3. Add **key/value** configuration in the following rows.

### Minimalna konfiguracja / Minimal config

| Social Media Board | |
|---|---|
| proxy | https://example.com/api/social |

### Pełna konfiguracja / Full config

| Social Media Board | |
|---|---|
| proxy | /api/social |
| sources | all |
| page-size | 18 |
| max-items | 50 |
| show-filters | true |
| show-search | true |

---

## Opcje konfiguracji / Configuration options

| Klucz / Key | Wartość / Value | Wymagane / Required | Domyślnie / Default | Opis / Notes |
|---|---|---:|---:|---|
| `proxy` | URL | ✅ | — | Endpoint proxy zwracający JSON (patrz niżej). **Bez tokenów.** / Proxy endpoint returning JSON (see below). **No tokens.** |
| `sources` | `all \\| facebook \\| instagram` | ❌ | `all` | Określa widoczne źródła i parametr `type` dla proxy. / Controls visible sources and the proxy `type`. |
| `page-size` | number | ❌ | `18` | Ile elementów pokazać na “stronę” (przed “Load more”). / Items per page before “Load more”. |
| `max-items` | number | ❌ | `50` | Limit pobieranych elementów z proxy. / Max items requested from proxy. |
| `show-filters` | boolean | ❌ | `true` | `true/false`, `yes/no`, `on/off`, `1/0` |
| `show-search` | boolean | ❌ | `true` | `true/false`, `yes/no`, `on/off`, `1/0` |

Zasady / Rules:
- `sources=facebook` → tylko Facebook (bez All/Instagram).
- `sources=instagram` → tylko Instagram (bez All/Facebook).
- `sources=all` → All + Facebook + Instagram.
- Brak lub błędny `proxy` → blok pokaże komunikat błędu w treści strony. / Missing/invalid `proxy` renders an in-page error message.

---

## Proxy (server-side) / Proxy (server-side)

### Dlaczego proxy? / Why a proxy?
Tokeny Meta muszą być sekretami. W EDS blok działa w przeglądarce — nie można tam bezpiecznie trzymać kluczy.

Meta tokens are secrets. EDS blocks run in the browser — you cannot safely keep tokens there.

### Architektura / Architecture

`EDS page → Social Media Board block → your proxy → Meta Graph API`

### Endpoint / Endpoint

Frontend wywołuje / Frontend calls:

`GET {proxy}?type=all|facebook|instagram&limit={max-items}`

Parametry / Params:
- `type`: `all` / `facebook` / `instagram`
- `limit`: liczba elementów (np. 50) / max items (e.g. 50)

### Odpowiedź JSON / JSON response

```json
{
  "facebook": [
    {
      "id": "string",
      "message": "string (optional)",
      "created_time": "ISO-8601 string",
      "full_picture": "url string (optional)",
      "permalink_url": "url string"
    }
  ],
  "instagram": [
    {
      "id": "string",
      "caption": "string (optional)",
      "timestamp": "ISO-8601 string",
      "media_url": "url string (optional)",
      "thumbnail_url": "url string (optional, videos)",
      "permalink": "url string",
      "media_type": "IMAGE|VIDEO|CAROUSEL_ALBUM (optional)"
    }
  ]
}
```

### Błędy / Errors
W razie błędu proxy powinno zwrócić / On failure, proxy should return:
- HTTP `4xx/5xx`
- JSON: `{ "error": "human readable message" }`

### Cache (zalecane) / Cache (recommended)

Proxy powinno ustawić nagłówki cache, np. / Proxy should set cache headers, e.g.:

`Cache-Control: public, max-age=0, s-maxage=600, stale-while-revalidate=600`

---

## Checklist bezpieczeństwa / Security checklist

- [ ] Brak tokenów w Google Docs / No tokens in Google Docs
- [ ] Brak tokenów w JS/CSS/HTML / No tokens in JS/CSS/HTML
- [ ] Brak bezpośrednich requestów do `graph.facebook.com` z przeglądarki / No direct browser requests to `graph.facebook.com`
- [ ] Proxy trzyma sekrety w ENV/Secrets / Proxy keeps secrets in ENV/Secrets
- [ ] Proxy ma caching (min. 5–15 min) / Proxy has caching (at least 5–15 min)

---

## Troubleshooting / Rozwiązywanie problemów

**Nie widać postów / No posts visible**
- Sprawdź w DevTools → Network czy blok pobiera dane z `{proxy}` i czy jest poprawny JSON.
- Check DevTools → Network that the block requests `{proxy}` and receives valid JSON.

**CORS errors**
- Najprościej: hostuj proxy na tej samej domenie co strona.
- Easiest: host the proxy on the same domain as the site.

**Puste zdjęcia / Missing images**
- Facebook: `full_picture` może być puste.
- Instagram: dla VIDEO użyj `thumbnail_url` (proxy powinno je dostarczyć).

**Rate limiting**
- Dodaj caching po stronie proxy + CDN cache headers.

