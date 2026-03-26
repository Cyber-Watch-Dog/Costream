# Project Synopsis

## CoStream - Watch Party Application

**Submitted to**
Savitribai Phule Pune University

**In Partial Fulfillment of**
Bachelor of Computer Applications (Science)
BCA(SCI) III Year (Semester VI)

**Submitted by**
Mr. Pranav More
Mr. Yash Pawar

**Department of Computer Application**
MIT Arts, Commerce and Science College Alandi (D) Pune

**2025– 2026**

---

## INDEX FOR SYNOPSIS

| S.NO | CONTENT | Page No |
|------|---------|---------|
| 1 | Introduction of System | 2 |
| 2 | Existing System and Drawbacks | 3 |
| 3 | Proposed System and Objectives | 4 |
| 4 | Operating Environment - Hardware and Software | 5 |
| 5 | Bibliography (References) | 6 |

---

## 1. Introduction of the System

CoStream is a real-time synchronized video watching application developed to enable users to watch videos together remotely in a seamless and interactive manner. It allows users to create unique watch parties, invite others via room codes, and enjoy synchronized video playback with live chat functionality. At the same time, the system provides administrators the capability to monitor active sessions and manage application performance from a centralized dashboard.

This system replaces traditional asynchronous video sharing methods with a centralized real-time platform that maintains synchronized video states across all participants in a watch party room. Users can create rooms, share video URLs, and experience true synchronized playback where play, pause, and seek actions are instantly reflected across all connected clients.

By leveraging WebSocket technology and real-time communication protocols, the system ensures instantaneous synchronization, minimal latency, and seamless user experience. The web-based approach provides accessibility across devices, eliminates installation requirements, and enables secure real-time collaboration, making remote video watching simple, reliable, and engaging for all users.

---

## 2. Existing System and Drawbacks

Currently, users who wish to watch videos together remotely rely on multiple manual synchronization methods. These include sharing video links via messaging platforms (WhatsApp, Discord, Telegram) and verbally coordinating play actions, using screen sharing through video conferencing tools like Zoom or Google Meet which consume significant bandwidth, or recording video calls which lack real-time interactivity. Users often have difficulty coordinating exact timestamps and maintaining synchronized playback across different network conditions.

Several drawbacks arise in these existing methods:

- **Lack of Synchronization**: Without a dedicated platform, users must manually coordinate play/pause actions, leading to loss of synchronization
- **Bandwidth Inefficiency**: Screen sharing and recording consume excessive bandwidth and system resources
- **Poor User Experience**: Users cannot independently control their view or interact with a dedicated interface designed for watching together
- **Limited Chat Integration**: Communication is scattered across multiple platforms, fragmenting the viewing experience
- **Scalability Issues**: Video conferencing platforms struggle with large group watch parties
- **No Persistent State**: Session data is lost once the conference ends, with no historical record of watch parties
- **Technical Barriers**: Users face difficulties with setup and technical requirements, limiting accessibility

These limitations demonstrate the critical need for a dedicated, purpose-built platform that provides real-time video synchronization with minimal latency and maximum ease of use.

---

## 3. Proposed System and Objectives

To address the limitations of existing methods, CoStream offers a fully integrated web-based platform that streamlines the entire watch party experience. Users can access the system through standard web browsers, create unique watch party rooms with a single click, share room codes with others, input video URLs, and join existing rooms seamlessly. The system automatically synchronizes all video playback actions across participants and maintains real-time state information.

From the technical perspective, the system features:

- **Room Management**: Users can create, join, and manage watch party sessions with unique identifiable codes
- **Real-Time Synchronization**: Play, pause, and seek operations are instantly propagated to all participants via WebSocket connections
- **Live Chat**: Integrated chat functionality allows users to communicate with other participants without leaving the application
- **User Presence Tracking**: The system displays active participants and maintains awareness of user connections
- **Video State Management**: Persistent tracking of video URL, playback position, and playback status across all users in a room
- **Administrator Dashboard**: System administrators can monitor active sessions, track performance metrics, and generate reports (future enhancement)

The system's objectives are:

- **Eliminate Manual Synchronization**: Automate all synchronization processes to eliminate user coordination burden
- **Reduce Bandwidth Consumption**: Use efficient WebSocket communication instead of bandwidth-heavy video streaming
- **Improve Accessibility**: Provide a simple, intuitive interface accessible to users with minimal technical knowledge
- **Enable Real-Time Collaboration**: Facilitate seamless interaction and communication among remote participants
- **Support Scalability**: Design architecture capable of supporting multiple concurrent watch parties with varying group sizes
- **Enhance User Experience**: Create an engaging, responsive platform dedicated to the watch party use case
- **Ensure Reliability**: Implement robust error handling and reconnection mechanisms for stable operations

By creating a centralized, purpose-built platform, CoStream transforms remote video watching from a technical challenge into an enjoyable and accessible experience for users globally.

---

## 4. Operating Environment

The development and execution of CoStream requires appropriate hardware and software infrastructure to function efficiently.

### Hardware Environment

The system can be developed and deployed on standard computing platforms with the following minimum specifications:

- **Processor**: Intel i3 or equivalent (or better)
- **RAM**: Minimum 4 GB RAM
- **Hard Disk**: 500 GB or above
- **Internet Connection**: Stable broadband connection (minimum 5 Mbps)
- **Client System**: PC/Laptop/Tablet with modern browser support

### Software Environment

**Frontend Technology Stack:**
- **HTML5**: Markup and semantic structure
- **CSS3**: Responsive design and styling
- **JavaScript (Vanilla)**: Client-side logic and interactivity
- **Socket.IO Client**: Real-time bidirectional communication

**Backend Technology Stack:**
- **Python 3.8+**: Server-side programming language
- **Flask**: Lightweight web framework for routing and request handling
- **Flask-SocketIO**: Extension for WebSocket support and real-time communication
- **Python Standard Library**: Utilities for UUID generation, JSON handling, and datetime operations

**Deployment Environment:**
- **Operating System**: Windows 10 & Above / Linux (Ubuntu 20.04+) / macOS 10.14+
- **Web Server**: Flask development server (or Gunicorn/uWSGI for production)
- **Browser Compatibility**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Database**: Optional (currently in-memory storage; PostgreSQL/SQLite for future persistence)
- **Containerization**: Docker (for scalable deployment)

---

## 5. Bibliography (References)

The development of CoStream is supported by academic and technical resources covering real-time web communications, network programming, and distributed systems. Key references include:

### Books

- Wieruch, R. (2020). *The Road to React*. Independent Publication.
- Pimentel, V., & Nickerson, B. G. (2012). Communicating and Displaying Real-Time Data with WebSocket. *IEEE Internet Computing*, 16(4), 45-53.

### Research Papers

- Kurose, J. F., & Ross, K. W. (2017). *Computer Networking* (7th ed.). Pearson Education.
- Stevens, W. R., & Fenner, B. (2004). *UNIX Network Programming, Volume 1: The Sockets Networking API* (3rd ed.). Addison-Wesley.

### Online Documentation & Resources

- **Flask Official Documentation**: https://flask.palletsprojects.com/
- **Socket.IO Documentation**: https://socket.io/docs/
- **Python Documentation**: https://docs.python.org/3/
- **Mozilla Developer Network (MDN)**: https://developer.mozilla.org/ (for JavaScript and Web APIs)
- **W3Schools.com**: https://www.w3schools.com/ (for HTML, CSS, and JavaScript tutorials)
- **GitHub Repositories**: Communication and collaboration patterns in real-time applications

---

**Project Name**: CoStream - Watch Party Application  
**Version**: 1.0  
**Status**: Active Development  
**Last Updated**: March 2026
