import React, { useState } from "react";
import '../Styling/Register.css'; // Import the CSS file for styling
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Footer from "./Footer"; // Import Footer component

export const Register = () => {
    const [userName, setUserName] = useState('');
    const [pass, setPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate for navigation

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pass !== confirmPass) {
            setErrorMessage('Passwords do not match!');
            return;
        }
        const requestObj = {
            userName: userName,
            password: pass
        };
        fetch('http://localhost:5001/admin/login/register', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(requestObj)
        }).then(res => {
            if (res.status === 201) {
                alert("Registration successful")
                navigate('/login'); // Navigate to login page on successful registration
            } else {
                setErrorMessage('Registration failed. Please try again.');
            }
        }).catch(err => {
            console.log('err', err);
            setErrorMessage('An error occurred. Please try again.');
        });
    };

    return (
        <div className="register_app">
            <div className="main-container1">
                <div className="auth-form-container">
                    <h2>Register</h2>
                    <form className="register-form" onSubmit={handleSubmit}>
                        <label htmlFor="userName">User Name</label>
                        <input
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Enter user name"
                            id="userName"
                            name="userName"
                        />
                        <label htmlFor="password">Password</label>
                        <input
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            type="password"
                            placeholder="********"
                            id="password"
                            name="password"
                        />
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                            type="password"
                            placeholder="********"
                            id="confirmPassword"
                            name="confirmPassword"
                        />
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        <button type="submit" className="register-submit-button">Register</button> {/* Unique class name */}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
