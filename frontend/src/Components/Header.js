import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styling/Header.css';

const Header = ({ onSearch }) => {
  const navigate = useNavigate();

  // const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    const value = event.target.value;
    // setSearchTerm(value);
    onSearch(value);
  };

  
  // const handleInputChange = (event) => {
  //   onSearch(event.target.value); // Pass the input value directly to onSearch
  //   navigate('/'); // Navigating to the main landing page
  // };

  const handleLoginClick = () => {
    navigate('/login'); // Navigating to the login page
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
            onChange={handleSearchChange} // Call onSearch when input changes
          />
          <button type='submit' className='search-button'>
            <i className='fa fa-search' aria-hidden='true'></i>
          </button>
        </form>
      </div>
      <div className='login-button-container'>
        <button className='login-button' onClick={handleLoginClick}>Login</button>
      </div>
    </div>
  );
};

export default Header;
