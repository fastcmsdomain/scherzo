"""
Test for overlap issue - take screenshots during scroll
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    print("=== Testing Overlap Issue ===\n")

    # Test scroll positions where overlap might occur
    test_positions = [
        (500, "During section 1->2 transition"),
        (1500, "Section 2 entering"),
        (1800, "Section 2 almost in place"),
        (2500, "During section 2->3 transition"),
        (3000, "Section 3 entering"),
    ]

    for i, (scroll_pos, description) in enumerate(test_positions):
        page.evaluate(f'window.scrollTo(0, {scroll_pos})')
        page.wait_for_timeout(200)
        page.screenshot(path=f'/tmp/overlap_test_{i+1}.png', full_page=False)
        print(f"{i+1}. {description} (scroll: {scroll_pos}px) - saved")

    print("\nScreenshots saved to /tmp/overlap_test_*.png")
    browser.close()
