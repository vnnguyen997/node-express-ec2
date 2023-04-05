import React, { useState } from 'react';
import axios from 'axios';

function DisplayInventory() {
  const [inventory, setInventory] = useState([]);

  const handlePopulateTable = () => {
    fetch('/displayInventory')
      .then(res => res.json())
      .then(data => setInventory(data))
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h2>Inventory List</h2>
      <button onClick={handlePopulateTable}>Populate Table</button>      
      <table>
        <thead>
          <tr>
            <th>Inventory ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Weight</th>
            <th>Price</th>
            <th>Item Group</th>
            <th>Stock</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.inventory_id}>
              <td>{item.inventory_id}</td>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.weight}</td>
              <td>{item.price}</td>
              <td>{item.itemgroup}</td>
              <td>{item.stock}</td>
              <td>{item.image}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DisplayInventory;