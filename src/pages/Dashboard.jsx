import { useEffect, useState, useContext, useCallback } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import TaskModal from "../components/TaskModal";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    sort: "createdAt:desc",
  });

  const getTasks = useCallback(async () => {
    try {
      const { search, status, priority, sort } = filters;
      const res = await api.get(
        `/tasks?page=${page}&limit=5&status=${status}&search=${search}&sort=${sort}&priority=${priority}`
      );
      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      if (err.response?.status === 401) logout();
    }
  }, [page, logout, filters]);

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  const handleSaveTask = async (form) => {
    try {
      if (selectedTask) {
        await api.put(`/tasks/${selectedTask._id}`, form);
        toast.success("Task updated successfully!");
      } else {
        await api.post("/tasks", form);
        toast.success("Task added successfully!");
      }
      setShowModal(false);
      setSelectedTask(null);
      getTasks();
    } catch (err) {
      toast.error("Failed to save task");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete task");
      console.error(err);
    }
    getTasks();
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedStatus =
        task.status === "completed" ? "pending" : "completed";
      const res = await api.put(`/tasks/${task._id}`, {
        status: updatedStatus,
      });

      // Update tasks state
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));

      toast.success(
        updatedStatus === "completed"
          ? "Task marked as completed!"
          : "Task marked as pending!"
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update task");
    }
  };

  const handleBulkComplete = async () => {
    try {
      const promises = selectedTasks.map((id) =>
        api.put(`/tasks/${id}`, { status: "completed" })
      );
      const results = await Promise.all(promises);

      // Update state
      setTasks((prev) =>
        prev.map((task) =>
          selectedTasks.includes(task._id)
            ? results.find((r) => r.data._id === task._id).data
            : task
        )
      );

      toast.success("Selected tasks marked as completed!");
      setSelectedTasks([]); // Clear selection
    } catch (err) {
      toast.error("Failed to update selected tasks");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm("Are you sure you want to delete selected tasks?"))
      return;

    try {
      const promises = selectedTasks.map((id) => api.delete(`/tasks/${id}`));
      await Promise.all(promises);

      // Update state
      setTasks((prev) =>
        prev.filter((task) => !selectedTasks.includes(task._id))
      );

      toast.success("Selected tasks deleted!");
      setSelectedTasks([]); // Clear selection
    } catch (err) {
      toast.error("Failed to delete selected tasks");
    }
  };

  const handleOpenModal = (task = null) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setShowModal(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Task Manager</h1>
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleBulkComplete}
            disabled={selectedTasks.length === 0}
            className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            Mark Completed
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedTasks.length === 0}
            className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            Delete Selected
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            + Add Task
          </button>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="border p-2 rounded flex-1"
        />

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange("priority", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange("sort", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="createdAt:desc">Newest</option>
          <option value="createdAt:asc">Oldest</option>
          <option value="dueDate:asc">Due Soon</option>
          <option value="dueDate:desc">Due Latest</option>
        </select>

        <button
          onClick={() => {
            setPage(1);
            getTasks();
          }}
          className="bg-gray-800 text-white px-3 py-1 rounded"
        >
          Apply
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task._id}
              className="border p-3 rounded bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <div>
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task._id)}
                    onChange={() => {
                      setSelectedTasks((prev) =>
                        prev.includes(task._id)
                          ? prev.filter((id) => id !== task._id)
                          : [...prev, task._id]
                      );
                    }}
                    className="w-4 h-4"
                  />
                </div>
                <div>
                  <h3
                    className="font-bold text-gray-800 cursor-pointer"
                    onClick={() => handleToggleComplete(task)}
                    title={
                      task.status === "pending"
                        ? " Mark as complete"
                        : " Mark as Pending"
                    }
                  >
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <p className="text-xs text-gray-500">
                    Status: {task.status} | Priority: {task.priority} |
                    {task.dueDate && ` Due: ${task.dueDate.split("T")[0]}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(task)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center mt-10">No tasks found</p>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-700">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TaskModal
          show={showModal}
          task={selectedTask}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

export default Dashboard;
