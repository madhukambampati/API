import { Routes, Route, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Header from "./Components/Header";
import Sidebar from "./Components/Sidebar";
import CategoryCard from "./Components/CategoryCard";
import CategoryPage from "./Components/CategoryPage.js";
import Footer from "./Components/Footer";
import Login from "./Components/login.jsx"; // Import the Login component
import ManageCategories from "./Components/ManageCategory.js"

//import { FaBeer } from "react-icons/fa";
import "font-awesome/css/font-awesome.min.css";
import "./Styling/App.css";
import "./Styling/Header.css";
import "./Styling/Sidebar.css";
import "./Styling/CategoryCard.css";
import "./Styling/Footer.css";
//import { cardClasses } from "@mui/material";


const App = () => {
  const [categories, setCategories] = useState([])
  const location = useLocation(); // Define useLocation here

    useEffect(() => {
        const fetchData = async () => {
            try {
              const response = await fetch('http://localhost:5000/api/data');  
              const responseData = await response.json();
              setCategories(responseData)
              setFilteredCategories(responseData)
              console.log('responseData', responseData)
            } catch (error) {
              console.log('ERROR',error)
            }
          };
     fetchData()

    }, [location])

    

  const getEndpointsForCurrentCategory = (location) => {
    const currentCategory = categories.find((category) =>
      location.pathname.includes(category.title.toLowerCase().replace(/ /g, "-"))
    );
    return currentCategory
      ? currentCategory.endpoints.map((endpoint) => endpoint.name)
      : [];
  };
  const [filteredCategories, setFilteredCategories] = useState(categories);

  const onSearch = ({ value }) => {
    const filtered = categories.filter((category) =>
      category.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  return (
    <div className="app">
      <Header onSearch={onSearch} />
      <div className="main-container">
        {location.pathname === "/" ? (
          <Sidebar links={categories.map((category) => category.title)} />
        ) : (
          <Sidebar links={getEndpointsForCurrentCategory(location)} /> // Pass location prop
        )}
        <Routes>
          <Route
            path="/"
            element={
              <section className="categories-grid">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category, index) => (
                    <CategoryCard
                      key={index}
                      icon={category.icon}
                      title={category.title}
                      description={category.description}
                    />
                  ))
                ) : (
                  <div className="no-cards">
                    <p className="no-cards-title">
                      There are no results that match your search.
                    </p>
                    <p className="no-cards-message">
                      Please try modifying your search to get more results.
                    </p>
                  </div>
                )}
              </section>
            }
          />
          {categories.map((category, index) => (
            <Route
              key={index}
              path={`/${category.title.toLowerCase().replace(/ /g, "-")}`}
              element={
                <CategoryPage
                  title={category.title}
                  description={category.description}
                  endpoints={category.endpoints}
                  website={category.website}
                />
              }
            />
          ))}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/manage-categories" element={<ManageCategories />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;