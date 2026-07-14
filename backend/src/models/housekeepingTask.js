import mongoose from "mongoose";

const houseKeepingTaskSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, "Room Number is required"],
      trim: true,
    },
    taskType: {
      type: String,
      required: [true, "Task Type is required"],
      enum: ["cleaning", "inspection", "maintenance", "turndown"],
      trim: true,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["pending", "in-progress", "done"],
      default: "pending",
    },
    assignedTo: { type: String, default: null, trim: true },
    priority: {
      type: String,
      required: [true, "Priority is required"],
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    notes: { type: String, default: null, trim: true },
    dueDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.HouseKeepingTask || mongoose.model("HouseKeepingTask", houseKeepingTaskSchema);
