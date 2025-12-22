import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


export function Orders() {
    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: ordersApi.getAll
    });

    if (isLoading) return <div className="container py-20 text-center">Loading orders...</div>;

    if (!orders || orders.length === 0) return <div className="container py-20 text-center">No orders found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            <div className="space-y-6">
                {orders.map((order) => (
                    <Card key={order.id}>
                        <CardHeader className="flex flex-row items-center justify-between bg-muted/20">
                            <div>
                                <CardTitle className="text-base">Order #{order.id}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown Date'}
                                </p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <span className="font-bold">${order.total_price}</span>
                                <Badge>{order.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                {order.order_items?.map(item => (
                                    <div key={item.product_id} className="flex justify-between text-sm">
                                        <span>{item.name || `Product ${item.product_id}`} x {item.quantity}</span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t text-sm">
                                <p className="font-semibold">Shipping Address:</p>
                                <p>{order.shipping_address?.full_name}</p>
                                <p>{order.shipping_address?.address}, {order.shipping_address?.city}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
