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
import CreateOrders from './components/CreateOrder';
import UpdateOrder from './components/UpdateOrder';
import RemoveCustomer from './components/RemoveCustomer';
import RemoveEmployee from './components/RemoveEmployee';
import RemoveInventory from './components/RemoveInventory';
import RemoveOrder from './components/RemoveOrder';
import NavBar from './components/NavBar';
import LogoutButton from './components/LogoutButton';
import AddToCart from './components/AddToCart';
import RemoveCartItem from './components/RemoveCartItem';
import UpdateCartItemQuantity from './components/UpdateCartItemQuantity';
import CheckoutButton from './components/CheckoutButton';


const App = () => {
  return (
    <div>
      <NavBar />
      <Register />
      <Login />
      <LogoutButton />
      <EmployeeCreate />
      <EmployeeLogin />
      <InventoryCreate />
      <CreateOrders />
      <UpdateCustomer />
      <UpdateEmployee />
      <UpdateInventory />
      <UpdateOrder />
      <RemoveCustomer />
      <RemoveEmployee />
      <RemoveInventory />
      <RemoveOrder />
      <AddToCart />
      <RemoveCartItem />
      <UpdateCartItemQuantity />
      <CheckoutButton />
    </div>
  );
};

export default App;