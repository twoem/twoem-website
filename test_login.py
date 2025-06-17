import requests
import json

def test_login():
    url = "http://localhost:8001/api/auth/login"
    headers = {"Content-Type": "application/json"}
    data = {"username": "admin", "password": "Twoemweb@2020"}
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            token = response.json()["access_token"]
            print(f"Token: {token}")
            
            # Test user info endpoint
            user_url = "http://localhost:8001/api/auth/me"
            user_headers = {"Authorization": f"Bearer {token}"}
            user_response = requests.get(user_url, headers=user_headers)
            print(f"User Info Status Code: {user_response.status_code}")
            print(f"User Info: {user_response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()