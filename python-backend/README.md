# Back2Life.Studio - Audio Processing Backend

Python Flask backend for audio/video processing using FFmpeg.

## 🚀 Deployment on Render.com

### Quick Deploy (Recommended)

1. **Create Render Account**: https://render.com/
2. **Connect GitHub**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this backend

3. **Configure Service**:
   - **Name**: `back2life-audio-processing`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `python-backend`
   - **Runtime**: Python 3
   - **Build Command**: (auto-detected from render.yaml)
   - **Start Command**: `bash start.sh`

4. **Deploy**:
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Your backend URL will be: `https://back2life-audio-processing.onrender.com`

5. **Update Frontend**:
   - Copy your Render URL
   - Add to `.env.local` in your Next.js project:
     ```bash
     NEXT_PUBLIC_BACKEND_URL=https://back2life-audio-processing.onrender.com
     ```
   - Redeploy your Vercel frontend

### Alternative: Manual Deploy

If auto-detection doesn't work:

```bash
# Build Command
apt-get update && apt-get install -y ffmpeg && pip install -r requirements.txt

# Start Command
bash start.sh
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "ffmpeg_available": true,
  "message": "Back2Life.Studio audio processing server is running"
}
```

### Split Video
```bash
POST /api/split-video
```

**Request:**
- `file`: Video file (MP4, MOV, AVI, MKV, WebM)
- `duration`: Segment duration in seconds (default: 60)

**Response:**
- ZIP file containing video segments

### Convert Audio
```bash
POST /api/convert-audio
```

**Request:**
- `file`: Audio file (MP3, WAV, M4A, etc.)
- `output_format`: Target format (mp3, wav, flac, ogg, etc.)
- `quality`: Quality preset (low, standard, high, lossless)

**Response:**
- Converted audio file

### Edit Audio
```bash
POST /api/edit-audio
```

**Request:**
- `file`: Audio file
- `trim_start`: Start time in seconds (default: 0)
- `trim_end`: End time in seconds (default: duration)
- `fade_in`: Fade in duration in seconds (default: 0)
- `fade_out`: Fade out duration in seconds (default: 0)
- `volume`: Volume multiplier 0-2 (default: 1.0)
- `speed`: Playback speed 0.5-2.0 (default: 1.0)

**Response:**
- Edited MP3 file (192kbps)

## 🧪 Testing Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Make sure FFmpeg is installed
# Mac: brew install ffmpeg
# Ubuntu: sudo apt install ffmpeg
# Windows: Download from ffmpeg.org

# Start server
PORT=5000 python app.py

# Test endpoints
curl http://localhost:5000/health
```

## 📦 Dependencies

- **Flask**: Web framework
- **flask-cors**: CORS support for Next.js frontend
- **gunicorn**: Production WSGI server
- **FFmpeg**: Audio/video processing (installed via buildCommand)

## 🔧 Environment Variables

None required! The server auto-configures based on Render's environment.

## 💰 Render Pricing

- **Free Tier**: 750 hours/month (sleeps after 15 min inactivity)
- **Starter Plan**: $7/month (always-on, no sleep)

**Recommendation**: Start with free tier, upgrade to Starter if you need instant response times.

## 🐛 Troubleshooting

### "FFmpeg not found"
- Check Render build logs
- Verify `buildCommand` includes `apt-get install -y ffmpeg`

### "Service timeout"
- Increase timeout in Render dashboard: Settings → Advanced → Timeout
- Recommended: 300 seconds for large file processing

### "502 Bad Gateway"
- Service is sleeping (free tier)
- First request wakes it up (~30 seconds)
- Solution: Upgrade to Starter plan or keep service warm with cron job

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Flask Documentation](https://flask.palletsprojects.com/)