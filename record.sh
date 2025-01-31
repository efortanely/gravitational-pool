#!/bin/bash

# record.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="recordings"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg not found. Installing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y ffmpeg
    elif command -v yum &> /dev/null; then
        sudo yum install -y ffmpeg
    elif command -v brew &> /dev/null; then
        brew install ffmpeg
    else
        echo "Could not install ffmpeg. Please install it manually."
        exit 1
    fi
fi

# Check and set DISPLAY variable
if [ -z "$DISPLAY" ]; then
    # Try to detect display
    if [ -n "$(ps aux | grep Xorg | grep -v grep)" ]; then
        export DISPLAY=:0
    elif [ -n "$(ps aux | grep XQuartz | grep -v grep)" ]; then
        export DISPLAY=:0
    elif grep -q Microsoft /proc/version; then
        # WSL2 specific
        export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0
    else
        echo "Could not detect display. Please set DISPLAY manually."
        echo "Example: export DISPLAY=:0"
        exit 1
    fi
fi

# Test X11 connection
if ! xdpyinfo &>/dev/null; then
    echo "Cannot connect to X server"
    echo "If using WSL2, make sure an X server (like VcXsrv) is running on Windows"
    echo "If using SSH, make sure X11 forwarding is enabled (-X flag)"
    echo "Current DISPLAY=$DISPLAY"
    exit 1
fi

# Create recordings directory if it doesn't exist
mkdir -p $OUTPUT_DIR

# Start recording
echo "Starting screen recording... Press Ctrl+C to stop"
echo "Recording to $OUTPUT_DIR/demo_$TIMESTAMP.mp4"
echo "Using DISPLAY=$DISPLAY"

ffmpeg -f x11grab \
       -video_size 1920x1080 \
       -framerate 30 \
       -i $DISPLAY \
       -draw_mouse 0 \
       -c:v libx264 \
       -preset ultrafast \
       "$OUTPUT_DIR/demo_$TIMESTAMP.mp4"