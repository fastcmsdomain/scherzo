"""
Test scroll-hero without PIN - check section positions and text animations
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    print("=== Test Without PIN ===\n")

    # Check section positions at different scroll points
    test_positions = [
        (0, "Initial"),
        (1080, "Section 2 entering"),
        (2160, "Section 2 at top"),
        (2700, "Section 2 scrolling"),
        (3240, "Section 3 entering"),
        (4320, "Section 3 at top"),
    ]

    for scroll_pos, description in test_positions:
        page.evaluate(f'window.scrollTo(0, {scroll_pos})')
        page.wait_for_timeout(200)

        info = page.evaluate('''() => {
            const sections = document.querySelectorAll('.screen-section');
            const results = [];
            sections.forEach((section, i) => {
                const rect = section.getBoundingClientRect();
                const strapline = section.querySelector('.strapline');
                const strapline2 = section.querySelector('.strapline-2');

                if (rect.top <= 1080 && rect.bottom >= 0) {
                    results.push({
                        index: i,
                        sectionTop: Math.round(rect.top),
                        straplineTop: strapline ? Math.round(parseFloat(window.getComputedStyle(strapline).top)) : null,
                        strapline2Top: strapline2 ? Math.round(parseFloat(window.getComputedStyle(strapline2).top)) : null,
                    });
                }
            });
            return results;
        }''')

        print(f"Scroll {scroll_pos}px - {description}:")
        for s in info:
            print(f"  Section {s['index']}: top={s['sectionTop']}px, strapline={s['straplineTop']}px, strapline2={s['strapline2Top']}px")
        print()

    browser.close()
