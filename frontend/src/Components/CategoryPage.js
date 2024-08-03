import React, { useState, useEffect } from "react";
import '../Styling/CategoryPage.css';
import { useLocation } from 'react-router-dom';

const CategoryPage = ({ title, description, endpoints, website }) => {
  const { pathname } = useLocation();
  const [selectedEndpoint, setSelectedEndpoint] = useState("");
  const [endpointData, setEndpointData] = useState(null);

  useEffect(() => {
    // For testing purposes, log endpoints when they change
    console.log('Endpoints:',pathname, endpoints);
    console.log('website:', website);
    return () => {
      // removing selected fileds when navigating to new page
      setSelectedEndpoint('');
      setEndpointData(null);
    };

  }, [useLocation,pathname]);
  

  const handleEndpointChange = (event) => {
    const endpointName = event.target.value;
    setSelectedEndpoint(endpointName);
    const FullEndpointData = endpoints.find(
      (endpoint) => endpoint.name === endpointName
    );
    setEndpointData(FullEndpointData || null);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
      </div>
      <div className="form-control">
        <label htmlFor="endpoint-select">Select Endpoint</label>
        <select
          id="endpoint-select"
          value={selectedEndpoint}
          onChange={handleEndpointChange}
        >
          <option value="" disabled>Select an endpoint</option>
          {endpoints &&
            endpoints.map((endpoint) => (
              <option key={endpoint.name} value={endpoint.name}>
                {endpoint.name}
              </option>
            ))}
        </select>
      </div>
      {endpointData && (
        <div className="endpoint-details">
          <h2>Endpoint Description:</h2>
          <p>{endpointData.description}</p>
          <h2>Http Endpoint Link:</h2>
          <pre>{JSON.stringify(endpointData.httplink, null, 2)}</pre>
          <h2>API Key and Host</h2>
          <pre>{endpointData.apikey}</pre><pre>{endpointData.apihost}</pre>
          
          <p>
            For more information, please visit the website below:
          </p>
          <a href={website} target="_blank" rel="noopener noreferrer">
            {website}
          </a>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
