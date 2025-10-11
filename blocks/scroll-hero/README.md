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
- **titleParts** z `.tytul-zdjecia > div > div`
- **images** z `picture source[media="(min-width: 600px)"]`
- **description** z elementów `.description, .subtitle, p`
- **time** z elementów `.time, .timestamp`

## Użycie

1. **Utwórz slajdy w folderze `/slides/`:**

```markdown
<!-- /slides/friends-section/index.md -->
# Friends Section

## Tytul Zdjecia
- friends  
- for life

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

## Kluczowe animacje

### Efekt nakładania obrazów
- Każda sekcja ma `position: sticky` i `z-index` zwiększający się z każdą sekcją
- `ScrollTrigger.create()` z `pin: true` i `pinSpacing: false`

### Animacje tekstów
- **Wejście:** `opacity: 0 → 1`, `y: 100 → 0`, `scale: 0.8 → 1`
- **Wyjście:** `y: 0 → -150`, `opacity: 1 → 0.3`, `scale: 1 → 0.8`
- **Timing:** `scrub: 1.5` dla płynnego dopasowania do przewijania

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
