import React, { Component } from 'react';
import axios from 'axios';

class RemoveOrder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            order_id: ''
        };
      }
    
      handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
      };
    
      handleSubmit = (event) => {
        event.preventDefault();
        const { order_id } = this.state;
        axios.delete(`/removeOrder?order_id=${order_id}`)
          .then((response) => {
            console.log(response.data);
          })
          .catch((error) => {
            console.log(error);
          });
      };
    
      render() {
        const { order_id } = this.state;
        return (
          <div>
            <h2>Delete Order</h2>
            <form onSubmit={this.handleSubmit}>
              <label>
                Order ID:
                <input type="number" name="order_id" value={order_id} onChange={this.handleInputChange} />
              </label>
              <br />
              <button type="submit">Delete Order</button>
            </form>
          </div>
        );
      }
    }

export default RemoveOrder;