import React, { useState, useEffect } from 'react';
import { FaPlus, FaMapMarkerAlt } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { CgRadioCheck } from "react-icons/cg";
import Header from '../components/Header';
import Map from '../components/Map';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Worker() {
  const [showMap, setShowMap] = useState(false);
  const [inLocation, setInLocation] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is logged in and is a worker
  useEffect(() => {
    if (!user) {
      toast.error("Please login to access the worker dashboard");
      navigate("/login");
    } else if (user.role !== "worker") {
      toast.error("You do not have access to this page");
      navigate("/");
    }
  }, [user, navigate]);
  
  const [taskGroups, setTaskGroups] = useState([]);

  // const taskGroups = [
  //   { 
  //     name: "John Center", 
  //     tasks: [
  //       { name: "Clip Grass", status: false },
  //       { name: "Inspect Wiring", status: false },
  //       { name: "Clean Windows", status: false },
  //       { name: "Replace Bulb", status: true }
  //     ] 
  //   },
  //   { 
  //     name: "Fenwick Library", 
  //     tasks: [
  //       { name: "Fold Laundry", status: true },
  //       { name: "Check Inventory", status: false },
  //       { name: "Wash Floors", status: false },
  //       { name: "Test Generators", status: false }
  //     ] 
  //   },
  // ];

  const handleLocationClick = () => {
    setShowMap(true);
  };

  const fetchUserTasks = async () => {
    
    try {
      const response = await fetch(`http://localhost:3000/get-grouped-tasks/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user tasks");
      }
      
      const data = await response.json();
      setTaskGroups(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching user tasks", error);
      toast.error("Failed to fetch worker data");
    }
  };

  const alterTaskStatus = async (wid,tid) => {
    console.log("Altering task status for worker", wid, "and task", tid);
      try {
        const response = await fetch(`http://localhost:3000/alter-user-task/${wid}/${tid}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          }
        });
  
        const data = await response.json();
        fetchUserTasks();
        toast.success("Task status updated");
        console.log("Task status updated", data);
      } catch (error) {
        console.error("Error updating task status", error);
        toast.error("Failed to update task status");
      }
    };

  useEffect(() => {
    fetchUserTasks();
  }, []);

  return (
    <div className="text-white font-s min-h-screen bg-zinc-800 p-4">
      <Header>Worker Dashboard</Header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {taskGroups.map((group, index) => (
          <div
            key={index}
            className="bg-zinc-700 border border-yellow-500/30 rounded-lg p-4 text-white shadow-md transition-all duration-500 ease-in-out 
                       hover:shadow-xl hover:border-yellow-500/50 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-yellow-300">{group.name}</h2>
              <div className="flex items-center gap-2">

              <span className={`${inLocation ? 'text-green-500' : 'text-red-500'} font-bold`}>
                      {inLocation ? 'In Location' : 'Not In Location'}
              </span>
                {/* Map Button */}
                <button 
                  onClick={handleLocationClick}
                  className="text-yellow-500/70 hover:text-green-400/70 transition-colors duration-300"
                >
                  <FaMapMarkerAlt className="text-lg" />
                </button>
                <button className="opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out
                                text-yellow-500/70 hover:text-green-400/70">
                  
                </button>
              </div>
            </div>
            {/* Tasks List */}
            <div className="space-y-3 mb-4">
              {group.tasks.map((task, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 rounded-lg transition-all duration-500 ease-in-out
                           hover:bg-zinc-600/50 hover:shadow-sm
                           group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {task.status ? 
                      <TiTick className="text-green-500" /> : 
                      <CgRadioCheck className="text-white" />
                    }
                    <span onClick={() => alterTaskStatus(user.id, task.taskId)} className={task.status ? 'line-through text-gray-500' : ''}>
                      {task.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Map Dialog */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 p-6 rounded-lg border border-yellow-500 shadow-xl w-full max-w-4xl">
            <Map setShowMap={setShowMap} />
          </div>
        </div>
      )}
    </div>
  );
}
