import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/products.api';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productsApi.getById(id!),
        enabled: !!id
    });

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            return;
        }
        if (!product) return;

        try {
            await addItem(product.id, quantity);
            toast.success('Added to cart');
        } catch (error: any) {
            toast.error('Failed to add to cart: ' + error.response?.data?.detail);
        }
    };

    if (isLoading) return <div className="container py-20 text-center">Loading...</div>;
    if (!product) return <div className="container py-20 text-center">Product not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Images */}
                <div className="bg-muted rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                    {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="object-contain w-full h-full" />
                    ) : (
                        <span className="text-muted-foreground text-lg">No Image Available</span>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-6">
                    <div>
                        <Badge className="mb-2">{product.category}</Badge>
                        <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                        <p className="text-2xl font-semibold">${product.price}</p>
                    </div>

                    <p className="text-muted-foreground text-lg">{product.description}</p>

                    <div className="py-4 border-y">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="font-semibold">Quantity:</span>
                            <div className="flex items-center border rounded-md">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center">{quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={quantity >= product.stock}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <span className="text-sm text-muted-foreground">{product.stock} available</span>
                        </div>

                        <Button size="lg" className="w-full md:w-auto" onClick={handleAddToCart} disabled={product.stock === 0}>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
