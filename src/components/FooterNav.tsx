import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function FooterNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/home", icon: "🏠", label: "Home" },
    { path: "/events", icon: "📅", label: "Events" },
    { path: "/search", icon: "🔎", label: "Search" },
    { path: "/inbox", icon: "📬", label: "Inbox" },
    { path: "/profile", icon: "👤", label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-paper border-t border-gray-200 shadow-lg px-sm py-xs">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center py-sm px-xs min-w-0 flex-1 transition-colors ${
              location.pathname === item.path
                ? "text-primary"
                : "text-secondary hover:text-primary"
            }`}
          >
            <span className="text-lg mb-xs">{item.icon}</span>
            <span className="text-xs truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 