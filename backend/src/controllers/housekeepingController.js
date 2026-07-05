import housekeepingTask from "../models/housekeepingTask.js";

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await housekeepingTask.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const {
      roomNumber,
      taskType,
      status,
      assignedTo,
      priority,
      notes,
      dueDate,
    } = req.body;
    if (!roomNumber || !taskType) {
      return res.status(400).json({
        success: false,
        message: "Room Number and Task Type are required",
      });
    }
    const task = await housekeepingTask.create({
      roomNumber,
      taskType,
      status: status || "Pending",
      assignedTo: assignedTo || null,
      priority: priority || "Normal",
      notes: notes || null,
      dueDate: dueDate || null,
    });
    res
      .status(201)
      .json({ success: true, message: "Task Created", data: task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "In Progress", "Completed"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }
    const task = await housekeepingTask.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Task updated", data: task });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await housekeepingTask.findByIdAndDelete(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};
