import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/products.api';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category') || 'all';
    const [searchQuery, setSearchQuery] = useState('');

    const { data: products, isLoading } = useQuery({
        queryKey: ['products', categoryParam, searchQuery],
        queryFn: () => productsApi.getAll({
            category: categoryParam !== 'all' ? categoryParam : undefined,
            search: searchQuery || undefined
        })
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => productsApi.getCategories()
    });

    const handleCategoryChange = (value: string) => {
        setSearchParams({ category: value });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Logic handled by react-query state binding effectively, 
        // but usually search triggers on submission or debounce.
        // Here binded to state which triggers refetch.
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Products</h1>

                <div className="flex gap-4 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search products..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    <Select value={categoryParam} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories?.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i} className="h-[300px] animate-pulse bg-muted"></Card>
                    ))}
                </div>
            ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Card key={product.id} className="flex flex-col transition-all hover:border-primary">
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
                                    <Badge variant="secondary">{product.category}</Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Link to={`/products/${product.id}`} className="w-full">
                                    <Button className="w-full">View Details</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <h3 className="text-xl font-semibold">No products found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                </div>
            )}
        </div>
    );
}
