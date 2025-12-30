// Enhanced Image Debug - Paste this in browser console
// This will intercept and log the completion data to see what's happening

console.log("🔍 ENHANCED IMAGE DEBUGGER LOADED");

// Override fetch to intercept the API response
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;
  
  if (url.includes('/resurrect/stream')) {
    console.log("🚀 INTERCEPTING API CALL:", url);
    
    return originalFetch.apply(this, args).then(response => {
      console.log("📡 API Response received:", response.status);
      
      // Clone the response so we can read it
      const clonedResponse = response.clone();
      
      // Create a new response that logs the stream data
      const readable = new ReadableStream({
        start(controller) {
          const reader = clonedResponse.body.getReader();
          
          function pump() {
            return reader.read().then(({ done, value }) => {
              if (done) {
                console.log("📡 Stream ended");
                controller.close();
                return;
              }
              
              // Convert chunk to text and log it
              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    
                    if (data.type === 'complete') {
                      console.log("🎯 COMPLETION DATA INTERCEPTED:");
                      console.log("📊 Full completion object:", data);
                      
                      const result = data.result || {};
                      console.log("📊 Result object:", result);
                      
                      if (result.enhanced_image_base64) {
                        console.log("✅ Enhanced image found in result!");
                        console.log("📏 Enhanced image length:", result.enhanced_image_base64.length);
                        console.log("🔤 Enhanced image preview:", result.enhanced_image_base64.substring(0, 100) + "...");
                        
                        // Check if it's valid base64
                        try {
                          atob(result.enhanced_image_base64.substring(0, 100));
                          console.log("✅ Enhanced image appears to be valid base64");
                        } catch (e) {
                          console.log("❌ Enhanced image is NOT valid base64:", e);
                        }
                      } else {
                        console.log("❌ NO enhanced_image_base64 in result!");
                        console.log("📋 Available result fields:", Object.keys(result));
                      }
                    }
                  } catch (e) {
                    // Not JSON, ignore
                  }
                }
              }
              
              controller.enqueue(value);
              return pump();
            });
          }
          
          return pump();
        }
      });
      
      return new Response(readable, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    });
  }
  
  return originalFetch.apply(this, args);
};

// Also monitor React state changes for enhanced image
let originalSetState = null;

// Monitor the specific setEnhancedImageBase64 calls
window.debugEnhancedImage = {
  calls: [],
  
  logCall: function(value, source) {
    const call = {
      timestamp: new Date().toISOString(),
      source: source,
      hasValue: !!value,
      length: value ? value.length : 0,
      preview: value ? value.substring(0, 50) + "..." : null
    };
    
    this.calls.push(call);
    console.log("🖼️ setEnhancedImageBase64 called:", call);
  },
  
  getCalls: function() {
    console.log("📜 Enhanced image state calls:", this.calls);
    return this.calls;
  },
  
  checkCurrentState: function() {
    // Try to find the enhanced image in the DOM
    const enhancedTab = document.querySelector('[value="enhanced"]');
    const isDisabled = enhancedTab ? enhancedTab.hasAttribute('disabled') : true;
    
    console.log("🔍 Current enhanced tab state:", {
      tabExists: !!enhancedTab,
      isDisabled: isDisabled,
      tabElement: enhancedTab
    });
    
    // Look for enhanced images in the DOM
    const enhancedImages = document.querySelectorAll('img[src*="data:image/png;base64"]');
    console.log("🖼️ Enhanced images in DOM:", enhancedImages.length);
    
    enhancedImages.forEach((img, i) => {
      console.log(`  Image ${i + 1}:`, {
        src: img.src.substring(0, 100) + "...",
        visible: img.offsetParent !== null
      });
    });
  }
};

console.log("✅ Enhanced image debugger ready!");
console.log("📋 Available commands:");
console.log("  - window.debugEnhancedImage.getCalls() - See all setEnhancedImageBase64 calls");
console.log("  - window.debugEnhancedImage.checkCurrentState() - Check current DOM state");
console.log("  - Upload a document and watch the console!");