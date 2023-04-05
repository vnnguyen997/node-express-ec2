import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DisplayEmployees() {
  const [employees, setEmployees] = useState([]);

  const handlePopulateTable = () => {
    fetch('/displayEmployees')
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(error => console.error(error));
  };


  return (
    <div>
      <h2>Employee List</h2>
      <button onClick={handlePopulateTable}>Populate Table</button>      
      <table>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.employee_id}>
              <td>{employee.employee_id}</td>
              <td>{employee.firstname}</td>
              <td>{employee.lastname}</td>
              <td>{employee.email}</td>
              <td>{employee.password}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DisplayEmployees;