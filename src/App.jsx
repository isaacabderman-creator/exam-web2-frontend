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
import { AuthProvider } from "./context/AuthContext.jsx";

function Layout() {
  const location = useLocation();
  return (
    <>
      {location.pathname !== "/login" && <Navbar />}
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/courses" element={<Courses />} />
          <Route path="/admin/exams" element={<Exams />} />
          <Route path="/admin/exams/new" element={<ExamForm />} />
          <Route path="/admin/exams/:id/edit" element={<ExamForm />} />
          <Route path="/admin/exams/:id/questions" element={<ExamQuestions />} />
          <Route path="/admin/exams/:id/results" element={<ExamResults />} />
          <Route path="/student/exams" element={<AvailableExams />} />
          <Route path="/student/results" element={<MyResults />} />
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