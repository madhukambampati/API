import React from 'react';
import { Link, useNavigate } from 'react-router-dom';


import '../Styling/Sidebar.css';

const Sidebar = ({ links }) => {
    const icons = {
        sports: "fas fa-football-ball",
        finance: "fas fa-dollar-sign",
        data: "fas fa-database",
        travel: "fas fa-plane",
        location: "fas fa-map-marker-alt",
        science: "fas fa-flask",
        food: "fas fa-utensils",
        tools: "fas fa-tools",
        'text analysis': "fas fa-text-height",
        weather: "fas fa-cloud-sun",
        gaming: "fas fa-gamepad",
        events: "fas fa-calendar-alt",
        health: "fas fa-heartbeat",
        sms: "fas fa-sms"
        
    };
    const navigate = useNavigate();

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 class="dashboard" onClick={() => navigate('/')}>Dashboard</h1>
            </div>
            <nav>
                <ul>
                    {links.map((link, index) => (
                        <li key={index}>
                            <Link to={`/${link.toLowerCase().replace(/ /g, '-')}`}>
                                <i className={icons[link.toLowerCase()] || "fas fa-link"}></i> {link}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
