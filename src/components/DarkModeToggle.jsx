import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 p-2 rounded"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
