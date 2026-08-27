import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
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
import { AuthProvider } from "./routes/AuthContext.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";

function Layout() {
  const location = useLocation();
  return (
    <>
      {location.pathname !== "/login" && <Navbar />}
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<RoleRoute role="admin"><Dashboard /></RoleRoute>} />
          <Route path="/admin/students" element={<RoleRoute role="admin"><Students /></RoleRoute>} />
          <Route path="/admin/courses" element={<RoleRoute role="admin"><Courses /></RoleRoute>} />
          <Route path="/admin/exams" element={<RoleRoute role="admin"><Exams /></RoleRoute>} />
          <Route path="/admin/exams/new" element={<RoleRoute role="admin"><ExamForm /></RoleRoute>} />
          <Route path="/admin/exams/:id/edit" element={<RoleRoute role="admin"><ExamForm /></RoleRoute>} />
          <Route path="/admin/exams/:id/questions" element={<RoleRoute role="admin"><ExamQuestions /></RoleRoute>} />
          <Route path="/admin/exams/:id/results" element={<RoleRoute role="admin"><ExamResults /></RoleRoute>} />
          <Route path="/student/exams" element={<RoleRoute role="student"><AvailableExams /></RoleRoute>} />
          <Route path="/student/exams/:id" element={<RoleRoute role="student"><TakeExam /></RoleRoute>} />
          <Route path="/student/results" element={<RoleRoute role="student"><MyResults /></RoleRoute>} />
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
