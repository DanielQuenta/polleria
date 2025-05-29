import React from "react";
import { NavLink } from "react-router-dom";

export function Sidebar() {
  const baseClasses = "block px-4 py-2 rounded hover:bg-yellow-500";
  const activeClasses = "bg-yellow-600 text-white font-bold";

  return (
    <aside className="w-64 bg-yellow-600 text-white min-h-screen p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-10">Broasters Pollería</h1>
      <nav className="flex flex-col gap-3">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${baseClasses} ${isActive ? activeClasses : "text-yellow-100"}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `${baseClasses} ${isActive ? activeClasses : "text-yellow-100"}`
          }
        >
          Pedidos
        </NavLink>
        <NavLink
          to="/customers"
          className={({ isActive }) =>
            `${baseClasses} ${isActive ? activeClasses : "text-yellow-100"}`
          }
        >
          Clientes
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `${baseClasses} ${isActive ? activeClasses : "text-yellow-100"}`
          }
        >
          Reportes
        </NavLink>
      </nav>
    </aside>
  );
}
