import React, { useState, useEffect } from 'react';


function DisplayCustomers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch('/displayCustomers')
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(error => console.error(error));
  }, []);

  const handlePopulateTable = () => {
    fetch('/displayCustomers')
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h2>Customer List</h2>
      <button onClick={handlePopulateTable}>Populate Table</button>
      <table>
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Password</th>
            <th>Shipping Address</th>
            <th>Credit Card</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.customer_id}>
              <td>{customer.customer_id}</td>
              <td>{customer.firstname}</td>
              <td>{customer.lastname}</td>
              <td>{customer.email}</td>
              <td>{customer.password}</td>
              <td>{customer.shippingaddress}</td>
              <td>{customer.creditcard}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DisplayCustomers;