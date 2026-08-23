import { BrowserRouter } from "react-router-dom";
import LoginForm from "./components/LoginForm/LoginForm.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <LoginForm/>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;