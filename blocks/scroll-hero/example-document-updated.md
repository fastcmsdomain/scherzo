# Scroll Hero Block - Pobieranie z /slides/query-index.json

## Scroll Hero
(Dane pobierane automatycznie z /slides/query-index.json - podobnie jak slide-builder)

---

## Jak skonfigurować

### 1. Utwórz slajdy w folderze /slides/

#### `/slides/friends-section/index.md`
```markdown
# Friends Section

## Tytul Zdjecia
- friends          <!-- Row 1 -> main-title span -->
- for life         <!-- Row 2 -> main-title span -->
- healthy breakfast <!-- Row 3 -> subtitle span -->
- energising start  <!-- Row 4 -> subtitle span -->

![Friends Breakfast](./friends-breakfast.jpg)
![Friends Sports](./friends-sports.jpg)

## Description
Begin the day with a **healthy and energising breakfast** with boarding friends.

## Time
07:30
```

#### `/slides/skills-section/index.md`
```markdown
# Skills Section

## Tytul Zdjecia
- skills            <!-- Row 1 -> main-title span -->
- for life          <!-- Row 2 -> main-title span -->
- science labs      <!-- Row 3 -> subtitle span -->
- technology        <!-- Row 4 -> subtitle span -->

![Science Lab](./science-lab.jpg)
![Technology](./technology.jpg)

## Description
Time to **delve into the world and beyond** in our science labs.

## Time
11:15
```

### 2. Upewnij się, że masz /slides/query-index.json

```json
{
  "data": [
    {
      "path": "/slides/friends-section",
      "title": "Friends Section"
    },
    {
      "path": "/slides/skills-section", 
      "title": "Skills Section"
    }
  ]
}
```

### 3. Użyj bloku w dokumencie

```markdown
## Scroll Hero
```

To wszystko! Komponent automatycznie:
- ✅ Pobierze dane z `/slides/query-index.json`
- ✅ Załaduje HTML każdego slajdu z `.plain.html`
- ✅ Wyekstraktuje obrazy z `picture source`
- ✅ Wyekstraktuje teksty z `.tytul-zdjecia > div > div`:
  - **Wiersze 1-2** → `main-title` w `<span class="title-part">` tagach
  - **Wiersze 3-4** → `subtitle` w `<span class="subtitle-part">` tagach
- ✅ Utworzy animacje GSAP ScrollTrigger w stylu Wellington College

## Kluczowe różnice od slide-builder

| Feature | slide-builder | scroll-hero |
|---------|---------------|-------------|
| **Layout** | Horizontal carousel | Vertical scroll with overlapping |
| **Animation** | Slide transitions | Pin + parallax + text movement |
| **Navigation** | Dots/arrows | Progress indicators |
| **Images** | Single per slide | Multiple per section |
| **Text** | Static positioning | Dynamic scroll-based movement |

## Efekty animacji (identyczne z Wellington College)

1. **Nakładające się sekcje** - każda sekcja "wypycha" poprzednią w górę
2. **Parallax tła** - obrazy poruszają się wolniej niż tekst  
3. **Animacje tekstów** - teksty wchodzą z dołu i wychodzą w górę
4. **Pin scrolling** - sekcje są "przypięte" podczas animacji
5. **Zmiana obrazów** - wiele obrazów na sekcję zmienia się podczas przewijania
6. **Responsywność** - pełne dostosowanie mobile/desktop

Implementacja w 100% odtwarza efekty z Wellington College Prep! 🎉
