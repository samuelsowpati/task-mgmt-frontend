import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

export default function Header({children}) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        // Use the logout function from context
        logout();
        navigate('/login');
    };

    return (
        <div className="shadow-sm shadow-amber-600 bg-amber-300 border-2 border-solid rounded-lg text-black mx-1.5 my-1.5 p-3">
            <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{children}</div>
                
                {user && (
                    <div className="text-right flex items-center gap-4">
                        <div>
                            <p className="font-semibold">Welcome: {user.username.charAt(0).toUpperCase() + user.username.slice(1)}</p>
                            <p className="text-sm">Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded text-sm"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}