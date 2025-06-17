import asyncio
from playwright.async_api import async_playwright

async def test_auth():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        print("Starting TWOEM Authentication System Test")
        
        # Set viewport size for desktop testing
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        try:
            # Navigate to login page
            print("Navigating to login page...")
            await page.goto('http://localhost:3000/login')
            
            # Take screenshot of login page
            await page.screenshot(path='login_page.png')
            print("Login page loaded successfully")
            
            # Test admin login
            print("Attempting admin login...")
            await page.fill('#username', 'admin')
            await page.fill('#password', 'Twoemweb@2020')
            
            # Click login button
            await page.click('button[type="submit"]')
            
            # Wait for navigation
            await page.wait_for_timeout(2000)
            
            # Check current URL
            current_url = page.url
            print(f"Current URL after login: {current_url}")
            
            # Take screenshot after login
            await page.screenshot(path='after_login.png')
            
            print("Test completed successfully")
            
        except Exception as e:
            print(f"Test failed with error: {e}")
            await page.screenshot(path='error.png')
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_auth())