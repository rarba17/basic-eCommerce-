from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.models.cart import CartModel
from app.models.product import ProductModel
from app.Schemas.cart import CartResponse, CartItemAdd, CartItemUpdate
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])
#cart_model = CartModel()
#product_model = ProductModel()


async def get_product_model():
  return ProductModel()


async def get_cart_model():
  return CartModel()

@router.get("/", response_model=CartResponse)
async def get_cart(
    current_user: dict = Depends(get_current_user),
    cart_model: CartModel = Depends(get_cart_model)
    ):
    """Get current user's cart"""
    cart = await cart_model.get_cart_by_user_id(current_user.id)

    if not cart:
        # Create cart if doesn't exist
        await cart_model.create_cart(current_user.id)
        cart = await cart_model.get_cart_by_user_id(current_user.id)

    cart_dict = cart.copy()
    cart_dict["id"] = str(cart_dict.pop("_id"))
    return CartResponse(**cart_dict)

@router.post("/items", response_model=CartResponse)
async def add_item_to_cart(
    item: CartItemAdd,
    product_model: ProductModel = Depends(get_product_model),
    current_user: dict = Depends(get_current_user),
    cart_model: CartModel = Depends(get_cart_model)
):
    """Add item to cart"""
    # Verify product exists and has stock
    product = await product_model.get_product_by_id(item.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    if product["stock"] < item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )

    # Add to cart
    await cart_model.add_item_to_cart(
        current_user.id,
        item.product_id,
        item.quantity,
        product["price"]
    )

    # Return updated cart
    cart = await cart_model.get_cart_by_user_id(current_user.id)
    cart_dict = cart.copy()
    cart_dict["id"] = str(cart_dict.pop("_id"))
    return CartResponse(**cart_dict)

@router.put("/items/{product_id}", response_model=CartResponse)
async def update_cart_item(
    product_id: str,
    item_update: CartItemUpdate,
    current_user: dict = Depends(get_current_user),
    cart_model: CartModel = Depends(get_cart_model)
):
    """Update item quantity in cart"""
    updated = await cart_model.update_item_quantity(
        current_user.id,
        product_id,
        item_update.quantity
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )

    cart = await cart_model.get_cart_by_user_id(current_user.id)
    cart_dict = cart.copy()
    cart_dict["id"] = str(cart_dict.pop("_id"))
    return CartResponse(**cart_dict)

@router.delete("/items/{product_id}", response_model=CartResponse)
async def remove_item_from_cart(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    cart_model: CartModel = Depends(get_cart_model)
):
    """Remove item from cart"""
    updated = await cart_model.remove_item_from_cart(
        current_user.id,
        product_id
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )

    cart = await cart_model.get_cart_by_user_id(current_user.id)
    cart_dict = cart.copy()
    cart_dict["id"] = str(cart_dict.pop("_id"))
    return CartResponse(**cart_dict)

@router.delete("/clear", response_model=dict)
async def clear_cart(
    current_user: dict = Depends(get_current_user),
    cart_model: CartModel = Depends(get_cart_model)
    ):
    """Clear all items from cart"""
    await cart_model.clear_cart(current_user.id)
    return {"message": "Cart cleared successfully"}

@router.post("/checkout", response_model=dict)
async def checkout_cart(
    current_user: dict = Depends(get_current_user),
    cart_model: CartModel = Depends(get_cart_model)
    ):
    """Convert cart to order (placeholder - you'll implement this)"""
    cart = await cart_model.get_cart_by_user_id(current_user.id)

    if not cart or not cart["items"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )

    # Here you would typically:
    # 1. Create order from cart items
    # 2. Clear the cart
    # 3. Return order details

    return {
        "message": "Checkout initiated",
        "cart_items": cart["items"],
        "total_amount": cart["total_amount"]
    }