import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/features/cart/CartDrawer';
import Home from './pages/Home';
import About from './pages/About';
import Articles from './pages/Articles';
import Chronicles from './pages/Chronicles';
import Store from './pages/Store';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/admin/Dashboard';
import ArticleEditor from './pages/admin/ArticleEditor';
import ProductsManager from './pages/admin/ProductsManager';
import ProductEditor from './pages/admin/ProductEditor';
import SuppliersManager from './pages/admin/SuppliersManager';
import SupplierEditor from './pages/admin/SupplierEditor';
import ArticleDetail from './pages/ArticleDetail';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <div className="flex flex-col min-h-screen bg-background text-text-primary font-sans">
                        <Header />
                        <main className="flex-grow">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/artigos" element={<Articles />} />
                                <Route path="/cronicas" element={<Chronicles />} />
                                <Route path="/artigo/:id" element={<ArticleDetail />} />
                                <Route path="/cronica/:id" element={<ArticleDetail />} />
                                <Route path="/store" element={<Store />} />
                                <Route path="/checkout" element={<Checkout />} />
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
                            </Routes>
                        </main>
                        <Footer />
                        <CartDrawer />
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
