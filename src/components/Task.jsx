import { TiTick } from "react-icons/ti";
import { CgRadioCheck } from "react-icons/cg";
export default function Task({task,alterStatus}){

    return(
        <li onClick={()=>alterStatus(task._id)} key={task.id} className="flex items-center gap-2 mb-2">
          {task.status ? <TiTick className="text-green-500" />:<CgRadioCheck />}

          <span className={task.status ? 'line-through text-gray-500' : ''}>
            {task.name}
          </span>
        </li>
    );
        
        
      
}