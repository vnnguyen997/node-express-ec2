import React, { Component } from 'react';
import axios from 'axios';

class UpdateEmployee extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { firstname, lastname, email, password } = this.state;
    axios.put(`http://3.133.128.233:5001/updateEmployee/${email}`, {
      firstname,
      lastname,
      password,
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const { firstname, lastname, email, password } = this.state;
    return (
      <div>
        <h2>UpdateEmployee</h2>
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
          <button type="submit">UpdateEmployee</button>
        </form>
      </div>
    );
  }
}

export default UpdateEmployee;