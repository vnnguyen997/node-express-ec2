import React, { Component } from 'react';
import axios from 'axios';

class UpdateInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventory_id: '',
      name: '',
      description: '',
      weight: '',
      price: '',
      itemgroup: '',
      stock: ''
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { inventory_id, name, description, weight, price, itemgroup, stock } = this.state;
    axios.put(`http://3.133.128.233:5001/UpdateInventory/${inventory_id}`, {
      name,
      description,
      weight,
      price,
      itemgroup,
      stock
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const { inventory_id, name, description, weight, price, itemgroup, stock } = this.state;
    return (
      <div>
        <h2>Update Inventory</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Inventory ID:
            <input type="text" name="inventory_id" value={inventory_id} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Name:
            <input type="text" name="name" value={name} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Description:
            <input type="text" name="description" value={description} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Weight:
            <input type="text" name="weight" value={weight} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Price:
            <input type="text" name="price" value={price} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Item Group:
            <input type="text" name="itemgroup" value={itemgroup} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Stock:
            <input type="text" name="stock" value={stock} onChange={this.handleInputChange} />
          </label>
          <br />
          <button type="submit">Update Inventory</button>
        </form>
      </div>
    );
  }
}

export default UpdateInventory;