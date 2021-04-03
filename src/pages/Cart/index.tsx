import React, { useEffect, useState } from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
 import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();
  
 

  const cartFormatted = cart.map(product => ({
    ...product, priceFormatted: formatPrice(product.price), subTotal: formatPrice(product.amount * product.price)
  }))


  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        sumTotal +=  product.amount * product.price;  
        console.log(sumTotal);
        return sumTotal;
      }, 0)
    )

  function handleProductIncrement(product: Product) {
    updateProductAmount({productId: product.id,amount: product.amount + 1 });
  }

  function handleProductDecrement(product: Product) {
    updateProductAmount({productId: product.id,amount: product.amount - 1 });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map(Product => (
            <tr key={Product.id} data-testid="product">
            <td>
              <img src={Product.image} alt="Tênis de Caminhada Leve Confortável" />
            </td>
            <td>
              <strong>{Product.title}</strong>
              <span>{Product.priceFormatted}</span>
            </td>
            <td>
              <div>
                <button
                  type="button"
                  data-testid="decrement-product"
                 disabled={Product.amount <= 1}
                 onClick={() => handleProductDecrement(Product)}
                >
                  <MdRemoveCircleOutline size={20} />
                </button>
                <input
                  type="text"
                  data-testid="product-amount"
                  readOnly
                  value={Product.amount}
                />
                <button
                  type="button"
                  data-testid="increment-product"
                 onClick={() => handleProductIncrement(Product)}
                >
                  <MdAddCircleOutline size={20} />
                </button>
              </div>
            </td>
            <td>
              <strong>{Product.subTotal}</strong>
            </td>
            <td>
              <button
                type="button"
                data-testid="remove-product"
               onClick={() => handleRemoveProduct(Product.id)}
              >
                <MdDelete size={20} />
              </button>
            </td>
          </tr>
          ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
