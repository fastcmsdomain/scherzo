# Scroll Hero Block

Komponent Franklin odtwarzający animacje przewijania z strony Wellington College Prep z wykorzystaniem GSAP ScrollTrigger.

## Funkcjonalności

- **Nakładające się obrazy** - sekcje przesuwają się jedna nad drugą podczas przewijania
- **Animacje tekstów** - teksty poruszają się w górę i w dół z różną prędkością
- **Parallax tła** - obrazy tła poruszają się z inną prędkością niż tekst
- **Nawigacja postępu** - boczna nawigacja pokazująca aktualną sekcję
- **Responsywność** - dostosowanie do urządzeń mobilnych

## Struktura danych

Komponent pobiera dane z `/slides/query-index.json` (podobnie jak slide-builder):

### Format JSON:
```json
{
  "data": [
    {
      "path": "/slides/friends-section",
      "title": "Friends Section", 
      "lastModified": "2024-01-01"
    },
    {
      "path": "/slides/skills-section",
      "title": "Skills Section",
      "lastModified": "2024-01-01" 
    }
  ]
}
```

### Struktura slajdów w Franklin:
Każdy slajd w folderze `/slides/` powinien mieć:

```markdown
# Section Title

## Tytul Zdjecia
- friends
- for life

![Image](./image.jpg)

## Description
Begin the day with a **healthy breakfast**

## Time  
07:30
```

Komponent automatycznie ekstraktuje:
- **mainTitleParts** (1-2 wiersze) z `.tytul-zdjecia > div > div` - umieszczane w `<span class="title-part">` tagach
- **subtitleParts** (3-4 wiersze) z `.tytul-zdjecia > div > div` - umieszczane w `<span class="subtitle-part">` tagach
- **images** z `picture source[media="(min-width: 600px)"]`
- **description** z elementów `.description, .subtitle, p`
- **time** z elementów `.time, .timestamp`

## Użycie

1. **Utwórz slajdy w folderze `/slides/`:**

```markdown
<!-- /slides/friends-section/index.md -->
# Friends Section

## Tytul Zdjecia
- friends          <!-- Row 1 -> main-title span -->
- for life         <!-- Row 2 -> main-title span -->
- healthy breakfast <!-- Row 3 -> subtitle span -->
- energising start  <!-- Row 4 -> subtitle span -->

![Friends Image](./friends-breakfast.jpg)
![Friends Image 2](./friends-sports.jpg)

## Description
Begin the day with a **healthy and energising breakfast** with boarding friends.

## Time
07:30
```

2. **Dodaj blok do dokumentu Franklin:**
```markdown
## Scroll Hero
(Blok automatycznie pobierze dane z /slides/query-index.json)
```

3. **Komponent automatycznie:**
   - Pobierze listę slajdów z `/slides/query-index.json`
   - Załaduje HTML każdego slajdu z `.plain.html`
   - Wyekstraktuje obrazy, teksty i metadane
   - Utworzy animacje GSAP ScrollTrigger

## Struktura HTML

Komponent generuje następującą strukturę HTML:

```html
<div class="strapline">
  <h1 class="main-title">
    <span class="title-part title-part-0">friends</span>
    <span class="title-part title-part-1">for life</span>
  </h1>
</div>
<div class="strapline-2">
  <h2 class="subtitle">
    <span class="subtitle-part subtitle-part-0">healthy breakfast</span>
    <span class="subtitle-part subtitle-part-1">energising start</span>
  </h2>
</div>
```

### Kluczowe elementy:
- **strapline**: Zawiera główny tytuł (wiersze 1-2)
- **strapline-2**: Zawiera podtytuł (wiersze 3-4)
- **title-part**: Indywidualne span-y dla każdego wiersza tytułu
- **subtitle-part**: Indywidualne span-y dla każdego wiersza podtytułu

## Kluczowe animacje

### Animacja tekstów
- **strapline** (główny tytuł): Przesuwa się do góry strony podczas scrollowania
- **strapline-2** (podtytuł): Przesuwa się do środka strony gdy strapline osiąga górę
- Oba elementy używają GSAP ScrollTrigger z płynnym scrub: 0.5

### Efekt nakładania obrazów
- Każda sekcja ma `position: sticky` i `z-index` zwiększający się z każdą sekcją
- `ScrollTrigger.create()` z `pin: true` i `pinSpacing: false`

### Parallax tła
- Obrazy tła poruszają się z `yPercent: -50` podczas przewijania
- `scrub: 1.5` dla efektu parallax

## Zależności

- GSAP 3.12.2+
- ScrollTrigger plugin
- Automatyczne ładowanie z CDN jeśli nie są dostępne

## Kompatybilność

- Wszystkie nowoczesne przeglądarki
- Responsywne (desktop, tablet, mobile)
- Fallback dla przeglądarek bez obsługi GSAP

## Konfiguracja

Możesz dostosować animacje modyfikując parametry w `initScrollAnimations()`:

```javascript
// Prędkość animacji
scrub: 1.5  // Im wyższa wartość, tym wolniejsze animacje

// Punkty wyzwalania
start: 'top top'
end: 'bottom top'

// Opóźnienia
delay: 0.1
```
