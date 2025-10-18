"use client";

import { Key, Layers, Code } from "lucide-react";

const navItems = [
  { id: "keys", label: "Key Management", icon: Key },
  { id: "apps", label: "Applications", icon: Layers },
  { id: "docs", label: "Documentation", icon: Code },
];

export function DashboardSidebar({ activeTab, onTabChange }) {
  return (
    <div className="lg:w-64 flex-shrink-0">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
