"""
Detailed test of scroll-hero animation - more granular scroll steps
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    print("=== Detailed Scroll Test ===\n")

    viewport_height = 1080

    # Test section 2 animation sequence in detail
    # Section 2 starts at scroll ~1080 and section arrives at ~2160

    test_positions = [
        (2160, "Section 2 fully in place"),
        (2400, "25% into text animation"),
        (2700, "50% into text animation"),
        (3000, "75% into text animation"),
        (3240, "100% - strapline should be at top"),
        (3500, "strapline-2 animating"),
        (3800, "strapline-2 should be at center"),
        (4100, "Final - both texts in position"),
    ]

    for i, (scroll_pos, description) in enumerate(test_positions):
        page.evaluate(f'window.scrollTo(0, {scroll_pos})')
        page.wait_for_timeout(200)

        # Get current positions
        positions = page.evaluate('''() => {
            const section2 = document.querySelectorAll('.screen-section')[1];
            if (!section2) return null;

            const strapline = section2.querySelector('.strapline');
            const strapline2 = section2.querySelector('.strapline-2');

            return {
                strapline: strapline ? {
                    top: window.getComputedStyle(strapline).top,
                    transform: window.getComputedStyle(strapline).transform
                } : null,
                strapline2: strapline2 ? {
                    top: window.getComputedStyle(strapline2).top,
                    transform: window.getComputedStyle(strapline2).transform
                } : null
            };
        }''')

        page.screenshot(path=f'/tmp/scroll_detail_{i+1}.png', full_page=False)

        print(f"{i+1}. Scroll {scroll_pos}px - {description}")
        if positions:
            if positions['strapline']:
                print(f"   Strapline: top={positions['strapline']['top']}")
            if positions['strapline2']:
                print(f"   Strapline-2: top={positions['strapline2']['top']}")
        print()

    browser.close()
    print("=== Test Complete ===")
    print("Screenshots saved to /tmp/scroll_detail_*.png")
