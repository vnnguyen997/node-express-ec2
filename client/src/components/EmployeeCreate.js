import React, { Component } from 'react';
import axios from 'axios';

class EmployeeCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      employee_id: '',
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    };
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { employee_id, firstname, lastname, email, password } = this.state;
    axios.post('http://3.133.128.233:5001/employeeCreate', { employee_id, firstname, lastname, email, password })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const { employee_id, firstname, lastname, email, password } = this.state;
    return (
      <div>
        <h2>Create Employee</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Employee ID:
            <input type="text" name="employee_id" value={employee_id} onChange={this.handleInputChange} />
          </label>
          <br />
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
          <button type="submit">Create Employee</button>
        </form>
      </div>
    );
  };

};

export default EmployeeCreate;