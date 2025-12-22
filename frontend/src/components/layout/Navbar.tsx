import { Link } from 'react-router-dom';
import { ShoppingCart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { cart } = useCartStore();

    const cartItemCount = cart?.items?.length || 0; // Or sum quantity if preferred

    return (
        <nav className="border-b bg-background sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold">
                    E-Shop
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/" className="text-sm font-medium hover:text-primary">
                        Home
                    </Link>
                    <Link to="/products" className="text-sm font-medium hover:text-primary">
                        Products
                    </Link>
                    {isAuthenticated && (
                        <Link to="/orders" className="text-sm font-medium hover:text-primary">
                            Orders
                        </Link>
                    )}
                    {user?.is_admin && (
                        <Link to="/admin" className="text-sm font-medium hover:text-primary text-red-500">
                            Admin
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/cart">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            {cartItemCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0">
                                    {cartItemCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium hidden md:block">
                                Hi, {user?.username}
                            </span>
                            <Button variant="ghost" size="icon" onClick={() => logout()}>
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button>Register</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
