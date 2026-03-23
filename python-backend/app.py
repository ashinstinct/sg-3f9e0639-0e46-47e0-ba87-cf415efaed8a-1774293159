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

# Import AI models
try:
    from spleeter.separator import Separator
    SPLEETER_AVAILABLE = True
except ImportError:
    SPLEETER_AVAILABLE = False
    print("Warning: Spleeter not available. Install with: pip install spleeter")

try:
    from df.enhance import enhance, init_df
    from df.io import save_audio
    import torch
    DEEPFILTERNET_AVAILABLE = True
except ImportError:
    DEEPFILTERNET_AVAILABLE = False
    print("Warning: DeepFilterNet not available. Install with: pip install deepfilternet")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Configuration
UPLOAD_FOLDER = tempfile.gettempdir()
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB max file size
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'flac', 'ogg', 'm4a', 'aiff', 'opus'}
ALLOWED_OUTPUT_FORMATS = {'mp3', 'wav', 'flac', 'ogg', 'm4a', 'aiff', 'opus'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Initialize models on startup
spleeter_separator = None
deepfilter_model = None

if SPLEETER_AVAILABLE:
    try:
        # Initialize Spleeter with 4stems model (vocals, drums, bass, other)
        spleeter_separator = Separator('spleeter:4stems')
        logger.info("Spleeter initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Spleeter: {e}")

if DEEPFILTERNET_AVAILABLE:
    try:
        # Initialize DeepFilterNet model
        deepfilter_model, df_state, _ = init_df()
        logger.info("DeepFilterNet initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize DeepFilterNet: {e}")


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'spleeter_available': SPLEETER_AVAILABLE and spleeter_separator is not None,
        'deepfilternet_available': DEEPFILTERNET_AVAILABLE and deepfilter_model is not None
    })


@app.route('/api/separate-stems', methods=['POST'])
def separate_stems():
    """
    Separate audio into stems using Spleeter
    Expects: audio file
    Returns: ZIP file with separated stems (vocals, drums, bass, other)
    """
    if not SPLEETER_AVAILABLE or spleeter_separator is None:
        return jsonify({'error': 'Spleeter is not available'}), 503

    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    try:
        # Create unique temporary directories
        job_id = str(uuid.uuid4())
        input_dir = Path(tempfile.mkdtemp(prefix=f'spleeter_input_{job_id}_'))
        output_dir = Path(tempfile.mkdtemp(prefix=f'spleeter_output_{job_id}_'))

        # Save uploaded file
        filename = secure_filename(file.filename)
        input_path = input_dir / filename
        file.save(str(input_path))

        logger.info(f"Processing stem separation for: {filename}")

        # Run Spleeter
        spleeter_separator.separate_to_file(
            str(input_path),
            str(output_dir),
            codec='wav'
        )

        # Spleeter creates a subdirectory with the filename (without extension)
        stem_dir = output_dir / Path(filename).stem

        if not stem_dir.exists():
            raise Exception("Spleeter output directory not found")

        # Create ZIP file with all stems
        zip_path = output_dir / f'{Path(filename).stem}_stems.zip'
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for stem_file in stem_dir.glob('*.wav'):
                zipf.write(stem_file, stem_file.name)

        logger.info(f"Stem separation completed: {zip_path}")

        # Send ZIP file and clean up
        response = send_file(
            str(zip_path),
            mimetype='application/zip',
            as_attachment=True,
            download_name=f'{Path(filename).stem}_stems.zip'
        )

        # Clean up temporary files after sending response
        @response.call_on_close
        def cleanup():
            try:
                shutil.rmtree(input_dir, ignore_errors=True)
                shutil.rmtree(output_dir, ignore_errors=True)
            except Exception as e:
                logger.error(f"Cleanup error: {e}")

        return response

    except Exception as e:
        logger.error(f"Stem separation error: {e}")
        # Clean up on error
        try:
            if 'input_dir' in locals():
                shutil.rmtree(input_dir, ignore_errors=True)
            if 'output_dir' in locals():
                shutil.rmtree(output_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': str(e)}), 500


@app.route('/api/enhance-audio', methods=['POST'])
def enhance_audio():
    """
    Enhance audio quality using DeepFilterNet (AI noise reduction)
    Expects: audio file
    Returns: enhanced audio file
    """
    if not DEEPFILTERNET_AVAILABLE or deepfilter_model is None:
        return jsonify({'error': 'DeepFilterNet is not available'}), 503

    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    try:
        # Create unique temporary directory
        job_id = str(uuid.uuid4())
        temp_dir = Path(tempfile.mkdtemp(prefix=f'deepfilter_{job_id}_'))

        # Save uploaded file
        filename = secure_filename(file.filename)
        input_path = temp_dir / filename
        file.save(str(input_path))

        logger.info(f"Processing audio enhancement for: {filename}")

        # Run DeepFilterNet enhancement
        output_path = temp_dir / f'{Path(filename).stem}_enhanced.wav'
        
        # Load and enhance audio
        enhanced_audio, sample_rate = enhance(
            deepfilter_model,
            df_state,
            str(input_path)
        )

        # Save enhanced audio
        save_audio(
            str(output_path),
            enhanced_audio,
            sample_rate
        )

        logger.info(f"Audio enhancement completed: {output_path}")

        # Send enhanced file and clean up
        response = send_file(
            str(output_path),
            mimetype='audio/wav',
            as_attachment=True,
            download_name=f'{Path(filename).stem}_enhanced.wav'
        )

        # Clean up temporary files after sending response
        @response.call_on_close
        def cleanup():
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception as e:
                logger.error(f"Cleanup error: {e}")

        return response

    except Exception as e:
        logger.error(f"Audio enhancement error: {e}")
        # Clean up on error
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
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    # Get conversion parameters
    output_format = request.form.get('output_format', 'mp3').lower()
    bitrate = request.form.get('bitrate', '192')  # Default 192kbps

    if output_format not in ALLOWED_OUTPUT_FORMATS:
        return jsonify({'error': f'Unsupported output format: {output_format}'}), 400

    try:
        # Create unique temporary directory
        job_id = str(uuid.uuid4())
        temp_dir = Path(tempfile.mkdtemp(prefix=f'convert_{job_id}_'))

        # Save uploaded file
        filename = secure_filename(file.filename)
        input_path = temp_dir / filename
        file.save(str(input_path))

        logger.info(f"Converting audio: {filename} -> {output_format}")

        # Prepare output path
        output_filename = f"{Path(filename).stem}_converted.{output_format}"
        output_path = temp_dir / output_filename

        # Build FFmpeg command based on output format
        ffmpeg_cmd = ['ffmpeg', '-i', str(input_path)]

        # Add codec and quality settings based on format
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

        # Add output path and overwrite flag
        ffmpeg_cmd.extend(['-y', str(output_path)])

        # Run FFmpeg conversion
        result = subprocess.run(
            ffmpeg_cmd,
            capture_output=True,
            text=True,
            check=True
        )

        if not output_path.exists():
            raise Exception("Conversion failed - output file not created")

        logger.info(f"Audio conversion completed: {output_path}")

        # Determine MIME type
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

        # Send converted file and clean up
        response = send_file(
            str(output_path),
            mimetype=mime_type,
            as_attachment=True,
            download_name=output_filename
        )

        # Clean up temporary files after sending response
        @response.call_on_close
        def cleanup():
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception as e:
                logger.error(f"Cleanup error: {e}")

        return response

    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg conversion error: {e.stderr}")
        # Clean up on error
        try:
            if 'temp_dir' in locals():
                shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': f'Conversion failed: {e.stderr}'}), 500
    except Exception as e:
        logger.error(f"Audio conversion error: {e}")
        # Clean up on error
        try:
            if 'temp_dir' in locals():
                shutil.rmtree(temp_dir, ignore_errors=True)
        except:
            pass
        return jsonify({'error': str(e)}), 500


@app.route('/api/clone-voice', methods=['POST'])
def clone_voice():
    """
    Voice cloning endpoint stub
    Expects: audio file (reference), text (to speak)
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No reference audio provided'}), 400
        
    text = request.form.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
        
    file = request.files['file']
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400
        
    try:
        # Create unique temporary directory
        job_id = str(uuid.uuid4())
        temp_dir = Path(tempfile.mkdtemp(prefix=f'voice_clone_{job_id}_'))
        
        # Save reference audio
        filename = secure_filename(file.filename)
        input_path = temp_dir / filename
        file.save(str(input_path))
        
        # NOTE: This is a stub. Integrating a full local TTS model like F5-TTS or Coqui 
        # requires significant GPU resources. For a production app, this would route to
        # an external API (like ElevenLabs or PlayHT) or a dedicated GPU worker.
        
        # For demonstration, we'll just return an error indicating the AI model is loading
        # In a real implementation, you would process the text and reference audio here.
        
        return jsonify({
            'error': 'Voice cloning requires GPU compute node which is currently offline. Please connect an external API key (e.g., ElevenLabs) in settings.'
        }), 503
        
    except Exception as e:
        logger.error(f"Voice cloning error: {e}")
        return jsonify({'error': str(e)}), 500


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
        
        output_pattern = str(temp_dir / f"{Path(filename).stem}_part%03d{Path(filename).suffix}")
        
        # FFmpeg command to split by time (copies stream for blazing fast splitting without re-encoding)
        ffmpeg_cmd = [
            'ffmpeg', '-i', str(input_path),
            '-c', 'copy',
            '-map', '0',
            '-segment_time', str(segment_length),
            '-f', 'segment',
            '-reset_timestamps', '1',
            output_pattern
        ]
        
        subprocess.run(ffmpeg_cmd, capture_output=True, text=True, check=True)
        
        # Zip the files
        zip_filename = f"{Path(filename).stem}_segments.zip"
        zip_path = temp_dir / zip_filename
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for f in temp_dir.glob(f"{Path(filename).stem}_part*{Path(filename).suffix}"):
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
            except Exception as e:
                logger.error(f"Cleanup error: {e}")
                
        return response

    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg split error: {e.stderr}")
        return jsonify({'error': f'Split failed: {e.stderr}'}), 500
    except Exception as e:
        logger.error(f"Video splitting error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/models/status', methods=['GET'])
def models_status():
    """Get status of available AI models"""
    return jsonify({
        'spleeter': {
            'available': SPLEETER_AVAILABLE and spleeter_separator is not None,
            'model': 'spleeter:4stems',
            'outputs': ['vocals', 'drums', 'bass', 'other']
        },
        'deepfilternet': {
            'available': DEEPFILTERNET_AVAILABLE and deepfilter_model is not None,
            'model': 'DeepFilterNet3',
            'description': 'AI-powered noise reduction and audio enhancement'
        }
    })


@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'File too large. Maximum size is 100MB'}), 413


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Flask server on port {port}")
    logger.info(f"Spleeter available: {SPLEETER_AVAILABLE}")
    logger.info(f"DeepFilterNet available: {DEEPFILTERNET_AVAILABLE}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)