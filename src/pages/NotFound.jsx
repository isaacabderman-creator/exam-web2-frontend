import { Link } from "react-router-dom";
import { useAuth } from "../routes/AuthProvider.jsx";

export default function NotFound() {
    const { user } = useAuth();
    const homeLink = !user ? "/login" : user.role === "admin" ? "/admin" : "/student/exams";

    return (
        <div className="page">
            <div className="page-inner text-center">
                <h1 className="page-title">404</h1>
                <p className="page-subtitle mb-6">This page doesn't exist.</p>
                <Link to={homeLink} className="btn-primary">
                    Back to safety
                </Link>
            </div>
        </div>
    );
}
