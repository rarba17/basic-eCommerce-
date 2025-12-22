import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { productsApi } from '@/api/products.api';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function Home() {
    const { data: products, isLoading } = useQuery({
        queryKey: ['products', 'featured'],
        queryFn: () => productsApi.getAll({ limit: 4 })
    });

    // Also categories?
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => productsApi.getCategories()
    });

    return (
        <div className="flex flex-col gap-12 pb-10">
            {/* Hero */}
            <section className="bg-muted py-20 px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                    Welcome to E-Shop
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Discover the best products at unbeatable prices. Shop the latest trends in electronics, fashion, and more.
                </p>
                <Link to="/products">
                    <Button size="lg" className="text-lg px-8">Shop Now</Button>
                </Link>
            </section>

            {/* Featured Products */}
            <section className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {products?.slice(0, 4).map((product: Product) => (
                            <Card key={product.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                                <CardHeader className="p-0">
                                    <div className="aspect-square bg-muted w-full relative overflow-hidden rounded-t-lg">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 flex-1">
                                    <CardTitle className="line-clamp-1 mb-2 text-lg">{product.name}</CardTitle>
                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{product.description}</p>
                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="font-bold text-lg">${product.price}</span>
                                        <Badge variant="outline">{product.category}</Badge>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Link to={`/products/${product.id}`} className="w-full">
                                        <Button className="w-full" variant="secondary">View Details</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* Categories */}
            <section className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories?.map((cat) => (
                        <Link to={`/products?category=${cat}`} key={cat}>
                            <Card className="hover:bg-muted transition-colors cursor-pointer">
                                <CardContent className="flex items-center justify-center h-32 font-semibold text-xl">
                                    {cat}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
