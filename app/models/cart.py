from datetime import datetime
from bson import ObjectId
from app.database import db
from typing import List, Optional, Dict

class CartModel:
    def __init__(self):
        self.collection = db.get_collection("carts")

    async def get_cart_by_user_id(self, user_id: str) -> Optional[Dict]:
        """Get cart for a specific user"""
        return await self.collection.find_one({"user_id": user_id})

    async def create_cart(self, user_id: str) -> str:
        """Create a new cart for user"""
        cart_data = {
            "user_id": user_id,
            "items": [],
            "total_amount": 0.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await self.collection.insert_one(cart_data)
        return str(result.inserted_id)

    async def add_item_to_cart(self, user_id: str, product_id: str, quantity: int, price: float) -> bool:
        """Add item to cart or update quantity if exists"""
        cart = await self.get_cart_by_user_id(user_id)

        if not cart:
            # Create new cart if doesn't exist
            await self.create_cart(user_id)
            cart = await self.get_cart_by_user_id(user_id)

        # Check if item already exists in cart
        existing_item = None
        for item in cart["items"]:
            if item["product_id"] == product_id:
                existing_item = item
                break

        if existing_item:
            # Update quantity
            existing_item["quantity"] += quantity
            existing_item["subtotal"] = existing_item["quantity"] * price
        else:
            # Add new item
            new_item = {
                "product_id": product_id,
                "quantity": quantity,
                "price": price,
                "subtotal": quantity * price
            }
            cart["items"].append(new_item)

        # Update total amount
        total_amount = sum(item["subtotal"] for item in cart["items"])

        result = await self.collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "items": cart["items"],
                    "total_amount": total_amount,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def remove_item_from_cart(self, user_id: str, product_id: str) -> bool:
        """Remove item from cart"""
        cart = await self.get_cart_by_user_id(user_id)
        if not cart:
            return False

        # Filter out the item
        cart["items"] = [item for item in cart["items"] if item["product_id"] != product_id]

        # Update total amount
        total_amount = sum(item["subtotal"] for item in cart["items"])

        result = await self.collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "items": cart["items"],
                    "total_amount": total_amount,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def update_item_quantity(self, user_id: str, product_id: str, quantity: int) -> bool:
        """Update quantity of specific item"""
        cart = await self.get_cart_by_user_id(user_id)
        if not cart:
            return False

        # Find and update item
        for item in cart["items"]:
            if item["product_id"] == product_id:
                if quantity <= 0:
                    # Remove item if quantity is 0 or less
                    return await self.remove_item_from_cart(user_id, product_id)

                item["quantity"] = quantity
                item["subtotal"] = quantity * item["price"]
                break

        # Update total amount
        total_amount = sum(item["subtotal"] for item in cart["items"])

        result = await self.collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "items": cart["items"],
                    "total_amount": total_amount,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def clear_cart(self, user_id: str) -> bool:
        """Clear all items from cart"""
        result = await self.collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "items": [],
                    "total_amount": 0.0,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def delete_cart(self, user_id: str) -> bool:
        """Delete cart entirely"""
        result = await self.collection.delete_one({"user_id": user_id})
        return result.deleted_count > 0

    async def merge_cart_with_order(self, user_id: str) -> Optional[Dict]:
        """Get cart items for order creation (then clear cart)"""
        cart = await self.get_cart_by_user_id(user_id)
        if cart and cart["items"]:
            # Clear cart after getting items
            await self.clear_cart(user_id)
            return cart
        return None