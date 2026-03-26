# 🧪 Testing Checklist & Verification Guide

## Pre-Launch Checklist

Before demo or submission, verify all items below.

---

## ✅ Installation Verification

### Step 1: Dependencies Installed
```bash
pip list | grep -i "flask\|socketio"
```

Expected output:
```
Flask           3.0.0
Flask-SocketIO  5.3.5
python-engineio 4.8.0
python-socketio 5.10.0
```

**Check**: ☐ All packages installed

### Step 2: Server Starts
```bash
python app.py
```

Expected output:
```
Starting Watch Party Server...
Access the app at http://localhost:5000
WARNING in app.run_debug_server: Debugger is active!
```

**Check**: ☐ Server starts without errors

### Step 3: Browser Loads
Open http://localhost:5000

Expected:
- ✅ Page loads without errors
- ✅ Modal visible with "Create" and "Join" options
- ✅ No console errors (F12 → Console)

**Check**: ☐ Page loads correctly

---

## ✅ Feature Testing

### Test 1: Room Creation

**Setup**:
- One browser window open
- Server running

**Steps**:
1. Enter video URL: `https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4`
2. Enter username: `Test1`
3. Click "Create Room"

**Verify**:
- ☐ Modal disappears
- ☐ Watch party interface appears
- ☐ Room ID displayed (6 uppercase characters)
- ☐ Video player visible
- ☐ Chat panel on right
- ☐ User count shows "1"
- ☐ User list shows "Test1"
- ☐ Status shows "Ready" or "In sync"

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 2: Room Joining

**Setup**:
- Room created from Test 1
- Note the room ID (e.g., "ABC123")
- Open new browser window

**Steps**:
1. In new browser, go to http://localhost:5000
2. Click "Join Existing Room"
3. Enter Room ID from Test 1
4. Enter video URL: (same as Test 1)
5. Enter username: `Test2`
6. Click "Join Room"

**Verify**:
- ☐ New user interface appears
- ☐ Same room ID displayed
- ☐ User count shows "2"
- ☐ User list shows both "Test1" and "Test2"
- ☐ Video player synced to current position

**In Original Browser**:
- ☐ Notification appears: "Test2 joined the party"
- ☐ User count updated to "2"
- ☐ User list shows "Test2"

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 3: Play Synchronization

**Setup**:
- Both browsers in same room (from Test 2)
- Videos paused at beginning

**Steps**:
1. In Browser 1, click play button
2. Watch Browser 2 for 2 seconds

**Verify Browser 1**:
- ☐ Video starts playing
- ☐ Status shows "Playing..."

**Verify Browser 2**:
- ☐ Video starts playing automatically within 1 second
- ☐ Both videos playing at roughly same timestamp
- ☐ Status shows sync notification

**Timing Check**:
- ☐ Sync happens within 500ms
- ☐ No visible delay between browsers

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 4: Pause Synchronization

**Setup**:
- Both browsers playing video

**Steps**:
1. In Browser 1, click pause button
2. Watch Browser 2 for 1 second

**Verify Browser 1**:
- ☐ Video pauses
- ☐ Status shows "Paused"

**Verify Browser 2**:
- ☐ Video pauses automatically within 500ms
- ☐ Both videos paused at similar timestamp
- ☐ Status shows sync notification

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 5: Seek Synchronization

**Setup**:
- Both browsers in same room

**Steps**:
1. In Browser 1, drag video progress bar to 3-second mark
2. Watch Browser 2 for 1 second

**Verify Browser 1**:
- ☐ Video jumps to position
- ☐ Status shows sync notification

**Verify Browser 2**:
- ☐ Video jumps to similar position automatically
- ☐ Both at same timestamp (within 1 second)
- ☐ Status shows sync notification

**Check Precise Sync**:
- ☐ Browser 1 shows 3.00s, Browser 2 shows 3.00-3.05s ✓
- ☐ Not more than 1 second difference

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 6: Chat Messaging

**Setup**:
- Both browsers in same room

**Steps**:
1. In Browser 1, click chat input box
2. Type: "Hello from Browser 1"
3. Press Enter
4. Watch both browsers

**Verify Browser 1**:
- ☐ Message appears in chat
- ☐ Message shows as "own" (different styling)
- ☐ Shows username: "Test1"
- ☐ Shows timestamp (HH:MM:SS format)
- ☐ Input field clears

**Verify Browser 2**:
- ☐ Same message appears within 500ms
- ☐ Shows sender username: "Test1"
- ☐ Shows timestamp
- ☐ Message NOT highlighted as "own"

**Repeat from Browser 2**:
1. Type: "Hello from Browser 2"
2. Press Enter
3. Verify appears in both browsers

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 7: User Join Notification

**Setup**:
- One room with one user (Test1)
- Second browser ready

**Steps**:
1. Keep Browser 1 open
2. In new Browser 2, join same room as Test2

**Verify Browser 1**:
- ☐ Notification appears: "Test2 joined the party!"
- ☐ User count changes: 1 → 2
- ☐ User list updated with "Test2"
- ☐ Status badge shows notification

**Verify Browser 2**:
- ☐ Video already at current position (synced)
- ☐ Chat history visible
- ☐ Shows correct user count

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 8: User Leave Notification

**Setup**:
- Both browsers in same room with Test1 and Test2

**Steps**:
1. In Browser 2, click "Leave Room" button

**Verify Browser 2**:
- ☐ Returns to room setup modal
- ☐ Input fields cleared
- ☐ Chat cleared

**Verify Browser 1**:
- ☐ Notification appears: "Test2 left the party"
- ☐ User count changes: 2 → 1
- ☐ User list shows only "Test1"

**Edge Case - Room Cleanup**:
- ☐ If Browser 1 also leaves, room should be deleted
- ☐ New user joining same room ID should see "Room does not exist"

**Pass/Fail**: ☐ Pass ☐ Fail

---

## ✅ UI/UX Testing

### Test 9: Responsive Design

**Mobile Test** (Chrome DevTools):
1. Press F12 → Toggle Device Toolbar
2. Select "iPhone 12" or "Pixel 5"
3. Test all features

**Verify**:
- ☐ Modal fits screen without scroll
- ☐ Video player responsive
- ☐ Chat panel stacks below video
- ☐ Buttons clickable (not too small)
- ☐ Text readable
- ☐ No horizontal scroll

**Tablet Test**:
- ☐ Two-column layout on larger screens
- ☐ Single column on smaller screens

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 10: Form Validation

**Test Missing Fields**:

**Room Creation - Empty Video URL**:
1. Leave video URL blank
2. Enter username
3. Click "Create Room"
- ☐ Error message shows: "Please enter both video URL and username"
- ☐ Room not created

**Room Join - Missing Room ID**:
1. Leave room ID blank
2. Enter video URL
3. Enter username
4. Click "Join Room"
- ☐ Error message shows: "Please enter room ID, video URL, and username"
- ☐ Room join fails

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 11: Visual Feedback

**Status Messages**:
- ☐ "Ready" shown at startup
- ☐ "Playing..." shown when video plays
- ☐ "Paused" shown when video paused
- ☐ "Seeking..." shown during seek

**User Notifications**:
- ☐ Join notification appears and is readable
- ☐ Leave notification appears and is readable
- ☐ Chat messages clearly visible

**Visual Design**:
- ☐ Colors are pleasant
- ☐ Layout is clean
- ☐ No broken elements
- ☐ Animations smooth

**Pass/Fail**: ☐ Pass ☐ Fail

---

## ✅ Edge Cases & Error Handling

### Test 12: Invalid Room ID

**Steps**:
1. Click "Join Existing Room"
2. Enter Room ID: "INVALID"
3. Enter video URL
4. Enter username
5. Click "Join Room"

**Expected**:
- ☐ Page either creates new room or shows error
- ☐ No server crash
- ☐ No console errors

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 13: Invalid Video URL

**Steps**:
1. Enter video URL: "not-a-valid-url"
2. Enter username
3. Create room

**Expected**:
- ☐ Room created (URL stored as-is)
- ☐ Video player shows error when trying to load
- ☐ No chat or sync affected

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 14: Disconnect Handling

**Steps**:
1. Open two browsers in same room
2. In Browser 2, close the tab/window
3. Wait 30 seconds
4. Watch Browser 1

**Expected**:
- ☐ After 30 seconds, Browser 1 shows "User2 left"
- ☐ User count decreases
- ☐ No error messages
- ☐ Browser 1 still functional

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 15: Multiple Sequential Rooms

**Steps**:
1. Create Room A with Browser 1
2. Create Room B with Browser 2
3. Verify isolation:
   - Sync video in Room A
   - Check Room B is unaffected
   - Chat in Room A doesn't appear in Room B

**Expected**:
- ☐ Rooms are isolated
- ☐ No cross-room communication
- ☐ Each room has independent state

**Pass/Fail**: ☐ Pass ☐ Fail

---

## ✅ Performance Testing

### Test 16: Sync Latency

**Measurement Setup**:
- Open browser dev tools (F12)
- Go to Network tab
- Filter by "socket.io"

**Steps**:
1. Click play in Browser 1
2. Note time Browser 2 starts playing
3. Check network request timing

**Expected**:
- ☐ Sync within 100-500ms typically
- ☐ Never more than 1 second
- ☐ No lag in UI
- ☐ Smooth video playback

**Pass/Fail**: ☐ Pass ☐ Fail

---

### Test 17: Chat Performance

**Steps**:
1. Send 10 messages rapidly
2. Verify all appear in both browsers

**Expected**:
- ☐ All messages arrive
- ☐ Appear within 500ms
- ☐ No messages lost
- ☐ Correct order

**Pass/Fail**: ☐ Pass ☐ Fail

---

## ✅ Browser Compatibility

### Test 18: Browser Testing

Test on different browsers (if available):

**Chrome/Edge**:
- ☐ Full functionality works
- ☐ No console errors

**Firefox**:
- ☐ Full functionality works
- ☐ No console errors

**Safari** (if available):
- ☐ Full functionality works
- ☐ No console errors

**Mobile Browser**:
- ☐ Responsive layout works
- ☐ Touch controls work
- ☐ Chat input works

**Pass/Fail**: ☐ Pass ☐ Fail

---

## 📊 Final Results

### Summary Checklist
- ☐ Test 1: Room Creation - PASS
- ☐ Test 2: Room Joining - PASS
- ☐ Test 3: Play Sync - PASS
- ☐ Test 4: Pause Sync - PASS
- ☐ Test 5: Seek Sync - PASS
- ☐ Test 6: Chat - PASS
- ☐ Test 7: Join Notification - PASS
- ☐ Test 8: Leave Notification - PASS
- ☐ Test 9: Responsive Design - PASS
- ☐ Test 10: Form Validation - PASS
- ☐ Test 11: Visual Feedback - PASS
- ☐ Test 12: Invalid Room ID - PASS
- ☐ Test 13: Invalid Video URL - PASS
- ☐ Test 14: Disconnect Handling - PASS
- ☐ Test 15: Multiple Rooms - PASS
- ☐ Test 16: Sync Latency - PASS
- ☐ Test 17: Chat Performance - PASS
- ☐ Test 18: Browser Compatibility - PASS

### Overall Status

**Total Tests Passed**: ___ / 18

**Overall Result**:
- ☐ Ready for Submission (14+ tests passed)
- ☐ Needs Fixes (under 14 tests passed)

---

## 🐛 Issue Tracker

If any test fails, document here:

### Issue #1
- **Test**: _______________
- **Problem**: _______________
- **Solution**: _______________
- **Status**: ☐ Fixed ☐ Pending

### Issue #2
- **Test**: _______________
- **Problem**: _______________
- **Solution**: _______________
- **Status**: ☐ Fixed ☐ Pending

---

## ✅ Sign-Off

**Tested By**: _________________  
**Date**: _________________  
**Status**: ☐ Ready for Demo ☐ Ready for Submission  

**Notes**:
```
_________________________________________
_________________________________________
_________________________________________
```

---

## 📞 Quick Reference

- **Server logs**: Check terminal running `python app.py`
- **Browser console**: F12 → Console tab
- **Network issues**: F12 → Network tab → Filter "socket.io"
- **Test video URL**: https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
- **Clear cache**: Ctrl+Shift+Delete or Cmd+Shift+Delete

---

**All tests passing? You're ready for demo!** 🎉
