import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import Login from "./pages/Login/Login.jsx";
import Students from "./pages/admin/Students/Students.jsx";
import Dashboard from "./pages/admin/Dashboard/Dashboard.jsx";
import Courses from "./pages/admin/Courses/Courses.jsx";
import Exams from "./pages/admin/Exams/Exams.jsx";
import ExamForm from "./pages/admin/Exams/ExamForm.jsx";
import ExamQuestions from "./pages/admin/Exams/ExamQuestions.jsx";
import ExamResults from "./pages/admin/Exams/ExamResults.jsx";
import AvailableExams from "./pages/student/AvailableExams/AvailableExams.jsx";
import MyResults from "./pages/student/MyResults/MyResults.jsx";
import TakeExam from "./pages/student/TakeExam/TakeExam.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/student/exams"} replace />;
  }
  return children;
}

function Layout() {
  const location = useLocation();
  return (
    <>
      {location.pathname !== "/login" && <Navbar />}
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute role="admin"><Students /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute role="admin"><Courses /></ProtectedRoute>} />
          <Route path="/admin/exams" element={<ProtectedRoute role="admin"><Exams /></ProtectedRoute>} />
          <Route path="/admin/exams/new" element={<ProtectedRoute role="admin"><ExamForm /></ProtectedRoute>} />
          <Route path="/admin/exams/:id/edit" element={<ProtectedRoute role="admin"><ExamForm /></ProtectedRoute>} />
          <Route path="/admin/exams/:id/questions" element={<ProtectedRoute role="admin"><ExamQuestions /></ProtectedRoute>} />
          <Route path="/admin/exams/:id/results" element={<ProtectedRoute role="admin"><ExamResults /></ProtectedRoute>} />
          <Route path="/student/exams" element={<ProtectedRoute role="student"><AvailableExams /></ProtectedRoute>} />
          <Route path="/student/exams/:id" element={<ProtectedRoute role="student"><TakeExam /></ProtectedRoute>} />
          <Route path="/student/results" element={<ProtectedRoute role="student"><MyResults /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;