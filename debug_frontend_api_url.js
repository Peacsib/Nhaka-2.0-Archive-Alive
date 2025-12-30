// Debug Frontend API URL - Paste this in browser console
// This will show what API URL the frontend is actually using

console.log("🔍 FRONTEND API URL DEBUGGER");
console.log("=" * 40);

// Check environment variables
console.log("📋 Environment Variables:");
console.log("  VITE_API_URL:", import.meta?.env?.VITE_API_URL || "NOT SET");
console.log("  NODE_ENV:", import.meta?.env?.NODE_ENV || "NOT SET");
console.log("  MODE:", import.meta?.env?.MODE || "NOT SET");

// Check what the ProcessingSection is using
const apiUrl = import.meta?.env?.VITE_API_URL || "https://nhaka-2-0-archive-alive.onrender.com";
console.log("🎯 Actual API URL being used:", apiUrl);
console.log("🔗 Full endpoint:", `${apiUrl}/resurrect/stream`);

// Test if we can reach the API
console.log("\n🧪 Testing API connectivity...");
fetch(`${apiUrl}/`)
  .then(response => {
    console.log("✅ API reachable:", response.status, response.statusText);
    return response.json();
  })
  .then(data => {
    console.log("📊 API Info:", data);
  })
  .catch(error => {
    console.log("❌ API not reachable:", error.message);
  });

// Monitor fetch calls to see what's actually being called
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && url.includes('resurrect')) {
    console.log("🚀 FETCH INTERCEPTED:", url);
    console.log("📤 Request details:", args);
  }
  return originalFetch.apply(this, args);
};

console.log("✅ API URL debugger ready!");
console.log("📋 Now upload a document and watch the console!");