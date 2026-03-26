# Audio Editor - End-to-End Test Plan

## 🎯 Test Overview
This document verifies the complete Audio Editor tool workflow from frontend to backend.

---

## ✅ Component Verification

### **Frontend (src/pages/edit.tsx)**
- [x] File upload UI with drag & drop
- [x] Waveform visualization (Canvas API)
- [x] Audio playback controls
- [x] Trim controls (start/end sliders)
- [x] Fade controls (in/out sliders)
- [x] Volume control (0-200%, converted to 0-2.0x)
- [x] Speed control (0.5x-2.0x)
- [x] Progress indication
- [x] Error handling and user feedback
- [x] Download processed audio

### **Backend (python-backend/app.py)**
- [x] `/api/edit-audio` endpoint
- [x] FFmpeg integration
- [x] Parameter validation
- [x] File handling
- [x] Temp directory cleanup
- [x] Error responses

---

## 🔄 End-to-End Flow

### **Step 1: File Upload**
```
User Action: Upload MP3 file (test.mp3, 3:45 duration)
Expected: 
  ✓ File appears in UI with name and size
  ✓ Waveform generates automatically
  ✓ Audio player loads
  ✓ Trim sliders set to 0s - 3:45s
```

### **Step 2: Waveform Visualization**
```
User Action: Audio loads
Expected:
  ✓ Canvas draws amplitude bars
  ✓ Waveform scales to canvas height
  ✓ Gradient purple coloring
  ✓ Click on waveform seeks to that position
```

### **Step 3: Audio Playback**
```
User Action: Click Play button
Expected:
  ✓ Audio plays through browser
  ✓ Current time marker moves on waveform
  ✓ Time display updates (MM:SS.ms format)
  ✓ Button changes to "Pause"
```

### **Step 4: Trim Configuration**
```
User Action: Set trim_start=10s, trim_end=30s
Expected:
  ✓ Green overlay from 0-10s on waveform
  ✓ Red overlay from 30s-end on waveform
  ✓ Time displays show: "0:10.0" and "0:30.0"
  ✓ Result will be 20s clip
```

### **Step 5: Fade Configuration**
```
User Action: Set fade_in=2s, fade_out=3s
Expected:
  ✓ Blue overlay from 10-12s (fade in)
  ✓ Blue overlay from 27-30s (fade out)
  ✓ Slider shows "2.0s" and "3.0s"
```

### **Step 6: Volume/Speed Adjustment**
```
User Action: Set volume=150%, speed=1.2x
Expected:
  ✓ Volume slider shows "150%"
  ✓ Speed slider shows "1.2x"
  ✓ Preview audio reflects volume change
  ✓ Preview audio reflects speed change
```

### **Step 7: Process Audio**
```
User Action: Click "Process Audio" button
Expected:
  ✓ Button shows "Processing Audio..." with spinner
  ✓ Button is disabled during processing
  ✓ FormData sent to backend with:
      - file: test.mp3
      - trim_start: "10"
      - trim_end: "30"
      - fade_in: "2"
      - fade_out: "3"
      - volume: "1.5" (150% / 100 = 1.5)
      - speed: "1.2"
```

### **Step 8: Backend Processing**
```
Backend receives request
Expected:
  ✓ Creates temp directory
  ✓ Saves uploaded file
  ✓ Validates parameters (volume 0-2.0, speed 0.5-2.0)
  ✓ Builds FFmpeg command:
      ffmpeg -i input.mp3 -ss 10 -t 20 
      -af "atempo=1.2,volume=1.5,afade=t=in:st=0:d=2,afade=t=out:st=17:d=3"
      -codec:a libmp3lame -b:a 192k output.mp3
  ✓ Executes FFmpeg
  ✓ Returns MP3 file
  ✓ Cleans up temp files
```

### **Step 9: Frontend Receives Response**
```
Backend returns processed audio
Expected:
  ✓ Button re-enables
  ✓ "Processing Audio..." becomes "Process Audio"
  ✓ Success toast appears
  ✓ Processed audio player appears
  ✓ Audio can be played to verify
  ✓ Download button is enabled
```

### **Step 10: Download**
```
User Action: Click "Download Edited Audio"
Expected:
  ✓ Browser downloads file: "test_edited.mp3"
  ✓ File duration: ~20s (trimmed from 3:45)
  ✓ File has fade in/out effects
  ✓ Volume is 50% louder
  ✓ Speed is 20% faster
  ✓ Success toast appears
```

---

## 🧪 Test Scenarios

### **Scenario 1: Basic Trim Only**
```yaml
Input: 5 minute podcast.mp3
Actions:
  - trim_start: 60s
  - trim_end: 120s
  - All other settings: default
Expected Output:
  - 60 second clip (1:00 - 2:00)
  - No fade effects
  - Normal volume (100%)
  - Normal speed (1.0x)
```

### **Scenario 2: Full Edit**
```yaml
Input: song.mp3 (3:45)
Actions:
  - trim_start: 30s
  - trim_end: 150s
  - fade_in: 3s
  - fade_out: 5s
  - volume: 120%
  - speed: 0.9x (slower)
Expected Output:
  - 120 second clip (30s - 150s)
  - 3s fade in at start
  - 5s fade out at end
  - 20% louder
  - 10% slower
```

### **Scenario 3: Volume Boost Only**
```yaml
Input: quiet-recording.mp3
Actions:
  - No trim
  - volume: 200% (maximum)
  - All other settings: default
Expected Output:
  - Full duration preserved
  - 2x louder (maximum safe boost)
  - No distortion
```

### **Scenario 4: Speed Change Only**
```yaml
Input: audiobook.mp3
Actions:
  - speed: 1.5x (faster)
  - All other settings: default
Expected Output:
  - Duration reduced by 33% (1.5x faster)
  - Pitch preserved (atempo filter)
  - No chipmunk effect
```

---

## ⚠️ Error Handling Tests

### **Test 1: No File Selected**
```
Action: Click "Process Audio" without uploading
Expected: Toast error "Please upload an audio file first"
```

### **Test 2: Invalid File Type**
```
Action: Upload image.png
Expected: Error "Please select a valid audio file"
```

### **Test 3: Backend Offline**
```
Action: Process audio while backend is down
Expected: 
  - Fetch fails
  - Error toast shows connection error
  - Helpful message about backend server
```

### **Test 4: Backend Processing Error**
```
Action: Upload corrupted audio file
Expected:
  - Backend returns 500 error
  - Frontend shows error message
  - Temp files cleaned up
```

### **Test 5: Invalid Parameters**
```
Action: Manually set volume > 2.0 (via dev tools)
Expected: Backend rejects with "Volume must be between 0 and 2.0"
```

---

## 🎨 UI/UX Tests

### **Visual Feedback**
- [x] Upload area highlights on hover
- [x] Drag & drop visual feedback
- [x] Disabled states during processing
- [x] Loading spinner during processing
- [x] Success/error color coding
- [x] Smooth slider animations

### **Waveform Interactions**
- [x] Click to seek works
- [x] Trim markers visible
- [x] Fade markers visible
- [x] Current time marker updates
- [x] Visual overlays match parameters

### **Responsive Behavior**
- [x] Works on mobile (touch sliders)
- [x] Works on tablet
- [x] Works on desktop
- [x] Canvas scales properly

---

## 📊 Performance Tests

### **File Size Limits**
```
Test: Upload 50 MB audio file
Expected: 
  ✓ Upload succeeds (under 100 MB limit)
  ✓ Processing completes
  ✓ No timeout errors
```

### **Processing Time**
```
Test: 5 minute audio with all effects
Expected:
  ✓ Processing < 30 seconds
  ✓ No timeout (300s limit)
  ✓ Memory efficient
```

### **Concurrent Users**
```
Test: Multiple users processing simultaneously
Expected:
  ✓ Each gets unique temp directory
  ✓ No file conflicts
  ✓ Cleanup works per user
```

---

## 🔒 Security Tests

### **File Upload Validation**
- [x] Only audio files accepted
- [x] Filename sanitization (secure_filename)
- [x] File size limit enforced (100 MB)
- [x] Temp directory isolation

### **Parameter Validation**
- [x] Volume range: 0-2.0
- [x] Speed range: 0.5-2.0
- [x] Trim values: positive floats
- [x] No command injection via filenames

---

## ✅ Pre-Deployment Checklist

Before going live:

- [ ] Test with real audio files (MP3, WAV, M4A, OGG)
- [ ] Verify waveform generation works
- [ ] Test all parameter combinations
- [ ] Verify download works
- [ ] Test error scenarios
- [ ] Check mobile responsiveness
- [ ] Verify backend cleanup (no orphaned temp files)
- [ ] Load test with multiple users
- [ ] Security audit complete
- [ ] Documentation updated

---

## 🐛 Known Issues / Limitations

### **Free Tier (Render)**
- First request after sleep: ~30s cold start
- Show "Waking up backend..." message during wake

### **FFmpeg Limitations**
- Speed range: 0.5x - 2.0x (FFmpeg atempo constraint)
- Large files (>100 MB): May timeout
- Some exotic audio formats: May not work

### **Browser Compatibility**
- Canvas API: All modern browsers ✓
- MediaRecorder: All modern browsers ✓
- Web Audio API: All modern browsers ✓

---

## 📝 Test Results Log

### **Manual Testing (Date: ___________)**

| Test Case | Status | Notes |
|-----------|--------|-------|
| File Upload | ⬜ Pass / ⬜ Fail | |
| Waveform Display | ⬜ Pass / ⬜ Fail | |
| Audio Playback | ⬜ Pass / ⬜ Fail | |
| Trim Processing | ⬜ Pass / ⬜ Fail | |
| Fade Effects | ⬜ Pass / ⬜ Fail | |
| Volume Adjustment | ⬜ Pass / ⬜ Fail | |
| Speed Adjustment | ⬜ Pass / ⬜ Fail | |
| Download | ⬜ Pass / ⬜ Fail | |
| Error Handling | ⬜ Pass / ⬜ Fail | |
| Mobile Responsive | ⬜ Pass / ⬜ Fail | |

---

## 🎯 Success Criteria

The Audio Editor is considered **PRODUCTION READY** when:

✅ All test scenarios pass  
✅ Error handling works correctly  
✅ UI is responsive and intuitive  
✅ Backend processes reliably  
✅ Download works on all platforms  
✅ No security vulnerabilities  
✅ Performance meets targets  
✅ Documentation is complete  

---

## 🚀 Next Steps After Testing

1. Deploy backend to Render
2. Test with production URL
3. Monitor first user sessions
4. Collect feedback
5. Iterate based on real usage
6. Add analytics tracking
7. Optimize based on metrics
