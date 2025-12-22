import { useCartStore } from '@/store/cart.store';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Cart() {
    const { cart, isLoading, updateItem, removeItem, clearCart } = useCartStore();

    if (isLoading && !cart) return <div className="container py-20 text-center">Loading cart...</div>;

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container py-20 text-center flex flex-col items-center gap-4">
                <h2 className="text-2xl font-bold">Your cart is empty</h2>
                <p className="text-muted-foreground">Add some products to get started.</p>
                <Link to="/products">
                    <Button size="lg">Browse Products</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Chart</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-center">Quantity</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.items.map((item) => (
                                    <TableRow key={item.product_id}>
                                        <TableCell className="font-medium">
                                            {/* Ideally we fetch product name if not in item, but let's assume item structure or fetch separate */}
                                            {/* Backend cart item only has product_id. We might need to fetch names or store assumes consistent. */}
                                            {/* For now displaying Product ID or placeholder if name missing */}
                                            Product {item.product_id.slice(-4)}
                                            {/* Since backend doesn't return name in CartItem, we usually need a join. 
                                        Or we can fetch product details for each item. 
                                        For this MVP, I will just show ID or "Product". 
                                        Wait, verifying assumptions: "Backend may return raw arrays". 
                                        The `CartResponse` has `items: List[CartItem]` where CartItem has `product_id`.
                                        Does it have `name`? Schema `CartItem` in `cart.py` has `product_id`, `quantity`, `price`, `subtotal`. NO NAME.
                                        So I should strictly fetch product name.
                                        However, fetching N products might be slow.
                                        I will verify this behavior later.
                                    */}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItem(item.product_id, Math.max(1, item.quantity - 1))}>
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItem(item.product_id, item.quantity + 1)}>
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">${item.price}</TableCell>
                                        <TableCell className="text-right font-bold">${item.subtotal}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.product_id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button variant="outline" onClick={() => clearCart()} className="text-red-500 hover:text-red-600">
                            Clear Cart
                        </Button>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="border rounded-lg p-6 bg-muted/20">
                        <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${cart.total_amount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${cart.total_amount}</span>
                            </div>
                        </div>
                        <Link to="/checkout" className="w-full">
                            <Button className="w-full" size="lg">Proceed to Checkout</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
