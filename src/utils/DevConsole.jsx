// Debug logger for development environment
export const debugLog = (component, action, data = null) => {
  if (import.meta.env.DEV) {
    const timestamp = new Date().toISOString();
    const message = `[${component}:${action}]`;
    
    if (data instanceof Error) {
      console.error(message, data);
    } else if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

// Initialize DevConsole
if (import.meta.env.DEV) {
  console.log('DevConsole initialized');
} 