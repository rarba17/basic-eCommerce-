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
REGISTER_RESULT=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "tester@test.com", "password": "testpassword123", "full_name": "Tester", "username": "tester"}')

if echo $REGISTER_RESULT | jq -e '.id' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ User registered${NC}"
else
  # User might already exist, that's okay
  echo -e "${GREEN}✅ User already exists or registered${NC}"
fi

# Test 4: Login
echo -e "\n4️⃣  Logging in..."
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "tester@test.com", "password": "testpassword123"}' | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✅ Login successful${NC}"
  echo "   Token: ${TOKEN:0:20}..."
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
  echo "   Response: $CART"
fi

# Test 6: Get orders (tests OrderModel fix)
echo -e "\n6️⃣  Testing OrderModel (property fix)..."
ORDERS=$(curl -s -X GET $BASE_URL/orders/ -H "Authorization: Bearer $TOKEN")
if echo $ORDERS | jq -e 'type == "array"' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ OrderModel works - no AttributeError${NC}"
else
  echo -e "${RED}❌ OrderModel failed${NC}"
  echo "   Response: $ORDERS"
fi

# Test 7: Multi-item order
echo -e "\n7️⃣  Testing multi-item order (bug fix)..."

# Get first 3 product IDs
PRODUCTS=$(curl -s -X GET $BASE_URL/products/ | jq -r '.[0:3]')
PRODUCT_ID_1=$(echo $PRODUCTS | jq -r '.[0].id')
PRODUCT_ID_2=$(echo $PRODUCTS | jq -r '.[1].id')
PRODUCT_ID_3=$(echo $PRODUCTS | jq -r '.[2].id')

PRODUCT_NAME_1=$(echo $PRODUCTS | jq -r '.[0].name')
PRODUCT_NAME_2=$(echo $PRODUCTS | jq -r '.[1].name')
PRODUCT_NAME_3=$(echo $PRODUCTS | jq -r '.[2].name')

PRODUCT_PRICE_1=$(echo $PRODUCTS | jq -r '.[0].price')
PRODUCT_PRICE_2=$(echo $PRODUCTS | jq -r '.[1].price')
PRODUCT_PRICE_3=$(echo $PRODUCTS | jq -r '.[2].price')

# Get initial stock levels
INITIAL_STOCK_1=$(echo $PRODUCTS | jq -r '.[0].stock')
INITIAL_STOCK_2=$(echo $PRODUCTS | jq -r '.[1].stock')
INITIAL_STOCK_3=$(echo $PRODUCTS | jq -r '.[2].stock')

echo "   Product 1: $PRODUCT_NAME_1 (Stock: $INITIAL_STOCK_1)"
echo "   Product 2: $PRODUCT_NAME_2 (Stock: $INITIAL_STOCK_2)"
echo "   Product 3: $PRODUCT_NAME_3 (Stock: $INITIAL_STOCK_3)"

# Calculate total
ITEMS_PRICE=$(echo "$PRODUCT_PRICE_1 * 2 + $PRODUCT_PRICE_2 + $PRODUCT_PRICE_3" | bc)
SHIPPING_PRICE=10
TOTAL_PRICE=$(echo "$ITEMS_PRICE + $SHIPPING_PRICE" | bc)

# Create order with 3 items
ORDER_RESPONSE=$(curl -s -X POST $BASE_URL/orders/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"order_items\": [
      {
        \"product_id\": \"$PRODUCT_ID_1\",
        \"name\": \"$PRODUCT_NAME_1\",
        \"quantity\": 2,
        \"price\": $PRODUCT_PRICE_1
      },
      {
        \"product_id\": \"$PRODUCT_ID_2\",
        \"name\": \"$PRODUCT_NAME_2\",
        \"quantity\": 1,
        \"price\": $PRODUCT_PRICE_2
      },
      {
        \"product_id\": \"$PRODUCT_ID_3\",
        \"name\": \"$PRODUCT_NAME_3\",
        \"quantity\": 1,
        \"price\": $PRODUCT_PRICE_3
      }
    ],
    \"shipping_address\": {
      \"full_name\": \"Test User\",
      \"address\": \"123 Test St\",
      \"city\": \"Test City\",
      \"postal_code\": \"12345\",
      \"country\": \"USA\"
    },
    \"payment_method\": \"credit_card\",
    \"items_price\": $ITEMS_PRICE,
    \"shipping_price\": $SHIPPING_PRICE,
    \"total_price\": $TOTAL_PRICE
  }")

if echo $ORDER_RESPONSE | jq -e '._id' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Order created successfully${NC}"
  ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '._id')
  echo "   Order ID: $ORDER_ID"

  # Check stock was reduced for ALL products
  NEW_STOCK_1=$(curl -s -X GET $BASE_URL/products/$PRODUCT_ID_1 | jq -r '.stock')
  NEW_STOCK_2=$(curl -s -X GET $BASE_URL/products/$PRODUCT_ID_2 | jq -r '.stock')
  NEW_STOCK_3=$(curl -s -X GET $BASE_URL/products/$PRODUCT_ID_3 | jq -r '.stock')

  echo "   After order:"
  echo "   Product 1: $INITIAL_STOCK_1 → $NEW_STOCK_1 (expected: $((INITIAL_STOCK_1 - 2)))"
  echo "   Product 2: $INITIAL_STOCK_2 → $NEW_STOCK_2 (expected: $((INITIAL_STOCK_2 - 1)))"
  echo "   Product 3: $INITIAL_STOCK_3 → $NEW_STOCK_3 (expected: $((INITIAL_STOCK_3 - 1)))"

  # Verify all stocks reduced correctly
  if [ "$NEW_STOCK_1" -eq "$((INITIAL_STOCK_1 - 2))" ] && \
     [ "$NEW_STOCK_2" -eq "$((INITIAL_STOCK_2 - 1))" ] && \
     [ "$NEW_STOCK_3" -eq "$((INITIAL_STOCK_3 - 1))" ]; then
    echo -e "${GREEN}✅ All products stock reduced correctly - multi-item bug FIXED!${NC}"
  else
    echo -e "${RED}❌ Stock reduction incorrect - bug still exists${NC}"
  fi
else
  echo -e "${RED}❌ Order creation failed${NC}"
  echo "   Response: $ORDER_RESPONSE"
fi

echo -e "\n✨ Basic tests complete!"
echo -e "\nFor race condition tests, follow the detailed steps in the guide."
