import { useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

function Register() {
  const navigate = useNavigate();
  
  // State for registration data
  const [data, setData] = useState({
    username: "",
    password: "",
    role: "worker",
    phone: ""
  });

  // Function to update state on input change
  function handleChange(id, val) {
    setData((prev) => ({
      ...prev,
      [id]: val
    }));
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      // First, register the user
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });

      const responseData = await res.json();
      
      
      if (res.ok) {
        // If registration is successful and user is a worker, create user task record
        if (data.role === "worker") {
          try {
            
            const taskRes = await fetch(`${API_BASE_URL}/create-user-task`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                workerId: responseData.id,
                workerName: responseData.username,
                tasks: []
              })
            });

            
            

            if (!taskRes.ok) {
              throw new Error("Failed to create user task record");
            }
          } catch (error) {
            console.error("Failed to create user task record", error);
            toast.error("User registered but failed to create task record");
          }
        }

        toast.success("Registration successful! Please login");
        // Navigate to login page after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        toast.error(responseData.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration failed", error);
      toast.error("Registration failed");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Register</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Username</label>
            <input
              type="text"
              value={data.username}
              onChange={(e) => handleChange("username", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Choose a username"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              value={data.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Create a password"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-white mb-2">Phone</label>
            <input
              type="text"
              value={data.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter your phone number"
              required
            />
              
          </div>
          
          <div className="mb-6">
            <label className="block text-white mb-2">Role</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="worker"
                  checked={data.role === "worker"}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="mr-2"
                />
                <span className="text-white">Worker</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={data.role === "manager"}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="mr-2"
                />
                <span className="text-white">Manager</span>
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Register
          </button>
        </form>
        
        
      </div>
    </div>
  );
}

export default Register; 