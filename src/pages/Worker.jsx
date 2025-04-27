import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaMapMarkerAlt } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { CgRadioCheck } from "react-icons/cg";
import Header from '../components/Header';
import Map2 from '../components/Map2';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

export default function Worker() {
  const [showMap, setShowMap] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const[mLoc,setMLoc] = useState({lat:0,long:0});
  const savedLoc = useRef({});
  const [notifs,setNotifs] = useState(false);
  

  const [currLoc,setCurrLoc] = useState({lat:0,long:0});
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


//avg location from group
  const handleLocationClick = (taskgroup) => {
    // console.log(tg);
    setShowMap(true);
    setMLoc((prev)=>(
      {...prev,
      lat:taskgroup.avgloc.lat,
      long:taskgroup.avgloc.long,
      name:taskgroup.name}
    ));
  };

  const handleTaskLocationClick = (task) => {
    // console.log(task);
    setShowMap(true);
    setMLoc((prev)=>(
      {...prev,
      lat:task.loc.lat,
      long:task.loc.long,
      name:task.name}
    ));
  };

  const fetchUserTasks = async () => {
    
    try {
      const response = await fetch(`${API_BASE_URL}/get-grouped-tasks/${user.id}`, {
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
      // console.log(data);
    } catch (error) {
      console.error("Error fetching user tasks", error);
      toast.error("Failed to fetch worker data");
    }
  };

  const alterTaskStatus = async (wid,tid) => {

    // console.log("Altering task status for worker", wid, "and task", tid);
      try {
        const response = await fetch(`${API_BASE_URL}/alter-user-task/${wid}/${tid}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          }
        });
  
        // const data = await response.json();
        fetchUserTasks();
        toast.success("Task status updated");
        // console.log("Task status updated", data);
      } catch (error) {
        console.error("Error updating task status", error);
        toast.error("Failed to update task status");
      }
    };

  useEffect(() => {
    fetchUserTasks();
  }, []);

  useEffect(() => {
    
  function currentLoc() {
      
      navigator.geolocation.getCurrentPosition(
        // 1st argument
        (position) => {
          setCurrLoc((prev)=>(
            {...prev,
            lat:position.coords.latitude,
            long:position.coords.longitude}
          ));
            
          // console.log(`latitude is: ${position.coords.latitude} 
          // and longitude is: ${position.coords.longitude}`);
        },
  
        // 2nd argument
        (error) => {
          console.error("Error fetching current location:", error);
        },
  
        // 3rd Argument
        {
          enableHighAccuracy: true,
          maximumAge: 100,
        }
      );
    }
    //initial fetch
    currentLoc();

    const interval = setInterval(() => {
      currentLoc();
    }, 8000);

    return () => clearInterval(interval);
  }, []);


    function inLocation(group) {
      // Check if we already calculated this group's location status
      
      if (savedLoc.current[group.name] !== undefined) {
        return savedLoc.current[group.name];
      }
      
      // If not calculated yet, do the calculation
      const R = 6371; 

      // console.log("Task Group location", group.avgloc);
      // console.log("Current location", currLoc);

      const dLat = (group.avgloc.lat - currLoc.lat) * (Math.PI / 180);
      const dLon = (group.avgloc.long - currLoc.long) * (Math.PI / 180);

      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(currLoc.lat * (Math.PI / 180)) * Math.cos(group.avgloc.lat * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in kilometers

      // Distance in meters
      const meterDistance = distance * 1000;
      // console.log("Distance in meters:", meterDistance);

      // True if distance is less than 20 meters
      const result = meterDistance <= 20;
      
      // Log the group when location is within range
      if (result === true) {
        console.log('Worker is within location range for group:', group);
      }

      savedLoc.current[group.name] = result;
      if(result == true && notifs) {
        console.log("Sending text to",user.phone,"for group",group.name);

        sendText(user.phone,group.name);
      }

      return result;
    }
  
  // Reset location cache when current location changes
  useEffect(() => {
    // Clear cache when current location updates
    savedLoc.current = {};
  }, [currLoc]);

  
  async function sendText(user_phone,loc_name) {
    try {
      
      const name = user.username.charAt(0).toUpperCase() + user.username.slice(1);
     
      const response = await fetch(`${API_BASE_URL}/send-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name:  name,
          phone: user_phone,
          location: loc_name
        })
      });
      
      const data = await response.json();
      console.log(data);
      
      if (data.success) {
        toast.success('Message sent successfully!');
      } else {
        toast.error(`Failed to send message: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending text:', error);
      toast.error('Failed to send text message');
    }
  }
  return (
    <div className="text-white font-s min-h-screen bg-zinc-800 p-4">
      <Header>Worker Dashboard</Header>
      
      <div className="mt-4">
        <label className="flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={notifs} onChange={()=>setNotifs(!notifs)}/>
          <div className="relative w-11 h-6 bg-gray-500 peer-checked:bg-blue-600 rounded-full peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          <span className="ml-3 text-sm font-medium text-white">Notifs </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {

        taskGroups.map((group, index) => (
          <div
            key={index}
            className="bg-zinc-700 border border-yellow-500/30 rounded-lg p-4 text-white shadow-md transition-all duration-500 ease-in-out 
                       hover:shadow-xl hover:border-yellow-500/50 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-yellow-300">{group.name}</h2>
              <div className="flex items-center gap-2">

              <span className={`${inLocation(group) ? 'text-green-500' : 'text-red-500'} font-bold`}>
                      { inLocation(group) ? 'In Location' : 'Not In Location'}
              </span>
                {/* Map Button */}
                <button 
                  onClick={()=>{handleLocationClick(group)}}
                  className="text-yellow-500/70 hover:text-green-400/70 transition-colors duration-300"
                >
                  <FaMapMarkerAlt className="text-lg" />
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

                  onClick={() => {
                    //if inLocation is true then alterTaskStatus else show toast  
                      
                      if(inLocation(group))
                        alterTaskStatus(user.id, task.taskId)
                      else{
                        
                        toast.error(`You are not in ${group.name}`);
                      }

                    } }
                >




                  <div className="flex items-center gap-2">
                    {task.status ? 
                      <TiTick className="text-green-500" /> : 
                      <CgRadioCheck className="text-white" />
                    }

                    <span className={task.status ? 'line-through text-gray-500' : ''}>
                      {task.name}
                    </span>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskLocationClick(task);
                    }}
                    className="text-red-500/70 hover:text-green-400/70 transition-colors duration-300"
                  >
                    <FaMapMarkerAlt className="text-lg" />
                  </button>


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
            <Map2 aloc={mLoc} setShowMap={setShowMap} />
          </div>
        </div>
      )}
    </div>
  );
}
