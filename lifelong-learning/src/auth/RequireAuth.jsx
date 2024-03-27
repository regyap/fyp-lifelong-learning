import { useNavigate } from 'react-router-dom';
import { useAuth } from "../auth/AuthContext.jsx";

function RequireAuth({ children }) {
    const auth = useAuth();
    let navigate = useNavigate();

    if (!auth.isAuthenticated) {

        return navigate('/login');
    }

    return children;
}
