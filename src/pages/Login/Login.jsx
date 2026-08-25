import LoginForm from "../../components/LoginForm/LoginForm.jsx";

function Login(){
    return (
        <div className="max-w-5xl mx-auto flex grid grid-cols-2 gap-8">
            <div className="py-8 px-10 flex items-center justify-center">
                <p className="font-semibold text-6xl">examhub</p>
            </div>
            <LoginForm/>
        </div>
    )
}

export default Login;