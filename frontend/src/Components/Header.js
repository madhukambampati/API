import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styling/Header.css';

const Header = ({ onSearch }) => {
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    onSearch(event.target);
    navigate('/'); // Navigating to the main landing page

  };

  return (
    <div className='header-container'>
      <div className='logo' onClick={() => navigate('/')}>API-HUB</div>
      <div className='search-container'>
        <form action='/search' id='search-fs' method='get'>
          <input
            id='search-text'
            name='q'
            placeholder='Search here'
            required
            type='text'
            onChange={handleInputChange} // Call onSearch when input changes
          />
          <button type='submit' className='search-button'>
            <i className='fa fa-search' aria-hidden='true'></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Header;