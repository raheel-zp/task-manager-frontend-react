import { useState, useEffect } from "react";

const TaskModal = ({ show, onClose, onSave, task }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    dueDate: "",
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "pending",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        status: "pending",
        dueDate: "",
      });
    }
  }, [task]);

  if (!show) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {task ? "Edit Task" : "Create New Task"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="border p-2 w-full mb-3 rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="border p-2 w-full mb-3 rounded"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 w-full mb-3 rounded"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="border p-2 w-full mb-3 rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              {task ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
