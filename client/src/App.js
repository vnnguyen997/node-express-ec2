import './App.css';
import React from 'react';
import Register from './components/Authenticate';
import Login from './components/Login';

const App = () => {
  return (
    <div>
      <Register />
      <Login />
    </div>
  );
};

export default App;