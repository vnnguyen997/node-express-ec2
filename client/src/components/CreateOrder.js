import React, { Component } from 'react';
import axios from 'axios';

class CreateOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order_id: '',
      creationdate: '',
      status: '',
      deliverydate: ''
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { order_id, creationdate, status, deliverydate } = this.state;
    axios.post('/createOrder', {
      order_id,
      creationdate,
      status,
      deliverydate
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const { order_id, creationdate, status, deliverydate } = this.state;
    return (
      <div>
        <h2>Create Order</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Order ID:
            <input type="text" name="order_id" value={order_id} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Creation Date:
            <input type="text" name="creationdate" value={creationdate} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Status:
            <input type="text" name="status" value={status} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Delivery Date:
            <input type="text" name="deliverydate" value={deliverydate} onChange={this.handleInputChange} />
          </label>
          <br />
          <button type="submit">Create Order</button>
        </form>
      </div>
    );
  }
}

export default CreateOrders;