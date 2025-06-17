import requests
import json
import sys

def test_admin_login():
    base_url = "http://localhost:8001/api"
    
    # Test health endpoint
    print("Testing health endpoint...")
    try:
        health_response = requests.get(f"{base_url}/health")
        print(f"Health Status Code: {health_response.status_code}")
        print(f"Health Response: {health_response.text}")
        print()
    except Exception as e:
        print(f"Error testing health endpoint: {e}")
        sys.exit(1)
    
    # Test login with admin credentials
    print("Testing admin login...")
    login_url = f"{base_url}/auth/login"
    login_headers = {"Content-Type": "application/json"}
    login_data = {"username": "admin", "password": "Twoemweb@2020"}
    
    try:
        login_response = requests.post(login_url, headers=login_headers, json=login_data)
        print(f"Login Status Code: {login_response.status_code}")
        print(f"Login Response: {login_response.text}")
        
        if login_response.status_code != 200:
            print("Login failed, cannot continue with the test")
            sys.exit(1)
        
        token = login_response.json().get("access_token")
        if not token:
            print("No token received, cannot continue with the test")
            sys.exit(1)
            
        print(f"Token: {token}")
        print()
        
        # Test user info endpoint
        print("Testing user info endpoint...")
        user_url = f"{base_url}/auth/me"
        user_headers = {"Authorization": f"Bearer {token}"}
        
        user_response = requests.get(user_url, headers=user_headers)
        print(f"User Info Status Code: {user_response.status_code}")
        print(f"User Info: {user_response.text}")
        
        if user_response.status_code != 200:
            print("User info request failed, cannot continue with the test")
            sys.exit(1)
        
        user_data = user_response.json()
        is_first_login = user_data.get('is_first_login', False)
        print(f"Is First Login: {is_first_login}")
        print()
        
        # Test change password endpoint if first login
        if is_first_login:
            print("Testing change password endpoint...")
            change_password_url = f"{base_url}/auth/change-password"
            change_password_headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
            change_password_data = {"new_password": "NewAdminPass123!"}
            
            change_password_response = requests.post(
                change_password_url, 
                headers=change_password_headers, 
                json=change_password_data
            )
            print(f"Change Password Status Code: {change_password_response.status_code}")
            print(f"Change Password Response: {change_password_response.text}")
            print()
            
            # Test login with new password
            print("Testing login with new password...")
            new_login_data = {"username": "admin", "password": "NewAdminPass123!"}
            
            new_login_response = requests.post(login_url, headers=login_headers, json=new_login_data)
            print(f"New Login Status Code: {new_login_response.status_code}")
            print(f"New Login Response: {new_login_response.text}")
            
            if new_login_response.status_code == 200:
                new_token = new_login_response.json().get("access_token")
                if not new_token:
                    print("No new token received")
                    sys.exit(1)
                    
                print(f"New Token: {new_token}")
                
                # Test user info again to verify is_first_login is now false
                print("Testing user info again...")
                new_user_headers = {"Authorization": f"Bearer {new_token}"}
                
                new_user_response = requests.get(user_url, headers=new_user_headers)
                print(f"New User Info Status Code: {new_user_response.status_code}")
                print(f"New User Info: {new_user_response.text}")
                
                if new_user_response.status_code == 200:
                    new_user_data = new_user_response.json()
                    print(f"Is First Login (after password change): {new_user_data.get('is_first_login', False)}")
                    
                    if not new_user_data.get('is_first_login', True):
                        print("Password change successful, is_first_login is now False")
                    else:
                        print("Password change did not update is_first_login flag")
                else:
                    print("Failed to get user info after password change")
            else:
                print("Failed to login with new password")
        else:
            print("User is not on first login, skipping password change test")
            
        print("\nAuthentication flow test completed successfully!")
        
    except Exception as e:
        print(f"Error during authentication test: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_admin_login()