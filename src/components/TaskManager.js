import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';


const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchTasks(user.id);
    };

    getUser();
  }, []);

  const fetchTasks = async (userId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) {
      setTasks(data);
    }
  };

  const addTask = async () => {
    if (!title.trim()) return;
    const { data, error } = await supabase.from('tasks').insert([
      { title, user_id: user.id },
    ]);
    if (!error) {
      setTitle('');
      fetchTasks(user.id);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">My Tasks</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border px-2 py-1 rounded"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={addTask} className="bg-blue-500 text-white px-4 py-1 rounded">
          Add
        </button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="flex justify-between py-1 border-b">
            <span>{task.title}</span>
            <span>{task.completed ? '✅' : '❌'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;
