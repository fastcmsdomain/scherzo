"""
Test section 3 (index 2) which has a background image
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    print("=== Testing Section 3 (has background) ===\n")

    # Section 3 starts after sections 0, 1, 2 (with PIN spacing)
    # Each section with PIN adds extra scroll space

    test_positions = [
        (4500, "Section 3 entering"),
        (5000, "Section 3 should be pinned"),
        (5500, "Text animating on Section 3"),
        (6000, "Texts should be in place"),
        (6500, "After PIN ends"),
    ]

    for i, (scroll_pos, description) in enumerate(test_positions):
        page.evaluate(f'window.scrollTo(0, {scroll_pos})')
        page.wait_for_timeout(200)

        # Check which section is visible
        visible = page.evaluate('''() => {
            const sections = document.querySelectorAll('.screen-section');
            const visible = [];
            sections.forEach((s, i) => {
                const rect = s.getBoundingClientRect();
                if (rect.top < 1080 && rect.bottom > 0) {
                    const bg = s.querySelector('.image-bg-0');
                    visible.push({
                        index: i,
                        top: rect.top,
                        hasBg: bg && bg.style.backgroundImage ? true : false
                    });
                }
            });
            return visible;
        }''')

        page.screenshot(path=f'/tmp/section3_test_{i+1}.png', full_page=False)
        print(f"{i+1}. Scroll {scroll_pos}px - {description}")
        for v in visible:
            print(f"   Section {v['index']}: top={v['top']}px, hasBg={v['hasBg']}")
        print()

    browser.close()
    print("Screenshots saved to /tmp/section3_test_*.png")
