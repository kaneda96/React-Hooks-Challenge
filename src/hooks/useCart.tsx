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

      if(productId <= 0){
        throw Error();
      }

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
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {

      const ProductFound = cart.find(Product => Product.id === productId);

      if (ProductFound) {
        const updatedCart = cart.filter(Product => Product.id !== productId);
        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart",  JSON.stringify(updatedCart));
      }else{
        throw Error();
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {  
      
      if (amount <= 0) {
        throw Error();
      }
      
      const stock = await api.get(`/stock/${productId}`);
      const stockAmount = stock.data.amount;   
      let UpdatedCart = [...cart];

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }


      const selectedProduct = UpdatedCart.find(Product => Product.id === productId);

      if(selectedProduct){
          selectedProduct.amount = amount;
          setCart(UpdatedCart);
          localStorage.setItem("@RocketShoes:cart",  JSON.stringify(UpdatedCart))
      }else{
        throw Error();
      }    
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
