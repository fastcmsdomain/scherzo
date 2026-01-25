"""
Test timing of text animations vs next section entrance
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    print("=== Testing Animation Timing ===\n")

    # Test at critical points during section 3 (index 2) which has background
    # Section 3 starts at ~2160px
    test_positions = [
        (2160, "Section 3 just revealed"),
        (2300, "15% into section - strapline animating"),
        (2450, "30% - strapline should be at top"),
        (2600, "45% - strapline2 should be at center"),
        (2800, "60% - texts in place, next section NOT visible yet"),
        (3000, "Next section should start entering now"),
    ]

    for i, (scroll_pos, description) in enumerate(test_positions):
        page.evaluate(f'window.scrollTo(0, {scroll_pos})')
        page.wait_for_timeout(150)

        # Check text positions on section 3
        info = page.evaluate('''() => {
            const section = document.querySelectorAll('.screen-section')[2];
            if (!section) return null;

            const strapline = section.querySelector('.strapline');
            const strapline2 = section.querySelector('.strapline-2');

            // Check if next section is visible
            const nextSection = document.querySelectorAll('.screen-section')[3];
            const nextRect = nextSection ? nextSection.getBoundingClientRect() : null;
            const nextVisible = nextRect && nextRect.top < 1080;

            return {
                strapline: strapline ? Math.round(parseFloat(window.getComputedStyle(strapline).top)) : null,
                strapline2: strapline2 ? Math.round(parseFloat(window.getComputedStyle(strapline2).top)) : null,
                nextSectionVisible: nextVisible,
                nextSectionTop: nextRect ? Math.round(nextRect.top) : null
            };
        }''')

        page.screenshot(path=f'/tmp/timing_test_{i+1}.png', full_page=False)

        print(f"{i+1}. {description} (scroll: {scroll_pos}px)")
        if info:
            s1_pct = round(info['strapline'] / 1080 * 100) if info['strapline'] else None
            s2_pct = round(info['strapline2'] / 1080 * 100) if info['strapline2'] else None
            print(f"   Strapline: {info['strapline']}px ({s1_pct}%)")
            print(f"   Strapline-2: {info['strapline2']}px ({s2_pct}%)")
            print(f"   Next section visible: {info['nextSectionVisible']} (top: {info['nextSectionTop']}px)")
        print()

    browser.close()
    print("Screenshots saved to /tmp/timing_test_*.png")
