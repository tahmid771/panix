"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Key } from "lucide-react";

export function CreateKeyModal({ user, selectedApp, onClose, onSuccess }) {
  const [keyType, setKeyType] = useState("random");
  const [customKey, setCustomKey] = useState("");
  const [hwidEnabled, setHwidEnabled] = useState(false);
  const [expiresIn, setExpiresIn] = useState("");
  const [applicationId, setApplicationId] = useState(selectedApp?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: appsData } = useQuery({
    queryKey: ["user-applications"],
    queryFn: async () => {
      const response = await fetch(`/api/applications?userId=${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          applicationId: parseInt(applicationId),
          keyType,
          customKey: keyType === "custom" ? customKey : undefined,
          hwidEnabled,
          expiresIn: expiresIn ? parseInt(expiresIn) : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || "Failed to create key");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Generate New Key</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Application
            </label>
            <select
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Application</option>
              {appsData?.applications?.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Key Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="random"
                  checked={keyType === "random"}
                  onChange={(e) => setKeyType(e.target.value)}
                  className="mr-2 text-blue-600"
                />
                <span>Random Key</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="custom"
                  checked={keyType === "custom"}
                  onChange={(e) => setKeyType(e.target.value)}
                  className="mr-2 text-blue-600"
                />
                <span>Custom Key</span>
              </label>
            </div>
          </div>

          {keyType === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Key Value
              </label>
              <input
                type="text"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter custom key"
                required
              />
            </div>
          )}

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={hwidEnabled}
                onChange={(e) => setHwidEnabled(e.target.checked)}
                className="mr-2 text-blue-600"
              />
              <span>Enable HWID Binding</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              When enabled, the key will be bound to the user's hardware
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expires In (days, leave empty for no expiration)
            </label>
            <input
              type="number"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 30"
              min="1"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !applicationId}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "Generating..." : "Generate Key"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
