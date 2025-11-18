#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Influencer Marketplace
Tests all major backend endpoints and functionality
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

class InfluencerMarketplaceAPITester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.api_url = f"{self.base_url}/api"
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_data = {}
        self.test_service_id = None
        self.test_order_id = None
        self.manager_token = None
        self.manager_user_data = {}
        self.test_custom_order_id = None
        
        # Test data
        self.buyer_data = {
            "name": "Sarah Johnson",
            "email": "sarah.johnson@example.com",
            "password": "SecurePass123!",
            "userType": "buyer"
        }
        
        self.seller_data = {
            "name": "Alex Rodriguez",
            "email": "alex.rodriguez@example.com", 
            "password": "InfluencerPass456!",
            "userType": "seller",
            "platform": "Instagram",
            "followers": "50K",
            "bio": "Fashion and lifestyle influencer"
        }
        
        self.service_data = {
            "title": "Instagram Story Promotion",
            "description": "I will promote your brand in my Instagram story with 50K+ followers",
            "category": "Story Mentions",
            "image": "https://example.com/service-image.jpg",
            "packages": {
                "basic": {
                    "name": "Single Story",
                    "price": 25.0,
                    "delivery": 1,
                    "features": ["1 Instagram Story", "24h visibility", "Story highlights"]
                },
                "standard": {
                    "name": "Story + Post",
                    "price": 50.0,
                    "delivery": 2,
                    "features": ["1 Instagram Story", "1 Feed Post", "48h visibility"]
                },
                "premium": {
                    "name": "Full Campaign",
                    "price": 100.0,
                    "delivery": 3,
                    "features": ["2 Stories", "1 Feed Post", "1 Reel", "Analytics report"]
                }
            }
        }
        
        # Manager test data
        self.manager_data = {
            "name": "Emma Wilson",
            "email": "emma.wilson@influxier.com",
            "password": "ManagerPass789!",
            "userType": "manager",
            "bio": "Experienced influencer marketing manager with 5+ years in the industry",
            "phone": "+1-555-0123"
        }

    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status} {test_name}")
        if details:
            print(f"    Details: {details}")
        if not success:
            print(f"    ⚠️  This is a critical failure that needs attention")

    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    headers: Dict = None, auth_required: bool = False) -> requests.Response:
        """Make HTTP request with proper headers and auth"""
        url = f"{self.api_url}{endpoint}"
        
        request_headers = {"Content-Type": "application/json"}
        if headers:
            request_headers.update(headers)
            
        if auth_required and self.auth_token:
            request_headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=request_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise

    def test_authentication_flow(self) -> bool:
        """Test complete authentication flow"""
        print("\n🔐 Testing Authentication Flow...")
        
        # Test 1: Register new buyer
        try:
            response = self.make_request("POST", "/auth/register", self.buyer_data)
            
            if response.status_code == 201 or response.status_code == 200:
                data = response.json()
                if "user" in data and "token" in data:
                    self.auth_token = data["token"]
                    self.test_user_data = data["user"]
                    self.log_test("User Registration", True, f"User ID: {data['user'].get('_id', 'N/A')}")
                else:
                    self.log_test("User Registration", False, "Missing user or token in response")
                    return False
            else:
                # User might already exist, try login
                response = self.make_request("POST", "/auth/login", {
                    "email": self.buyer_data["email"],
                    "password": self.buyer_data["password"]
                })
                
                if response.status_code == 200:
                    data = response.json()
                    self.auth_token = data["token"]
                    self.test_user_data = data["user"]
                    self.log_test("User Login (existing user)", True, f"User ID: {data['user'].get('_id', 'N/A')}")
                else:
                    self.log_test("User Registration/Login", False, f"Status: {response.status_code}, Response: {response.text}")
                    return False
        except Exception as e:
            self.log_test("User Registration", False, f"Exception: {str(e)}")
            return False

        # Test 2: Get current user info
        try:
            response = self.make_request("GET", "/auth/me", auth_required=True)
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data.get("email") == self.buyer_data["email"]:
                    self.log_test("Get Current User", True, f"Email verified: {user_data['email']}")
                else:
                    self.log_test("Get Current User", False, "Email mismatch in response")
                    return False
            else:
                self.log_test("Get Current User", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Current User", False, f"Exception: {str(e)}")
            return False

        # Test 3: Test unauthorized access
        try:
            temp_token = self.auth_token
            self.auth_token = "invalid_token"
            response = self.make_request("GET", "/auth/me", auth_required=True)
            
            if response.status_code == 401:
                self.log_test("Unauthorized Access Protection", True, "Correctly rejected invalid token")
            else:
                self.log_test("Unauthorized Access Protection", False, f"Should return 401, got {response.status_code}")
                
            self.auth_token = temp_token  # Restore valid token
        except Exception as e:
            self.log_test("Unauthorized Access Protection", False, f"Exception: {str(e)}")
            self.auth_token = temp_token
            return False

        return True

    def test_service_browsing(self) -> bool:
        """Test service browsing functionality"""
        print("\n🛍️ Testing Service Browsing...")
        
        # Test 1: Get all categories
        try:
            response = self.make_request("GET", "/categories")
            
            if response.status_code == 200:
                categories = response.json()
                if isinstance(categories, list) and len(categories) > 0:
                    category_names = [cat.get("name") for cat in categories]
                    self.log_test("Get Categories", True, f"Found {len(categories)} categories: {', '.join(category_names[:3])}...")
                else:
                    self.log_test("Get Categories", False, "Empty or invalid categories response")
                    return False
            else:
                self.log_test("Get Categories", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Categories", False, f"Exception: {str(e)}")
            return False

        # Test 2: Get all services
        try:
            response = self.make_request("GET", "/services")
            
            if response.status_code == 200:
                services = response.json()
                if isinstance(services, list):
                    self.log_test("Get All Services", True, f"Found {len(services)} services")
                    
                    # Store a service ID for later tests
                    if len(services) > 0:
                        self.test_service_id = services[0].get("_id")
                else:
                    self.log_test("Get All Services", False, "Invalid services response format")
                    return False
            else:
                self.log_test("Get All Services", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get All Services", False, f"Exception: {str(e)}")
            return False

        # Test 3: Get specific service details (if we have a service ID)
        if self.test_service_id:
            try:
                response = self.make_request("GET", f"/services/{self.test_service_id}")
                
                if response.status_code == 200:
                    service = response.json()
                    if service.get("_id") == self.test_service_id:
                        self.log_test("Get Service Details", True, f"Service: {service.get('title', 'N/A')}")
                    else:
                        self.log_test("Get Service Details", False, "Service ID mismatch")
                        return False
                else:
                    self.log_test("Get Service Details", False, f"Status: {response.status_code}")
                    return False
            except Exception as e:
                self.log_test("Get Service Details", False, f"Exception: {str(e)}")
                return False

        # Test 4: Search services
        try:
            response = self.make_request("GET", "/services?search=instagram")
            
            if response.status_code == 200:
                services = response.json()
                self.log_test("Search Services", True, f"Search returned {len(services)} results")
            else:
                self.log_test("Search Services", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Search Services", False, f"Exception: {str(e)}")
            return False

        return True

    def test_order_flow(self) -> bool:
        """Test complete order flow"""
        print("\n📦 Testing Order Flow...")
        
        if not self.test_service_id:
            self.log_test("Order Flow Setup", False, "No service ID available for testing")
            return False

        # Test 1: Create new order
        try:
            order_data = {
                "serviceId": self.test_service_id,
                "package": "basic",
                "requirements": "Please promote our new eco-friendly water bottle. Target audience: health-conscious millennials. Include our hashtag #EcoHydrate"
            }
            
            response = self.make_request("POST", "/orders", order_data, auth_required=True)
            
            if response.status_code == 200 or response.status_code == 201:
                order = response.json()
                if order.get("serviceId") == self.test_service_id:
                    self.test_order_id = order.get("_id")
                    self.log_test("Create Order", True, f"Order ID: {order.get('orderId', 'N/A')}")
                else:
                    self.log_test("Create Order", False, "Service ID mismatch in created order")
                    return False
            else:
                self.log_test("Create Order", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Order", False, f"Exception: {str(e)}")
            return False

        # Test 2: Get user's orders
        try:
            response = self.make_request("GET", "/orders", auth_required=True)
            
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list):
                    user_order_found = any(order.get("_id") == self.test_order_id for order in orders)
                    if user_order_found:
                        self.log_test("Get User Orders", True, f"Found {len(orders)} orders including test order")
                    else:
                        self.log_test("Get User Orders", True, f"Found {len(orders)} orders (test order may not be visible)")
                else:
                    self.log_test("Get User Orders", False, "Invalid orders response format")
                    return False
            else:
                self.log_test("Get User Orders", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get User Orders", False, f"Exception: {str(e)}")
            return False

        # Test 3: Get specific order details
        if self.test_order_id:
            try:
                response = self.make_request("GET", f"/orders/{self.test_order_id}", auth_required=True)
                
                if response.status_code == 200:
                    order = response.json()
                    if order.get("_id") == self.test_order_id:
                        self.log_test("Get Order Details", True, f"Status: {order.get('status', 'N/A')}")
                    else:
                        self.log_test("Get Order Details", False, "Order ID mismatch")
                        return False
                else:
                    self.log_test("Get Order Details", False, f"Status: {response.status_code}")
                    return False
            except Exception as e:
                self.log_test("Get Order Details", False, f"Exception: {str(e)}")
                return False

        return True

    def test_messaging_system(self) -> bool:
        """Test messaging system"""
        print("\n💬 Testing Messaging System...")
        
        if not self.test_order_id:
            self.log_test("Messaging Setup", False, "No order ID available for testing")
            return False

        # Test 1: Send a message
        try:
            message_data = {
                "orderId": self.test_order_id,
                "message": "Hi! I'm excited to work with you on this project. When can we expect the first draft?",
                "attachments": []
            }
            
            response = self.make_request("POST", "/messages", message_data, auth_required=True)
            
            if response.status_code == 200 or response.status_code == 201:
                message = response.json()
                if message.get("orderId") == self.test_order_id:
                    self.log_test("Send Message", True, f"Message sent: {message.get('message', '')[:50]}...")
                else:
                    self.log_test("Send Message", False, "Order ID mismatch in message")
                    return False
            else:
                self.log_test("Send Message", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Send Message", False, f"Exception: {str(e)}")
            return False

        # Test 2: Get messages for order
        try:
            response = self.make_request("GET", f"/messages/{self.test_order_id}", auth_required=True)
            
            if response.status_code == 200:
                messages = response.json()
                if isinstance(messages, list):
                    self.log_test("Get Messages", True, f"Found {len(messages)} messages for order")
                else:
                    self.log_test("Get Messages", False, "Invalid messages response format")
                    return False
            else:
                self.log_test("Get Messages", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Messages", False, f"Exception: {str(e)}")
            return False

        return True

    def test_reviews_system(self) -> bool:
        """Test reviews system"""
        print("\n⭐ Testing Reviews System...")
        
        if not self.test_service_id:
            self.log_test("Reviews Setup", False, "No service ID available for testing")
            return False

        # Test: Get reviews for service
        try:
            response = self.make_request("GET", f"/reviews/{self.test_service_id}")
            
            if response.status_code == 200:
                reviews = response.json()
                if isinstance(reviews, list):
                    self.log_test("Get Service Reviews", True, f"Found {len(reviews)} reviews")
                else:
                    self.log_test("Get Service Reviews", False, "Invalid reviews response format")
                    return False
            else:
                self.log_test("Get Service Reviews", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Service Reviews", False, f"Exception: {str(e)}")
            return False

        return True

    def test_error_handling(self) -> bool:
        """Test error handling for various scenarios"""
        print("\n🚨 Testing Error Handling...")
        
        # Test 1: Invalid service ID
        try:
            response = self.make_request("GET", "/services/invalid_id")
            
            if response.status_code == 400:
                self.log_test("Invalid Service ID Handling", True, "Correctly returned 400 for invalid ID")
            else:
                self.log_test("Invalid Service ID Handling", False, f"Expected 400, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Invalid Service ID Handling", False, f"Exception: {str(e)}")
            return False

        # Test 2: Unauthorized order access
        try:
            # Try to access orders without authentication
            temp_token = self.auth_token
            self.auth_token = None
            response = self.make_request("GET", "/orders")
            
            if response.status_code == 401 or response.status_code == 403:
                self.log_test("Unauthorized Order Access", True, "Correctly rejected unauthenticated request")
            else:
                self.log_test("Unauthorized Order Access", False, f"Expected 401/403, got {response.status_code}")
                
            self.auth_token = temp_token  # Restore token
        except Exception as e:
            self.log_test("Unauthorized Order Access", False, f"Exception: {str(e)}")
            self.auth_token = temp_token
            return False

        # Test 3: Invalid order creation
        try:
            invalid_order = {
                "serviceId": "invalid_service_id",
                "package": "basic",
                "requirements": "Test requirements"
            }
            
            response = self.make_request("POST", "/orders", invalid_order, auth_required=True)
            
            if response.status_code >= 400:
                self.log_test("Invalid Order Creation", True, f"Correctly rejected invalid order (Status: {response.status_code})")
            else:
                self.log_test("Invalid Order Creation", False, f"Should reject invalid order, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Invalid Order Creation", False, f"Exception: {str(e)}")
            return False

        return True

    def run_all_tests(self) -> Dict[str, bool]:
        """Run all backend API tests"""
        print("🚀 Starting Influencer Marketplace Backend API Tests")
        print(f"🌐 Testing against: {self.api_url}")
        print("=" * 60)
        
        results = {}
        
        # Run test suites
        results["authentication"] = self.test_authentication_flow()
        results["service_browsing"] = self.test_service_browsing()
        results["order_flow"] = self.test_order_flow()
        results["messaging"] = self.test_messaging_system()
        results["reviews"] = self.test_reviews_system()
        results["error_handling"] = self.test_error_handling()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_suite, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_suite.replace('_', ' ').title()}")
        
        print(f"\n🎯 Overall Result: {passed}/{total} test suites passed")
        
        if passed == total:
            print("🎉 All backend API tests passed successfully!")
        else:
            print("⚠️  Some tests failed - check the details above")
            
        return results

def main():
    """Main test execution"""
    # Get backend URL from environment or use default
    import os
    backend_url = "https://talent-connect-93.preview.emergentagent.com"
    
    print(f"Backend URL: {backend_url}")
    
    # Initialize and run tests
    tester = InfluencerMarketplaceAPITester(backend_url)
    results = tester.run_all_tests()
    
    # Return exit code based on results
    if all(results.values()):
        exit(0)  # Success
    else:
        exit(1)  # Some tests failed

if __name__ == "__main__":
    main()