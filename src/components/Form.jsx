export default function Form({card,changeName,changeLoc,handleSubmit,loc}){
    return(
<form className={`font-semibold ${card} w-[400px] mx-2 p-4 border rounded-lg shadow-md`}>
    <div className="flex w-full gap-4 mb-4">
      <label className="flex-1">Task Name:</label>
      <input onChange={(e)=>changeName("name",e.target.value)} className="bg-amber-200 flex-1 p-1 rounded" type="text" id="tname" name="tname"      />
    </div>

    <div className="flex w-full gap-4 mb-4">
      <label className="flex-1">Location Name:</label>
      <input onChange={(e)=>changeName("building",e.target.value)} className="bg-amber-200 flex-1 p-1 rounded" type="text" id="lname" name="lname"      />
    </div>
  
    <div className="flex w-full gap-4 mb-4">
      <label className="flex-1">Task Location:</label>
      <button onClick = {changeLoc}className="bg-amber-200 flex-1 p-1 rounded cursor-pointer hover:bg-blue-100">{loc.lat === 0 && loc.long === 0 ? "Set Location" : "Latitude: "+loc.lat + " Longitude: " + loc.long }</button>
    </div>
  
    <input onClick={handleSubmit}className="border-2 border-solid rounded-lg px-4 py-1 cursor-pointer hover:bg-blue-100" type="submit" value="Submit"/>
</form>
    );
}