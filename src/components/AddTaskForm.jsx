import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function AddTaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/tasks", { title });
      toast.success("Task added!");
      onTaskAdded(res.data);
      setTitle("");
    } catch {
      toast.error("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Enter task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 flex-1 rounded"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}
