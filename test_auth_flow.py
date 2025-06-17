import requests
import json
import time

def test_auth_flow():
    base_url = "http://localhost:8001/api"
    
    # Step 1: Test health endpoint
    print("Testing health endpoint...")
    health_response = requests.get(f"{base_url}/health")
    print(f"Health Status Code: {health_response.status_code}")
    print(f"Health Response: {health_response.text}")
    print()
    
    # Step 2: Test login with admin credentials
    print("Testing admin login...")
    login_url = f"{base_url}/auth/login"
    login_headers = {"Content-Type": "application/json"}
    login_data = {"username": "admin", "password": "Twoemweb@2020"}
    
    login_response = requests.post(login_url, headers=login_headers, data=json.dumps(login_data))
    print(f"Login Status Code: {login_response.status_code}")
    print(f"Login Response: {login_response.text}")
    
    if login_response.status_code != 200:
        print("Login failed, cannot continue with the test")
        return
    
    token = login_response.json()["access_token"]
    print(f"Token: {token}")
    print()
    
    # Step 3: Test user info endpoint
    print("Testing user info endpoint...")
    user_url = f"{base_url}/auth/me"
    user_headers = {"Authorization": f"Bearer {token}"}
    
    user_response = requests.get(user_url, headers=user_headers)
    print(f"User Info Status Code: {user_response.status_code}")
    print(f"User Info: {user_response.text}")
    
    if user_response.status_code != 200:
        print("User info request failed, cannot continue with the test")
        return
    
    user_data = user_response.json()
    print(f"Is First Login: {user_data['is_first_login']}")
    print()
    
    # Step 4: Test change password endpoint
    if user_data['is_first_login']:
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
            data=json.dumps(change_password_data)
        )
        print(f"Change Password Status Code: {change_password_response.status_code}")
        print(f"Change Password Response: {change_password_response.text}")
        print()
        
        # Step 5: Test login with new password
        print("Testing login with new password...")
        new_login_data = {"username": "admin", "password": "NewAdminPass123!"}
        
        new_login_response = requests.post(login_url, headers=login_headers, data=json.dumps(new_login_data))
        print(f"New Login Status Code: {new_login_response.status_code}")
        print(f"New Login Response: {new_login_response.text}")
        
        if new_login_response.status_code == 200:
            new_token = new_login_response.json()["access_token"]
            print(f"New Token: {new_token}")
            
            # Step 6: Test user info again to verify is_first_login is now false
            print("Testing user info again...")
            new_user_headers = {"Authorization": f"Bearer {new_token}"}
            
            new_user_response = requests.get(user_url, headers=new_user_headers)
            print(f"New User Info Status Code: {new_user_response.status_code}")
            print(f"New User Info: {new_user_response.text}")
            
            if new_user_response.status_code == 200:
                new_user_data = new_user_response.json()
                print(f"Is First Login (after password change): {new_user_data['is_first_login']}")
    else:
        print("User is not on first login, skipping password change test")

if __name__ == "__main__":
    test_auth_flow()