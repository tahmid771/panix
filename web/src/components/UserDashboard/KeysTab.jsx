"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Shield,
  Layers,
} from "lucide-react";

export function KeysTab({
  user,
  setShowCreateKey,
  selectedApp,
  setSelectedApp,
  setActiveTab
}) {
  const queryClient = useQueryClient();

  const { data: appsData } = useQuery({
    queryKey: ["user-applications"],
    queryFn: async () => {
      const response = await fetch(`/api/applications?userId=${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
  });

  const { data: keysData, isLoading: keysLoading } = useQuery({
    queryKey: ["user-keys", selectedApp?.id],
    queryFn: async () => {
      const url = selectedApp
        ? `/api/keys?userId=${user.id}&applicationId=${selectedApp.id}`
        : `/api/keys?userId=${user.id}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch keys");
      return response.json();
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId) => {
      const response = await fetch("/api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId, userId: user.id }),
      });
      if (!response.ok) throw new Error("Failed to delete key");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user-keys"]);
    },
  });

  const updateKeyMutation = useMutation({
    mutationFn: async ({ keyId, updates }) => {
      const response = await fetch("/api/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId, userId: user.id, ...updates }),
      });
      if (!response.ok) throw new Error("Failed to update key");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user-keys"]);
    },
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Key Management</h2>
          <p className="text-gray-400 mt-1">
            Generate and manage your authentication keys
          </p>
        </div>
        <button
          onClick={() => setShowCreateKey(true)}
          disabled={!appsData?.applications?.length}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Key</span>
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Filter by Application
        </label>
        <select
          value={selectedApp?.id || ""}
          onChange={(e) => {
            const app = appsData?.applications?.find(
              (a) => a.id === parseInt(e.target.value),
            );
            setSelectedApp(app || null);
          }}
          className="w-full max-w-xs px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Applications</option>
          {appsData?.applications?.map((app) => (
            <option key={app.id} value={app.id}>
              {app.name}
            </option>
          ))}
        </select>
      </div>

      {!appsData?.applications?.length ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No Applications Found
          </h3>
          <p className="text-gray-500 mb-4">
            Create an application first to generate keys
          </p>
          <button
            onClick={() => setActiveTab("apps")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Create Application
          </button>
        </div>
      ) : keysLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading keys...</div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    HWID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {keysData?.keys?.map((key) => (
                  <tr
                    key={key.id}
                    className="hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm text-blue-400 bg-gray-800 px-2 py-1 rounded">
                          {key.key_value.substring(0, 16)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(key.key_value)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {key.application_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            key.hwid_enabled
                              ? "bg-green-900 text-green-300"
                              : "bg-gray-900 text-gray-400"
                          }`}
                        >
                          {key.hwid_enabled ? "Enabled" : "Disabled"}
                        </span>
                        {key.hwid_enabled && (
                          <button
                            onClick={() =>
                              updateKeyMutation.mutate({
                                keyId: key.id,
                                updates: { resetHwid: true },
                              })
                            }
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            title="Reset HWID"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(key.expires_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          key.is_active
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {key.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateKeyMutation.mutate({
                              keyId: key.id,
                              updates: { hwidEnabled: !key.hwid_enabled },
                            })
                          }
                          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                          title="Toggle HWID"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteKeyMutation.mutate(key.id)}
                          className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
