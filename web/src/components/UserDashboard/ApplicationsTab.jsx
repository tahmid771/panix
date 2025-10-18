"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Copy, Layers } from "lucide-react";

export function ApplicationsTab({ user, setShowCreateApp }) {
  const queryClient = useQueryClient();

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ["user-applications"],
    queryFn: async () => {
      const response = await fetch(`/api/applications?userId=${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
  });

  const deleteAppMutation = useMutation({
    mutationFn: async (appId) => {
      const response = await fetch("/api/applications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, userId: user.id }),
      });
      if (!response.ok) throw new Error("Failed to delete application");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user-applications"]);
    },
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString) => {
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
          <h2 className="text-2xl font-bold">Applications</h2>
          <p className="text-gray-400 mt-1">
            Manage your application credentials
          </p>
        </div>
        <button
          onClick={() => setShowCreateApp(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Application</span>
        </button>
      </div>

      {appsLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading applications...</div>
        </div>
      ) : !appsData?.applications?.length ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No Applications
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first application to get started
          </p>
          <button
            onClick={() => setShowCreateApp(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Create Application
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {appsData.applications.map((app) => (
            <div key={app.id} className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Created: {formatDate(app.created_at)}
                  </p>
                  <p className="text-sm text-gray-400">Keys: {app.key_count}</p>
                </div>
                <button
                  onClick={() => deleteAppMutation.mutate(app.id)}
                  className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Application ID
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-3 bg-gray-800 rounded-lg text-blue-400 text-sm">
                      {app.app_id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(app.app_id)}
                      className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Secret Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-3 bg-gray-800 rounded-lg text-green-400 text-sm">
                      {app.app_secret}
                    </code>
                    <button
                      onClick={() => copyToClipboard(app.app_secret)}
                      className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
