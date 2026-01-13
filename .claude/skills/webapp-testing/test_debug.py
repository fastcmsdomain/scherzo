"""
Debug scroll-hero - check what section is visible and background images
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    # Check section backgrounds and visibility
    info = page.evaluate('''() => {
        const sections = document.querySelectorAll('.screen-section');
        const results = [];

        sections.forEach((section, i) => {
            const bg = section.querySelector('.image-bg-0');
            const rect = section.getBoundingClientRect();
            const style = window.getComputedStyle(section);

            results.push({
                index: i,
                className: section.className,
                top: rect.top,
                height: rect.height,
                visible: rect.top < 1080 && rect.bottom > 0,
                backgroundImage: bg ? bg.style.backgroundImage : 'none',
                transform: style.transform,
                position: style.position
            });
        });

        return results;
    }''')

    print("=== Section Debug Info (Initial State) ===\n")
    for s in info[:4]:
        print(f"Section {s['index']}:")
        print(f"  Class: {s['className']}")
        print(f"  Top: {s['top']}px, Height: {s['height']}px")
        print(f"  Visible: {s['visible']}")
        print(f"  Background: {s['backgroundImage'][:50]}..." if len(s['backgroundImage']) > 50 else f"  Background: {s['backgroundImage']}")
        print(f"  Transform: {s['transform']}")
        print()

    # Scroll to where section 2 should be pinned
    print("=== After scrolling to 2160px ===\n")
    page.evaluate('window.scrollTo(0, 2160)')
    page.wait_for_timeout(300)

    info2 = page.evaluate('''() => {
        const sections = document.querySelectorAll('.screen-section');
        const results = [];

        sections.forEach((section, i) => {
            const bg = section.querySelector('.image-bg-0');
            const rect = section.getBoundingClientRect();
            const style = window.getComputedStyle(section);

            results.push({
                index: i,
                top: rect.top,
                visible: rect.top < 1080 && rect.bottom > 0,
                backgroundImage: bg ? bg.style.backgroundImage.substring(0, 60) : 'none',
                isPinned: section.classList.contains('pin-spacer') || style.position === 'fixed'
            });
        });

        return results;
    }''')

    for s in info2[:4]:
        print(f"Section {s['index']}: top={s['top']}px, visible={s['visible']}, bg={s['backgroundImage']}")

    browser.close()
