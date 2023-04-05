import React, { Component } from 'react';
import axios from 'axios';

class RemoveCustomer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      message: '',
      error: ''
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { email } = this.state;
    axios.delete(`/removeCustomer?email=${email}`)
      .then((response) => {
        this.setState({ message: response.data.message, error: '' });
      })
      .catch((error) => {
        this.setState({ error: error.response.data.error, message: '' });
      });
  };

  render() {
    const { email } = this.state;
    return (
      <div>
        <h2>Remove Customer</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Email:
            <input type="email" name="email" value={email} onChange={this.handleInputChange} />
          </label>
          <br />
          <button type="submit">Remove Customer</button>
        </form>
      </div>
    );
  }
}

export default RemoveCustomer;