# 🚀 Deployment & Hosting Guide

## Local Development (Your Machine)

### Quick Start
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run server
python app.py

# 3. Open browser
http://localhost:5000
```

**Perfect for**: Development, testing, demos on your machine

---

## Testing on Network (Different Computer)

### Find Your IP Address

**Windows**:
```cmd
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux**:
```bash
ifconfig
```
Look for "inet" address

### Run on Network

**Server Machine**:
```bash
python app.py
```

**Other Machines on Same Network**:
```
http://[your-ip]:5000
```

Example: `http://192.168.1.100:5000`

**Perfect for**: Testing on multiple devices, classroom demos

---

## For Project Submission

### Package Everything

Create a folder with:
```
watch-party-app/
├── app.py
├── requirements.txt
├── README.md
├── QUICKSTART.md
├── DOCUMENTATION.md
├── TESTING_CHECKLIST.md
├── PROJECT_SUMMARY.md
├── .env.example
├── templates/
│   └── index.html
└── static/
    ├── script.js
    └── style.css
```

### Submission Checklist
- ☐ All files included
- ☐ No extra files (no __pycache__, .venv, etc.)
- ☐ README.md present
- ☐ requirements.txt complete
- ☐ Code tested and working

### How to Submit

1. **Zip folder**:
   - Right-click folder → Send to → Compressed Folder
   - Or: `tar -czf watch-party-app.tar.gz watch-party-app/`

2. **Upload to course platform** (Canvas, Blackboard, etc.)

3. **Include in documentation**:
   - Screenshot of working app
   - List of features implemented
   - Installation instructions (copy from QUICKSTART.md)

---

## Deployment to Heroku (Free Tier - Limited)

### Prerequisites
- Heroku account (free: heroku.com)
- Git installed
- Command line

### Step 1: Create Heroku App
```bash
heroku login
heroku create watch-party-app
```

### Step 2: Create Procfile
Create file named `Procfile` (no extension) in project root:
```
web: python app.py
```

### Step 3: Create runtime.txt
Create file named `runtime.txt`:
```
python-3.9.16
```

### Step 4: Deploy
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Step 5: Access
Your app will be at: `https://watch-party-app.herokuapp.com`

**Note**: Heroku free tier has limitations:
- Apps go to sleep after 30 minutes inactivity
- 512MB RAM (enough for this app)
- Regional US only
- Good for demos, not production

---

## Deployment to Digital Ocean

### Prerequisites
- Digital Ocean account (~$5/month)
- SSH key
- Command line

### Step 1: Create Droplet
1. Log in to Digital Ocean
2. Create → Droplets
3. Choose:
   - OS: Ubuntu 20.04 LTS
   - Plan: Basic $5/month
   - Region: Your preference

### Step 2: Install Dependencies
```bash
ssh root@[your-ip]

# Update system
apt update && apt upgrade -y

# Install Python
apt install python3-pip python3-venv -y

# Install Nginx
apt install nginx -y
```

### Step 3: Upload Files
```bash
# On your machine
scp -r watch-party-app root@[your-ip]:/home/watch-party-app
```

### Step 4: Setup App
```bash
ssh root@[your-ip]

cd /home/watch-party-app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 5: Run with Gunicorn
```bash
pip install gunicorn

# Edit app.py, change last line from:
# socketio.run(app, debug=True, host='0.0.0.0', port=5000)
# To:
# socketio.run(app, debug=False, host='0.0.0.0', port=5000)

# Start with gunicorn
gunicorn --worker-class eventlet -w 1 -b 0.0.0.0:5000 app:app
```

### Step 6: Setup Nginx Reverse Proxy

Edit `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Reload Nginx:
```bash
systemctl restart nginx
```

Access at: `http://[your-ip]`

---

## Deployment to AWS (EC2)

### Prerequisites
- AWS account (free tier available)
- EC2 instance (t2.micro free tier)

### Similar to Digital Ocean
1. Launch EC2 instance
2. SSH into instance
3. Install Python, dependencies
4. Copy files
5. Run with Gunicorn
6. Setup Nginx proxy

See Digital Ocean steps above - very similar process.

---

## Environment Variables (Production)

### Create .env file
```bash
# Change app.py to use environment variables
# At top of app.py, add:

import os
from dotenv import load_dotenv

load_dotenv()

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
HOST = os.getenv('HOST', '0.0.0.0')
PORT = int(os.getenv('PORT', 5000))
```

### Create .env file
```
SECRET_KEY=your-production-secret-key-change-this
DEBUG=False
HOST=0.0.0.0
PORT=5000
```

### Add to .gitignore
```
.env
.venv
__pycache__
*.pyc
```

---

## Production Improvements

### Security Checklist
- ☐ Change SECRET_KEY to random string
- ☐ Set DEBUG = False
- ☐ Use HTTPS (SSL certificate)
- ☐ Add CORS restrictions
- ☐ Validate all inputs
- ☐ Rate limit API endpoints
- ☐ Monitor server logs

### Performance Optimization
- ☐ Use Redis for session storage
- ☐ Implement database (MongoDB/PostgreSQL)
- ☐ Add caching headers
- ☐ Minify CSS/JS
- ☐ Enable gzip compression
- ☐ Use CDN for static files

### Monitoring
- ☐ Setup error logging (Sentry)
- ☐ Monitor server resources
- ☐ Track user metrics
- ☐ Setup alerts

---

## Docker Deployment (Advanced)

### Create Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=app.py
ENV FLASK_ENV=production

EXPOSE 5000

CMD ["python", "app.py"]
```

### Create docker-compose.yml
```yaml
version: '3'
services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DEBUG=False
```

### Run
```bash
docker build -t watch-party-app .
docker run -p 5000:5000 watch-party-app
```

Or:
```bash
docker-compose up
```

---

## Database Integration (Future)

When ready to add MongoDB:

### Install PyMongo
```bash
pip install pymongo
```

### Add to app.py
```python
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['watch_party']

# Store messages in database
def save_message(room_id, username, message):
    db.messages.insert_one({
        'room_id': room_id,
        'username': username,
        'message': message,
        'timestamp': datetime.now()
    })

# Retrieve message history
def get_messages(room_id):
    return list(db.messages.find({'room_id': room_id}))
```

---

## Troubleshooting Deployment

### Port Already in Use
```bash
# Find what's using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill it
kill -9 <pid>
```

### Import Errors
```bash
# Make sure virtual environment active
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate  # Windows

# Reinstall requirements
pip install -r requirements.txt
```

### Socket.IO Connection Issues
- Check CORS settings in app.py
- Verify WebSocket port open
- Check firewall rules

### Video Not Loading
- Verify video URL accessible from server
- Check CORS headers on video server
- Use absolute URLs (http://...)

---

## Monitoring & Logs

### Check Server Logs
```bash
# View Flask logs
tail -f app.log

# View system logs
journalctl -u watch-party-app

# View error logs
tail -f /var/log/nginx/error.log
```

### Enable Logging in app.py
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    filename='app.log',
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

@socketio.on('play')
def on_play(data):
    logger.info(f"Play event: {data}")
    # ... rest of handler
```

---

## Backup & Recovery

### Backup Files
```bash
# Backup entire app
tar -czf watch-party-backup.tar.gz watch-party-app/

# Copy to safe location
cp watch-party-backup.tar.gz /backup/
```

### Restore from Backup
```bash
# Extract backup
tar -xzf watch-party-backup.tar.gz

# Reinstall dependencies
pip install -r requirements.txt

# Run app
python app.py
```

---

## Performance Benchmarks

### Expected Performance
| Metric | Expected | Good | Excellent |
|--------|----------|------|-----------|
| Page Load Time | < 2s | < 1s | < 500ms |
| Sync Latency | < 1s | < 500ms | < 200ms |
| Chat Latency | < 500ms | < 250ms | < 100ms |
| CPU Usage | < 50% | < 30% | < 10% |
| Memory Usage | < 200MB | < 100MB | < 50MB |

---

## Support & Documentation References

- **Flask**: https://flask.palletsprojects.com/
- **Socket.IO**: https://socket.io/
- **Heroku Docs**: https://devcenter.heroku.com/
- **Digital Ocean Docs**: https://www.digitalocean.com/docs/
- **AWS EC2**: https://aws.amazon.com/ec2/

---

## Quick Decision Guide

**Choose your deployment:**

### 1. Local Only (Localhost)
- **Use case**: Development, testing
- **Setup time**: 5 minutes
- **Cost**: Free
- **Start**: `python app.py`

### 2. Network (Local Network)
- **Use case**: LAN demos, multiple devices
- **Setup time**: 10 minutes
- **Cost**: Free
- **Start**: Get IP, run on port 5000

### 3. Heroku
- **Use case**: Simple deployment, demos
- **Setup time**: 30 minutes
- **Cost**: Free (with limitations)
- **URL**: https://app.herokuapp.com

### 4. Digital Ocean
- **Use case**: Production-ready
- **Setup time**: 1-2 hours
- **Cost**: $5-10/month
- **URL**: http://your-ip.address

### 5. AWS
- **Use case**: Scalable production
- **Setup time**: 2-3 hours
- **Cost**: Free tier available, then $5-50/month
- **URL**: http://your-instance.amazonaws.com

---

## Submission Ready?

Before submitting, verify:
- ☐ App runs locally without errors
- ☐ All features working (see TESTING_CHECKLIST.md)
- ☐ Documentation complete
- ☐ Code well-commented
- ☐ No extra files included
- ☐ requirements.txt accurate

**You're ready to submit!** 📦

---

**Last Updated**: February 4, 2026
