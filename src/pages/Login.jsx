import { useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate(); 
  const { login } = useAuth();

  const [data, setData] = useState({
    username: "",
    password: ""
  });

  // Function to update state on input change
  function handleChange(id, val) {
    setData((prev) => ({
      ...prev,
      [id]: val
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },  
        body: JSON.stringify(data) 
      });

      const userData = await res.json();
      // console.log("Login response", userData);
      
      if (res.ok) {
        // Store user data in context
        login(userData);
        toast.success("Login successful!"); 
        navigate('/');
        if (userData.role === "manager") {
          navigate('/manager');
        } else {
          navigate('/worker');
        }

      } else {
        toast.error(userData.message || "Login failed");
      }
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Login</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Username</label>
            <input
              type="text"
              value={data.username}
              onChange={(e) => handleChange("username", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              value={data.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="mt-4 w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Register New Account !
          </button>
        </form>
        
        
      </div>
    </div>
  );
}

export default Login; 