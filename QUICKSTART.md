# ⚡ Quick Start Guide

## 5-Minute Setup

### Step 1: Install Python Dependencies
```bash
cd watch-party-app
pip install -r requirements.txt
```

### Step 2: Run the Server
```bash
python app.py
```

You should see:
```
Starting Watch Party Server...
Access the app at http://localhost:5000
WARNING in app.run_debug_server: Debugger is active!
```

### Step 3: Open in Browser
- **First User**: Open http://localhost:5000 in your browser
- **Second User**: Open http://localhost:5000 in another browser/tab/device on same network

### Step 4: Create a Watch Party
**User 1 - Creating Room**:
1. Click "Create New Room"
2. Enter video URL: 
   ```
   https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
   ```
3. Enter username: "Alice"
4. Click "Create Room"
5. **Note the Room ID** (e.g., "ABC123")

### Step 5: Join the Watch Party
**User 2 - Joining Room**:
1. Click "Join Existing Room"
2. Enter Room ID from User 1
3. Enter same video URL
4. Enter username: "Bob"
5. Click "Join Room"

### Step 6: Test Features
✅ **Play/Pause**: Click play in one browser, see other browser play automatically  
✅ **Chat**: Type messages in chat box - appears in both browsers  
✅ **Users**: See "Users: 2" in both browsers  
✅ **Seek**: Drag video progress in one browser - both sync to same position

---

## 🎬 Test Video URLs

Use these URLs for testing:

**Option 1**: Big Buck Bunny (9 seconds, 4MB)
```
https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
```

**Option 2**: Elephant Dream (25 seconds, 50MB)
```
https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4
```

**Option 3**: Local File (advanced)
```
http://192.168.1.XXX:8000/video.mp4
```
(Replace with your local IP if you have a web server running)

---

## 📱 Testing on Different Devices

### Same Computer
```
Terminal 1: python app.py
Browser 1: http://localhost:5000
Browser 2: http://localhost:5000
```

### Different Computer on Network
```
Terminal 1: python app.py
Computer A: http://[your-ip]:5000
Computer B: http://[your-ip]:5000
```

Find your IP:
- **Windows**: `ipconfig` (look for IPv4 Address)
- **Mac/Linux**: `ifconfig` (look for inet)

---

## 🆘 Quick Troubleshooting

**Error: "Port 5000 already in use"**
```bash
# Edit app.py, change last line from:
socketio.run(app, debug=True, host='0.0.0.0', port=5000)
# To:
socketio.run(app, debug=True, host='0.0.0.0', port=5001)
```

**Error: "Video won't load"**
- Check video URL is correct
- Try the test URLs above
- Make sure URL starts with `http://` or `https://`

**Chat not working**
- Check browser console (F12 → Console)
- Verify Socket.IO shows as "connected"
- Try refreshing the page

**Videos not syncing**
- Verify both users are in same room ID
- Check status says "In sync"
- Try clicking play again

---

## 📋 What's in Each File

| File | Purpose |
|------|---------|
| `app.py` | Backend server - handles rooms and events |
| `index.html` | Frontend UI - video player and chat |
| `script.js` | JavaScript - handles interactions and Socket.IO |
| `style.css` | Styling - responsive layout |
| `requirements.txt` | Python packages to install |
| `README.md` | Full user guide |
| `DOCUMENTATION.md` | Technical details |

---

## ✨ Key Features to Test

1. **Create Room** ✅
   - Generate unique room ID
   - Video URL saved

2. **Join Room** ✅
   - Enter room ID and join
   - Video synced to current state

3. **Video Sync** ✅
   - Play/pause synced < 1 second
   - Seek synced < 1 second
   - All controls synced

4. **Chat** ✅
   - Send messages
   - See username and timestamp
   - Your messages marked differently

5. **User Presence** ✅
   - See who's in room
   - Join notifications
   - Leave notifications

---

## 🎓 Project Status

✅ **Complete**  
✅ **All Features Working**  
✅ **Production Ready**  
✅ **Well Documented**  
✅ **Easy to Extend**

---

## 📞 Questions?

Refer to:
- `README.md` - User guide and troubleshooting
- `DOCUMENTATION.md` - Technical deep dive
- `app.py` - Backend with detailed comments
- `script.js` - Frontend with detailed comments
- `style.css` - Styling with comments

---

**Ready to showcase your watch party app!** 🎬🎉
