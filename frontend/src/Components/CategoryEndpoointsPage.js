import React, { useState } from 'react';
import './CategoryEndpointsPage.css';

const CategoryEndpointsPage = ({ category }) => {
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);

    // Function to handle click on endpoint
    const handleEndpointClick = (endpoint) => {
        setSelectedEndpoint(endpoint);
    };

    // Function to render JSON data in textarea
    const renderJSONData = () => {
        if (selectedEndpoint) {
            return (
                <textarea
                    className="json-textarea"
                    value={JSON.stringify(selectedEndpoint, null, 2)}
                    readOnly
                />
            );
        } else {
            return <p>Select an endpoint to view JSON data</p>;
        }
    };

    return (
        <div className="category-endpoints-page">
            <h2>{category.title} Endpoints</h2>
            <p>{category.description}</p>
            <ul>
                {category.endpoints.map((endpoint, index) => (
                    <li key={index} className="endpoint" onClick={() => handleEndpointClick(endpoint)}>
                        <h3>{endpoint.name}</h3>
                        <p>{endpoint.description}</p>
                    </li>
                ))}
            </ul>
            {/* Render JSON data */}
            {renderJSONData()}
        </div>
    );
};

export default CategoryEndpointsPage;
