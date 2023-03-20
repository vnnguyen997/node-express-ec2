import React, { Component } from 'react';
import axios from 'axios';

class InventoryCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
      weight: '',
      price: '',
      itemgroup: ''
    };
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { name, description, weight, price, itemgroup } = this.state;
    axios.post('http://3.133.128.233:5001/createInventory', { name, description, weight, price, itemgroup })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const { name, description, weight, price, itemgroup } = this.state;
    return (
      <div>
        <h2>Create Inventory</h2>
        <form onSubmit={this.handleSubmit}>
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
            <input type="number" name="weight" value={weight} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Price:
            <input type="number" name="price" value={price} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Item Group:
            <select name="itemgroup" value={itemgroup} onChange={this.handleInputChange}>
              <option value="">--Select--</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
            </select>
          </label>
          <br />
          <button type="submit">Create Inventory</button>
        </form>
      </div>
    );
  };

};

export default InventoryCreate;