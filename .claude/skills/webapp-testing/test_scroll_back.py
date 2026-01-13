"""
Test scroll back behavior - sections should hide when scrolling back
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    print("=== Testing Scroll Back Behavior ===\n")

    vh = 1080 / 100  # pixels per vh

    # Scroll forward to section 3
    print("1. Scrolling to section 3 (400vh)...")
    page.evaluate(f'window.scrollTo(0, {int(400 * vh)})')
    page.wait_for_timeout(300)
    page.screenshot(path='/tmp/scrollback_1_forward.png', full_page=False)

    # Get visible sections
    info = page.evaluate('''() => {
        const sections = document.querySelectorAll('.screen-section');
        const visible = [];
        sections.forEach((s, i) => {
            const clip = window.getComputedStyle(s).clipPath;
            const match = clip.match(/inset\\((\\d+(?:\\.\\d+)?)%/);
            const inset = match ? parseFloat(match[1]) : 0;
            if (inset < 100) visible.push(i);
        });
        return visible;
    }''')
    print(f"   Visible sections: {info}")

    # Now scroll back
    print("\n2. Scrolling back to section 1 (50vh)...")
    page.evaluate(f'window.scrollTo(0, {int(50 * vh)})')
    page.wait_for_timeout(300)
    page.screenshot(path='/tmp/scrollback_2_back.png', full_page=False)

    info = page.evaluate('''() => {
        const sections = document.querySelectorAll('.screen-section');
        const visible = [];
        sections.forEach((s, i) => {
            const clip = window.getComputedStyle(s).clipPath;
            const match = clip.match(/inset\\((\\d+(?:\\.\\d+)?)%/);
            const inset = match ? parseFloat(match[1]) : 0;
            if (inset < 100) visible.push(i);
        });
        return visible;
    }''')
    print(f"   Visible sections: {info}")

    # Scroll to beginning
    print("\n3. Scrolling to beginning (0)...")
    page.evaluate('window.scrollTo(0, 0)')
    page.wait_for_timeout(300)
    page.screenshot(path='/tmp/scrollback_3_start.png', full_page=False)

    info = page.evaluate('''() => {
        const sections = document.querySelectorAll('.screen-section');
        const visible = [];
        sections.forEach((s, i) => {
            const clip = window.getComputedStyle(s).clipPath;
            const match = clip.match(/inset\\((\\d+(?:\\.\\d+)?)%/);
            const inset = match ? parseFloat(match[1]) : 0;
            if (inset < 100) visible.push(i);
        });
        return visible;
    }''')
    print(f"   Visible sections: {info}")

    browser.close()
    print("\nScreenshots saved to /tmp/scrollback_*.png")
