import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/store/cart.store';
import { ordersApi } from '@/api/orders.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

const addressSchema = z.object({
    full_name: z.string().min(3),
    address: z.string().min(5),
    city: z.string().min(2),
    postal_code: z.string().min(3),
    country: z.string().min(2),
    phone_no: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export function Checkout() {
    const { cart, clearCart } = useCartStore();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            full_name: user?.full_name || '',
        }
    });

    const onSubmit = async (data: AddressFormValues) => {
        if (!cart || cart.items.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        try {
            const orderData = {
                order_items: cart.items.map(item => ({
                    product_id: item.product_id,
                    name: `Product ${item.product_id}`, // Fallback name
                    quantity: item.quantity,
                    price: item.price,
                    // image: undefined 
                })),
                shipping_address: data,
                payment_method: 'credit_card', // hardcoded for demo
                items_price: cart.total_amount,
                shipping_price: 10,
                total_price: cart.total_amount + 10,
            };

            await ordersApi.create(orderData);
            toast.success('Order placed successfully!');
            await clearCart();
            navigate('/orders');
        } catch (error: any) {
            toast.error('Failed to place order: ' + (error.response?.data?.detail || error.message));
        }
    };

    if (!cart || cart.items.length === 0) {
        return <div className="container py-20 text-center">Your cart is empty</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid lg:grid-cols-2 gap-8">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input id="full_name" {...register('full_name')} />
                                    {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" {...register('address')} />
                                    {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" {...register('city')} />
                                        {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Postal Code</Label>
                                        <Input id="postal_code" {...register('postal_code')} />
                                        {errors.postal_code && <p className="text-sm text-red-500">{errors.postal_code.message}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" {...register('country')} />
                                    {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="bg-muted/20">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {cart.items.map(item => (
                                    <div key={item.product_id} className="flex justify-between text-sm">
                                        <span>Product {item.product_id.slice(-4)} x {item.quantity}</span>
                                        <span>${item.subtotal}</span>
                                    </div>
                                ))}
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>${cart.total_amount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>$10.00</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total</span>
                                        <span>${cart.total_amount + 10}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                form="checkout-form"
                                className="w-full mt-6"
                                size="lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Placing Order...' : 'Place Order'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
