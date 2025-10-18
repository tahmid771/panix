// Program.cs
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;

class Program {
    static async Task<int> Main() {
        string baseUrl = "https://panixauth-09.created.app";
        var apps = new List < (string Name, string AppId, string Secret)>
            {
            ("Aimsilent", "app_uv14r1df98o3u80s61c7e", "sec_d41imrypg8i6opuyd7gx"),
            ("Internal Max", "app_1h1x0sw1qmdry6k6b39dgl", "sec_7n8gwy4pnxy9ml6rcimz74"),
            ("Brutal", "app_2gv3linlnpa9zt2d8cor0v", "sec_tr3nyp7g7pjsc47t1nxy99"),
            ("Internal", "app_7ro8oh1b6wclc4lh4odjjo", "sec_un056qho4uzoqrhi7ocr")
    };

        Console.WriteLine("=== PanixAuth Key Creator ===");
    for(int i = 0; i <apps.Count; i++)
Console.WriteLine($"{i + 1}. {apps[i].Name}");
Console.Write("Choice (1-4): ");
if (!int.TryParse(Console.ReadLine(), out int choice) || choice < 1 || choice > apps.Count) {
    Console.WriteLine("Invalid choice.");
    return 1;
}

var app = apps[choice - 1];
Console.WriteLine($"\nSelected: {app.Name} (AppID: {app.AppId})");

Console.Write("Dashboard email: ");
        string email = Console.ReadLine();
Console.Write("Password: ");
        string password = ReadPassword();

Console.Write("\nEnter expiration days (leave blank for never): ");
        string daysStr = Console.ReadLine();
int ? expires_in = null;
if (int.TryParse(daysStr, out int di)) expires_in = di;

Console.Write("Enter custom key (leave blank for random): ");
        string customKey = Console.ReadLine();

Console.Write("Enable HWID binding? (y/n): ");
        bool hwid = Console.ReadLine().Trim().ToLower().StartsWith("y");

        using var client = new HttpClient();
client.BaseAddress = new Uri(baseUrl);

// --- LOGIN ---
var loginBody = new { email = email, password = password };
var loginResp = await client.PostAsync("/api/login", new StringContent(JsonConvert.SerializeObject(loginBody), Encoding.UTF8, "application/json"));
        string loginText = await loginResp.Content.ReadAsStringAsync();
if (!loginResp.IsSuccessStatusCode) {
    Console.WriteLine($"Login failed ({(int)loginResp.StatusCode}): {loginText}");
    return 1;
}

        string token = null;
try {
    var jo = JObject.Parse(loginText);
    token = jo["token"]?.ToString() ?? jo["access_token"]?.ToString();
}
catch { }

if (string.IsNullOrEmpty(token)) {
    Console.WriteLine("Login succeeded but no token returned.");
    return 1;
}

client.DefaultRequestHeaders.Add("Authorization", "Bearer " + token);

// --- CREATE KEY ---
var payload = new Dictionary < string, object>
    {
            { "application", app.AppId },
{ "hwid_enabled", hwid },
{ "type", string.IsNullOrEmpty(customKey) ? "random" : "custom" }
        };
if (!string.IsNullOrEmpty(customKey)) payload["custom_key"] = customKey;
if (expires_in.HasValue) payload["expires_in"] = expires_in.Value;

var createResp = await client.PostAsync("/api/keys/create", new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json"));
        string createText = await createResp.Content.ReadAsStringAsync();

if (!createResp.IsSuccessStatusCode) {
    Console.WriteLine($"❌ Failed to create key. Status: {(int)createResp.StatusCode}");
    Console.WriteLine($"Response saved to debug file: panix_debug_error_{DateTime.Now:yyyyMMdd_HHmmss}.json");
    System.IO.File.WriteAllText($"panix_debug_error_{DateTime.Now:yyyyMMdd_HHmmss}.json", createText);
    return 1;
}

        string createdKey = null;
try {
    var jo = JObject.Parse(createText);
    createdKey = jo["key"]?.ToString() ?? jo["token"]?.ToString();
}
catch { }

if (!string.IsNullOrEmpty(createdKey)) {
    Console.WriteLine($"\n✅ Key created: {createdKey}");
}
else {
    Console.WriteLine("Key created but could not parse key from response.");
}

return 0;
    }

    static string ReadPassword()
{
    var sb = new StringBuilder();
    while (true) {
        var key = Console.ReadKey(true);
        if (key.Key == ConsoleKey.Enter) break;
        if (key.Key == ConsoleKey.Backspace && sb.Length > 0) { sb.Length--; Console.Write("\b \b"); continue; }
        sb.Append(key.KeyChar);
        Console.Write("*");
    }
    Console.WriteLine();
    return sb.ToString();
}
}
