"""
Test parallax cover effect with clip-path approach
Each section gets 200vh of scroll distance
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    print("=== Testing Parallax Cover Effect ===\n")

    # With 200vh per section:
    # Section 1: 0-200vh (index 0, always visible)
    # Section 2: 200-400vh (reveal at 200vh, text animates 230-300vh)
    # Section 3: 400-600vh (reveal at 400vh, text animates 430-500vh)
    # etc.

    test_positions = [
        (0, "Initial - Section 1"),
        (100, "Section 1 - scrolling"),
        (200, "Section 2 starts revealing"),
        (250, "Section 2 - 50% revealed, strapline animating"),
        (300, "Section 2 - fully revealed, texts in position"),
        (400, "Section 3 starts revealing"),
        (450, "Section 3 - 50% revealed"),
        (500, "Section 3 - texts in position"),
        (600, "Section 4 starts revealing"),
    ]

    # Convert vh to pixels (viewport height = 1080px)
    vh = 1080 / 100

    for i, (scroll_vh, description) in enumerate(test_positions):
        scroll_px = int(scroll_vh * vh)
        page.evaluate(f'window.scrollTo(0, {scroll_px})')
        page.wait_for_timeout(200)

        # Get info about visible sections
        info = page.evaluate('''() => {
            const sections = document.querySelectorAll('.screen-section');
            const results = [];
            sections.forEach((section, idx) => {
                const style = window.getComputedStyle(section);
                const clipPath = style.clipPath;
                // Parse clip-path: inset(X% 0 0 0)
                const match = clipPath.match(/inset\\((\\d+(?:\\.\\d+)?)%/);
                const insetTop = match ? parseFloat(match[1]) : 0;
                const visible = insetTop < 100;

                if (visible) {
                    const strapline = section.querySelector('.strapline');
                    const strapline2 = section.querySelector('.strapline-2');
                    results.push({
                        index: idx,
                        clipPath: clipPath,
                        insetTop: insetTop,
                        straplineTop: strapline ? Math.round(parseFloat(style.getPropertyValue('--st') || window.getComputedStyle(strapline).top)) : null,
                        strapline2Top: strapline2 ? Math.round(parseFloat(window.getComputedStyle(strapline2).top)) : null,
                    });
                }
            });
            return results;
        }''')

        page.screenshot(path=f'/tmp/parallax_test_{i+1}.png', full_page=False)

        print(f"{i+1}. {description} (scroll: {scroll_vh}vh = {scroll_px}px)")
        for s in info:
            print(f"   Section {s['index']}: clip={s['clipPath'][:30]}..., strapline={s['straplineTop']}px, strapline2={s['strapline2Top']}px")
        print()

    browser.close()
    print("Screenshots saved to /tmp/parallax_test_*.png")
