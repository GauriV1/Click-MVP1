#!/bin/bash

# Function to kill process on a port
kill_port() {
    local port=$1
    echo "Checking port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || echo "No process found on port $port"
}

# Kill processes on our ports
kill_port 3000
kill_port 3006
kill_port 5000

echo "Ports cleared. You can now start your servers." 