import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import BottomTabBar from './components/layout/BottomTabBar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/features/cart/CartDrawer';
import InstallPrompt from './components/features/pwa/InstallPrompt';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Articles = lazy(() => import('./pages/Articles'));
const Chronicles = lazy(() => import('./pages/Chronicles'));
// LOJA TEMPORARIAMENTE FORA DO AR — ver StoreUnderConstruction.jsx.
// Para reativar: descomente as duas linhas abaixo, remova o import da página
// de construção e volte as rotas /store e /checkout (mais abaixo).
// const Store = lazy(() => import('./pages/Store'));
// const Checkout = lazy(() => import('./pages/Checkout'));
const StoreUnderConstruction = lazy(() => import('./pages/StoreUnderConstruction'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ArticleEditor = lazy(() => import('./pages/admin/ArticleEditor'));
const ProductsManager = lazy(() => import('./pages/admin/ProductsManager'));
const ProductEditor = lazy(() => import('./pages/admin/ProductEditor'));
const SuppliersManager = lazy(() => import('./pages/admin/SuppliersManager'));
const SupplierEditor = lazy(() => import('./pages/admin/SupplierEditor'));
const OrdersManager = lazy(() => import('./pages/admin/OrdersManager'));
const OrderDetailAdmin = lazy(() => import('./pages/admin/OrderDetailAdmin'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));

function PageLoader() {
    return (
        <div className="flex justify-center items-center min-h-[50vh] py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <div className="flex flex-col min-h-screen bg-background text-text-primary font-sans">
                        <Header />
                        <main className="flex-grow pb-16 md:pb-0">
                            <Suspense fallback={<PageLoader />}>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/artigos" element={<Articles />} />
                                    <Route path="/cronicas" element={<Chronicles />} />
                                    <Route path="/artigo/:id" element={<ArticleDetail />} />
                                    <Route path="/cronica/:id" element={<ArticleDetail />} />
                                    {/* LOJA EM CONSTRUÇÃO — restaurar para <Store /> e <Checkout /> */}
                                    <Route path="/store" element={<StoreUnderConstruction />} />
                                    <Route path="/checkout" element={<Navigate to="/store" replace />} />
                                    <Route path="/orders" element={<Orders />} />
                                    <Route path="/orders/:orderId" element={<OrderDetail />} />
                                    <Route path="/sobre" element={<About />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/signup" element={<SignUp />} />
                                    <Route
                                        path="/admin"
                                        element={
                                            <ProtectedRoute requireAdmin={true}>
                                                <Dashboard />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/new"
                                        element={
                                            <ProtectedRoute requireAdmin={true}>
                                                <ArticleEditor />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/edit/:id"
                                        element={
                                            <ProtectedRoute requireAdmin={true}>
                                                <ArticleEditor />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/products"
                                        element={
                                            <ProtectedRoute requireAdmin={true}>
                                                <ProductsManager />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/products/new"
                                        element={
                                            <ProtectedRoute requireAdmin={true}>
                                                <ProductEditor />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/products/edit/:id"
                                        element={
                                            <ProtectedRoute requireAdmin={true}>
                                                <ProductEditor />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/suppliers"
                                        element={
                                            <ProtectedRoute requireAdmin={true}>
                                                <SuppliersManager />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/suppliers/new"
                                        element={
                                            <ProtectedRoute requireAdmin={true}>
                                                <SupplierEditor />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/suppliers/edit/:id"
                                        element={
                                            <ProtectedRoute requireAdmin={true}>
                                                <SupplierEditor />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/orders"
                                        element={
                                            <ProtectedRoute requireAdmin={true}>
                                                <OrdersManager />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/orders/:orderId"
                                        element={
                                            <ProtectedRoute requireAdmin={true}>
                                                <OrderDetailAdmin />
                                            </ProtectedRoute>
                                        }
                                    />
                                </Routes>
                            </Suspense>
                        </main>
                        <Footer />
                        <BottomTabBar />
                        <CartDrawer />
                        <InstallPrompt />
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
