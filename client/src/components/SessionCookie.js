import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SessionCookie = () => {
  const [cookie, setCookie] = useState('');

  useEffect(() => {
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
  }, []);

  return (
    <p>Cookie: {cookie}</p>
  );
};

export default SessionCookie;