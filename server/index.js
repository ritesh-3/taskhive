import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const isMongoEnabled = !!process.env.MONGO_URL;
const FILE_PATH = path.resolve('./tasks.json');

// Helper for File Storage
const readTasksFromFile = () => {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeTasksToFile = (tasks) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2));
};

let TaskModel = null;

if (isMongoEnabled) {
  // MongoDB Schema
  TaskModel = mongoose.model('Task', {
    title: String,
    completed: Boolean,
  });
}

// API Routes
app.get('/api/tasks', async (req, res) => {
  if (isMongoEnabled) {
    const tasks = await TaskModel.find();
    res.json(tasks);
  } else {
    const tasks = readTasksFromFile();
    res.json(tasks);
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  if (isMongoEnabled) {
    const task = new TaskModel({ title, completed: false });
    await task.save();
    res.json(task);
  } else {
    const tasks = readTasksFromFile();
    const newTask = { id: Date.now().toString(), title, completed: false };
    tasks.push(newTask);
    writeTasksToFile(tasks);
    res.json(newTask);
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  if (isMongoEnabled) {
    await TaskModel.findByIdAndDelete(id);
    res.json({ success: true });
  } else {
    let tasks = readTasksFromFile();
    tasks = tasks.filter((t) => t.id !== id);
    writeTasksToFile(tasks);
    res.json({ success: true });
  }
});

// Start Server
const startServer = async () => {
  if (isMongoEnabled) {
    try {
      await mongoose.connect(process.env.MONGO_URL);
      console.log("✅ Connected to MongoDB");
    } catch (err) {
      console.error("❌ MongoDB connection failed:", err);
      process.exit(1);
    }
  } else {
    console.log("⚠️ MongoDB disabled — using file system as fallback");
  }

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
