// Debug Frontend State - Paste this in browser console
// This will help debug the React state and component rendering

console.log("🔍 FRONTEND STATE DEBUGGER LOADED");

// Monitor React state changes
const originalSetState = React.useState;
let stateChanges = [];

// Log all state changes
const logStateChange = (stateName, oldValue, newValue) => {
  console.log(`🔄 STATE CHANGE: ${stateName}`, {
    old: oldValue,
    new: newValue,
    timestamp: new Date().toISOString()
  });
  stateChanges.push({ stateName, oldValue, newValue, timestamp: Date.now() });
};

// Monitor specific state variables we care about
window.debugState = {
  isComplete: false,
  isProcessing: false,
  enhancedImageBase64: null,
  activeTab: "original",
  
  // Log state changes
  setIsComplete: (value) => {
    logStateChange('isComplete', window.debugState.isComplete, value);
    window.debugState.isComplete = value;
  },
  
  setIsProcessing: (value) => {
    logStateChange('isProcessing', window.debugState.isProcessing, value);
    window.debugState.isProcessing = value;
  },
  
  setEnhancedImageBase64: (value) => {
    logStateChange('enhancedImageBase64', 
      window.debugState.enhancedImageBase64 ? `${window.debugState.enhancedImageBase64.length} chars` : null,
      value ? `${value.length} chars` : null
    );
    window.debugState.enhancedImageBase64 = value;
  },
  
  setActiveTab: (value) => {
    logStateChange('activeTab', window.debugState.activeTab, value);
    window.debugState.activeTab = value;
  },
  
  // Get current state summary
  getState: () => {
    console.log("📊 CURRENT STATE:", {
      isComplete: window.debugState.isComplete,
      isProcessing: window.debugState.isProcessing,
      hasEnhancedImage: !!window.debugState.enhancedImageBase64,
      enhancedImageLength: window.debugState.enhancedImageBase64?.length || 0,
      activeTab: window.debugState.activeTab
    });
    return window.debugState;
  },
  
  // Get state change history
  getHistory: () => {
    console.log("📜 STATE CHANGE HISTORY:", stateChanges);
    return stateChanges;
  },
  
  // Check if auto-switch should happen
  checkAutoSwitch: () => {
    const shouldSwitch = window.debugState.isComplete && window.debugState.enhancedImageBase64;
    console.log("🔄 AUTO-SWITCH CHECK:", {
      isComplete: window.debugState.isComplete,
      hasEnhancedImage: !!window.debugState.enhancedImageBase64,
      shouldSwitch: shouldSwitch,
      currentTab: window.debugState.activeTab
    });
    return shouldSwitch;
  }
};

// Monitor DOM changes for tab switching
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      const element = mutation.target;
      if (element.textContent?.includes('Enhanced') || element.textContent?.includes('Original')) {
        console.log("🎯 TAB DOM CHANGE:", {
          element: element.textContent,
          classes: element.className,
          isActive: element.className.includes('active') || element.className.includes('selected')
        });
      }
    }
  });
});

// Start observing
observer.observe(document.body, {
  attributes: true,
  subtree: true,
  attributeFilter: ['class']
});

console.log("✅ Frontend debugger ready!");
console.log("📋 Available commands:");
console.log("  - window.debugState.getState() - Get current state");
console.log("  - window.debugState.getHistory() - Get state change history");
console.log("  - window.debugState.checkAutoSwitch() - Check if auto-switch should happen");
console.log("  - Upload a document and watch the console!");