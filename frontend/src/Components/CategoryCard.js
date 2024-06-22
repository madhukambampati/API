import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ title, description }) => {
    return (
        <div className="category-card">
            <h3>{title}</h3>
            <p>{description}</p>
            <Link to={`/${title.toLowerCase().replace(/ /g, '-')}`}>
                <button>Explore</button>
            </Link>
        </div>
    );
};

export default CategoryCard;
