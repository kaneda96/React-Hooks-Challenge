import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
     const storagedCart = localStorage.getItem('@RocketShoes:cart');       
    if (storagedCart) {          
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {      
     const updatedCart = [...cart];
      const productExists = updatedCart.find(product => product.id === productId);

      const stock = await api.get(`/stock/${productId}`);
      const stockAmount = stock.data.amount;
      const currentAmount = productExists ? productExists.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (productExists) {
        productExists.amount = amount;
      }else{
        const product = await api.get(`/products/${productId}`);
        const newProduct = {
          ...product.data,
          amount:1
        }

        updatedCart.push(newProduct);
      }
      
      setCart(updatedCart);
      localStorage.setItem("@RocketShoes:cart",  JSON.stringify(updatedCart))
    } catch {
      toast.error("Erro ao adicionar Produtos");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      setCart(cart.filter(Product => Product.id !== productId));
      localStorage.setItem("@RocketShoes:cart",  JSON.stringify(cart));
    } catch {
      toast("Erro ao Remover Produtos");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const selectedProductIndex = cart.findIndex(Product => Product.id === productId);
      cart[selectedProductIndex].amount = amount;
      setCart([...cart])
      localStorage.setItem("@RocketShoes:cart",  JSON.stringify(cart))
    } catch {
      toast("Erro ao Atualizar Produtos");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
