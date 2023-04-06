import React, { useState } from 'react';
import axios from 'axios';

const SessionCookie = () => {
  const [cookie, setCookie] = useState('');

  const handleButtonClick = () => {
    // Set session variable on backend server
    axios.get('http://3.133.128.233:5001/set-session')
      .then(() => {
        // Retrieve cookie from backend server
        axios.get('http://3.133.128.233:5001/get-session')
          .then((response) => {
            setCookie(response.data);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Get Cookie</button>
      <p>Cookie: {cookie}</p>
    </div>
  );
};

export default SessionCookie;