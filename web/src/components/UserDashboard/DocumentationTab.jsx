"use client";

import {
  Key,
  Settings,
  Download,
  Shield,
  Clock,
} from "lucide-react";

export function DocumentationTab() {
  const downloadPanixAuth = () => {
    const code = `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Newtonsoft.Json;
using System.Management;

public class PanixAuth
{
    private readonly string _appId;
    private readonly string _appSecret;
    private readonly string _baseUrl = "YOUR_PANIXAUTH_URL"; // Replace with your PanixAuth URL
    private readonly HttpClient _httpClient;

    public PanixAuth(string appId, string appSecret)
    {
        _appId = appId;
        _appSecret = appSecret;
        _httpClient = new HttpClient();
    }

    public async Task<bool> ValidateKeyAsync(string key)
    {
        try
        {
            var hwid = GetHWID();
            var payload = new
            {
                appId = _appId,
                appSecret = _appSecret,
                key = key,
                hwid = hwid
            };

            var json = JsonConvert.SerializeObject(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_baseUrl}/api/validate", content);
            var responseText = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<dynamic>(responseText);

            return result.success == true;
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Validation error: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return false;
        }
    }

    private string GetHWID()
    {
        try
        {
            string hwid = "";
            ManagementObjectSearcher searcher = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystemProduct");
            
            foreach (ManagementObject obj in searcher.Get())
            {
                hwid = obj["UUID"].ToString();
                break;
            }
            
            return hwid;
        }
        catch
        {
            return Environment.MachineName + Environment.UserName;
        }
    }

    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}

// Usage Example:
/*
public partial class Form1 : Form
{
    private PanixAuth auth;

    public Form1()
    {
        InitializeComponent();
        auth = new PanixAuth("your_app_id", "your_app_secret");
    }

    private async void btnValidate_Click(object sender, EventArgs e)
    {
        string userKey = txtKey.Text;
        bool isValid = await auth.ValidateKeyAsync(userKey);
        
        if (isValid)
        {
            MessageBox.Show("Key is valid! Access granted.", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
            // Continue with your application logic
        }
        else
        {
            MessageBox.Show("Invalid key! Access denied.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            Application.Exit();
        }
    }

    protected override void OnFormClosed(FormClosedEventArgs e)
    {
        auth?.Dispose();
        base.OnFormClosed(e);
    }
}
*/`;

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PanixAuth.cs";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Documentation</h2>
        <p className="text-gray-400 mt-1">
          Learn how to integrate PanixAuth with your C# WinForms application
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Download PanixAuth Library
          </h3>
          <p className="text-gray-300 mb-4">
            Download the PanixAuth.cs file to integrate authentication into your
            C# WinForms application.
          </p>
          <button
            onClick={downloadPanixAuth}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PanixAuth.cs</span>
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Integration Guide
          </h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-blue-400 mb-2">
                Step 1: Install Required NuGet Packages
              </h4>
              <div className="bg-gray-800 rounded-lg p-4">
                <code className="text-green-400 text-sm">
                  Install-Package Newtonsoft.Json
                  <br />
                  Install-Package System.Management
                </code>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-blue-400 mb-2">
                Step 2: Add PanixAuth.cs to Your Project
              </h4>
              <p className="text-gray-300 mb-2">
                Download the PanixAuth.cs file using the button above and add it
                to your project.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-blue-400 mb-2">
                Step 3: Initialize PanixAuth
              </h4>
              <div className="bg-gray-800 rounded-lg p-4">
                <code className="text-yellow-400 text-sm">
                  {`// In your form constructor or Load event
private PanixAuth auth;

public Form1()
{
    InitializeComponent();
    auth = new PanixAuth("your_app_id", "your_app_secret");
}`}
                </code>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-blue-400 mb-2">
                Step 4: Validate User Keys
              </h4>
              <div className="bg-gray-800 rounded-lg p-4">
                <code className="text-yellow-400 text-sm">
                  {`private async void btnLogin_Click(object sender, EventArgs e)
{
    string userKey = txtKey.Text;
    bool isValid = await auth.ValidateKeyAsync(userKey);
    
    if (isValid)
    {
        MessageBox.Show("Access granted!");
        // Continue with your application
    }
    else
    {
        MessageBox.Show("Invalid key!");
        Application.Exit();
    }
}`}
                </code>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-blue-400 mb-2">
                Step 5: Clean Up Resources
              </h4>
              <div className="bg-gray-800 rounded-lg p-4">
                <code className="text-yellow-400 text-sm">
                  {`protected override void OnFormClosed(FormClosedEventArgs e)
{
    auth?.Dispose();
    base.OnFormClosed(e);
}`}
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Features</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <h4 className="font-medium text-white">HWID Protection</h4>
                <p className="text-sm text-gray-400">
                  Hardware-based key binding for enhanced security
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Key className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <h4 className="font-medium text-white">Unlimited Keys</h4>
                <p className="text-sm text-gray-400">
                  Generate as many keys as you need
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <h4 className="font-medium text-white">Expiration Control</h4>
                <p className="text-sm text-gray-400">
                  Set custom expiration dates for keys
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Settings className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="font-medium text-white">Easy Integration</h4>
                <p className="text-sm text-gray-400">
                  Simple API with comprehensive documentation
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Need Help?</h3>
          <p className="text-gray-300 mb-4">
            If you encounter any issues during integration, please check the
            following:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Ensure your Application ID and Secret are correct</li>
            <li>Check that your application has active keys generated</li>
            <li>Verify your internet connection for key validation</li>
            <li>Make sure required NuGet packages are installed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
