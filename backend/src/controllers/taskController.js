const { validationResult } = require('express-validator');
const Task = require('../models/Task');

const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.json({ items: tasks });
  } catch (err) {
    return next(err);
  }
};

const getAllTasksAdmin = async (req, res, next) => {
  try {
    const tasks = await Task.find().populate('owner', 'name email role');
    return res.json({ items: tasks });
  } catch (err) {
    return next(err);
  }
};

const createTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }

  const { title, description, status } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      status,
      owner: req.user._id,
    });

    return res.status(201).json(task);
  } catch (err) {
    return next(err);
  }
};

const getTaskById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const task = await Task.findOne({ _id: id, owner: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (err) {
    return next(err);
  }
};

const updateTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }

  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const task = await Task.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { title, description, status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (err) {
    return next(err);
  }
};

const deleteTask = async (req, res, next) => {
  const { id } = req.params;

  try {
    const filter =
      req.user.role === 'admin'
        ? { _id: id }
        : { _id: id, owner: req.user._id };

    const task = await Task.findOneAndDelete(filter);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getTasks,
  getAllTasksAdmin,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
};

