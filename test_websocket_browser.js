// Test WebSocket connection directly in browser console
// Copy and paste this into your browser's developer console

console.log("Starting WebSocket test...");

// Create WebSocket connection
const ws = new WebSocket('ws://localhost:8000/ws/socket-server/');

ws.onopen = function(event) {
    console.log('✅ WebSocket connected successfully!');
    
    // Send a test reply message
    const testMessage = {
        type: "post_reply", 
        message: "Test reply from browser console",
        post_id: 1
    };
    
    console.log('Sending test message:', testMessage);
    ws.send(JSON.stringify(testMessage));
};

ws.onmessage = function(event) {
    console.log('✅ Received WebSocket message:', event.data);
    try {
        const data = JSON.parse(event.data);
        console.log('Parsed message:', data);
    } catch (e) {
        console.log('Raw message:', event.data);
    }
};

ws.onclose = function(event) {
    console.log('WebSocket closed:', event.code, event.reason);
};

ws.onerror = function(error) {
    console.error('❌ WebSocket error:', error);
};

// Keep connection open for testing
setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
        console.log('WebSocket is still connected after 5 seconds');
    } else {
        console.log('WebSocket connection failed');
    }
}, 5000);
