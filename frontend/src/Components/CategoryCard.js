import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ icon, title, description }) => {
  const Icon = icon;

  return (
    <div className="category-card">
      <p className="card-icon">{Icon}</p>
      <p className="card-title">{title}</p>
      <p className="card-description">{description}</p>
      <Link to={`/${title.toLowerCase().replace(/ /g, "-")}`}>
        <button className="card-button">Explore</button>
      </Link>
    </div>
  );
};

export default CategoryCard;
