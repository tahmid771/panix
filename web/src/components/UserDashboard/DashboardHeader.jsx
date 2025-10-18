"use client";

import { LogOut, Code } from "lucide-react";

export function DashboardHeader({ user, onLogout, onTabChange }) {
  return (
    <header className="bg-gray-900 border-b border-gray-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src="https://ucarecdn.com/201a4688-4d6c-4c8f-a581-2a4d74f80633/-/format/auto/"
              alt="PanixAuth Logo"
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold">PanixAuth Dashboard</h1>
              <p className="text-sm text-gray-400">
                Welcome back, {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onTabChange("docs")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>Documentation</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
