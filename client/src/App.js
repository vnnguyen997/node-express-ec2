import './App.css';
import React from 'react';
import Register from './components/Authenticate';
import Login from './components/Login';
import EmployeeCreate from './components/EmployeeCreate';
import EmployeeLogin from './components/EmployeeLogin';
import InventoryCreate from './components/InventoryCreate';
import UpdateCustomer from './components/UpdateCustomer';
import UpdateEmployee from './components/UpdateEmployee';
import UpdateInventory from './components/UpdateInventory';


const App = () => {
  return (
    <div>
      <Register />
      <Login />
      <EmployeeCreate />
      <EmployeeLogin />
      <InventoryCreate />
      <UpdateCustomer />
      <UpdateEmployee />
      <UpdateInventory />

    
    </div>
  );
};

export default App;