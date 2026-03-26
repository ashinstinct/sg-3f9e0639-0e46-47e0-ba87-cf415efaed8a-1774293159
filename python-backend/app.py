from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import tempfile
import uuid
from pathlib import Path
import logging
import zipfile
import shutil
import subprocess
import requests
import base64
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Configuration
UPLOAD_FOLDER = tempfile.gettempdir()
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB max file size
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'flac', 'ogg', 'm4a', 'aiff', 'opus', 'mp4', 'mov', 'avi', 'mkv', 'webm'}
ALLOWED_OUTPUT_FORMATS = {'mp3', 'wav', 'flac', 'ogg', 'm4a', 'aiff', 'opus'}
ALLOWED_AUDIO_FORMATS = {'mp3', 'wav', 'flac', 'ogg', 'm4a', 'aiff', 'opus'}

# Hugging Face API Configuration
HF_TOKEN = os.getenv('HF_TOKEN', '')
HF_ENHANCE_API_URL = "https://api-inference.huggingface.co/models/ResembleAI/resemble-enhance"

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def allowed_audio_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_AUDIO_FORMATS


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    # Check if FFmpeg is available
    ffmpeg_available = False
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True, timeout=5)
        ffmpeg_available = result.returncode == 0
    except Exception as e:
        logger.warning(f"FFmpeg check failed: {e}")
    
    # Check if HF API token is configured - WITH DEBUG INFO
    hf_token_value = os.getenv('HF_TOKEN', '')
    hf_configured = bool(hf_token_value and hf_token_value != 'your_hugging_face_token_here')
    
    # Debug logging (only log first 7 chars for security)
    token_preview = hf_token_value[:7] + '...' if len(hf_token_value) > 7 else hf_token_value
    logger.info(f"HF_TOKEN check - Exists: {bool(hf_token_value)}, Preview: '{token_preview}', Length: {len(hf_token_value)}")
    
    return jsonify({
        'status': 'healthy',
        'ffmpeg_available': ffmpeg_available,
        'hf_api_configured': hf_configured,
        'hf_token_debug': {
            'exists': bool(hf_token_value),
            'length': len(hf_token_value),
            'preview': token_preview,
            'is_placeholder': hf_token_value == 'your_hugging_face_token_here'
        },
        'message': 'Backend is online and ready'
    })


@app.route('/api/split-video', methods=['POST'])
def split_video():
    """
    Split video into equal length segments using FFmpeg
    Expects: video file, segment_length (in seconds)
    Returns: ZIP file with separated video segments
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    segment_length = request.form.get('segment_length', '30')
    try:
        segment_length = int(segment_length)
    except ValueError:
        return jsonify({'error': 'Invalid segment length'}), 400

    try:
        job_id = str(uuid.uuid4())
        temp_dir = Path(tempfile.mkdtemp(prefix=f'split_{job_id}_'))
        
        filename = secure_filename(file.filename)
        input_path = temp_dir / filename
        file.save(str(input_path))
        
        logger.info(f"Splitting video: {filename} into {segment_length}s segments")
        
        output_pattern = str(temp_dir / f"{Path(filename).stem}_part%03d{Path(filename).suffix}")
        
        # FFmpeg command to split by time (copies stream for fast splitting without re-encoding)
        ffmpeg_cmd = [
            'ffmpeg', '-i', str(input_path),
            '-c', 'copy',
            '-map', '0',
            '-segment_time', str(segment_length),
            '-f', 'segment',
            '-reset_timestamps', '1',
            output_pattern
        ]
        
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True, check=True, timeout=300)
        logger.info(f"FFmpeg split completed successfully")
        
        # Zip the files
        zip_filename = f"{Path(filename).stem}_segments.zip"
        zip_path = temp_dir / zip_filename
        
        segment_files = list(temp_dir.glob(f"{Path(filename).stem}_part*{Path(filename).suffix}"))
        if not segment_files:
            raise Exception("No segments were created")
        
        logger.info(f"Creating ZIP with {len(segment_files)} segments")
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for f in segment_files:
                zipf.write(f, f.name)
                
        response = send_file(
            str(zip_path),
            mimetype='application/zip',
            as_attachment=True,
            download_name=zip_filename
        )
        
        @response.call_on_close
        def cleanup():
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
                logger.info(f"Cleaned up temp directory: {temp_dir}")
            except Exception as e:
                logger.error(f"Cleanup error: {e}")
                
        return response

    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg split error: {e.stderr}")
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': f'Video split failed: {e.stderr}'}), 500
    except subprocess.TimeoutExpired:
        logger.error("FFmpeg process timeout")
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': 'Processing timeout - video may be too large'}), 500
    except Exception as e:
        logger.error(f"Video splitting error: {e}")
        try:
            if 'temp_dir' in locals():
                shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': str(e)}), 500


@app.route('/api/convert-audio', methods=['POST'])
def convert_audio():
    """
    Convert audio files between different formats using FFmpeg
    Expects: audio file, output_format, bitrate (optional)
    Returns: converted audio file
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    output_format = request.form.get('output_format', 'mp3').lower()
    bitrate = request.form.get('bitrate', '192')

    if output_format not in ALLOWED_OUTPUT_FORMATS:
        return jsonify({'error': f'Unsupported output format: {output_format}'}), 400

    try:
        job_id = str(uuid.uuid4())
        temp_dir = Path(tempfile.mkdtemp(prefix=f'convert_{job_id}_'))

        filename = secure_filename(file.filename)
        input_path = temp_dir / filename
        file.save(str(input_path))

        logger.info(f"Converting audio: {filename} -> {output_format}")

        output_filename = f"{Path(filename).stem}_converted.{output_format}"
        output_path = temp_dir / output_filename

        # Build FFmpeg command based on output format
        ffmpeg_cmd = ['ffmpeg', '-i', str(input_path)]

        if output_format == 'mp3':
            ffmpeg_cmd.extend(['-codec:a', 'libmp3lame', '-b:a', f'{bitrate}k'])
        elif output_format == 'wav':
            ffmpeg_cmd.extend(['-codec:a', 'pcm_s16le'])
        elif output_format == 'ogg':
            ffmpeg_cmd.extend(['-codec:a', 'libvorbis', '-b:a', f'{bitrate}k'])
        elif output_format == 'flac':
            ffmpeg_cmd.extend(['-codec:a', 'flac'])
        elif output_format == 'm4a':
            ffmpeg_cmd.extend(['-codec:a', 'aac', '-b:a', f'{bitrate}k'])
        elif output_format == 'aiff':
            ffmpeg_cmd.extend(['-codec:a', 'pcm_s16be'])
        elif output_format == 'opus':
            ffmpeg_cmd.extend(['-codec:a', 'libopus', '-b:a', f'{bitrate}k'])

        ffmpeg_cmd.extend(['-y', str(output_path)])

        result = subprocess.run(
            ffmpeg_cmd,
            capture_output=True,
            text=True,
            check=True,
            timeout=300
        )

        if not output_path.exists():
            raise Exception("Conversion failed - output file not created")

        logger.info(f"Audio conversion completed: {output_path}")

        mime_types = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'flac': 'audio/flac',
            'm4a': 'audio/mp4',
            'aiff': 'audio/aiff',
            'opus': 'audio/opus'
        }
        mime_type = mime_types.get(output_format, 'audio/mpeg')

        response = send_file(
            str(output_path),
            mimetype=mime_type,
            as_attachment=True,
            download_name=output_filename
        )

        @response.call_on_close
        def cleanup():
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception as e:
                logger.error(f"Cleanup error: {e}")

        return response

    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg conversion error: {e.stderr}")
        try:
            if 'temp_dir' in locals():
                shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': f'Conversion failed: {e.stderr}'}), 500
    except subprocess.TimeoutExpired:
        logger.error("FFmpeg process timeout")
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': 'Processing timeout'}), 500
    except Exception as e:
        logger.error(f"Audio conversion error: {e}")
        try:
            if 'temp_dir' in locals():
                shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': str(e)}), 500


@app.route('/api/edit-audio', methods=['POST'])
def edit_audio():
    """
    Edit audio with trim, fade, volume, and speed adjustments using FFmpeg
    Expects: audio file, trim_start, trim_end, fade_in, fade_out, volume, speed
    Returns: edited audio file
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_audio_file(file.filename):
        return jsonify({'error': 'Invalid audio file type'}), 400

    try:
        # Get editing parameters
        trim_start = float(request.form.get('trim_start', 0))
        trim_end = float(request.form.get('trim_end', 0))
        fade_in = float(request.form.get('fade_in', 0))
        fade_out = float(request.form.get('fade_out', 0))
        volume = float(request.form.get('volume', 1.0))  # 1.0 = 100%, 0.5 = 50%, 2.0 = 200%
        speed = float(request.form.get('speed', 1.0))

        # Validate parameters
        if volume < 0 or volume > 2.0:
            return jsonify({'error': 'Volume must be between 0 and 2.0'}), 400
        if speed < 0.5 or speed > 2.0:
            return jsonify({'error': 'Speed must be between 0.5 and 2.0'}), 400

        job_id = str(uuid.uuid4())
        temp_dir = Path(tempfile.mkdtemp(prefix=f'edit_{job_id}_'))

        filename = secure_filename(file.filename)
        input_path = temp_dir / filename
        file.save(str(input_path))

        logger.info(f"Editing audio: {filename}")
        logger.info(f"Parameters - trim: {trim_start}-{trim_end}s, fade: {fade_in}/{fade_out}s, volume: {volume:.2f}x, speed: {speed}x")

        output_filename = f"{Path(filename).stem}_edited.mp3"
        output_path = temp_dir / output_filename

        # Build FFmpeg filter complex
        filters = []
        
        # Speed adjustment (atempo - must be between 0.5 and 2.0)
        if speed != 1.0:
            # FFmpeg atempo only supports 0.5-2.0 range, so we chain multiple if needed
            if speed < 0.5:
                speed = 0.5
            elif speed > 2.0:
                speed = 2.0
            filters.append(f'atempo={speed}')

        # Volume adjustment
        if volume != 1.0:
            filters.append(f'volume={volume}')

        # Fade in
        if fade_in > 0:
            filters.append(f'afade=t=in:st=0:d={fade_in}')

        # Fade out (calculate from end of trimmed audio)
        if fade_out > 0 and trim_end > 0:
            duration = trim_end - trim_start
            fade_start = duration - fade_out
            if fade_start > 0:
                filters.append(f'afade=t=out:st={fade_start}:d={fade_out}')

        # Build FFmpeg command
        ffmpeg_cmd = ['ffmpeg', '-i', str(input_path)]

        # Add trim if specified
        if trim_start > 0:
            ffmpeg_cmd.extend(['-ss', str(trim_start)])
        if trim_end > 0:
            duration = trim_end - trim_start
            ffmpeg_cmd.extend(['-t', str(duration)])

        # Add audio filters
        if filters:
            filter_chain = ','.join(filters)
            ffmpeg_cmd.extend(['-af', filter_chain])

        # Output settings
        ffmpeg_cmd.extend([
            '-codec:a', 'libmp3lame',
            '-b:a', '192k',
            '-y',
            str(output_path)
        ])

        logger.info(f"FFmpeg command: {' '.join(ffmpeg_cmd)}")

        result = subprocess.run(
            ffmpeg_cmd,
            capture_output=True,
            text=True,
            check=True,
            timeout=300
        )

        if not output_path.exists():
            raise Exception("Audio editing failed - output file not created")

        logger.info(f"Audio editing completed: {output_path}")

        response = send_file(
            str(output_path),
            mimetype='audio/mpeg',
            as_attachment=True,
            download_name=output_filename
        )

        @response.call_on_close
        def cleanup():
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
                logger.info(f"Cleaned up temp directory: {temp_dir}")
            except Exception as e:
                logger.error(f"Cleanup error: {e}")

        return response

    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg editing error: {e.stderr}")
        try:
            if 'temp_dir' in locals():
                shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': f'Audio editing failed: {e.stderr}'}), 500
    except subprocess.TimeoutExpired:
        logger.error("FFmpeg process timeout")
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': 'Processing timeout'}), 500
    except ValueError as e:
        logger.error(f"Invalid parameter: {e}")
        return jsonify({'error': f'Invalid parameter: {str(e)}'}), 400
    except Exception as e:
        logger.error(f"Audio editing error: {e}")
        try:
            if 'temp_dir' in locals():
                shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': str(e)}), 500


@app.route('/api/enhance-audio', methods=['POST'])
def enhance_audio():
    """
    Enhance audio quality using Hugging Face API (ResembleAI) or FFmpeg fallback
    Expects: audio file
    Returns: enhanced audio file
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_audio_file(file.filename):
        return jsonify({'error': 'Invalid audio file type'}), 400

    try:
        job_id = str(uuid.uuid4())
        temp_dir = Path(tempfile.mkdtemp(prefix=f'enhance_{job_id}_'))

        filename = secure_filename(file.filename)
        input_path = temp_dir / filename
        file.save(str(input_path))

        logger.info(f"Enhancing audio: {filename}")

        # Check if HF API is configured
        use_hf_api = bool(HF_TOKEN and HF_TOKEN != 'your_hugging_face_token_here')

        if use_hf_api:
            logger.info("Using Hugging Face API for enhancement")
            try:
                # Read audio file as bytes
                with open(input_path, 'rb') as f:
                    audio_bytes = f.read()

                # Call Hugging Face API
                headers = {
                    "Authorization": f"Bearer {HF_TOKEN}",
                    "Content-Type": "application/octet-stream"
                }

                logger.info(f"Calling HF API: {HF_ENHANCE_API_URL}")
                response = requests.post(
                    HF_ENHANCE_API_URL,
                    headers=headers,
                    data=audio_bytes,
                    timeout=120
                )

                if response.status_code == 200:
                    # Save enhanced audio
                    output_filename = f"{Path(filename).stem}_enhanced.wav"
                    output_path = temp_dir / output_filename

                    with open(output_path, 'wb') as f:
                        f.write(response.content)

                    logger.info(f"HF API enhancement completed: {output_path}")

                    response_file = send_file(
                        str(output_path),
                        mimetype='audio/wav',
                        as_attachment=True,
                        download_name=output_filename
                    )

                    @response_file.call_on_close
                    def cleanup():
                        try:
                            shutil.rmtree(temp_dir, ignore_errors=True)
                        except Exception as e:
                            logger.error(f"Cleanup error: {e}")

                    return response_file
                else:
                    logger.warning(f"HF API returned {response.status_code}: {response.text}")
                    logger.info("Falling back to FFmpeg enhancement")
                    use_hf_api = False

            except requests.exceptions.Timeout:
                logger.warning("HF API timeout - falling back to FFmpeg")
                use_hf_api = False
            except Exception as e:
                logger.warning(f"HF API error: {e} - falling back to FFmpeg")
                use_hf_api = False

        # FFmpeg fallback (or primary if HF not configured)
        if not use_hf_api:
            logger.info("Using FFmpeg for audio enhancement")

            output_filename = f"{Path(filename).stem}_enhanced.wav"
            output_path = temp_dir / output_filename

            # FFmpeg enhancement filters
            ffmpeg_cmd = [
                'ffmpeg', '-i', str(input_path),
                '-af', 'afftdn=nf=-25,highpass=f=80,loudnorm=I=-16:TP=-1.5:LRA=11,compand=attacks=0.3:decays=0.8:points=-80/-80|-45/-15|-27/-9|0/-7|20/-7:soft-knee=6:gain=0:volume=0:delay=0.05',
                '-ar', '44100',
                '-ac', '2',
                '-y',
                str(output_path)
            ]

            result = subprocess.run(
                ffmpeg_cmd,
                capture_output=True,
                text=True,
                check=True,
                timeout=300
            )

            if not output_path.exists():
                raise Exception("FFmpeg enhancement failed - output file not created")

            logger.info(f"FFmpeg enhancement completed: {output_path}")

            response_file = send_file(
                str(output_path),
                mimetype='audio/wav',
                as_attachment=True,
                download_name=output_filename
            )

            @response_file.call_on_close
            def cleanup():
                try:
                    shutil.rmtree(temp_dir, ignore_errors=True)
                except Exception as e:
                    logger.error(f"Cleanup error: {e}")

            return response_file

    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg enhancement error: {e.stderr}")
        try:
            if 'temp_dir' in locals():
                shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': f'Audio enhancement failed: {e.stderr}'}), 500
    except subprocess.TimeoutExpired:
        logger.error("FFmpeg process timeout")
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': 'Processing timeout'}), 500
    except Exception as e:
        logger.error(f"Audio enhancement error: {e}")
        try:
            if 'temp_dir' in locals():
                shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': str(e)}), 500


@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'File too large. Maximum size is 100MB'}), 413


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# App is ready - no __main__ block needed for Gunicorn
# Gunicorn will import 'app' directly