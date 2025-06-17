import requests
import json
import os

class AuthenticationTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        elif self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test the health check endpoint"""
        print("\n===== Testing Health Check =====")
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        if success:
            print(f"Health check response: {response}")
        return success

    def test_admin_login(self):
        """Test admin login with default credentials"""
        print("\n===== Testing Admin Login =====")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "admin", "password": "Twoemweb@2020"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print("Admin login successful, token obtained")
            return True
        return False

    def test_user_info(self):
        """Test getting current user info"""
        print("\n===== Testing User Info Endpoint =====")
        if not self.token:
            print("❌ No token available, login first")
            return False
            
        success, response = self.run_test(
            "Get User Info",
            "GET",
            "auth/me",
            200,
            token=self.token
        )
        if success:
            print(f"User info: {json.dumps(response, indent=2)}")
            # Check if is_first_login is true
            if response.get('is_first_login') == True:
                print("✅ Verified is_first_login is True")
                return True
            else:
                print("❌ is_first_login is not True")
                return False
        return False

def main():
    # Get the backend URL from environment variable or use default
    backend_url = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001")
    
    print(f"Testing TWOEM Authentication API at: {backend_url}")
    tester = AuthenticationTester(backend_url)
    
    # Test health check
    health_check_result = tester.test_health_check()
    
    # Test admin login
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1
    
    # Test user info endpoint
    user_info_result = tester.test_user_info()
    
    # Print results
    print(f"\n📊 Total tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    # Return overall success/failure
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    main()