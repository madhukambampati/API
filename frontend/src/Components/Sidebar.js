import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ links }) => {
    return (
        <aside className="sidebar">
            <nav>
                <ul>
                    {links.map((link, index) => (
                        <li key={index}>
                            <Link to={`/${link.toLowerCase().replace(/ /g, '-')}`}>{link}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
