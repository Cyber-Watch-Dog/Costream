/**
 * Watch Party Frontend Script
 * ============================
 * Handles:
 * - Socket.IO connection and event handling
 * - Video player synchronization (play, pause, seek)
 * - Real-time chat
 * - UI updates and notifications
 */

// ==============================================================================
// STATE MANAGEMENT
// ==============================================================================

const state = {
    roomId: null,
    username: null,
    socket: null,
    videoUrl: null,
    isSyncing: false,  // Prevent recursive sync
    isLocalChange: false,  // Track if change originated locally
    isYouTube: false,  // Track if using YouTube player
    ytPlayer: null,  // YouTube player instance
    ytReady: false,  // YouTube player ready state
    lastYTTime: 0,  // Last known YouTube time for seek detection
    ytTimeCheckInterval: null  // Interval for YouTube time checking
};

const elements = {
    // Modal elements
    roomModal: document.getElementById('roomModal'),
    createVideoUrl: document.getElementById('createVideoUrl'),
    createUsername: document.getElementById('createUsername'),
    createRoomBtn: document.getElementById('createRoomBtn'),
    joinRoomId: document.getElementById('joinRoomId'),
    joinUsername: document.getElementById('joinUsername'),
    joinRoomBtn: document.getElementById('joinRoomBtn'),
    roomError: document.getElementById('roomError'),

    // Loading overlay
    loadingOverlay: document.getElementById('loadingOverlay'),

    // Watch party elements
    watchPartyContainer: document.getElementById('watchPartyContainer'),
    videoPlayer: document.getElementById('videoPlayer'),
    youtubePlayer: document.getElementById('youtubePlayer'),
    displayRoomId: document.getElementById('displayRoomId'),
    usersCount: document.getElementById('usersCount'),
    usersList: document.getElementById('usersList'),
    leaveRoomBtn: document.getElementById('leaveRoomBtn'),

    // Chat elements
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendChatBtn: document.getElementById('sendChatBtn'),

    // Status elements
    syncStatus: document.getElementById('syncStatus'),
    statusMessage: document.getElementById('statusMessage')
};

// ==============================================================================
// YOUTUBE HELPER FUNCTIONS
// ==============================================================================

function isYouTubeUrl(url) {
    if (!url) return false;
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return ytRegex.test(url);
}

function extractYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function initYouTubePlayer(videoId) {
    const iframe = elements.youtubePlayer;

    // Explicitly set the iframe inner src specifically designed for JS APIs to catch it
    // Wait for the iframe's YT API to sync before interacting
    iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=1&rel=0&modestbranding=1`;

    // YT.Player hooks itself into the existing iframe identified by ID 'youtubePlayer' 
    state.ytPlayer = new YT.Player('youtubePlayer', {
        events: {
            'onReady': onYTPlayerReady,
            'onStateChange': onYTPlayerStateChange
        }
    });
}

function onYTPlayerReady(event) {
    state.ytReady = true;
    state.lastYTTime = 0;

    // Start tracking time for seek detection
    state.ytTimeCheckInterval = setInterval(() => {
        if (!state.ytPlayer || !state.ytReady || state.isSyncing || !state.socket) return;

        const currentTime = state.ytPlayer.getCurrentTime();
        const timeDiff = Math.abs(currentTime - state.lastYTTime);

        // If time jumped more than 3 seconds (and not just normal playback), it's a seek
        // Also check player state is playing to avoid seek spam
        const playerState = state.ytPlayer.getPlayerState();
        if (timeDiff > 3 && playerState !== YT.PlayerState.BUFFERING) {
            state.socket.emit('seek', {
                room_id: state.roomId,
                current_time: currentTime
            });
            updateStatus('Seeking...', 'info');
        }

        state.lastYTTime = currentTime;
    }, 500);

    updateStatus('YouTube player ready', 'success');
}

function onYTPlayerStateChange(event) {
    // Skip if syncing or no socket
    if (state.isSyncing || !state.socket) return;

    // YT.PlayerState: PLAYING = 1, PAUSED = 2, BUFFERING = 3
    if (event.data === YT.PlayerState.PLAYING) {
        // Delay slightly to avoid race conditions
        setTimeout(() => {
            if (state.isSyncing) return;
            state.socket.emit('play', {
                room_id: state.roomId,
                current_time: state.ytPlayer.getCurrentTime()
            });
            updateStatus('Playing...', 'success');
        }, 100);
    } else if (event.data === YT.PlayerState.PAUSED) {
        // Delay slightly to avoid race conditions
        setTimeout(() => {
            if (state.isSyncing) return;
            state.socket.emit('pause', {
                room_id: state.roomId,
                current_time: state.ytPlayer.getCurrentTime()
            });
            updateStatus('Paused', 'info');
        }, 100);
    }
}

// ==============================================================================
// INITIALIZATION
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Check for URL parameters (passed from landing page)
    const urlParams = new URLSearchParams(window.location.search);
    const videoParam = urlParams.get('video');
    const roomParam = urlParams.get('room');
    const userParam = urlParams.get('user');

    // Retrieve previous state from localStorage
    const savedStateStr = localStorage.getItem('room_state');
    const savedState = savedStateStr ? JSON.parse(savedStateStr) : null;

    if (videoParam && userParam) {
        // Auto-create room from landing page data by calling API
        fetch('/api/create-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ video_url: videoParam })
        })
            .then(response => response.json())
            .then(data => {
                if (data.room_id) {
                    // Clean up URL to avoid re-runs on refresh
                    window.history.replaceState({}, document.title, window.location.pathname);
                    joinWatchParty(data.room_id, userParam, videoParam);
                }
            });
    } else if (roomParam && userParam) {
        // Auto-join room from landing page data
        window.history.replaceState({}, document.title, window.location.pathname);
        joinWatchParty(roomParam, userParam, null);
    } else if (savedState && savedState.roomId && savedState.username) {
        // Automatically restore session if local data exists (reloading page seamlessly)
        console.log(`[RELOAD] Restoring session for Room ${savedState.roomId}`);
        joinWatchParty(savedState.roomId, savedState.username, savedState.videoUrl);
    }

    // Event listeners for room setup manually
    elements.createRoomBtn.addEventListener('click', handleCreateRoom);
    elements.joinRoomBtn.addEventListener('click', handleJoinRoom);
    elements.leaveRoomBtn.addEventListener('click', handleLeaveRoom);

    // Video player event listeners
    elements.videoPlayer.addEventListener('play', handleVideoPlay);
    elements.videoPlayer.addEventListener('pause', handleVideoPause);
    elements.videoPlayer.addEventListener('seeking', handleVideoSeeking);

    // Chat event listeners
    elements.sendChatBtn.addEventListener('click', handleSendMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Form-based Enter handles the other inputs automatically now
});

// ==============================================================================
// ROOM MANAGEMENT
// ==============================================================================

function handleCreateRoom(e) {
    if (e) e.preventDefault();
    const videoUrl = elements.createVideoUrl.value.trim();
    const username = elements.createUsername.value.trim();

    if (!videoUrl || !username) {
        showError('Please enter both video URL and username');
        return;
    }

    // Create room via REST API
    fetch('/api/create-room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ video_url: videoUrl })
    })
        .then(response => response.json())
        .then(data => {
            if (data.room_id) {
                // Clean up URL to avoid re-runs on refresh
                window.history.replaceState({}, document.title, window.location.pathname);
                joinWatchParty(data.room_id, username, videoUrl);
            }
        })
        .catch(error => {
            console.error('Error creating room:', error);
            showError('Failed to create room');
        });
}

function handleJoinRoom(e) {
    if (e) e.preventDefault();
    const roomId = elements.joinRoomId.value.trim().toUpperCase();
    const username = elements.joinUsername.value.trim();

    if (!roomId || !username) {
        showError('Please enter room ID and username');
        return;
    }

    // Clean up URL to avoid re-runs on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
    // Join without video URL - will get it from the room's host
    joinWatchParty(roomId, username, null);
}

function joinWatchParty(roomId, username, videoUrl) {
    // Avoid double socket initialization
    if (state.socket) {
        console.log("[JOIN] Disconnecting existing socket before re-joining.");
        state.socket.disconnect();
        state.socket = null;
    }

    state.roomId = roomId;
    state.username = username;
    state.videoUrl = videoUrl;  // May be null for joiners
    state.isYouTube = videoUrl ? isYouTubeUrl(videoUrl) : false;

    // Persist room details for future page reloads
    localStorage.setItem('room_state', JSON.stringify({
        roomId: state.roomId,
        username: state.username,
        videoUrl: state.videoUrl
    }));

    console.log(`[JOIN] Joining room: ${roomId} as ${username}`);

    // Show loading spinner safely without flickers
    elements.roomModal.style.display = 'none';
    elements.watchPartyContainer.style.display = 'none';
    elements.loadingOverlay.style.display = 'flex';

    // Initialize Socket.IO connection
    state.socket = io();

    // Socket event listeners
    state.socket.on('connect', () => {
        console.log('[CONNECT] Connected to server with SID:', state.socket.id);

        // Join the room (video_url only sent by host)
        const joinData = {
            room_id: roomId,
            username: username
        };
        if (state.videoUrl) {
            joinData.video_url = state.videoUrl;
        }
        state.socket.emit('join_room', joinData);
    });

    state.socket.on('user_joined', (data) => {
        updateUsersList(data.all_users);
        updateStatus(`${data.username} joined the party!`, 'info');
        elements.usersCount.textContent = data.users_count;
    });

    state.socket.on('user_left', (data) => {
        updateUsersList(data.all_users);
        updateStatus(`${data.username} left the party`, 'warning');
        elements.usersCount.textContent = data.users_count;
    });

    // Video sync events
    state.socket.on('play', (data) => {
        state.isSyncing = true;
        if (state.isYouTube && state.ytPlayer && state.ytReady) {
            state.ytPlayer.seekTo(data.current_time, true);
            state.ytPlayer.playVideo();
            state.lastYTTime = data.current_time;
        } else {
            elements.videoPlayer.currentTime = data.current_time;
            elements.videoPlayer.play();
        }
        // Keep syncing flag true for a bit to prevent feedback loop
        setTimeout(() => { state.isSyncing = false; }, 1000);
        updateStatus('Video playing (synced)', 'success');
    });

    state.socket.on('pause', (data) => {
        state.isSyncing = true;
        if (state.isYouTube && state.ytPlayer && state.ytReady) {
            state.ytPlayer.seekTo(data.current_time, true);
            state.ytPlayer.pauseVideo();
            state.lastYTTime = data.current_time;
        } else {
            elements.videoPlayer.currentTime = data.current_time;
            elements.videoPlayer.pause();
        }
        // Keep syncing flag true for a bit to prevent feedback loop
        setTimeout(() => { state.isSyncing = false; }, 1000);
        updateStatus('Video paused (synced)', 'info');
    });

    state.socket.on('seek', (data) => {
        state.isSyncing = true;
        if (state.isYouTube && state.ytPlayer && state.ytReady) {
            state.ytPlayer.seekTo(data.current_time, true);
            state.lastYTTime = data.current_time;  // Update to prevent double-seek
        } else {
            elements.videoPlayer.currentTime = data.current_time;
        }
        // Keep syncing flag true for a bit to prevent feedback loop
        setTimeout(() => { state.isSyncing = false; }, 1000);
        updateStatus('Seeking...', 'info');
        setTimeout(() => updateStatus('In sync', 'success'), 1000);
    });

    // Sync initial video state
    state.socket.on('sync_video_state', (videoState) => {
        console.log("[SYNC] Received video state:", videoState);
        state.isSyncing = true;  // Prevent events during initial sync

        // Get video URL from room state if not already set (for joiners)
        if (!state.videoUrl && videoState.video_url) {
            state.videoUrl = videoState.video_url;
            state.isYouTube = isYouTubeUrl(state.videoUrl);

            // Backup the newly found video URL
            localStorage.setItem('room_state', JSON.stringify({
                roomId: state.roomId,
                username: state.username,
                videoUrl: state.videoUrl
            }));
        }

        if (state.isYouTube) {
            const videoId = extractYouTubeId(state.videoUrl);
            if (videoId) {
                // Show YouTube player, hide standard player
                elements.youtubePlayer.style.display = 'block';
                elements.videoPlayer.style.display = 'none';

                // Set the URL in the iframe and attach
                initYouTubePlayer(videoId);

                // Wait for player to be ready, then sync
                const checkReady = setInterval(() => {
                    if (state.ytReady) {
                        clearInterval(checkReady);
                        state.isSyncing = true;  // Re-enable before sync actions
                        state.ytPlayer.seekTo(videoState.current_time, true);
                        state.lastYTTime = videoState.current_time;
                        if (videoState.is_playing) {
                            state.ytPlayer.playVideo();
                        } else {
                            state.ytPlayer.pauseVideo();
                        }
                        // Clear sync flag after delay
                        setTimeout(() => { state.isSyncing = false; }, 1500);
                    }
                }, 100);
            }
        } else {
            elements.videoPlayer.src = state.videoUrl;
            elements.videoPlayer.currentTime = videoState.current_time;

            if (videoState.is_playing) {
                elements.videoPlayer.play();
            } else {
                elements.videoPlayer.pause();
            }
            // Clear sync flag after delay
            setTimeout(() => { state.isSyncing = false; }, 1500);
        }

        // Successfully loaded: Replace Loading Screen with Interface
        elements.loadingOverlay.style.display = 'none';
        elements.watchPartyContainer.style.display = 'block';
        elements.displayRoomId.textContent = state.roomId;
        updateStatus('In sync', 'success');
        clearError();
    });

    // Chat events
    state.socket.on('chat_message', (data) => {
        addChatMessage(data.username, data.message, data.timestamp);
    });

    // Error handling
    state.socket.on('error', (data) => {
        console.error("[ERROR] Received from server:", data);
        showError(data.message);

        // Remove locally stored state if invalid connection
        localStorage.removeItem('room_state');
        resetUI(); // Return to form
    });

    state.socket.on('disconnect', () => {
        console.log('[DISCONNECT] Disconnected from server');
    });
}

function handleLeaveRoom() {
    console.log(`[LEAVE] User ${state.username} triggered leave for room ${state.roomId}`);

    // Smoothly remove state and redirect
    if (state.socket && state.roomId) {
        state.socket.emit('leave_room', {
            room_id: state.roomId,
            username: state.username
        });
        state.socket.disconnect();
    }

    localStorage.removeItem('room_state');

    // Use replace to prevent back button from restoring ghosts
    window.location.replace("/");
}

function resetUI() {
    elements.loadingOverlay.style.display = 'none';
    elements.watchPartyContainer.style.display = 'none';
    elements.roomModal.style.display = 'block';

    // Reset player visibility
    elements.videoPlayer.style.display = 'block';
    elements.youtubePlayer.style.display = 'none';
    elements.youtubePlayer.src = '';

    // Clear inputs
    elements.createVideoUrl.value = '';
    elements.createUsername.value = '';
    elements.joinRoomId.value = '';
    if (elements.joinVideoUrl) elements.joinVideoUrl.value = ''; // Safe check
    elements.joinUsername.value = '';

    // Clear chat
    elements.chatMessages.innerHTML = '<div class="chat-welcome"><p>Welcome to the watch party!</p><p>Messages will appear here.</p></div>';

    // Reset state
    state.roomId = null;
    state.username = null;
    state.socket = null;
    state.isYouTube = false;
    state.ytPlayer = null;
    state.ytReady = false;
    state.lastYTTime = 0;
    if (state.ytTimeCheckInterval) {
        clearInterval(state.ytTimeCheckInterval);
        state.ytTimeCheckInterval = null;
    }
}

// ==============================================================================
// VIDEO PLAYER SYNCHRONIZATION
// ==============================================================================

function handleVideoPlay() {
    if (state.isSyncing || !state.socket) return;

    state.socket.emit('play', {
        room_id: state.roomId,
        current_time: elements.videoPlayer.currentTime
    });

    updateStatus('Playing...', 'success');
}

function handleVideoPause() {
    if (state.isSyncing || !state.socket) return;

    state.socket.emit('pause', {
        room_id: state.roomId,
        current_time: elements.videoPlayer.currentTime
    });

    updateStatus('Paused', 'info');
}

function handleVideoSeeking() {
    if (state.isSyncing || !state.socket) return;

    // Only send seek event after seeking completes (with small delay)
    setTimeout(() => {
        state.socket.emit('seek', {
            room_id: state.roomId,
            current_time: elements.videoPlayer.currentTime
        });

        updateStatus('Seeking...', 'info');
    }, 100);
}

// ==============================================================================
// CHAT FUNCTIONALITY
// ==============================================================================

function handleSendMessage() {
    const message = elements.chatInput.value.trim();

    if (!message || !state.socket) return;

    state.socket.emit('chat_message', {
        room_id: state.roomId,
        username: state.username,
        message: message
    });

    elements.chatInput.value = '';
    elements.chatInput.focus();
}

function addChatMessage(username, message, timestamp) {
    // Remove welcome message if it exists
    const welcomeMsg = elements.chatMessages.querySelector('.chat-welcome');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message';

    const isOwnMessage = username === state.username ? 'own' : '';
    if (isOwnMessage) {
        messageEl.classList.add(isOwnMessage);
    }

    messageEl.innerHTML = `
        <div class="chat-message-header">
            <span class="chat-username">${escapeHtml(username)}</span>
            <span class="chat-timestamp">${timestamp}</span>
        </div>
        <div class="chat-message-content">${escapeHtml(message)}</div>
    `;

    elements.chatMessages.appendChild(messageEl);

    // Auto-scroll to latest message
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// ==============================================================================
// UI UPDATES
// ==============================================================================

function updateUsersList(users) {
    elements.usersList.innerHTML = users.map(user => {
        const icon = user === state.username ? '👤' : '🟢';
        return `<li>${icon} ${escapeHtml(user)}</li>`;
    }).join('');
}

function updateStatus(message, type = 'idle') {
    elements.statusMessage.textContent = message;

    // Update status badge color
    elements.syncStatus.className = 'status-badge status-' + type;

    // Map message types to badges
    const badges = {
        'success': '✓ ',
        'info': 'ℹ ',
        'warning': '⚠ ',
        'idle': ''
    };

    elements.syncStatus.textContent = badges[type] + message;
}

function showError(message) {
    elements.roomError.textContent = message;
    elements.roomError.style.display = 'block';
}

function clearError() {
    elements.roomError.textContent = '';
    elements.roomError.style.display = 'none';
}

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

function escapeHtml(text) {
    /**
     * Escape HTML special characters to prevent XSS attacks
     */
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
