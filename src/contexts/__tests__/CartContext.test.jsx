import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

describe('CartContext', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('useCart', () => {
        it('deve inicializar com carrinho vazio', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            expect(result.current.cartItems).toEqual([]);
            expect(result.current.cartCount).toBe(0);
            expect(result.current.cartTotal).toBe(0);
            expect(result.current.isCartOpen).toBe(false);
        });

        it('deve carregar carrinho do localStorage na inicialização', () => {
            const savedCart = [
                { id: '1', name: 'Produto 1', price: 10, quantity: 2 }
            ];
            localStorage.setItem('cart', JSON.stringify(savedCart));

            const { result } = renderHook(() => useCart(), { wrapper });

            expect(result.current.cartItems).toEqual(savedCart);
            expect(result.current.cartCount).toBe(2);
        });

        it('deve lidar com localStorage corrompido graciosamente', () => {
            localStorage.setItem('cart', 'invalid-json');
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const { result } = renderHook(() => useCart(), { wrapper });

            expect(result.current.cartItems).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });

    describe('addToCart', () => {
        it('deve adicionar produto ao carrinho', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product = { id: '1', name: 'Produto 1', price: 10 };

            act(() => {
                result.current.addToCart(product);
            });

            expect(result.current.cartItems).toHaveLength(1);
            expect(result.current.cartItems[0]).toEqual({ ...product, quantity: 1 });
            expect(result.current.cartCount).toBe(1);
            expect(result.current.isCartOpen).toBe(true);
        });

        it('deve aumentar quantidade quando produto já existe', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product = { id: '1', name: 'Produto 1', price: 10 };

            act(() => {
                result.current.addToCart(product, 2);
                result.current.addToCart(product, 3);
            });

            expect(result.current.cartItems).toHaveLength(1);
            expect(result.current.cartItems[0].quantity).toBe(5);
            expect(result.current.cartCount).toBe(5);
        });

        it('deve adicionar quantidade específica', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product = { id: '1', name: 'Produto 1', price: 10 };

            act(() => {
                result.current.addToCart(product, 5);
            });

            expect(result.current.cartItems[0].quantity).toBe(5);
        });

        it('deve abrir carrinho ao adicionar item', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product = { id: '1', name: 'Produto 1', price: 10 };

            act(() => {
                result.current.addToCart(product);
            });

            expect(result.current.isCartOpen).toBe(true);
        });
    });

    describe('removeFromCart', () => {
        it('deve remover produto do carrinho', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product1 = { id: '1', name: 'Produto 1', price: 10 };
            const product2 = { id: '2', name: 'Produto 2', price: 20 };

            act(() => {
                result.current.addToCart(product1);
                result.current.addToCart(product2);
            });

            expect(result.current.cartItems).toHaveLength(2);

            act(() => {
                result.current.removeFromCart('1');
            });

            expect(result.current.cartItems).toHaveLength(1);
            expect(result.current.cartItems[0].id).toBe('2');
        });
    });

    describe('updateQuantity', () => {
        it('deve atualizar quantidade do produto', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product = { id: '1', name: 'Produto 1', price: 10 };

            act(() => {
                result.current.addToCart(product, 2);
                result.current.updateQuantity('1', 5);
            });

            expect(result.current.cartItems[0].quantity).toBe(5);
            expect(result.current.cartCount).toBe(5);
        });

        it('deve remover produto quando quantidade for 0', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product = { id: '1', name: 'Produto 1', price: 10 };

            act(() => {
                result.current.addToCart(product, 2);
                result.current.updateQuantity('1', 0);
            });

            expect(result.current.cartItems).toHaveLength(0);
        });

        it('deve remover produto quando quantidade for negativa', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product = { id: '1', name: 'Produto 1', price: 10 };

            act(() => {
                result.current.addToCart(product, 2);
                result.current.updateQuantity('1', -1);
            });

            expect(result.current.cartItems).toHaveLength(0);
        });
    });

    describe('clearCart', () => {
        it('deve limpar todos os itens do carrinho', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product1 = { id: '1', name: 'Produto 1', price: 10 };
            const product2 = { id: '2', name: 'Produto 2', price: 20 };

            act(() => {
                result.current.addToCart(product1, 2);
                result.current.addToCart(product2, 3);
                result.current.clearCart();
            });

            expect(result.current.cartItems).toHaveLength(0);
            expect(result.current.cartCount).toBe(0);
            expect(result.current.cartTotal).toBe(0);
        });
    });

    describe('openCart e closeCart', () => {
        it('deve abrir e fechar carrinho', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            expect(result.current.isCartOpen).toBe(false);

            act(() => {
                result.current.openCart();
            });

            expect(result.current.isCartOpen).toBe(true);

            act(() => {
                result.current.closeCart();
            });

            expect(result.current.isCartOpen).toBe(false);
        });
    });

    describe('cartCount e cartTotal', () => {
        it('deve calcular total de itens corretamente', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product1 = { id: '1', name: 'Produto 1', price: 10 };
            const product2 = { id: '2', name: 'Produto 2', price: 20 };

            act(() => {
                result.current.addToCart(product1, 2);
                result.current.addToCart(product2, 3);
            });

            expect(result.current.cartCount).toBe(5);
            expect(result.current.cartTotal).toBe(80); // (10 * 2) + (20 * 3)
        });

        it('deve calcular total como 0 quando carrinho está vazio', () => {
            const { result } = renderHook(() => useCart(), { wrapper });

            expect(result.current.cartCount).toBe(0);
            expect(result.current.cartTotal).toBe(0);
        });
    });

    describe('persistência no localStorage', () => {
        it('deve salvar carrinho no localStorage ao adicionar item', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product = { id: '1', name: 'Produto 1', price: 10 };

            act(() => {
                result.current.addToCart(product, 2);
            });

            const savedCart = JSON.parse(localStorage.getItem('cart'));
            expect(savedCart).toHaveLength(1);
            expect(savedCart[0].quantity).toBe(2);
        });

        it('deve salvar carrinho no localStorage ao atualizar quantidade', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product = { id: '1', name: 'Produto 1', price: 10 };

            act(() => {
                result.current.addToCart(product);
                result.current.updateQuantity('1', 5);
            });

            const savedCart = JSON.parse(localStorage.getItem('cart'));
            expect(savedCart[0].quantity).toBe(5);
        });

        it('deve salvar carrinho vazio no localStorage ao limpar', () => {
            const { result } = renderHook(() => useCart(), { wrapper });
            const product = { id: '1', name: 'Produto 1', price: 10 };

            act(() => {
                result.current.addToCart(product);
                result.current.clearCart();
            });

            const savedCart = JSON.parse(localStorage.getItem('cart'));
            expect(savedCart).toEqual([]);
        });
    });

    describe('useCart fora do provider', () => {
        it('deve lançar erro quando usado fora do provider', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            expect(() => {
                renderHook(() => useCart());
            }).toThrow('useCart must be used within CartProvider');
            
            consoleErrorSpy.mockRestore();
        });
    });
});
