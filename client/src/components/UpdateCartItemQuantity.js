import React, { Component } from 'react';
import axios from 'axios';

class UpdateCartItemQuantity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customer_id: '',
      inventory_id: '',
      quantity: ''
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { customer_id, inventory_id, quantity } = this.state;
    axios.put(`http://3.133.128.233:5001/updateCartItemQuantity`, {
      customer_id,
      inventory_id,
      newQuantity: quantity
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
  };
  
  render() {
    const { customer_id, inventory_id, quantity } = this.state;
    return (
      <div>
        <h2>Update Cart Item Quantity</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Customer ID:
            <input type="text" name="customer_id" value={customer_id} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Inventory ID:
            <input type="text" name="inventory_id" value={inventory_id} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            New Quantity:
            <input type="text" name="quantity" value={quantity} onChange={this.handleInputChange} />
          </label>
          <br />
          <button type="submit">Update Cart Item Quantity</button>
        </form>
      </div>
    );
  }
}

export default UpdateCartItemQuantity;