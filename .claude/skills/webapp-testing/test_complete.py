"""
Complete test - verify full animation sequence
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    print("=== Complete Animation Test ===\n")

    # Section 2 (first with 200vh) starts at scroll ~1080px
    # Section 3 starts at ~1080 + 200vh = ~3240px
    test_positions = [
        (0, "Initial - Section 1"),
        (1080, "Section 1 scrolled, Section 2 entering"),
        (1620, "Section 2 halfway revealed"),
        (2160, "Section 2 fully revealed"),
        (2700, "Section 2 texts animating (halfway through 200vh)"),
        (3240, "Section 2 complete, Section 3 entering"),
        (3780, "Section 3 halfway revealed"),
        (4320, "Section 3 fully revealed"),
        (4860, "Section 3 texts animating"),
        (5400, "Section 3 texts complete"),
    ]

    for i, (scroll_pos, description) in enumerate(test_positions):
        page.evaluate(f'window.scrollTo(0, {scroll_pos})')
        page.wait_for_timeout(150)

        page.screenshot(path=f'/tmp/complete_{i+1}.png', full_page=False)
        print(f"{i+1}. {description} (scroll: {scroll_pos}px)")

    browser.close()
    print("\nScreenshots saved to /tmp/complete_*.png")
