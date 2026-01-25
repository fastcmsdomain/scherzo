"""
Final test with clip-path approach - test section 3 (with background)
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    print("=== Final Test with Clip-Path ===\n")

    # Test section 3 (index 2) which has background image
    test_positions = [
        (2160, "Section 3 revealed, texts at bottom"),
        (2500, "Strapline animating"),
        (2700, "Strapline halfway"),
        (2900, "Strapline near top, strapline2 starting"),
        (3240, "Both texts in final position"),
    ]

    for i, (scroll_pos, description) in enumerate(test_positions):
        page.evaluate(f'window.scrollTo(0, {scroll_pos})')
        page.wait_for_timeout(200)

        positions = page.evaluate('''() => {
            const section = document.querySelectorAll('.screen-section')[2];
            if (!section) return null;

            const strapline = section.querySelector('.strapline');
            const strapline2 = section.querySelector('.strapline-2');

            return {
                strapline: strapline ? Math.round(parseFloat(window.getComputedStyle(strapline).top)) : null,
                strapline2: strapline2 ? Math.round(parseFloat(window.getComputedStyle(strapline2).top)) : null
            };
        }''')

        page.screenshot(path=f'/tmp/clippath_test_{i+1}.png', full_page=False)

        print(f"{i+1}. {description} (scroll: {scroll_pos}px)")
        if positions:
            s1_pct = round(positions['strapline'] / 1080 * 100) if positions['strapline'] else None
            s2_pct = round(positions['strapline2'] / 1080 * 100) if positions['strapline2'] else None
            print(f"   Strapline: {positions['strapline']}px ({s1_pct}%)")
            print(f"   Strapline-2: {positions['strapline2']}px ({s2_pct}%)")
        print()

    print("Expected: Strapline ~194px (18%), Strapline-2 ~540px (50%)")
    print("Screenshots saved to /tmp/clippath_test_*.png")

    browser.close()
