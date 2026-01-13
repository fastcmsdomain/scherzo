"""
Final comprehensive test of the parallax cover effect
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    print("=== Final Parallax Cover Effect Test ===\n")

    vh = 1080 / 100

    # Key points in the scroll journey
    test_cases = [
        (0, "section_1_start", "First section - static"),
        (130, "section_2_reveal", "Section 2 starting to reveal"),
        (200, "section_2_mid", "Section 2 mid-reveal, text animating"),
        (280, "section_2_complete", "Section 2 complete, texts in position"),
        (400, "section_3_reveal", "Section 3 starting to reveal"),
        (450, "section_3_mid", "Section 3 mid-reveal"),
        (550, "section_3_complete", "Section 3 complete"),
    ]

    for scroll_vh, name, desc in test_cases:
        scroll_px = int(scroll_vh * vh)
        page.evaluate(f'window.scrollTo(0, {scroll_px})')
        page.wait_for_timeout(250)
        page.screenshot(path=f'/tmp/final_{name}.png', full_page=False)
        print(f"✓ {desc} ({scroll_vh}vh)")

    browser.close()
    print("\n=== All screenshots saved to /tmp/final_*.png ===")
