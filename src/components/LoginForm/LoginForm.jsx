import "./LoginForm.css";
function LoginForm() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <form className={"login-form"}>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" placeholder="Username" />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Password"/>
                </div>
                <button type="submit" className="btn">Login</button>
            </form>
        </div>
    )
}
export default LoginForm;