import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../Styling/login.css'; 
// import AdminApiContainer from './adminApiContainer';

export const Login = (props) => {
    const [userName, setuserName] = useState('');
    const [pass, setPass] = useState('');
    const [loginStatus, setLoginStatus] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const requestObj = {
            userName: userName,
            password: pass,
            userType: 'admin'
        };
        fetch('http://localhost:5001/admin/login', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(requestObj)
        })
        
        .then(response => response.json())
        .then(res => {
            console.log('resss', res);
            setLoginStatus(res.status === 200 ? 'success' : 'fail');
            sessionStorage.setItem("userId", res.userId);
            navigate('/adminApi')
        }).catch(err => console.log('err', err));
    };

    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <>
            {loginStatus !== 'success' && (
                <div className="auth-form-container">
                    <h2>Login</h2>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <label htmlFor="userName">User Name</label>
                        <input
                            value={userName}
                            onChange={(e) => setuserName(e.target.value)}
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
                        <button type="submit">Log In</button>
                    </form>
                    {loginStatus === 'fail' && <div className="error-message">Please Enter valid credentials</div>}
                    <button className="register-button" onClick={handleRegister}>Don't have an account? Register</button>
                </div>
            )}
        </>
    );
}

export default Login;
