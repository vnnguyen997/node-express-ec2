import React, { Component } from 'react';
import axios from 'axios';

class RemoveInventory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inventory_id: ''
        };
      }
    
      handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
      };
    
      handleSubmit = (event) => {
        event.preventDefault();
        const { inventory_id } = this.state;
        axios.delete(`/removeInventoryItem?inventory_id=${inventory_id}`)
          .then((response) => {
            console.log(response.data);
          })
          .catch((error) => {
            console.log(error);
          });
      };
    
      render() {
        const { inventory_id } = this.state;
        return (
          <div>
            <h2>Delete Inventory Item</h2>
            <form onSubmit={this.handleSubmit}>
              <label>
                Inventory ID:
                <input type="text" name="inventory_id" value={inventory_id} onChange={this.handleInputChange} />
              </label>
              <br />
              <button type="submit">Delete Inventory Item</button>
            </form>
          </div>
        );
      }
    }

export default RemoveInventory;