export interface User {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    is_admin: boolean;
    created_at: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    brand?: string;
    stock: number;
    images: string[];
    rating: number;
    num_reviews: number;
    created_at?: string;
}

export interface ProductCreate {
    name: string;
    description: string;
    price: number;
    category: string;
    brand?: string;
    stock: number;
    images: string[];
}

export interface CartItem {
    product_id: string;
    quantity: number;
    price: number;
    subtotal: number;
}

// Checking backend cart structure more closely via previous file view
// CartModel seems to store: user_id, items=[{product_id, quantity, price}], total_amount
// The CartResponse just returns this dict.

export interface Cart {
    id?: string; // CartResponse doesn't explicitly have ID field in some schemas but CartModel usually does. Schema `CartResponse` has user_id, items, total_amount, created_at.
    user_id: string;
    items: CartItem[];
    total_amount: number;
    created_at: string;
    updated_at?: string;
}

export interface ShippingAddress {
    full_name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    phone_no?: string;
}

export interface OrderItem {
    product_id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
}

export interface Order {
    id: string;
    user_id: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    order_items: OrderItem[];
    shipping_address: ShippingAddress;
    payment_method: string;
    items_price: number;
    shipping_price: number;
    total_price: number;
    is_paid: boolean;
    paid_at?: string;
    is_delivered: boolean;
    delivered_at?: string;
    created_at: string;
}

export interface OrderCreate {
    order_items: OrderItem[];
    shipping_address: ShippingAddress;
    payment_method: string;
    items_price: number;
    shipping_price: number;
    total_price: number;
}
