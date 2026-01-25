"""
Test scroll-hero animation behavior on localhost:3000
Takes screenshots at different scroll positions to analyze animation sequence
"""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # Navigate to the page
    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')

    # Wait for scroll-hero to initialize
    page.wait_for_timeout(500)

    print("=== Testing Scroll Hero Animation ===\n")

    # Screenshot 1: Initial state (top of page)
    page.screenshot(path='/tmp/scroll_hero_1_initial.png', full_page=False)
    print("1. Initial state captured - /tmp/scroll_hero_1_initial.png")

    # Get page height for scroll calculations
    page_height = page.evaluate('document.body.scrollHeight')
    viewport_height = 1080
    print(f"   Page height: {page_height}px, Viewport: {viewport_height}px")

    # Screenshot 2: Scroll to where second section starts appearing
    scroll_pos = viewport_height
    page.evaluate(f'window.scrollTo(0, {scroll_pos})')
    page.wait_for_timeout(300)
    page.screenshot(path='/tmp/scroll_hero_2_section2_entering.png', full_page=False)
    print(f"2. Second section entering (scroll: {scroll_pos}px) - /tmp/scroll_hero_2_section2_entering.png")

    # Screenshot 3: Second section fully in view
    scroll_pos = viewport_height * 2
    page.evaluate(f'window.scrollTo(0, {scroll_pos})')
    page.wait_for_timeout(300)
    page.screenshot(path='/tmp/scroll_hero_3_section2_full.png', full_page=False)
    print(f"3. Second section full (scroll: {scroll_pos}px) - /tmp/scroll_hero_3_section2_full.png")

    # Screenshot 4: After section 2 is in place, strapline should be animating
    scroll_pos = viewport_height * 2.5
    page.evaluate(f'window.scrollTo(0, {scroll_pos})')
    page.wait_for_timeout(300)
    page.screenshot(path='/tmp/scroll_hero_4_strapline_animating.png', full_page=False)
    print(f"4. Strapline animating (scroll: {scroll_pos}px) - /tmp/scroll_hero_4_strapline_animating.png")

    # Screenshot 5: Strapline at top, strapline-2 should start
    scroll_pos = viewport_height * 3
    page.evaluate(f'window.scrollTo(0, {scroll_pos})')
    page.wait_for_timeout(300)
    page.screenshot(path='/tmp/scroll_hero_5_strapline2_start.png', full_page=False)
    print(f"5. Strapline-2 starting (scroll: {scroll_pos}px) - /tmp/scroll_hero_5_strapline2_start.png")

    # Screenshot 6: Final position - strapline at top, strapline-2 at center
    scroll_pos = viewport_height * 3.5
    page.evaluate(f'window.scrollTo(0, {scroll_pos})')
    page.wait_for_timeout(300)
    page.screenshot(path='/tmp/scroll_hero_6_final.png', full_page=False)
    print(f"6. Final position (scroll: {scroll_pos}px) - /tmp/scroll_hero_6_final.png")

    # Get strapline positions at final scroll
    strapline_info = page.evaluate('''() => {
        const sections = document.querySelectorAll('.screen-section');
        const results = [];
        sections.forEach((section, i) => {
            const strapline = section.querySelector('.strapline');
            const strapline2 = section.querySelector('.strapline-2');
            if (strapline || strapline2) {
                const s1Style = strapline ? window.getComputedStyle(strapline) : null;
                const s2Style = strapline2 ? window.getComputedStyle(strapline2) : null;
                results.push({
                    section: i + 1,
                    strapline: s1Style ? { top: s1Style.top, transform: s1Style.transform } : null,
                    strapline2: s2Style ? { top: s2Style.top, transform: s2Style.transform, opacity: s2Style.opacity } : null
                });
            }
        });
        return results;
    }''')

    print("\n=== Strapline Positions at Final Scroll ===")
    for info in strapline_info:
        print(f"Section {info['section']}:")
        if info['strapline']:
            print(f"  Strapline: top={info['strapline']['top']}")
        if info['strapline2']:
            print(f"  Strapline-2: top={info['strapline2']['top']}, opacity={info['strapline2']['opacity']}")

    browser.close()
    print("\n=== Test Complete ===")
    print("Review screenshots in /tmp/scroll_hero_*.png to see animation behavior")
