"""
Watch Party Application Backend
================================
A simple Flask-SocketIO application for real-time synchronized video watching.

Key Components:
- Room Management: Create and manage watch party rooms
- Event Handling: Real-time sync for play, pause, seek, and chat
- State Management: Track video state and user presence in each room
"""

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime
import os
import uuid
import json

# Initialize Flask app and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'costream-secret-123'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# ==============================================================================
# DATA STRUCTURE: In-Memory Room Storage
# ==============================================================================
# Format: {
#     "room_id": {
#         "users": [{"sid": "...", "username": "..."}, ...],
#         "video_state": {
#             "is_playing": False,
#             "current_time": 0,
#             "video_url": "https://..."
#         }
#     }
# }
rooms = {}


# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

def generate_room_id():
    """Generate a unique 6-character room ID"""
    return str(uuid.uuid4())[:6].upper()


def get_room(room_id):
    """Safely retrieve room data"""
    return rooms.get(room_id)


def create_room(room_id, video_url):
    """Create a new watch party room"""
    rooms[room_id] = {
        "users": [],
        "video_state": {
            "is_playing": False,
            "current_time": 0,
            "video_url": video_url
        },
        "created_at": datetime.now().isoformat()
    }
    return rooms[room_id]


def add_user_to_room(room_id, sid, username, is_host=False):
    """Add a user to a room"""
    room = get_room(room_id)
    if room:
        room["users"].append({
            "sid": sid,
            "username": username,
            "is_host": is_host,
            "joined_at": datetime.now().isoformat()
        })
        return True
    return False


def remove_user_from_room(room_id, sid):
    """Remove a user from a room"""
    room = get_room(room_id)
    if room:
        room["users"] = [u for u in room["users"] if u["sid"] != sid]
        # Delete room if empty
        if not room["users"]:
            del rooms[room_id]
        return True
    return False


def get_room_users(room_id):
    """Get list of users in a room"""
    room = get_room(room_id)
    if room:
        return [u["username"] for u in room["users"]]
    return []


# ==============================================================================
# ROUTES
# ==============================================================================

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/room')
def room_page():
    return render_template('index.html')


@app.route('/api/create-room', methods=['POST'])
def api_create_room():
    """API endpoint to create a new room"""
    data = request.json
    video_url = data.get('video_url', '')
    
    if not video_url:
        return jsonify({'error': 'Video URL required'}), 400
    
    room_id = generate_room_id()
    create_room(room_id, video_url)
    
    return jsonify({
        'room_id': room_id,
        'message': 'Room created successfully'
    }), 201


# ==============================================================================
# SOCKETIO EVENTS
# ==============================================================================

@socketio.on('join_room')
def on_join_room(data):
    """
    Event: User joins a watch party room
    Expected data: {
        'room_id': 'ABC123',
        'username': 'John Doe',
        'video_url': 'https://...' (only required for host creating room)
    }
    """
    room_id = data.get('room_id')
    username = data.get('username', 'Anonymous')
    video_url = data.get('video_url', '')
    
    # Check if room exists
    is_host = False
    if not get_room(room_id):
        if not video_url:
            emit('error', {'message': 'Room does not exist. Please ask the host for a valid room ID.'})
            return
        # Creating new room - this user is the host
        create_room(room_id, video_url)
        is_host = True
    
    # Add user to room
    add_user_to_room(room_id, request.sid, username, is_host)
    
    # Add socket to SocketIO room
    join_room(room_id)
    
    # Get current room state
    room = get_room(room_id)
    users = get_room_users(room_id)
    
    # Notify all users in room
    emit('user_joined', {
        'username': username,
        'users_count': len(users),
        'all_users': users
    }, room=room_id)
    
    # Send current video state to the new user
    emit('sync_video_state', room['video_state'])
    
    print(f"[JOIN] {username} joined room {room_id} (SID: {request.sid})")


@socketio.on('leave_room')
def on_leave_room(data):
    """
    Event: User leaves a watch party room
    Expected data: {
        'room_id': 'ABC123',
        'username': 'John Doe'
    }
    """
    room_id = data.get('room_id')
    username = data.get('username', 'Anonymous')
    
    # Remove user from room
    remove_user_from_room(room_id, request.sid)
    leave_room(room_id)
    
    # Notify remaining users if room still exists
    if get_room(room_id):
        users = get_room_users(room_id)
        emit('user_left', {
            'username': username,
            'users_count': len(users),
            'all_users': users
        }, room=room_id)
    
    print(f"[LEAVE] {username} left room {room_id} (SID: {request.sid})")


@socketio.on('play')
def on_play(data):
    """
    Event: A user clicks play - synchronize to all users
    Expected data: {
        'room_id': 'ABC123',
        'current_time': 0
    }
    """
    room_id = data.get('room_id')
    current_time = data.get('current_time', 0)
    
    room = get_room(room_id)
    if room:
        room['video_state']['is_playing'] = True
        room['video_state']['current_time'] = current_time
        
        # Broadcast play event to all users in room except sender
        emit('play', {
            'current_time': current_time
        }, room=room_id, include_self=False)
        
        print(f"[PLAY] Room {room_id} - Time: {current_time}s")


@socketio.on('pause')
def on_pause(data):
    """
    Event: A user clicks pause - synchronize to all users
    Expected data: {
        'room_id': 'ABC123',
        'current_time': 45.5
    }
    """
    room_id = data.get('room_id')
    current_time = data.get('current_time', 0)
    
    room = get_room(room_id)
    if room:
        room['video_state']['is_playing'] = False
        room['video_state']['current_time'] = current_time
        
        # Broadcast pause event to all users in room except sender
        emit('pause', {
            'current_time': current_time
        }, room=room_id, include_self=False)
        
        print(f"[PAUSE] Room {room_id} - Time: {current_time}s")


@socketio.on('seek')
def on_seek(data):
    """
    Event: A user seeks to a position - synchronize to all users
    Expected data: {
        'room_id': 'ABC123',
        'current_time': 120.5
    }
    """
    room_id = data.get('room_id')
    current_time = data.get('current_time', 0)
    
    room = get_room(room_id)
    if room:
        room['video_state']['current_time'] = current_time
        
        # Broadcast seek event to all users in room except sender
        emit('seek', {
            'current_time': current_time
        }, room=room_id, include_self=False)
        
        print(f"[SEEK] Room {room_id} - Time: {current_time}s")


@socketio.on('chat_message')
def on_chat_message(data):
    """
    Event: A user sends a chat message
    Expected data: {
        'room_id': 'ABC123',
        'username': 'John',
        'message': 'This movie is great!'
    }
    """
    room_id = data.get('room_id')
    username = data.get('username', 'Anonymous')
    message = data.get('message', '')
    
    if not message.strip():
        return
    
    # Broadcast message to all users in room
    emit('chat_message', {
        'username': username,
        'message': message,
        'timestamp': datetime.now().strftime('%H:%M:%S')
    }, room=room_id)
    
    print(f"[CHAT] {username} in {room_id}: {message}")


@socketio.on('disconnect')
def on_disconnect():
    """
    Event: User disconnects (closes browser/loses connection)
    """
    # Find and remove user from all rooms
    for room_id in list(rooms.keys()):
        room = get_room(room_id)
        if room:
            user = next((u for u in room['users'] if u['sid'] == request.sid), None)
            if user:
                username = user['username']
                remove_user_from_room(room_id, request.sid)
                leave_room(room_id)
                
                # Notify remaining users
                if get_room(room_id):
                    users = get_room_users(room_id)
                    emit('user_left', {
                        'username': username,
                        'users_count': len(users),
                        'all_users': users
                    }, room=room_id)
                
                print(f"[DISCONNECT] {username} from {room_id}")


# ==============================================================================
# ERROR HANDLERS
# ==============================================================================

@socketio.on_error_default
def default_error_handler(e):
    """Handle SocketIO errors"""
    print(f"Error: {str(e)}")
    emit('error', {'message': 'An error occurred'})


# ==============================================================================
# MAIN
# ==============================================================================

if __name__ == '__main__':
    print("Starting Watch Party Server...")
    port = int(os.environ.get("PORT", 5000))
    print(f"Access the app at http://localhost:{port}")
    socketio.run(app, host='0.0.0.0', port=port)
