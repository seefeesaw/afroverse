const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class VideoGenerationService {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp');
    this.outputDir = path.join(__dirname, '../../output');
    this.audioTracks = {
      afrobeats: {
        id: 'afrobeats_001',
        bpm: 120,
        key: 'C',
        path: path.join(__dirname, '../../assets/audio/afrobeats.mp3')
      },
      amapiano: {
        id: 'amapiano_001',
        bpm: 115,
        key: 'F',
        path: path.join(__dirname, '../../assets/audio/amapiano.mp3')
      },
      highlife: {
        id: 'highlife_001',
        bpm: 100,
        key: 'G',
        path: path.join(__dirname, '../../assets/audio/highlife.mp3')
      },
      epic: {
        id: 'epic_001',
        bpm: 140,
        key: 'D',
        path: path.join(__dirname, '../../assets/audio/epic.mp3')
      }
    };
  }

  /**
   * Generate a video loop from an image
   * @param {Buffer} imageBuffer - The base image
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Video generation result
   */
  async generateLoop(imageBuffer, options = {}) {
    const {
      style = 'maasai',
      duration = 4,
      motion = 'subtle',
      intensity = 0.6
    } = options;

    try {
      // Create temp directory
      await this.ensureTempDir();

      const tempId = `loop_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const inputPath = path.join(this.tempDir, `${tempId}_input.jpg`);
      const outputPath = path.join(this.tempDir, `${tempId}_output.mp4`);

      // Save input image
      await fs.writeFile(inputPath, imageBuffer);

      // Generate motion frames using AnimateDiff-style approach
      const frames = await this.generateMotionFrames(inputPath, {
        style,
        duration,
        motion,
        intensity
      });

      // Create video from frames
      await this.createVideoFromFrames(frames, outputPath, {
        fps: 30,
        duration,
        loop: true
      });

      // Read output video
      const videoBuffer = await fs.readFile(outputPath);

      // Cleanup
      await this.cleanupTempFiles([inputPath, outputPath, ...frames]);

      return {
        success: true,
        videoBuffer,
        duration,
        fps: 30,
        width: 1080,
        height: 1920
      };

    } catch (error) {
      console.error('Error generating loop:', error);
      throw new Error(`Loop generation failed: ${error.message}`);
    }
  }

  /**
   * Generate a full video clip with audio
   * @param {Buffer} imageBuffer - The base image
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Video generation result
   */
  async generateClip(imageBuffer, options = {}) {
    const {
      style = 'maasai',
      duration = 12,
      vibe = 'afrobeats',
      captions = null,
      intensity = 0.6
    } = options;

    try {
      await this.ensureTempDir();

      const tempId = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const inputPath = path.join(this.tempDir, `${tempId}_input.jpg`);
      const outputPath = path.join(this.tempDir, `${tempId}_output.mp4`);

      // Save input image
      await fs.writeFile(inputPath, imageBuffer);

      // Generate multiple motion segments
      const segments = await this.generateClipSegments(inputPath, {
        style,
        duration,
        intensity
      });

      // Stitch segments together
      await this.stitchSegments(segments, outputPath);

      // Add audio if vibe is specified
      if (vibe && this.audioTracks[vibe]) {
        await this.addAudioTrack(outputPath, vibe, duration);
      }

      // Add captions if provided
      if (captions) {
        await this.addCaptions(outputPath, captions);
      }

      // Apply watermark
      await this.applyWatermark(outputPath);

      // Read output video
      const videoBuffer = await fs.readFile(outputPath);

      // Cleanup
      await this.cleanupTempFiles([inputPath, outputPath, ...segments]);

      return {
        success: true,
        videoBuffer,
        duration,
        fps: 30,
        width: 1080,
        height: 1920,
        audioTrack: vibe
      };

    } catch (error) {
      console.error('Error generating clip:', error);
      throw new Error(`Clip generation failed: ${error.message}`);
    }
  }

  /**
   * Generate motion frames for video
   * @param {string} inputPath - Path to input image
   * @param {Object} options - Motion options
   * @returns {Promise<string[]>} - Array of frame file paths
   */
  async generateMotionFrames(inputPath, options) {
    const { style, duration, motion, intensity } = options;
    const fps = 30;
    const totalFrames = duration * fps;
    const frames = [];

    // Motion parameters based on style and motion type
    const motionParams = this.getMotionParams(style, motion, intensity);

    for (let i = 0; i < totalFrames; i++) {
      const framePath = path.join(this.tempDir, `frame_${i.toString().padStart(4, '0')}.jpg`);
      
      // Apply motion transformation to frame
      await this.applyMotionTransform(inputPath, framePath, {
        frameIndex: i,
        totalFrames,
        ...motionParams
      });

      frames.push(framePath);
    }

    return frames;
  }

  /**
   * Get motion parameters for different styles and motion types
   * @param {string} style - Style name
   * @param {string} motion - Motion type
   * @param {number} intensity - Motion intensity
   * @returns {Object} - Motion parameters
   */
  getMotionParams(style, motion, intensity) {
    const baseParams = {
      intensity,
      rotation: 0,
      scale: 1,
      translateX: 0,
      translateY: 0
    };

    switch (motion) {
      case 'subtle':
        return {
          ...baseParams,
          rotation: intensity * 0.1,
          scale: 1 + (intensity * 0.05),
          translateX: Math.sin(Date.now() / 1000) * intensity * 2,
          translateY: Math.cos(Date.now() / 1000) * intensity * 2
        };
      
      case 'confident':
        return {
          ...baseParams,
          rotation: intensity * 0.2,
          scale: 1 + (intensity * 0.1),
          translateX: Math.sin(Date.now() / 1000) * intensity * 5,
          translateY: Math.cos(Date.now() / 1000) * intensity * 3
        };
      
      case 'hero':
        return {
          ...baseParams,
          rotation: intensity * 0.3,
          scale: 1 + (intensity * 0.15),
          translateX: Math.sin(Date.now() / 1000) * intensity * 8,
          translateY: Math.cos(Date.now() / 1000) * intensity * 5
        };
      
      default:
        return baseParams;
    }
  }

  /**
   * Apply motion transformation to a frame
   * @param {string} inputPath - Input image path
   * @param {string} outputPath - Output frame path
   * @param {Object} params - Motion parameters
   */
  async applyMotionTransform(inputPath, outputPath, params) {
    const { frameIndex, totalFrames, rotation, scale, translateX, translateY } = params;
    
    // Calculate frame-specific transformations
    const progress = frameIndex / totalFrames;
    const frameRotation = rotation * Math.sin(progress * Math.PI * 2);
    const frameScale = scale + (Math.sin(progress * Math.PI * 4) * 0.02);
    const frameTranslateX = translateX * Math.sin(progress * Math.PI * 2);
    const frameTranslateY = translateY * Math.cos(progress * Math.PI * 2);

    // Apply transformations using Sharp
    await sharp(inputPath)
      .resize(1080, 1920, { fit: 'cover' })
      .rotate(frameRotation)
      .resize(Math.round(1080 * frameScale), Math.round(1920 * frameScale))
      .extract({
        left: Math.max(0, Math.round((1080 * frameScale - 1080) / 2 + frameTranslateX)),
        top: Math.max(0, Math.round((1920 * frameScale - 1920) / 2 + frameTranslateY)),
        width: 1080,
        height: 1920
      })
      .jpeg({ quality: 90 })
      .toFile(outputPath);
  }

  /**
   * Create video from frame sequence
   * @param {string[]} framePaths - Array of frame file paths
   * @param {string} outputPath - Output video path
   * @param {Object} options - Video options
   */
  async createVideoFromFrames(framePaths, outputPath, options = {}) {
    const { fps = 30, duration, loop = false } = options;

    return new Promise((resolve, reject) => {
      let command = ffmpeg();

      // Add input frames
      framePaths.forEach(framePath => {
        command = command.input(framePath);
      });

      // Configure output
      command
        .fps(fps)
        .videoCodec('libx264')
        .outputOptions([
          '-profile:v baseline',
          '-level 3.1',
          '-pix_fmt yuv420p',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', () => {
          console.log('Video creation completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('Video creation error:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Generate segments for clip video
   * @param {string} inputPath - Input image path
   * @param {Object} options - Clip options
   * @returns {Promise<string[]>} - Array of segment file paths
   */
  async generateClipSegments(inputPath, options) {
    const { style, duration, intensity } = options;
    const segmentDuration = 4; // 4 seconds per segment
    const segments = [];

    // Generate 3 segments with different motion styles
    const motionStyles = ['confident', 'hero', 'accent'];
    
    for (let i = 0; i < 3; i++) {
      const segmentPath = path.join(this.tempDir, `segment_${i}.mp4`);
      
      // Generate frames for this segment
      const frames = await this.generateMotionFrames(inputPath, {
        style,
        duration: segmentDuration,
        motion: motionStyles[i],
        intensity
      });

      // Create video from frames
      await this.createVideoFromFrames(frames, segmentPath, {
        fps: 30,
        duration: segmentDuration
      });

      segments.push(segmentPath);
      
      // Cleanup frames
      await this.cleanupTempFiles(frames);
    }

    return segments;
  }

  /**
   * Stitch video segments together
   * @param {string[]} segments - Array of segment file paths
   * @param {string} outputPath - Output video path
   */
  async stitchSegments(segments, outputPath) {
    return new Promise((resolve, reject) => {
      let command = ffmpeg();

      // Add all segments as inputs
      segments.forEach(segment => {
        command = command.input(segment);
      });

      // Create filter complex for concatenation
      const filterComplex = segments.map((_, index) => `[${index}:v]`).join('') + 
        `concat=n=${segments.length}:v=1:a=0[outv]`;

      command
        .complexFilter(filterComplex)
        .outputOptions(['-map', '[outv]'])
        .output(outputPath)
        .on('end', () => {
          console.log('Segment stitching completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('Segment stitching error:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Add audio track to video
   * @param {string} videoPath - Video file path
   * @param {string} vibe - Audio vibe type
   * @param {number} duration - Video duration
   */
  async addAudioTrack(videoPath, vibe, duration) {
    const audioTrack = this.audioTracks[vibe];
    if (!audioTrack) {
      throw new Error(`Audio track not found for vibe: ${vibe}`);
    }

    const tempAudioPath = path.join(this.tempDir, `temp_audio_${Date.now()}.mp3`);
    
    return new Promise((resolve, reject) => {
      // First, trim audio to match video duration
      ffmpeg(audioTrack.path)
        .duration(duration)
        .output(tempAudioPath)
        .on('end', () => {
          // Then mux audio with video
          ffmpeg(videoPath)
            .input(tempAudioPath)
            .outputOptions([
              '-c:v copy',
              '-c:a aac',
              '-b:a 128k',
              '-shortest'
            ])
            .output(videoPath.replace('.mp4', '_with_audio.mp4'))
            .on('end', async () => {
              // Replace original with audio version
              await fs.rename(videoPath.replace('.mp4', '_with_audio.mp4'), videoPath);
              await fs.unlink(tempAudioPath);
              resolve();
            })
            .on('error', reject)
            .run();
        })
        .on('error', reject)
        .run();
    });
  }

  /**
   * Add captions to video
   * @param {string} videoPath - Video file path
   * @param {string} captions - Caption text
   */
  async addCaptions(videoPath, captions) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .videoFilters([
          `drawtext=text='${captions}':fontfile=/System/Library/Fonts/Arial.ttf:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-th-50:box=1:boxcolor=black@0.5:boxborderw=5`
        ])
        .output(videoPath.replace('.mp4', '_with_captions.mp4'))
        .on('end', async () => {
          // Replace original with captions version
          await fs.rename(videoPath.replace('.mp4', '_with_captions.mp4'), videoPath);
          resolve();
        })
        .on('error', reject)
        .run();
    });
  }

  /**
   * Apply watermark to video
   * @param {string} videoPath - Video file path
   */
  async applyWatermark(videoPath) {
    const watermarkPath = path.join(__dirname, '../../assets/watermark.png');
    
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .input(watermarkPath)
        .complexFilter([
          '[1:v]scale=200:200[wm]',
          '[0:v][wm]overlay=W-w-40:H-h-40'
        ])
        .output(videoPath.replace('.mp4', '_watermarked.mp4'))
        .on('end', async () => {
          // Replace original with watermarked version
          await fs.rename(videoPath.replace('.mp4', '_watermarked.mp4'), videoPath);
          resolve();
        })
        .on('error', reject)
        .run();
    });
  }

  /**
   * Generate thumbnail from video
   * @param {string} videoPath - Video file path
   * @param {number} timestamp - Timestamp in seconds
   * @returns {Promise<Buffer>} - Thumbnail buffer
   */
  async generateThumbnail(videoPath, timestamp = 1.0) {
    const thumbnailPath = path.join(this.tempDir, `thumb_${Date.now()}.jpg`);
    
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .frames(1)
        .output(thumbnailPath)
        .on('end', async () => {
          const thumbnailBuffer = await fs.readFile(thumbnailPath);
          await fs.unlink(thumbnailPath);
          resolve(thumbnailBuffer);
        })
        .on('error', reject)
        .run();
    });
  }

  /**
   * Ensure temp directory exists
   */
  async ensureTempDir() {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  /**
   * Cleanup temporary files
   * @param {string[]} filePaths - Array of file paths to delete
   */
  async cleanupTempFiles(filePaths) {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn(`Failed to delete temp file ${filePath}:`, error.message);
      }
    }
  }

  /**
   * Get available audio tracks
   * @returns {Object} - Available audio tracks
   */
  getAvailableAudioTracks() {
    return Object.keys(this.audioTracks).reduce((acc, vibe) => {
      acc[vibe] = {
        id: this.audioTracks[vibe].id,
        bpm: this.audioTracks[vibe].bpm,
        key: this.audioTracks[vibe].key
      };
      return acc;
    }, {});
  }
}

module.exports = new VideoGenerationService();
