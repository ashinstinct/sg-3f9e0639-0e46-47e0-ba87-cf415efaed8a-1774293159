# Back2Life.Studio - Python Audio Processing Backend

Flask microservice for AI-powered audio processing using Spleeter (stem separation) and DeepFilterNet (audio enhancement).

## Features

- **Stem Separation** - Separate audio into vocals, drums, bass, and other instruments using Spleeter
- **Audio Enhancement** - AI-powered noise reduction and quality improvement using DeepFilterNet
- **Production Ready** - Docker support, gunicorn, health checks
- **CORS Enabled** - Works seamlessly with Next.js frontend

## API Endpoints

### Health Check
```
GET /health
```
Returns service status and model availability.

### Separate Stems
```
POST /api/separate-stems
Content-Type: multipart/form-data
Body: file (audio file)
```
Returns: ZIP file with separated stems (vocals.wav, drums.wav, bass.wav, other.wav)

### Enhance Audio
```
POST /api/enhance-audio
Content-Type: multipart/form-data
Body: file (audio file)
```
Returns: Enhanced audio file (WAV format)

### Models Status
```
GET /api/models/status
```
Returns: Information about available AI models and their configuration.

## Local Development

### Prerequisites
- Python 3.10+
- FFmpeg installed
- 4GB+ RAM recommended

### Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Run the server:
```bash
python app.py
```

Server will start on `http://localhost:5000`

### Test the API

**Test Spleeter:**
```bash
curl -X POST http://localhost:5000/api/separate-stems \
  -F "file=@your-audio.mp3" \
  -o stems.zip
```

**Test DeepFilterNet:**
```bash
curl -X POST http://localhost:5000/api/enhance-audio \
  -F "file=@your-audio.mp3" \
  -o enhanced.wav
```

## Deployment

### Option 1: Railway (Recommended)

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Get your deployment URL from Railway dashboard

### Option 2: Render

1. Push code to GitHub
2. Connect repository to Render
3. Render will auto-detect `render.yaml` and deploy
4. Get your deployment URL from Render dashboard

### Option 3: Docker

```bash
docker build -t back2life-audio-backend .
docker run -p 5000:5000 back2life-audio-backend
```

### Option 4: Replit

1. Import this repository to Replit
2. Replit will auto-install dependencies
3. Run with `python app.py`
4. Use the Replit URL in your Next.js frontend

## Environment Variables

```bash
FLASK_ENV=production          # production or development
PORT=5000                      # Server port
ALLOWED_ORIGINS=*             # CORS origins (comma-separated)
MAX_CONTENT_LENGTH=104857600  # Max file size (100MB)
```

## Model Information

### Spleeter
- Model: `spleeter:4stems`
- Outputs: vocals, drums, bass, other
- Processing time: ~30 seconds per minute of audio
- Memory: ~2GB RAM required

### DeepFilterNet
- Model: `DeepFilterNet3`
- Output: Enhanced audio with noise reduction
- Processing time: ~10 seconds per minute of audio
- Memory: ~1.5GB RAM required

## Integration with Next.js

Update your Next.js `.env.local`:
```bash
NEXT_PUBLIC_PYTHON_BACKEND_URL=https://your-backend-url.railway.app
```

Example usage in Next.js:
```typescript
const formData = new FormData();
formData.append("file", audioFile);

const response = await fetch(
  `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/api/separate-stems`,
  { method: "POST", body: formData }
);

const blob = await response.blob();
// Handle ZIP file with stems
```

## Performance Notes

- First request may be slow (model loading)
- Subsequent requests are faster (models cached in memory)
- Processing time scales with audio length
- Recommended: 2GB+ RAM, 2+ CPU cores

## Troubleshooting

**Models not loading:**
- Check logs for import errors
- Verify all dependencies installed correctly
- Ensure sufficient RAM available

**Timeout errors:**
- Increase gunicorn timeout (currently 300s)
- Process shorter audio files
- Use more powerful server instance

**Out of memory:**
- Reduce worker count in gunicorn
- Process files sequentially
- Upgrade server instance

## License

MIT License - Free for commercial use