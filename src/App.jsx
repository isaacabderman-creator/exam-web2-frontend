import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import Login from "./pages/Login/Login.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
            <Route path="/login" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;