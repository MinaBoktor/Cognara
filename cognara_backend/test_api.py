#!/usr/bin/env python3
"""
Test script for Cognara Blog API endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USER = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "User"
}

TEST_ADMIN = {
    "username": "admin",
    "email": "admin@example.com", 
    "password": "adminpass123",
    "first_name": "Admin",
    "last_name": "User",
    "is_admin": True
}

TEST_ARTICLE = {
    "title": "Test Article",
    "excerpt": "This is a test article excerpt for testing purposes.",
    "content": "This is the full content of the test article. It contains detailed information about testing the Cognara blog API.",
    "meta_title": "Test Article - Cognara",
    "meta_description": "A test article for the Cognara blog API testing.",
    "keywords": "test, article, cognara, blog"
}

class APITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.user_token = None
        self.admin_token = None
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def test_endpoint(self, method, endpoint, data=None, headers=None, expected_status=200):
        """Test an API endpoint"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            self.log(f"{method.upper()} {endpoint} -> {response.status_code}")
            
            if response.status_code != expected_status:
                self.log(f"  Expected {expected_status}, got {response.status_code}")
                self.log(f"  Response: {response.text}")
                return False, response
                
            return True, response
            
        except Exception as e:
            self.log(f"  Error: {str(e)}")
            return False, None
    
    def test_user_registration(self):
        """Test user registration"""
        self.log("Testing user registration...")
        
        # Register regular user
        success, response = self.test_endpoint('POST', '/auth/register/', TEST_USER, expected_status=201)
        if success:
            data = response.json()
            self.user_token = data.get('token')
            self.log(f"  User registered successfully, token: {self.user_token[:20]}...")
        
        # Register admin user
        success, response = self.test_endpoint('POST', '/auth/register/', TEST_ADMIN, expected_status=201)
        if success:
            data = response.json()
            self.admin_token = data.get('token')
            self.log(f"  Admin registered successfully, token: {self.admin_token[:20]}...")
        
        return self.user_token and self.admin_token
    
    def test_user_login(self):
        """Test user login"""
        self.log("Testing user login...")
        
        # Login regular user
        login_data = {"username": TEST_USER["username"], "password": TEST_USER["password"]}
        success, response = self.test_endpoint('POST', '/auth/login/', login_data)
        if success:
            data = response.json()
            self.user_token = data.get('token')
            self.log(f"  User login successful")
        
        # Login admin user
        admin_login_data = {"username": TEST_ADMIN["username"], "password": TEST_ADMIN["password"]}
        success, response = self.test_endpoint('POST', '/auth/login/', admin_login_data)
        if success:
            data = response.json()
            self.admin_token = data.get('token')
            self.log(f"  Admin login successful")
        
        return self.user_token and self.admin_token
    
    def test_article_creation(self):
        """Test article creation"""
        self.log("Testing article creation...")
        
        headers = {"Authorization": f"Token {self.user_token}"}
        success, response = self.test_endpoint('POST', '/articles/', TEST_ARTICLE, headers=headers, expected_status=201)
        
        if success:
            data = response.json()
            article_id = data.get('id')
            self.log(f"  Article created successfully, ID: {article_id}")
            return article_id
        
        return None
    
    def test_article_approval(self, article_id):
        """Test article approval by admin"""
        self.log("Testing article approval...")
        
        headers = {"Authorization": f"Token {self.admin_token}"}
        approval_data = {"action": "approve", "admin_notes": "Test approval", "publish_immediately": True}
        
        success, response = self.test_endpoint('POST', f'/articles/{article_id}/approve_reject/', 
                                             approval_data, headers=headers)
        
        if success:
            self.log("  Article approved and published successfully")
            return True
        
        return False
    
    def test_newsletter_subscription(self):
        """Test newsletter subscription"""
        self.log("Testing newsletter subscription...")
        
        subscription_data = {"email": "newsletter@example.com"}
        success, response = self.test_endpoint('POST', '/subscribers/subscribe/', subscription_data)
        
        if success:
            self.log("  Newsletter subscription successful")
            return True
        
        return False
    
    def test_article_sharing(self, article_id):
        """Test article sharing"""
        self.log("Testing article sharing...")
        
        share_data = {"platform": "twitter"}
        success, response = self.test_endpoint('POST', f'/articles/{article_id}/share/', share_data)
        
        if success:
            self.log("  Article sharing logged successfully")
            return True
        
        return False
    
    def test_public_endpoints(self):
        """Test public endpoints"""
        self.log("Testing public endpoints...")
        
        # Test article list
        success, response = self.test_endpoint('GET', '/articles/')
        if success:
            self.log("  Article list endpoint working")
        
        # Test article by slug
        success, response = self.test_endpoint('GET', '/articles/by-slug/test-article/')
        if success:
            self.log("  Article by slug endpoint working")
        
        return True
    
    def run_all_tests(self):
        """Run all API tests"""
        self.log("Starting Cognara Blog API tests...")
        
        # Test user registration and login
        if not self.test_user_registration():
            self.log("User registration failed, trying login...")
            if not self.test_user_login():
                self.log("Both registration and login failed. Stopping tests.")
                return False
        
        # Test article creation
        article_id = self.test_article_creation()
        if not article_id:
            self.log("Article creation failed. Stopping tests.")
            return False
        
        # Test article approval
        if not self.test_article_approval(article_id):
            self.log("Article approval failed.")
        
        # Test newsletter subscription
        if not self.test_newsletter_subscription():
            self.log("Newsletter subscription failed.")
        
        # Test article sharing
        if not self.test_article_sharing(article_id):
            self.log("Article sharing failed.")
        
        # Test public endpoints
        if not self.test_public_endpoints():
            self.log("Public endpoints test failed.")
        
        self.log("API tests completed!")
        return True


if __name__ == "__main__":
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = BASE_URL
    
    tester = APITester(base_url)
    tester.run_all_tests()

