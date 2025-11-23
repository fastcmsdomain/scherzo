# Przykład użycia Scroll Hero Block w Franklin

## Scroll Hero

| Background Image | Title | Subtitle | Description | Time |
|------------------|-------|----------|-------------|------|
| https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1200&h=800&fit=crop, https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop | friends | for life | Begin the day with a **healthy and energising breakfast** with boarding friends to get **ready for the exciting day ahead**. | 07:30 |
| https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&h=800&fit=crop, https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop | skills | for life | Time to **delve into the world and beyond** in our state-of-the-art science labs. **Question, formulate and experiment**; skills that will take you anywhere. | 11:15 |
| https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop, https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=1200&h=800&fit=crop | confidence | for life | Make the most of every opportunity. **Play hard, work hard** and your confidence will help you to **be the best you can**. | 14:30 |

---

## Instrukcje implementacji

### 1. Struktura folderów Franklin
```
blocks/
  scroll-hero/
    scroll-hero.js      # Główna logika komponentu
    scroll-hero.css     # Style CSS
    README.md          # Dokumentacja
    demo.html          # Demonstracja
```

### 2. Konfiguracja w Franklin

W `head.html` lub głównym pliku HTML dodaj:

```html
<!-- GSAP Libraries (opcjonalnie - komponent załaduje automatycznie) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollToPlugin.min.js"></script>
```

### 3. Użycie w dokumencie Markdown

Wystarczy utworzyć tabelę z danymi jak powyżej. Komponent automatycznie:
- Załaduje GSAP jeśli nie jest dostępny
- Utworzy animacje przewijania
- Skonfiguruje nawigację postępu
- Dostosuje się do urządzeń mobilnych

### 4. Obsługa wielu obrazów

Możesz dodać wiele obrazów do jednej sekcji oddzielając je przecinkami:

```
| image1.jpg, image2.jpg, image3.jpg | title | subtitle | description | time |
```

Obrazy będą się zmieniać podczas przewijania sekcji.

### 5. Dostosowanie kolorów

Każda sekcja ma automatyczne kolory:
- **friends** - żółty (#f7d117)
- **skills** - turkusowy (#a6d6c9) 
- **confidence** - czerwony (#ff6b6b)

Możesz je zmienić w `scroll-hero.css`.

## Kluczowe funkcje animacji

### Efekt nakładania
- Każda sekcja "wypycha" poprzednią w górę
- `position: sticky` + `z-index` zapewnia właściwą kolejność
- `pin: true` w ScrollTrigger zatrzymuje sekcję podczas animacji

### Animacje tekstów
- **Wejście**: tekst pojawia się z dołu z efektem fade-in
- **Przewijanie**: tekst porusza się w górę z różną prędkością
- **Wyjście**: tekst znika w górę z efektem scale

### Parallax tła
- Obrazy tła poruszają się wolniej niż tekst
- Różne prędkości dla efektu głębi
- Automatyczna zmiana obrazów podczas przewijania

Animacje są w 100% oparte na oryginalnej implementacji z Wellington College Prep!
