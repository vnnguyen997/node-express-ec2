import './App.css';
import React from 'react';
import Register from './components/Authenticate';
import Login from './components/Login';
import EmployeeCreate from './components/EmployeeCreate';
import EmployeeLogin from './components/EmployeeLogin';
import InventoryCreate from './components/InventoryCreate';


const App = () => {
  return (
    <div>
      <Register />
      <Login />
      <EmployeeCreate />
      <EmployeeLogin />
      <InventoryCreate />

    
    </div>
  );
};

export default App;