import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import LoginForm from "./components/LoginForm/LoginForm.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
          <LoginForm/>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;