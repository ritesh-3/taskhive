import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const fetchTasks = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setTasks(data);
  };

  const addTask = async () => {
    if (!title.trim()) return;
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>TaskHive</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add new task"
        style={{ padding: "8px", width: "80%" }}
      />
      <button onClick={addTask} style={{ marginLeft: 8 }}>Add</button>

      <ul style={{ marginTop: 20, textAlign: "left" }}>
        {tasks.map((task) => (
          <li key={task._id} style={{ marginBottom: 8 }}>
            {task.title}
            <button onClick={() => deleteTask(task._id)} style={{ float: "right" }}>
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
