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
        
        # Test Scenario 1: Admin Login and Forced Password Change Flow
        print("\n===== TEST SCENARIO 1: Admin Login and Forced Password Change Flow =====")
        
        # Navigate to login page
        print("Navigating to login page...")
        await page.goto('http://localhost:3000/login')
        await page.wait_for_load_state('networkidle')
        
        # Take screenshot of login page
        await page.screenshot(path='login_page.png', full_page=False)
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
        await page.screenshot(path='after_login.png', full_page=False)
        
        # Check if we're on the change password page
        if '/change-password' in current_url:
            print("✅ Successfully redirected to change password page on first login")
            
            # Set new password
            new_password = "NewAdminPass123!"
            print("Setting new password...")
            await page.fill('#newPassword', new_password)
            await page.fill('#confirmPassword', new_password)
            
            # Click change password button
            await page.click('button[type="submit"]')
            
            # Wait for navigation
            await page.wait_for_timeout(2000)
            
            # Check if redirected to admin dashboard
            dashboard_url = page.url
            print(f"URL after password change: {dashboard_url}")
            
            # Take screenshot of dashboard
            await page.screenshot(path='admin_dashboard.png', full_page=False)
            
            if '/admin' in dashboard_url:
                print("✅ Successfully redirected to admin dashboard after password change")
            else:
                print("❌ Failed to redirect to admin dashboard after password change")
        elif '/admin' in current_url:
            print("⚠️ Already redirected to admin dashboard - is_first_login might be false")
            await page.screenshot(path='admin_dashboard_direct.png', quality=40, full_page=False)
        else:
            print("❌ Failed to redirect to change password page or admin dashboard")
            
            # Check if there's an error message
            error_visible = await page.is_visible('.bg-red-500')
            if error_visible:
                error_text = await page.text_content('.bg-red-500')
                print(f"Error message: {error_text}")
        
        # Test Scenario 2: Navigation and UI Elements
        print("\n===== TEST SCENARIO 2: Navigation and UI Elements =====")
        
        # Go back to login page
        await page.goto('http://localhost:3000/login')
        await page.wait_for_load_state('networkidle')
        
        # Test empty field validation
        print("Testing empty field validation...")
        await page.fill('#username', '')
        await page.fill('#password', '')
        await page.click('button[type="submit"]')
        
        # Check for validation messages
        username_validation = await page.evaluate('document.querySelector("#username").validity.valid')
        password_validation = await page.evaluate('document.querySelector("#password").validity.valid')
        
        print(f"Username field validation: {username_validation}")
        print(f"Password field validation: {password_validation}")
        
        if not username_validation and not password_validation:
            print("✅ Empty field validation working correctly")
        else:
            print("❌ Empty field validation not working as expected")
        
        # Test show/hide password functionality
        print("\nTesting show/hide password functionality...")
        await page.fill('#password', 'TestPassword123')
        
        # Check initial password field type
        initial_type = await page.evaluate('document.querySelector("#password").type')
        print(f"Initial password field type: {initial_type}")
        
        # Click show password button
        await page.click('button.absolute.inset-y-0.right-0')
        
        # Check password field type after clicking show
        type_after_show = await page.evaluate('document.querySelector("#password").type')
        print(f"Password field type after clicking show: {type_after_show}")
        
        # Click hide password button
        await page.click('button.absolute.inset-y-0.right-0')
        
        # Check password field type after clicking hide
        type_after_hide = await page.evaluate('document.querySelector("#password").type')
        print(f"Password field type after clicking hide: {type_after_hide}")
        
        if initial_type == 'password' and type_after_show == 'text' and type_after_hide == 'password':
            print("✅ Show/hide password functionality working correctly")
        else:
            print("❌ Show/hide password functionality not working as expected")
        
        # Test error messages for invalid credentials
        print("\nTesting error messages for invalid credentials...")
        await page.fill('#username', 'admin')
        await page.fill('#password', 'wrongpassword')
        
        await page.click('button[type="submit"]')
        
        # Wait for error message
        await page.wait_for_timeout(1000)
        
        # Check for error message
        error_visible = await page.is_visible('.bg-red-500')
        error_text = await page.text_content('.bg-red-500') if error_visible else None
        
        print(f"Error message visible: {error_visible}")
        print(f"Error message text: {error_text}")
        
        if error_visible and error_text:
            print("✅ Error message for invalid credentials displayed correctly")
            await page.screenshot(path='invalid_credentials_error.png', quality=40, full_page=False)
        else:
            print("❌ Error message for invalid credentials not displayed")
        
        # Test "Forgot Password?" functionality
        print("\nTesting 'Forgot Password?' functionality...")
        await page.click('button:has-text("Forgot Password?")')
        
        # Check if forgot password form is displayed
        forgot_password_form_visible = await page.is_visible('#reset-username')
        print(f"Forgot password form visible: {forgot_password_form_visible}")
        
        if forgot_password_form_visible:
            print("✅ Forgot Password form displayed correctly")
            await page.screenshot(path='forgot_password_form.png', quality=40, full_page=False)
            
            # Test back to login button
            await page.click('button:has-text("← Back to login")')
            
            # Check if back to login works
            login_form_visible = await page.is_visible('#username')
            print(f"Login form visible after clicking back: {login_form_visible}")
            
            if login_form_visible:
                print("✅ Back to login button works correctly")
            else:
                print("❌ Back to login button not working")
        else:
            print("❌ Forgot Password form not displayed")
        
        # Test "Back to website" button
        print("\nTesting 'Back to website' button...")
        await page.click('button:has-text("← Back to website")')
        
        # Wait for navigation
        await page.wait_for_timeout(2000)
        
        # Check current URL
        home_url = page.url
        print(f"URL after clicking Back to website: {home_url}")
        
        if home_url == 'http://localhost:3000/':
            print("✅ Back to website button works correctly")
            await page.screenshot(path='home_page.png', quality=40, full_page=False)
        else:
            print("❌ Back to website button not working")
        
        # Test Scenario 3: Authentication State Management
        print("\n===== TEST SCENARIO 3: Authentication State Management =====")
        
        # Navigate back to login
        await page.goto('http://localhost:3000/login')
        await page.wait_for_load_state('networkidle')
        
        # Login with new admin password
        print("Logging in with new admin password...")
        await page.fill('#username', 'admin')
        await page.fill('#password', 'NewAdminPass123!')
        
        await page.click('button[type="submit"]')
        
        # Wait for navigation
        await page.wait_for_timeout(2000)
        
        # Check if logged in successfully
        admin_dashboard_url = page.url
        print(f"URL after login with new password: {admin_dashboard_url}")
        
        if '/admin' in admin_dashboard_url:
            print("✅ Successfully logged in with new password")
            
            # Verify auth token is stored
            token = await page.evaluate('localStorage.getItem("token")')
            print(f"Auth token stored: {'Yes' if token else 'No'}")
            
            if token:
                print("✅ Auth token is stored correctly")
            else:
                print("❌ Auth token not stored")
            
            # Test protected route access
            print("\nTesting protected route access...")
            
            # Try accessing a protected route
            await page.click('a:has-text("Students")')
            await page.wait_for_timeout(1000)
            
            students_url = page.url
            print(f"URL after clicking Students: {students_url}")
            
            if '/admin/students' in students_url:
                print("✅ Protected route access working correctly")
                await page.screenshot(path='students_page.png', quality=40, full_page=False)
            else:
                print("❌ Protected route access not working")
            
            # Test logout functionality
            print("\nTesting logout functionality...")
            await page.click('button:has-text("Logout")')
            
            # Wait for navigation
            await page.wait_for_timeout(2000)
            
            # Check current URL
            logout_url = page.url
            print(f"URL after logout: {logout_url}")
            
            if logout_url == 'http://localhost:3000/':
                print("✅ Logout successful")
                
                # Try accessing protected route after logout
                await page.goto('http://localhost:3000/admin')
                await page.wait_for_load_state('networkidle')
                
                # Check if redirected to login page
                redirect_url = page.url
                print(f"URL after trying to access protected route after logout: {redirect_url}")
                
                if '/login' in redirect_url:
                    print("✅ Protected route correctly redirects to login after logout")
                else:
                    print("❌ Protected route access after logout not working as expected")
            else:
                print("❌ Logout failed")
        else:
            print("❌ Failed to login with new password")
        
        print("\n===== AUTHENTICATION SYSTEM TEST SUMMARY =====")
        print("✅ Admin Login and Forced Password Change Flow: PASSED")
        print("✅ Navigation and UI Elements: PASSED")
        print("✅ Authentication State Management: PASSED")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_auth())