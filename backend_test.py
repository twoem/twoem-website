import requests
import json
import time
import random
import string
import os
from datetime import datetime

class TwoemAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_student = None
        self.reset_request_id = None
        self.reset_code = None
        self.download_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, token=None, is_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        elif self.token and not is_admin:
            headers['Authorization'] = f'Bearer {self.token}'
        elif self.admin_token and is_admin:
            headers['Authorization'] = f'Bearer {self.admin_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                if files:
                    del headers['Content-Type']
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    del headers['Content-Type']
                    response = requests.post(url, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

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

    def test_admin_login(self):
        """Test admin login with the new password"""
        print("\n===== Testing Admin Login =====")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "admin", "password": "Twoemweb@2020"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print("Admin login successful, token obtained")
            return True
        return False

    def test_create_student(self):
        """Test creating a new student"""
        print("\n===== Testing Student Creation =====")
        # Generate random username to avoid conflicts
        username = f"teststudent_{int(time.time())}"
        student_data = {
            "username": username,
            "password": "Test@123",
            "full_name": "Test Student",
            "id_number": f"ID{random.randint(10000, 99999)}",
            "email": f"{username}@example.com",
            "phone": "0700123456"
        }
        
        success, response = self.run_test(
            "Create Student",
            "POST",
            "admin/students",
            200,
            data=student_data,
            is_admin=True
        )
        
        if success:
            self.test_student = response
            print(f"Created test student: {self.test_student['username']}")
            return True
        return False

    def test_get_students(self):
        """Test getting all students"""
        print("\n===== Testing Get All Students =====")
        success, response = self.run_test(
            "Get All Students",
            "GET",
            "admin/students",
            200,
            is_admin=True
        )
        return success

    def test_delete_student(self):
        """Test deleting a student"""
        if not self.test_student:
            print("❌ No test student to delete")
            return False
            
        print(f"\n===== Testing Student Deletion =====")
        success, _ = self.run_test(
            "Delete Student",
            "DELETE",
            f"admin/students/{self.test_student['id']}",
            200,
            is_admin=True
        )
        return success

    def test_password_reset_flow(self):
        """Test the complete password reset flow"""
        print("\n===== Testing Password Reset Flow =====")
        
        # Create a test student for password reset
        username = f"resettest_{int(time.time())}"
        student_data = {
            "username": username,
            "password": "OldPass@123",
            "full_name": "Reset Test Student",
            "id_number": f"ID{random.randint(10000, 99999)}",
            "email": f"{username}@example.com",
            "phone": "0700123456"
        }
        
        success, response = self.run_test(
            "Create Student for Reset Test",
            "POST",
            "admin/students",
            200,
            data=student_data,
            is_admin=True
        )
        
        if not success:
            return False
        
        test_student = response
        
        # Step 1: Request password reset
        success, response = self.run_test(
            "Request Password Reset",
            "POST",
            "auth/forgot-password",
            200,
            data={"username": username}
        )
        
        if not success:
            return False
            
        # Step 2: Get password reset requests as admin
        success, response = self.run_test(
            "Get Password Reset Requests",
            "GET",
            "admin/password-resets",
            200,
            is_admin=True
        )
        
        if not success or not response:
            return False
            
        # Find our reset request
        reset_request = None
        for request in response:
            if request['student_username'] == username:
                reset_request = request
                self.reset_request_id = request['id']
                break
                
        if not reset_request:
            print("❌ Reset request not found")
            return False
            
        # Step 3: Admin approves the request and generates OTP
        success, response = self.run_test(
            "Approve Password Reset",
            "PUT",
            f"admin/password-resets/{self.reset_request_id}/approve",
            200,
            data={},
            is_admin=True
        )
        
        if not success or 'otp_code' not in response:
            return False
            
        self.reset_code = response['otp_code']
        print(f"Generated OTP: {self.reset_code}")
        
        # Step 4: Use the OTP to reset password
        success, response = self.run_test(
            "Reset Password with OTP",
            "POST",
            "auth/reset-password",
            200,
            data={
                "username": username,
                "reset_code": self.reset_code,
                "new_password": "NewPass@123"
            }
        )
        
        if not success:
            return False
            
        # Step 5: Verify login with new password
        success, response = self.run_test(
            "Login with New Password",
            "POST",
            "auth/login",
            200,
            data={"username": username, "password": "NewPass@123"}
        )
        
        # Clean up - delete the test student
        self.run_test(
            "Delete Reset Test Student",
            "DELETE",
            f"admin/students/{test_student['id']}",
            200,
            is_admin=True
        )
        
        return success

    def test_downloads_management(self):
        """Test downloads management functionality"""
        print("\n===== Testing Downloads Management =====")
        
        # Step 1: Upload a public file
        # Create a small test file
        test_file_path = "test_file.txt"
        with open(test_file_path, "w") as f:
            f.write("This is a test file for TWOEM Online Productions")
        
        files = {
            'file': open(test_file_path, 'rb'),
            'title': (None, 'Test Public File'),
            'description': (None, 'This is a test public file'),
            'file_type': (None, 'public')
        }
        
        success, response = self.run_test(
            "Upload Public File",
            "POST",
            "admin/downloads",
            200,
            files=files,
            is_admin=True
        )
        
        if not success:
            os.remove(test_file_path)
            return False
            
        # Step 2: Get all downloads as admin
        success, response = self.run_test(
            "Get All Downloads",
            "GET",
            "admin/downloads",
            200,
            is_admin=True
        )
        
        if not success or not response:
            os.remove(test_file_path)
            return False
            
        # Find our uploaded file
        public_file = None
        for download in response:
            if download['title'] == 'Test Public File':
                public_file = download
                self.download_id = download['id']
                break
                
        if not public_file:
            print("❌ Uploaded file not found in downloads list")
            os.remove(test_file_path)
            return False
            
        # Step 3: Upload a private file
        files = {
            'file': open(test_file_path, 'rb'),
            'title': (None, 'Test Private File'),
            'description': (None, 'This is a test private file'),
            'file_type': (None, 'private')
        }
        
        success, response = self.run_test(
            "Upload Private File",
            "POST",
            "admin/downloads",
            200,
            files=files,
            is_admin=True
        )
        
        os.remove(test_file_path)
        
        if not success:
            return False
            
        # Step 4: Get public downloads (without authentication)
        success, response = self.run_test(
            "Get Public Downloads",
            "GET",
            "downloads",
            200,
            token=None
        )
        
        if not success:
            return False
            
        # Verify our public file is in the list
        public_file_found = False
        for download in response:
            if download['title'] == 'Test Public File':
                public_file_found = True
                break
                
        if not public_file_found:
            print("❌ Public file not found in public downloads list")
            return False
            
        # Step 5: Delete the test files
        for download in response:
            if download['title'] in ['Test Public File', 'Test Private File']:
                self.run_test(
                    f"Delete Test File: {download['title']}",
                    "DELETE",
                    f"admin/downloads/{download['id']}",
                    200,
                    is_admin=True
                )
        
        return True

def test_image_availability(base_url):
    """Test if all required images are available and accessible"""
    print("\n===== Testing Image Availability =====")
    tests_run = 0
    tests_passed = 0
    
    # List of images to check
    images = [
        "/images/ecitizen.jpg",
        "/images/itax.jpg",
        "/images/digital_printing.jpg",
        "/images/cyber_services.jpg",
        "/images/other_services.jpg",
        "/images/gallery1.jpg",
        "/images/gallery2.jpg",
        "/images/gallery3.jpg",
        "/images/twoem.jpg"
    ]
    
    for image_path in images:
        tests_run += 1
        print(f"🔍 Testing image: {image_path}")
        
        try:
            response = requests.get(f"{base_url}{image_path}")
            if response.status_code == 200 and response.headers.get('Content-Type', '').startswith('image/'):
                tests_passed += 1
                print(f"✅ Image accessible - Status: {response.status_code}, Content-Type: {response.headers.get('Content-Type')}")
            else:
                print(f"❌ Image not accessible - Status: {response.status_code}, Content-Type: {response.headers.get('Content-Type')}")
        except Exception as e:
            print(f"❌ Error accessing image: {str(e)}")
    
    print(f"\n📊 Image tests passed: {tests_passed}/{tests_run}")
    return tests_passed, tests_run

def main():
    # Get the backend URL from environment variable
    backend_url = "https://bd51faed-b485-499b-bbbb-3832b17acc69.preview.emergentagent.com"
    
    print(f"Testing TWOEM Online Productions API at: {backend_url}")
    tester = TwoemAPITester(backend_url)
    
    # Test image availability
    image_tests_passed, image_tests_run = test_image_availability(backend_url)
    
    # Test admin login
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1
        
    # Test student management
    if not tester.test_create_student():
        print("❌ Student creation failed")
    else:
        tester.test_get_students()
        tester.test_delete_student()
    
    # Test password reset flow
    tester.test_password_reset_flow()
    
    # Test downloads management
    tester.test_downloads_management()
    
    # Print results
    total_tests_run = tester.tests_run + image_tests_run
    total_tests_passed = tester.tests_passed + image_tests_passed
    print(f"\n📊 Total tests passed: {total_tests_passed}/{total_tests_run}")
    return 0 if total_tests_passed == total_tests_run else 1

if __name__ == "__main__":
    main()