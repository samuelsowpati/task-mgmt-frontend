import React, { useState } from 'react';
import { FaPlus, FaMapMarkerAlt } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { CgRadioCheck,CgRadioChecked } from "react-icons/cg";
import Header from '../components/Header';
import Map2 from '../components/Map2';
import { useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Form from "../components/Form";
import { API_BASE_URL } from '../config/api';

export default function Manager() {
  const [showMap, setShowMap] = useState(false);
  const [workerData, setWorkerData] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [genTaskWorker, setGenTaskWorker] = useState(null);
  const[mLoc,setMLoc] = useState({lat:0,long:0});

  const [temp, setTemp] = useState({
    name: "null",
    building: "null",
    location: {lat: 0, long: 0}
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is logged in and is a manager
  useEffect(() => {
    if (!user) {
      toast.error("Please login to access the manager dashboard");
      navigate("/login");
    } else if (user.role !== "manager") {
      toast.error("You do not have access to this page");
      navigate("/");
    }
  }, [user, navigate]);
  

  const handleLocationClick = (task) => {
    setShowMap(true);
    setMLoc((prev)=>(
      {...prev,
      lat:task.location.lat,
      long:task.location.long,
      name:task.name}
    ));
  };

  // Function to handle Add Task button click
  const handleAddTaskClick = (worker) => {
    setSelectedWorker(worker._id === selectedWorker?._id ? null : worker);
  };

  // Function to edit task name
  function changeName(id, val) {
    setTemp((prev) => ({
      ...prev,
      [id]: val
    }));
  }

  // Function to get location data
  function changeLoc(e) {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(
      // 1st argument
      (position) => {
        setTemp((prev) => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            long: position.coords.longitude,
          }
        }));
          
        // console.log(`latitude is: ${position.coords.latitude} 
        // and longitude is: ${position.coords.longitude}`);
      },

      // 2nd argument
      (error) => {
        console.error("Error fetching location:", error);
      },

      // 3rd Argument
      {
        enableHighAccuracy: true,
        maximumAge: 100,
      }
    );
  }

    
  // Function to add a task for a worker
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!selectedWorker) {
      toast.error("No worker selected");
      return;
    }

    const newTask = {
      name: temp.name,
      status: false,
      location: {
        building: temp.building,
        lat: temp.location.lat,
        long: temp.location.long
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/add-user-task/${selectedWorker._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: [...selectedWorker.tasks, newTask]
        })
      });

      const data = await response.json();
      
      // Refresh task data
      fetchUserTasks();
      setSelectedWorker(null);

      toast.success("Task added successfully");
      // console.log("Added task details", data);
    } catch (error) {
      console.error("Task could not be created", error);
      toast.error("Failed to add task");
    }
  }

  // API call to OpenAI via node to generate a task
  async function genTask(worker) {
    const targetWorker = worker || genTaskWorker;
    
    if (!targetWorker) {
      toast.error("Please select a worker first");
      return;
    }

    try {
      // Format past tasks to be more useful for OpenAI
      const formattedTasks = targetWorker.tasks.map(task => 
        `"${task.name}"`
      ).join(", ");
      
      const res = await fetch(`${API_BASE_URL}/gpt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pastTasks: formattedTasks,
          workerName: targetWorker.workerName
        })
      });
  
      const taskName = await res.text(); 
      console.log("🧠 Suggested Task from GPT:", taskName);
      
      // Get current location
      const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            position => resolve({
              lat: position.coords.latitude,
              long: position.coords.longitude
            }),
            error => {
              console.error("Error getting location:", error);
              resolve({ lat: 0, long: 0 });
            },
            { enableHighAccuracy: true, maximumAge: 100 }
          );
        });
      };

      // Get location
      const location = await getCurrentPosition();
      
      // Create and add the task
      const newTask = {
        name: taskName,
        status: false,
        location: {
          building: "JC",
          lat: location.lat,
          long: location.long
        }
      };

      const response = await fetch(`${API_BASE_URL}/add-user-task/${targetWorker._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: [...targetWorker.tasks, newTask]
        })
      });

      await response.json();
      
      // Refresh task data
      fetchUserTasks();
      toast.success("Task generated successfully");
    } catch (error) {
      console.error("❌ Error generating task:", error);
      toast.error("Error generating task");
    }
  }

  const fetchUserTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-user-task`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user tasks");
      }
      
      const data = await response.json();
      setWorkerData(data);
    } catch (error) {
      console.error("Error fetching user tasks", error);
      toast.error("Failed to fetch worker data");
    }
  };




  useEffect(() => {
    fetchUserTasks();
  }, []);


  return (
    <div className="text-white font-s min-h-screen bg-zinc-800 p-4">
      <Header>Manager Dashboard</Header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {workerData.map((worker, index) => (
          <div
            key={index}
            className="bg-zinc-700 border border-yellow-500/30 rounded-lg p-4 text-white shadow-md transition-all duration-500 ease-in-out 
                       hover:shadow-xl hover:border-yellow-500/50 hover:scale-[1.01]"
          >
            {/* Worker Name */}
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">{worker.workerName.charAt(0).toUpperCase() + worker.workerName.slice(1)}</h2>

            {/* Tasks List */}
            <div className="space-y-3 mb-4">
              {worker.tasks.map((task, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 rounded-lg transition-all duration-500 ease-in-out
                           hover:bg-zinc-600/50 hover:shadow-sm
                           group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {task.status ? 
                      <TiTick className="text-green-500" /> : 
                      <CgRadioChecked className="text-white" />
                    }
                    {/* onClick={() => alterStatus(worker._id, task._id)} */}
                    <span  className={task.status ? 'line-through text-gray-500' : ''}>
                      {task.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleLocationClick(task)}
                      className="text-yellow-500/70 hover:text-green-400/70 transition-colors duration-300"
                    >
                      <FaMapMarkerAlt className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Task Form - Only shown when this worker is selected */}
            {selectedWorker && selectedWorker._id === worker._id && (
              <div className="mt-4 mb-4 p-3 bg-zinc-800 rounded-lg border border-yellow-500/30">
                <h3 className="text-lg font-semibold text-yellow-300 mb-3">
                  Add Task for {worker.workerName.charAt(0).toUpperCase() + worker.workerName.slice(1)}
                </h3>
                <Form 
                  loc={temp.location} changeLoc={changeLoc} card="shadow-sm shadow-amber-600 bg-amber-300 border-2 border-solid rounded-lg text-black"
                  changeName={changeName} 
                  handleSubmit={handleSubmit} 
                />
                <button 
                  onClick={() => setSelectedWorker(null)} 
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-4 items-center">
              <button 
                onClick={() => handleAddTaskClick(worker)} 
                className="cursor-pointer mx-4 gap-2 flex items-center text-blue-400"
              >
                <FaPlus /> Add Task
              </button>

              <input 
                type="button" value="Generate Task" onClick={() => genTask(worker)} className="mx-2 my-2 text-green-400 border-2 border-solid rounded-lg px-4 py-1 cursor-pointer hover:bg-green-200 hover:text-black font-semibold" 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Map Dialog */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 p-6 rounded-lg border border-yellow-500 shadow-xl w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              
             
            </div>
            <Map2 aloc={mLoc} setShowMap={setShowMap} />
          </div>
        </div>
      )}
    </div>
  );
}
