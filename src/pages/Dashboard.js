// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [tags, setTags] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    status: '',
    priority: ''
  });

  // Edit states
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('pending');

  // Alert component
  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const Alert = ({ message, type }) => (
    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : type === 'error' 
        ? 'bg-red-500 text-white' 
        : 'bg-blue-500 text-white'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-green-200' : type === 'error' ? 'bg-red-200' : 'bg-blue-200'} animate-pulse`}></div>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 rounded-full bg-purple-600 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showAlert('Logout failed. Please try again.', 'error');
    } else {
      showAlert('Logged out successfully', 'success');
      navigate('/');
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      showAlert('Failed to fetch user data', 'error');
      return;
    }
    setUser(user);

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error: taskError } = await query;

    if (taskError) {
      showAlert('Error fetching tasks', 'error');
    } else {
      setTasks(data);
    }

    setLoading(false);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      title: '',
      description: '',
      status: '',
      priority: ''
    };

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      valid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
      valid = false;
    }

    if (!status) {
      newErrors.status = 'Status is required';
      valid = false;
    }

    if (!priority) {
      newErrors.priority = 'Priority is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('Please fill all required fields', 'error');
      return;
    }

    setIsCreating(true);
    const { error } = await supabase.from('tasks').insert([
      {
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        status,
        extras: {
          tags: tags.split(',').map((tag) => tag.trim()),
          dueDate,
          priority,
        },
      },
    ]);

    if (error) {
      showAlert('Failed to create task', 'error');
    } else {
      showAlert('Task created successfully!', 'success');
      // Clear inputs
      setTitle('');
      setDescription('');
      setStatus('pending');
      setTags('');
      setDueDate('');
      setPriority('');
      setErrors({
        title: '',
        description: '',
        status: '',
        priority: ''
      });
      fetchTasks();
    }
    setIsCreating(false);
  };

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) {
      showAlert('Failed to delete task', 'error');
    } else {
      showAlert('Task deleted successfully', 'success');
      fetchTasks();
    }
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
    setEditStatus(task.status || 'pending');
  };

  const validateEditForm = () => {
    let valid = true;
    const newErrors = {
      title: '',
      description: '',
      status: ''
    };

    if (!editTitle.trim()) {
      newErrors.title = 'Title is required';
      valid = false;
    }

    if (!editDescription.trim()) {
      newErrors.description = 'Description is required';
      valid = false;
    }

    if (!editStatus) {
      newErrors.status = 'Status is required';
      valid = false;
    }

    return valid;
  };

  const handleUpdateTask = async () => {
    if (!validateEditForm()) {
      showAlert('Please fill all required fields', 'error');
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        title: editTitle,
        description: editDescription,
        status: editStatus,
      })
      .eq('id', editingTask.id);

    if (error) {
      showAlert('Failed to update task', 'error');
    } else {
      showAlert('Task updated successfully!', 'success');
      setEditingTask(null);
      fetchTasks();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {alert && <Alert message={alert.message} type={alert.type} />}
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Task Manager
              </h1>
              <p className="text-gray-600 mt-1">Stay organized and productive</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Create Task Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Create New Task
          </h2>
          
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  placeholder="Enter task title..."
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors({...errors, title: ''});
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.title ? 'border-red-500' : 'border-gray-200'} focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white/50`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setErrors({...errors, status: ''});
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.status ? 'border-red-500' : 'border-gray-200'} focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white/50`}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                placeholder="Describe your task..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors({...errors, description: ''});
                }}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.description ? 'border-red-500' : 'border-gray-200'} focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white/50 resize-none`}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    setErrors({...errors, priority: ''});
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.priority ? 'border-red-500' : 'border-gray-200'} focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white/50`}
                >
                  <option value="">Select priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  placeholder="work, urgent, meeting"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <span>+</span>
                  Add Task
                </>
              )}
            </button>
          </form>
        </div>

        {/* Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter Tasks:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors duration-200 bg-white/50"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Your Tasks ({tasks.length})
          </h2>

          {loading ? (
            <LoadingSpinner />
          ) : tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01]"
                >
                  {editingTask?.id === task.id ? (
                    <div className="space-y-4">
                      <div>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border-2 ${!editTitle.trim() ? 'border-red-500' : 'border-gray-200'} focus:border-purple-500 focus:outline-none transition-colors duration-200`}
                          placeholder="Edit title *"
                        />
                        {!editTitle.trim() && <p className="mt-1 text-sm text-red-600">Title is required</p>}
                      </div>
                      <div>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={3}
                          className={`w-full px-4 py-3 rounded-xl border-2 ${!editDescription.trim() ? 'border-red-500' : 'border-gray-200'} focus:border-purple-500 focus:outline-none transition-colors duration-200 resize-none`}
                          placeholder="Edit description *"
                        />
                        {!editDescription.trim() && <p className="mt-1 text-sm text-red-600">Description is required</p>}
                      </div>
                      <div>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors duration-200"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleUpdateTask}
                          className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingTask(null)}
                          className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-800 flex-1">{task.title}</h3>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => startEditing(task)}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-4 leading-relaxed">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        
                        {task.extras?.priority && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.extras.priority)}`}>
                            {task.extras.priority}
                          </span>
                        )}
                        
                        {task.extras?.dueDate && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                            Due: {new Date(task.extras.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {task.extras?.tags && task.extras.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {task.extras.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium border border-purple-200"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-gray-500 text-lg">No tasks found</p>
              <p className="text-gray-400 text-sm mt-2">Create your first task to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;