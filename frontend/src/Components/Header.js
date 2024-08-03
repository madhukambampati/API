import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Styling/Header.css';

const Header = ({ onSearch }) => {
  const [userId, setUserId] = useState(null); // State to manage userId
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Retrieve userId from session storage
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, [location]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    onSearch(value);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = () => {
    const loggedUserId = sessionStorage.getItem('userId');

    fetch('http://localhost:5000/admin/logout', {
      method: 'POST',
      headers: {
          'Content-type': 'application/json'
      },
      body: JSON.stringify({loggedUserId})
  })
  .then(response => response.json())
  .then(res => {
    
    setUserId(null); // Reset userId state
    sessionStorage.removeItem('userId');
    navigate('/')
  }).catch(err => console.log('err', err));

    
  };

  return (
    <div className='header-container'>
      <div className='logo'>API-HUB</div>
      <div className='search-container'>
        <form action='/search' id='search-fs' method='get'>
          <input
            id='search-text'
            name='q'
            placeholder='Search here'
            required
            type='text'
            onChange={handleSearchChange}
          />
          <button type='submit' className='search-button'>
            <i className='fa fa-search' aria-hidden='true'></i>
          </button>
        </form>
      </div>
      <div className='login-button-container'>
        {userId &&  <button className='login-button' onClick={handleLogoutClick}>Logout</button>}
        {location.pathname !='/login' && !userId && <button className='login-button' onClick={handleLoginClick}>Login</button>}
       
      </div>
    </div>
  );
};

export default Header;
