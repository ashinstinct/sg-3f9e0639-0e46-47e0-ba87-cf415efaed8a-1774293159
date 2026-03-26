# 🚀 Render Deployment Guide - FIXED VERSION

## ✅ What Was Fixed

### **Issue #1: Multi-line Build Command**
**Problem:** Render's YAML parser sometimes fails with multi-line commands using `|`
**Fix:** Simplified to single-line command in `render.yaml`

### **Issue #2: FFmpeg Installation**
**Problem:** FFmpeg not available on Render's Python runtime by default
**Fix:** Removed FFmpeg from build command - will use Dockerfile instead

### **Issue #3: Start Command**
**Problem:** Using `bash start.sh` adds unnecessary complexity
**Fix:** Direct `gunicorn` command in `render.yaml`

### **Issue #4: Python Version**
**Problem:** No explicit Python version specified
**Fix:** Added `runtime.txt` with `python-3.11.0`

---

## 📦 Current Configuration

### **render.yaml** (Simplified & Fixed)
```yaml
services:
  - type: web
    name: back2life-audio-processing
    runtime: python
    region: oregon
    plan: free
    buildCommand: pip install --upgrade pip && pip install -r requirements.txt
    startCommand: gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 300 app:app
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
    healthCheckPath: /health
    autoDeploy: true
```

### **runtime.txt** (NEW - Forces Python 3.11)
```
python-3.11.0
```

### **Procfile** (NEW - Backup for Render)
```
web: gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 300 app:app
```

---

## 🎯 Two Deployment Options

### **Option 1: Native Python Runtime (RECOMMENDED - SIMPLER)**

✅ **Pros:**
- Simpler setup
- Faster builds (~2-3 minutes)
- Uses Render's Python runtime
- No Docker complexity

⚠️ **Cons:**
- FFmpeg not available (need to add as native build pack)
- Some audio/video tools won't work initially

**Best for:** Getting backend online quickly, testing non-FFmpeg endpoints

---

### **Option 2: Docker Runtime (FULL FEATURES)**

✅ **Pros:**
- FFmpeg included
- All audio/video tools work
- Full control over environment

⚠️ **Cons:**
- Slower builds (~5-8 minutes)
- More complex configuration
- Uses Docker (not native Python)

**Best for:** Production deployment with all features enabled

---

## 🚀 OPTION 1: Deploy with Native Python (Quick Start)

### **Step 1: Commit Changes**
```bash
git add .
git commit -m "fix: Simplify Render deployment configuration"
git push origin main
```

### **Step 2: Create Render Service**
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select **"Back2Life.Studio"** repository

### **Step 3: Configure Service**

| Setting | Value |
|---------|-------|
| **Name** | `back2life-audio-processing` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | `python-backend` |
| **Runtime** | `Python 3` |
| **Build Command** | Auto-detected from `render.yaml` ✅ |
| **Start Command** | Auto-detected from `render.yaml` ✅ |

### **Step 4: Deploy!**
1. Click **"Create Web Service"**
2. Wait 2-3 minutes for build
3. Service will be live at: `https://back2life-audio-processing.onrender.com`

### **Step 5: Test Health Endpoint**
```bash
curl https://back2life-audio-processing.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "ffmpeg_available": false,
  "message": "Backend is online and ready"
}
```

⚠️ **Note:** `ffmpeg_available: false` is expected - we'll add it in Option 2 if needed

### **Step 6: Test Working Endpoints**

✅ **These endpoints work WITHOUT FFmpeg:**
- Health check: `GET /health`

❌ **These endpoints need FFmpeg (Option 2):**
- Audio editor: `POST /api/edit-audio`
- Video splitter: `POST /api/split-video`
- Audio converter: `POST /api/convert-audio`

---

## 🔧 OPTION 2: Enable FFmpeg (Full Features)

### **Method A: Add Native Build Pack (EASIER)**

1. In Render Dashboard → Your Service → **Settings**
2. Scroll to **"Build & Deploy"**
3. Click **"Add Build Command"**
4. Update to:
```bash
apt-get update && apt-get install -y ffmpeg && pip install --upgrade pip && pip install -r requirements.txt
```
5. Click **"Save Changes"**
6. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

### **Method B: Use Docker (MORE RELIABLE)**

**Step 1: Update render.yaml**
```yaml
services:
  - type: web
    name: back2life-audio-processing
    runtime: docker
    region: oregon
    plan: free
    dockerfilePath: ./Dockerfile
    dockerContext: ./
    healthCheckPath: /health
    autoDeploy: true
```

**Step 2: Commit and Push**
```bash
git add python-backend/render.yaml
git commit -m "feat: Switch to Docker runtime for FFmpeg support"
git push origin main
```

**Step 3: Render Auto-Deploys**
- Render detects change
- Rebuilds with Docker
- FFmpeg now available ✅

---

## 🧪 Testing After Deployment

### **Test 1: Health Check**
```bash
curl https://back2life-audio-processing.onrender.com/health
```

Expected: `{"status": "healthy", "ffmpeg_available": true}`

### **Test 2: Audio Editor Endpoint**
```bash
curl -X POST https://back2life-audio-processing.onrender.com/api/edit-audio \
  -F "file=@test.mp3" \
  -F "trim_start=10" \
  -F "trim_end=30" \
  -F "volume=1.5" \
  -F "speed=1.0" \
  --output edited.mp3
```

Expected: Downloads `edited.mp3` successfully

### **Test 3: Video Splitter**
```bash
curl -X POST https://back2life-audio-processing.onrender.com/api/split-video \
  -F "file=@test.mp4" \
  -F "segment_length=30" \
  --output segments.zip
```

Expected: Downloads `segments.zip` with video segments

---

## 🐛 Troubleshooting

### **Problem: "Build failed" - Command not found**
**Cause:** Build command syntax error

**Fix:**
1. Go to Settings → Build & Deploy
2. Verify Build Command is exactly:
```bash
pip install --upgrade pip && pip install -r requirements.txt
```
3. No extra spaces, line breaks, or special characters

---

### **Problem: "Application failed to start"**
**Cause:** Gunicorn can't find `app:app`

**Fix:**
1. Verify `app.py` is in `python-backend/` directory
2. Check Start Command is exactly:
```bash
gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 300 app:app
```
3. Verify no `if __name__ == "__main__":` block in `app.py` ✅ (Already fixed)

---

### **Problem: "502 Bad Gateway" after deployment**
**Cause:** Service is sleeping (free tier) or PORT misconfiguration

**Fix:**
1. Wait 30-45 seconds for cold start
2. Refresh browser
3. Verify `$PORT` environment variable is used in start command ✅

---

### **Problem: "FFmpeg not found" in logs**
**Cause:** FFmpeg not installed

**Fix:**
- Use **Option 2: Method B (Docker runtime)**
- Docker includes FFmpeg in the image

---

### **Problem: "ModuleNotFoundError: No module named 'flask'"**
**Cause:** Dependencies not installed

**Fix:**
1. Verify `requirements.txt` exists in `python-backend/`
2. Check Root Directory is set to `python-backend` ✅
3. Trigger manual redeploy

---

### **Problem: Logs show "Address already in use"**
**Cause:** PORT conflict or Gunicorn issue

**Fix:**
1. Verify Start Command uses `$PORT` (not hardcoded 5000)
2. Check for multiple Gunicorn processes
3. Restart service from Render dashboard

---

## 📊 Deployment Comparison

| Feature | Option 1 (Python) | Option 2 (Docker) |
|---------|-------------------|-------------------|
| **Build Time** | ~2-3 minutes | ~5-8 minutes |
| **FFmpeg Support** | ❌ (requires apt-get) | ✅ Included |
| **Complexity** | Simple | Moderate |
| **Best For** | Quick testing | Production |
| **Free Tier** | ✅ Yes | ✅ Yes |

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Service is "Live" in Render dashboard
- [ ] Health check returns `{"status": "healthy"}`
- [ ] No errors in logs
- [ ] Can access: `https://back2life-audio-processing.onrender.com/health`
- [ ] FFmpeg available (if using Docker): `"ffmpeg_available": true`
- [ ] Audio editor endpoint works (if FFmpeg enabled)

---

## 🎯 Recommended Deployment Path

**For immediate deployment:**
1. Use **Option 1** (Python runtime) - Get backend online in 2-3 minutes
2. Test health endpoint
3. Verify frontend can connect

**For full features:**
1. Switch to **Option 2, Method B** (Docker runtime)
2. Wait 5-8 minutes for Docker build
3. Verify FFmpeg is available
4. Test audio/video endpoints

---

## 📝 Next Steps After Deployment

1. ✅ Update frontend `.env.local` with Render URL (already done)
2. ✅ Redeploy Vercel frontend
3. ✅ Test Audio Editor tool end-to-end
4. ✅ Monitor logs for errors
5. ✅ Set up uptime monitoring (UptimeRobot, etc.)

---

## 💰 Cost Tracking

**Free Tier Limits:**
- 750 hours/month runtime
- Sleeps after 15 minutes inactivity
- First request wakes in ~30 seconds

**Upgrade Path:**
- **Starter:** $7/month - Always-on, no sleep
- **Standard:** $25/month - More resources

**Estimated Free Tier Usage:**
- Development: ~100 hours/month
- Light production: ~300-500 hours/month
- Heavy usage: Need paid plan

---

## 🔗 Useful Links

- Render Dashboard: https://dashboard.render.com
- Service Logs: https://dashboard.render.com/web/[service-id]/logs
- Service Settings: https://dashboard.render.com/web/[service-id]/settings
- Render Docs: https://render.com/docs
- Render Status: https://status.render.com

---

## 🎉 You're Ready!

Your backend is now properly configured for Render deployment. Choose your deployment option and follow the steps above!

**Need help?** Check the Troubleshooting section or contact Render support.