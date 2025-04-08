// import { useEffect, useState } from "react";
// import { FaPlus } from "react-icons/fa";
// import { toast } from 'react-toastify';
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import Task from "../components/Task"
// import Form from "../components/Form";
// import Header from "../components/Header";

// function Dashboard() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [temp, setTemp] = useState({
//     name: "null",
//     location: {lat: 0, long: 0}
//   });

//   const [addTask, setAddTask] = useState(true);
//   const card = "shadow-sm shadow-amber-600 bg-amber-300 border-2 border-solid rounded-lg text-black";
//   const [tasks, setTasks] = useState([]);

//   // Check if user is logged in
//   useEffect(() => {
//     if (!user) {
//       toast.error("Please login to access the dashboard");
//       navigate("/login");
//     }
//   }, [user, navigate]);

//   //FUNCTION TO EDIT TASK NAME
//   function changeName(id, val) {
//     setTemp((prev) => ({
//       ...prev,
//       [id]: val
//     }));
//   }    

//   //FUNCTION TO EDIT ADDRESS
//   function changeLoc(e) {
//     e.preventDefault();
//     navigator.geolocation.getCurrentPosition(
//       //1st argument
//       (position) => {
//         setTemp((prev) => ({
//           ...prev,
//           //Use the below notation for ADDing or UPDATing new/existing values
//           location: {
//             lat: position.coords.latitude,
//             long: position.coords.longitude,
//           }
//         }));
          
//         console.log(`latitude is: ${position.coords.latitude} 
//         and longitude is: ${position.coords.longitude}`);
//       },

//       //2nd argument
//       (error) => {
//         console.error("Error fetching location:", error);
//       },

//       //3rd Argument
//       {
//         enableHighAccuracy: true,
//         maximumAge: 100,
//       }
//     );
//   }

//   //GET request to fetch all the TASK records
//   async function getTasks() {
//     try {
//       const res = await fetch(`http://localhost:3000/gettask`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
  
//       const data = await res.json(); 

//       // 👇 Store in tasks state
//       setTasks(data);
//     } catch (error) {
//       console.error("Could not fetch task records(REACT)", error);
//     }
//   }

//   //Check off/strike off tasks if status===false
//   async function alterStatus(id) {
//     try {
//       const res = await fetch(`http://localhost:3000/add/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
  
//       const data = await res.json(); 
//       await getTasks();
//       toast.success("Task completed");

//       console.log("Task status updated (REACT)", data);
//     } catch (error) {
//       console.error("Task status could not be updated(REACT)", error);
//     }
//   }

//   //FUNCTION TO ADD TASK
//   async function handleSubmit(e) {
//     e.preventDefault();
//     const record = {
//       name: temp.name,
//       status: false,
//       location: temp.location
//     };

//     try {
//       const res = await fetch("http://localhost:3000/add", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(record)
//       });
  
//       const data = await res.json();
      
//       await getTasks();
//       await setAddTask(true);

//       toast.success("Task added Successfully");
//       console.log("Added Task record details", data);
//     } catch (error) {
//       console.error("Task could not be Created(REACT)", error);
//     }
//   }

//   // Function to create a task from the generated text
//   async function handleGenSubmit(data) {
//     // Get current location
//     try {
//       // Promise to get current position
//       const getCurrentPosition = () => {
//         return new Promise((resolve, reject) => {
//           navigator.geolocation.getCurrentPosition(
//             position => resolve({
//               lat: position.coords.latitude,
//               long: position.coords.longitude
//             }),
//             error => {
//               console.error("Error getting location:", error);
//               reject(error);
//               // Use default location if error
//               resolve({ lat: 0, long: 0 });
//             },
//             { enableHighAccuracy: true, maximumAge: 100 }
//           );
//         });
//       };

//       // Get location first
//       const location = await getCurrentPosition();
      
//       // Create task record
//       const record = {
//         name: data,
//         status: false,
//         location: location
//       };

//       // Send to backend
//       const res = await fetch("http://localhost:3000/add", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(record)
//       });

//       const responseData = await res.json();
//       console.log("Added generated task:", responseData);
      
//     } catch (error) {
//       console.error("Failed to create task from generated text:", error);
//       toast.error("Failed to create task");
//     }
//   }

//   //API call to OpenAI via node
//   async function genTask() {
//     try {
//       const res = await fetch("http://localhost:3000/gpt", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
  
//       const data = await res.text(); 
//       console.log("🧠 Suggested Task from GPT:", data);
//       await handleGenSubmit(data);

//       await getTasks();
//       await setAddTask(true);

//       toast.success("Task generated successfully");

//     } catch (error) {
//       console.error("❌ Error fetching task:", error);
//       toast.error("Error fetching task");
//     }
//   }
  
//   useEffect(() => {
//     if (user) {
//       getTasks();
//     }
//   }, [user]);

//   // Only render if user is logged in
//   if (!user) return null;

//   return (
//     <>
//       <Header>Task Management Dashboard</Header>
//       <div className="text-white font-s">
//         <div className="font-bold my-4">Tasks List</div>

//         <ul className="list-disc pl-4">
//           {tasks.map((task) => (
//             <Task key={task._id} alterStatus={alterStatus} task={task} />
//           ))}
//         </ul>
    
//         {addTask && <button onClick={() => {setAddTask(false)}} className="mx-4 gap-2 flex items-center text-blue-400"><FaPlus />Add Task</button>}
      
//         {!addTask && <Form loc={temp.location} changeLoc={changeLoc} card={card} changeName={changeName} handleSubmit={handleSubmit} />}

//         <input onClick={genTask} className="mx-2 my-2 text-green-400 border-2 border-solid rounded-lg px-4 py-1 cursor-pointer hover:bg-green-200 hover:text-black font-semibold" type="button" value="Generate Task" />
      
      
//       </div>
//     </>
//   );
// }

// export default Dashboard; 