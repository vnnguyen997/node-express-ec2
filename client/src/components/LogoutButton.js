import { useState } from 'react';

function LogoutButton() {
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    try {
      const response = await fetch('http://3.133.128.233:5001/logout', { method: 'POST' });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setMessage('Failed to logout');
    }
  };

  return (
    <>
      <button onClick={handleLogout}>Logout</button>
      <p>{message}</p>
    </>
  );
}

export default LogoutButton;
