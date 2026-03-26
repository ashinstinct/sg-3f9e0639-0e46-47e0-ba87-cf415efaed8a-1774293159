# 🐳 Docker Deployment on Render - Simple Guide

## ✅ Configuration Ready

Your backend is now configured for Docker deployment on Render with:
- ✅ Dockerfile optimized for Render
- ✅ FFmpeg pre-installed
- ✅ Gunicorn server
- ✅ Auto PORT handling
- ✅ render.yaml configured

---

## 🚀 Deploy in 3 Steps (5 minutes)

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "feat(deploy): Configure backend for Render Docker deployment"
git push origin main
```

### **Step 2: Create Render Service**

1. Go to **https://render.com/dashboard**
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select **"Back2Life.Studio"** (or your repo name)

### **Step 3: Configure (Copy these EXACT values)**

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `back2life-audio-processing` | Must match render.yaml |
| **Region** | `Oregon (US West)` | Best for US users |
| **Root Directory** | `python-backend` | ⚠️ CRITICAL - folder with Dockerfile |
| **Environment** | `Docker` | Auto-detected from Dockerfile |
| **Docker Command** | Leave EMPTY | Uses CMD from Dockerfile |
| **Plan** | `Free` | 750 hours/month free |

**Advanced Settings (Optional):**
- Health Check Path: `/health` ✅
- Auto-Deploy: `Yes` ✅

**Click: "Create Web Service"**

---

## ⏱️ What Happens Next (5-8 minutes)

Render will:
1. ✅ Clone your repository
2. ✅ Build Docker image (installs FFmpeg + Python deps)
3. ✅ Start Gunicorn server
4. ✅ Service goes live at: `https://back2life-audio-processing.onrender.com`

**Watch the logs - you'll see:**
```
==> Cloning from https://github.com/...
==> Building...
Step 1/7 : FROM python:3.11-slim
Step 2/7 : WORKDIR /app
Step 3/7 : RUN apt-get update && apt-get install -y ffmpeg
Step 4/7 : COPY requirements.txt .
Step 5/7 : RUN pip install -r requirements.txt
Step 6/7 : COPY . .
Step 7/7 : CMD gunicorn...
==> Deploying...
==> Your service is live 🎉
```

---

## ✅ Test Deployment (30 seconds)

**Once live, test the health endpoint:**

Open in browser:
```
https://back2life-audio-processing.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "ffmpeg_available": true,
  "message": "Backend is online and ready"
}
```

**If you see this ✅ - Backend is fully working!**

---

## 🎯 What's Available

Your backend now has 3 working endpoints:

### **1. Health Check**
```
GET /health
```
Returns server status + FFmpeg availability

### **2. Audio Editor**
```
POST /api/edit-audio
```
Trim, fade, volume, speed adjustments

### **3. Video Splitter**
```
POST /api/split-video
```
Split video into timed segments

### **4. Audio Converter**
```
POST /api/convert-audio
```
Convert between MP3, WAV, M4A, etc.

---

## 🐛 Troubleshooting

### **"Build failed" Error**

**Cause:** Docker build timeout

**Fix:**
1. In Render Dashboard → Settings
2. Set "Docker Build Timeout" to **10 minutes**
3. Click "Manual Deploy" → "Clear build cache & deploy"

---

### **"Service Unavailable" Error**

**Cause:** Free tier sleep (after 15 min inactivity)

**What happens:**
- First request after sleep: ~30-45 seconds to wake up
- Shows "Service starting..." message
- Then works normally

**Not an error** - this is expected behavior on free tier!

---

### **FFmpeg Not Available**

**Check logs for:**
```
Step 3/7 : RUN apt-get update && apt-get install -y ffmpeg
```

**If missing:**
1. Verify `Dockerfile` exists in `python-backend/`
2. Verify Root Directory is set to `python-backend`
3. Redeploy

---

## 📊 Monitor Your Service

In Render Dashboard you can:
- ✅ View real-time logs
- ✅ Monitor CPU/Memory usage
- ✅ Check request counts
- ✅ See deployment history
- ✅ Restart service if needed

---

## 🎉 Success Checklist

- [ ] Service shows "Live" status in Render
- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] `ffmpeg_available: true` in health response
- [ ] No errors in logs
- [ ] Service URL is accessible

**Once all checked ✅ - Backend is PRODUCTION READY!**

---

## 🔗 Update Frontend

**In your Next.js project `.env.local`:**
```bash
NEXT_PUBLIC_BACKEND_URL=https://back2life-audio-processing.onrender.com
```

**Then redeploy Vercel:**
1. Go to Vercel Dashboard
2. Find your project
3. Click "Redeploy"
4. Wait 2-3 minutes
5. Frontend now connects to Render backend! 🎉

---

## ⚠️ Important Notes

### **Free Tier Limits:**
- 750 hours/month (plenty for testing)
- 512 MB RAM
- Sleeps after 15 min inactivity
- 30-45 sec cold start on first request

### **Upgrade Path:**
- **Starter:** $7/month
- Always-on (no sleep)
- 512 MB RAM
- Perfect for production

---

## 🚀 You're Done!

Your backend is now:
- ✅ Live on Render
- ✅ FFmpeg installed
- ✅ Auto-deploys on git push
- ✅ Ready for production use

**Next Steps:**
1. Test Audio Editor tool end-to-end
2. Test with real audio files
3. Monitor usage and performance
4. Build remaining tools!

---

**Questions?** Check Render docs or their support chat!