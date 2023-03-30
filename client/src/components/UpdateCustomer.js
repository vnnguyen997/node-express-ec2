import React, { Component } from 'react';
import axios from 'axios';

class UpdateCustomer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      shippingaddress: '',
      creditcard: ''
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { firstname, lastname, email, password, shippingaddress, creditcard } = this.state;
    axios.put(`http://3.133.128.233:5001/updateCustomer/${email}`, {
      firstname,
      lastname,
      password,
      shippingaddress,
      creditcard
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const { firstname, lastname, email, password, shippingaddress, creditcard } = this.state;
    return (
      <div>
        <h2>UpdateCustomer</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            First Name:
            <input type="text" name="firstname" value={firstname} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Last Name:
            <input type="text" name="lastname" value={lastname} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Email:
            <input type="email" name="email" value={email} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Password:
            <input type="password" name="password" value={password} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Shipping Address:
            <input type="text" name="shippingaddress" value={shippingaddress} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Credit Card:
            <input type="number" name="creditcard" value={creditcard} onChange={this.handleInputChange} />
          </label>
          <br />
          <button type="submit">UpdateCustomer</button>
        </form>
      </div>
    );
  }
}

export default UpdateCustomer;