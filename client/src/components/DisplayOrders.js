import React, { useState } from 'react';
import axios from 'axios';

function DisplayOrders() {
  const [orders, setOrders] = useState([]);

  const handlePopulateTable = () => {
    fetch('/displayOrders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h2>Orders List</h2>
      <button onClick={handlePopulateTable}>Populate Table</button>      
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Creation Date</th>
            <th>Status</th>
            <th>Delivery Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.order_id}>
              <td>{order.order_id}</td>
              <td>{order.creationdate}</td>
              <td>{order.status}</td>
              <td>{order.deliverydate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DisplayOrders;