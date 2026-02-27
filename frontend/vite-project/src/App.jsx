import { useEffect, useState } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';

function App() {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
  });

  const [taskViewMode, setTaskViewMode] = useState('mine'); // 'mine' | 'all'

  const isAuthenticated = Boolean(token);

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';

    const body =
      authMode === 'login'
        ? {
            email: authForm.email,
            password: authForm.password,
          }
        : authForm;

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      setAuthError(err.message || 'Something went wrong');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTasks([]);
  };

  const fetchTasks = async (mode = taskViewMode) => {
    if (!token) return;

    setTasksLoading(true);
    setTasksError('');

    try {
      const endpoint =
        currentUser && currentUser.role === 'admin' && mode === 'all'
          ? '/tasks/all'
          : '/tasks';

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load tasks');
      }

      setTasks(data.items || []);
    } catch (err) {
      setTasksError(err.message || 'Something went wrong');
    } finally {
      setTasksLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    setTasksError('');

    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create task');
      }

      setTaskForm({ title: '', description: '' });
      setTasks((prev) => [data, ...prev]);
    } catch (err) {
      setTasksError(err.message || 'Something went wrong');
    }
  };

  const handleDeleteTask = async (id) => {
    setTasksError('');
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete task');
      }

      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setTasksError(err.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks('mine');
      setTaskViewMode('mine');
    }
  }, [isAuthenticated]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Assignment API Demo</h1>
        {isAuthenticated && currentUser && (
          <div className="user-info">
            <span>
              Signed in as <strong>{currentUser.name}</strong> ({currentUser.role})
            </span>
            <button type="button" className="btn secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        <section className="card">
          <div className="card-header">
            <h2>Authentication</h2>
            <div className="tabs">
              <button
                type="button"
                className={authMode === 'login' ? 'tab active' : 'tab'}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'tab active' : 'tab'}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>
          </div>

          <form className="form" onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <>
                <label className="form-label" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  value={authForm.name}
                  onChange={handleAuthInputChange}
                  required
                />
              </>
            )}

            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={authForm.email}
              onChange={handleAuthInputChange}
              required
            />

            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={authForm.password}
              onChange={handleAuthInputChange}
              required
              minLength={6}
            />

            {authMode === 'register' && (
              <>
                <label className="form-label" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="form-input"
                  value={authForm.role}
                  onChange={handleAuthInputChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </>
            )}

            {authError && <p className="error-text">{authError}</p>}

            <button type="submit" className="btn primary" disabled={authLoading}>
              {authLoading ? 'Please wait…' : authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Tasks</h2>
            {isAuthenticated && currentUser?.role === 'admin' && (
              <div className="tabs">
                <button
                  type="button"
                  className={taskViewMode === 'mine' ? 'tab active' : 'tab'}
                  onClick={() => {
                    setTaskViewMode('mine');
                    fetchTasks('mine');
                  }}
                >
                  My tasks
                </button>
                <button
                  type="button"
                  className={taskViewMode === 'all' ? 'tab active' : 'tab'}
                  onClick={() => {
                    setTaskViewMode('all');
                    fetchTasks('all');
                  }}
                >
                  All users
                </button>
              </div>
            )}
          </div>

          {!isAuthenticated && (
            <p className="muted">
              Login or register to view and manage your tasks.
            </p>
          )}

          {isAuthenticated && (
            <>
              <form className="form inline" onSubmit={handleCreateTask}>
                <input
                  name="title"
                  type="text"
                  placeholder="Task title"
                  className="form-input"
                  value={taskForm.title}
                  onChange={handleTaskInputChange}
                  required
                />
                <input
                  name="description"
                  type="text"
                  placeholder="Optional description"
                  className="form-input"
                  value={taskForm.description}
                  onChange={handleTaskInputChange}
                />
                <button type="submit" className="btn primary">
                  Add
                </button>
              </form>

              {tasksLoading && <p className="muted">Loading tasks…</p>}
              {tasksError && <p className="error-text">{tasksError}</p>}

              <div className="task-list">
                {tasks.length === 0 && !tasksLoading && (
                  <p className="muted">
                    {taskViewMode === 'all'
                      ? 'No tasks found for any user.'
                      : 'No tasks yet. Create your first one above.'}
                  </p>
                )}

                {tasks.map((task) => (
                  <div key={task._id} className="task-item">
                    <div>
                      <h3>{task.title}</h3>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      <p className="task-meta">
                        Status: <span className="badge">{task.status}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn danger"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Backend docs available at{' '}
          <code>http://localhost:5000/api-docs</code> when the server is running.
        </p>
      </footer>
    </div>
  );
}

export default App;
