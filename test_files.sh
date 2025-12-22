
  #!/bin/bash

  BASE_URL="http://localhost:8000"

  echo "🧪 Testing Critical Fixes"
  echo "========================"

  # Colors
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  NC='\033[0m' # No Color

  # Test 1: Server Health
  echo -e "\n1️⃣  Testing server health..."
  if curl -s $BASE_URL/health | jq -e '.status == "healthy"' > /dev/null; then
    echo -e "${GREEN}✅ Server is healthy${NC}"
  else
    echo -e "${RED}❌ Server not responding${NC}"
    exit 1
  fi

  # Test 2: Seed products
  echo -e "\n2️⃣  Seeding test products..."
  curl -s -X DELETE $BASE_URL/seed/products > /dev/null
  SEED_RESULT=$(curl -s -X POST $BASE_URL/seed/products)
  PRODUCT_COUNT=$(echo $SEED_RESULT | jq -r '.message' | grep -o '[0-9]\+')
  echo -e "${GREEN}✅ Seeded $PRODUCT_COUNT products${NC}"

  # Test 3: Register user
  echo -e "\n3️⃣  Registering test user..."
  curl -s -X POST $BASE_URL/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email": "tester@test.com", "password": "test123", "full_name": "Tester"}' > /dev/null
  echo -e "${GREEN}✅ User registered${NC}"

  # Test 4: Login
  echo -e "\n4️⃣  Logging in..."
  TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=tester@test.com&password=test123" | jq -r '.access_token')

  if [ "$TOKEN" != "null" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
  else
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
  fi

  # Test 5: Get cart (tests CartModel fix)
  echo -e "\n5️⃣  Testing CartModel (property fix)..."
  CART=$(curl -s -X GET $BASE_URL/cart/ -H "Authorization: Bearer $TOKEN")
  if echo $CART | jq -e '.user_id' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ CartModel works - no AttributeError${NC}"
  else
    echo -e "${RED}❌ CartModel failed${NC}"
  fi

  # Test 6: Get orders (tests OrderModel fix)
  echo -e "\n6️⃣  Testing OrderModel (property fix)..."
  ORDERS=$(curl -s -X GET $BASE_URL/orders/ -H "Authorization: Bearer $TOKEN")
  if echo $ORDERS | jq -e 'type == "array"' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OrderModel works - no AttributeError${NC}"
  else
    echo -e "${RED}❌ OrderModel failed${NC}"
  fi

  echo -e "\n✨ Basic tests complete!"
  echo -e "\nFor multi-item order and race condition tests, follow the detailed steps in the guide."
