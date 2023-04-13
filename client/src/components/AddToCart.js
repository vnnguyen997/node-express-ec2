import React, { useState } from 'react';
import axios from 'axios';

const AddToCart = () => {
  const [customer_id, setcustomer_id] = useState('');
  const [inventoryId, setInventoryId] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post('http://3.133.128.233:5001/addItemToCart', { customer_id, inventory_id: inventoryId, quantity });
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Add Item to Cart</h2>
      <form onSubmit={handleSubmit}>
      <label>
          Customer ID:
          <input type="text" value={customer_id} onChange={(event) => setcustomer_id(event.target.value)} />
        </label>
        <br />
        <label>
          Inventory ID:
          <input type="text" value={inventoryId} onChange={(event) => setInventoryId(event.target.value)} />
        </label>
        <br />
        <label>
          Quantity:
          <input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </label>
        <br />
        <button type="submit">Add to Cart</button>
      </form>
    </div>
  );
};

export default AddToCart;