import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/api/products.api';
import { api } from '@/api/axios';
import type { Product, ProductCreate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

export function AdminDashboard() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { data: products, isLoading } = useQuery({
        queryKey: ['products', 'admin'],
        queryFn: () => productsApi.getAll({ limit: 1000 })
    });

    const deleteMutation = useMutation({
        mutationFn: productsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted');
        },
        onError: (error: any) => toast.error('Failed to delete: ' + error.message)
    });

    const createMutation = useMutation({
        mutationFn: productsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsDialogOpen(false);
            toast.success('Product created');
        },
        onError: (error: any) => toast.error('Failed to create: ' + error.message)
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ProductCreate> }) => productsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsDialogOpen(false);
            setEditingProduct(null);
            toast.success('Product updated');
        },
        onError: (error: any) => toast.error('Failed to update: ' + error.message)
    });

    const handleDelete = (id: string) => {
        if (confirm('Are you sure?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsDialogOpen(true);
    }

    const handleSeed = async () => {
        try {
            await api.post('/seed/products');
            toast.success('Database seeded successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        } catch (error: any) {
            toast.error('Seed failed: ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleClear = async () => {
        if (confirm('Are you sure you want to clear all products? This action cannot be undone.')) {
            try {
                await api.delete('/seed/products');
                toast.success('Database cleared successfully');
                queryClient.invalidateQueries({ queryKey: ['products'] });
            } catch (error: any) {
                toast.error('Clear failed: ' + (error.response?.data?.detail || error.message));
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={handleClear} className="text-red-500 border-red-500 hover:bg-red-50">
                        Clear Database
                    </Button>
                    <Button variant="outline" onClick={handleSeed}>
                        Seed Database
                    </Button>
                    <Button onClick={handleAddNew}>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Products Management</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <div>Loading...</div> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products?.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>${product.price}</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                        product={editingProduct}
                        onSubmit={(data) => {
                            if (editingProduct) {
                                updateMutation.mutate({ id: editingProduct.id, data });
                            } else {
                                createMutation.mutate(data as ProductCreate);
                            }
                        }}
                        isSubmitting={createMutation.isPending || updateMutation.isPending}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ProductForm({ product, onSubmit, isSubmitting }: { product: Product | null, onSubmit: (data: any) => void, isSubmitting: boolean }) {
    const { register, handleSubmit, formState: { errors } } = useForm<ProductCreate>({
        defaultValues: product ? {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            images: product.images || [],
            brand: product.brand
        } : {
            images: []
        }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name', { required: 'Name is required' })} />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description', { required: 'Description is required' })} />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true, required: 'Price is required' })} />
                    {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" type="number" {...register('stock', { valueAsNumber: true, required: 'Stock is required' })} />
                    {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message}</p>}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register('category', { required: 'Category is required' })} />
                {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" placeholder="http://..." {...register('images.0')} />
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Product'}
                </Button>
            </div>
        </form>
    );
}
