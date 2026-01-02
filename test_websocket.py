#!/usr/bin/env python3
"""
Simple WebSocket test to debug connection issues
"""
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/socket-server/"
    try:
        print(f"Connecting to {uri}...")
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Test sending a message
            test_message = {
                "type": "post_reply",
                "message": "Test message from Python script",
                "post_id": 1
            }
            
            print("Sending test message...")
            await websocket.send(json.dumps(test_message))
            print("✅ Message sent!")
            
            # Wait for response
            print("Waiting for response...")
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                print(f"✅ Received response: {response}")
            except asyncio.TimeoutError:
                print("⚠️  No response received within 10 seconds")
                
    except ConnectionRefusedError:
        print("❌ Connection refused - Django server not running or WebSocket not configured")
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")

if __name__ == "__main__":
    print("Testing WebSocket connection...")
    asyncio.run(test_websocket())
