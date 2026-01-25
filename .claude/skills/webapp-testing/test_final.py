"""
Final test - verify text positions on section with background
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    print("=== Final Animation Test ===\n")

    # Go to section 3 (index 2) which has background
    # After section 0 PIN (150vh) + section 1 PIN (150vh) + section 2 entering

    test_positions = [
        (4800, "Section 3 just pinned - texts should start at bottom"),
        (5200, "Strapline animating up"),
        (5600, "Strapline near top, strapline-2 starting"),
        (6000, "Final position - both texts in place"),
    ]

    for i, (scroll_pos, description) in enumerate(test_positions):
        page.evaluate(f'window.scrollTo(0, {scroll_pos})')
        page.wait_for_timeout(200)

        positions = page.evaluate('''() => {
            const section = document.querySelectorAll('.screen-section')[2]; // Section 3
            if (!section) return null;

            const strapline = section.querySelector('.strapline');
            const strapline2 = section.querySelector('.strapline-2');

            return {
                strapline: strapline ? parseInt(window.getComputedStyle(strapline).top) : null,
                strapline2: strapline2 ? parseInt(window.getComputedStyle(strapline2).top) : null
            };
        }''')

        page.screenshot(path=f'/tmp/final_test_{i+1}.png', full_page=False)

        print(f"{i+1}. {description} (scroll: {scroll_pos}px)")
        if positions:
            s1_percent = round(positions['strapline'] / 1080 * 100) if positions['strapline'] else None
            s2_percent = round(positions['strapline2'] / 1080 * 100) if positions['strapline2'] else None
            print(f"   Strapline: {positions['strapline']}px ({s1_percent}%)")
            print(f"   Strapline-2: {positions['strapline2']}px ({s2_percent}%)")
        print()

    print("Expected final positions:")
    print("   Strapline: ~194px (18%)")
    print("   Strapline-2: ~540px (50%)")
    print("\nScreenshots saved to /tmp/final_test_*.png")

    browser.close()
