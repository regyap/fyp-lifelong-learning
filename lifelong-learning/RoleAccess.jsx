import { Navigate, Outlet } from "react-router-dom";

const RoleAccess = ({ roles = [] }) => {
    const domain = localStorage.getItem("userDomain");
    return !roles.length || roles.includes(domain)
        ? <Outlet />
        : <Navigate to="/login" replace />;
};

export default RoleAccess;
