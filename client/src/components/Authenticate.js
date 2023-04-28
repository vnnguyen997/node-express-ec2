import React, { Component } from 'react';
import axios from 'axios';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      shippingaddress: '',
      creditcard: '',
      cvv: '',
      expirationdate: '',
      billingaddress: ''
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { firstname, lastname, email, password, shippingaddress, creditcard, cvv, expirationdate, billingaddress } = this.state;
    axios.post('http://3.133.128.233:5001/register', { firstname, lastname, email, password, shippingaddress, creditcard, cvv, expirationdate, billingaddress })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const { firstname, lastname, email, password, shippingaddress, creditcard, cvv, expirationdate, billingaddress } = this.state;
    return (
      <div>
        <h2>Register</h2>
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
          <label>
            CVV:
            <input type="number" name="cvv" value={cvv} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Expiration Date:
            <input type="text" name="expirationdate" value={expirationdate} onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            Billing Address:
            <input type="text" name="billingaddress" value={billingaddress} onChange={this.handleInputChange} />
          </label>
          <br />
          <button type="submit">Register</button>
        </form>
      </div>
    );
  }
}

export default Register;