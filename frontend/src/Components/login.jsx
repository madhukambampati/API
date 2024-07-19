import React, { useState } from "react";
import '../Styling/login.css'; // Import the CSS file
import AdminApiContainer from './adminApiContainer'
export const Login = (props) => {
    const [userName, setuserName] = useState('');
    const [pass, setPass] = useState('');
    const [loginStatus, setLoginStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const requestObj={
            userName:userName,
            password:pass,
            userType:'admin'
        }
        fetch('/admin/login',{
            method:'POST',
            headers:{
                'Content-type':'application/json'
            },
            body:JSON.stringify(requestObj)
        }).then(res=>{
            console.log('resss',res)
            setLoginStatus(res.status == 200 ? 'success' : 'fail')
        }).catch(err=> console.log('err',err))
    }

    return (
        <>
        {loginStatus != 'success' && <div className="auth-form-container">
            <h2>Login</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="userName">User Name</label>
                <input value={userName} onChange={(e) => setuserName(e.target.value)}placeholder="Enter user name" id="userName" name="userName" />
                <label htmlFor="password">password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
                <button type="submit">Log In</button>
            </form>
            {loginStatus =='fail' && <div>Please Enter valid credentials</div>}
        </div>}
            {loginStatus == 'success' && <div>
                <AdminApiContainer />
            </div>}
            </>
    )
}
export default Login;