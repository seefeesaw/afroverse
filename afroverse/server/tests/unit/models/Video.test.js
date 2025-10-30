const mongoose = require('mongoose');
const Video = require('../../../src/models/Video');
const User = require('../../../src/models/User');

describe('Video Model', () => {
  let testUser;

  beforeAll(async () => {
    testUser = await User.create({
      phone: '+1234567890',
      username: 'testuser'
    });
  });

  describe('Schema Validation', () => {
    it('should require ownerId field', async () => {
      const video = new Video({
        type: 'image_loop',
        style: 'test-style',
        tribe: 'test-tribe',
        durationSec: 10,
        region: 'ZA',
        cdn: {
          hlsUrl: 'https://example.com/video.m3u8',
          mp4Url: 'https://example.com/video.mp4',
          thumbUrl: 'https://example.com/thumb.jpg'
        }
      });

      await expect(video.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require type field', async () => {
      const video = new Video({
        ownerId: testUser._id,
        style: 'test-style',
        tribe: 'test-tribe',
        durationSec: 10,
        region: 'ZA',
        cdn: {
          hlsUrl: 'https://example.com/video.m3u8',
          mp4Url: 'https://example.com/video.mp4',
          thumbUrl: 'https://example.com/thumb.jpg'
        }
      });

      await expect(video.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should validate type enum values', async () => {
      const video = new Video({
        ownerId: testUser._id,
        type: 'invalid_type',
        style: 'test-style',
        tribe: 'test-tribe',
        durationSec: 10,
        region: 'ZA',
        cdn: {
          hlsUrl: 'https://example.com/video.m3u8',
          mp4Url: 'https://example.com/video.mp4',
          thumbUrl: 'https://example.com/thumb.jpg'
        }
      });

      await expect(video.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should accept valid type enum values', async () => {
      const validTypes = ['image_loop', 'portrait_loop', 'fullbody_dance', 'battle_clip'];
     
      for (const type of validTypes) {
        const video = await Video.create({
          ownerId: testUser._id,
          type: type,
          style: 'test-style',
          tribe: 'test-tribe',
          durationSec: 10,
          region: 'ZA',
          cdn: {
            hlsUrl: 'https://example.com/video.m3u8',
            mp4Url: 'https://example.com/video.mp4',
            thumbUrl: 'https://example.com/thumb.jpg'
          }
        });

        expect(video.type).toBe(type);
        await Video.deleteOne({ _id: video._id });
      }
    });

    it('should require style field', async () => {
      const video = new Video({
        ownerId: testUser._id,
        type: 'image_loop',
        tribe: 'test-tribe',
        durationSec: 10,
        region: 'ZA',
        cdn: {
          hlsUrl: 'https://example.com/video.m3u8',
          mp4Url: 'https://example.com/video.mp4',
          thumbUrl: 'https://example.com/thumb.jpg'
        }
      });

      await expect(video.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require tribe field', async () => {
      const video = new Video({
        ownerId: testUser._id,
        type: 'image_loop',
        style: 'test-style',
        durationSec: 10,
        region: 'ZA',
        cdn: {
          hlsUrl: 'https://example.com/video.m3u8',
          mp4Url: 'https://example.com/video.mp4',
          thumbUrl: 'https://example.com/thumb.jpg'
        }
      });

      await expect(video.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require cdn fields', async () => {
      const video = new Video({
        ownerId: testUser._id,
        type: 'image_loop',
        style: 'test-style',
        tribe: 'test-tribe',
        durationSec: 10,
        region: 'ZA'
      });

      await expect(video.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should create video with all required fields', async () => {
      const videoData = {
        ownerId: testUser._id,
        type: 'image_loop',
        style: 'test-style',
        tribe: 'test-tribe',
        durationSec: 10,
        region: 'ZA',
        cdn: {
          hlsUrl: 'https://example.com/video.m3u8',
          mp4Url: 'https://example.com/video.mp4',
          thumbUrl: 'https://example.com/thumb.jpg'
        }
      };

      const video = await Video.create(videoData);

      expect(video.ownerId.toString()).toBe(testUser._id.toString());
      expect(video.type).toBe(videoData.type);
      expect(video.style).toBe(videoData.style);
      expect(video.tribe).toBe(videoData.tribe);
      expect(video.cdn.hlsUrl).toBe(videoData.cdn.hlsUrl);
    });
  });

  describe('Default Values', () => {
    it('should set default stats values', async () => {
      const video = await Video.create({
        ownerId: testUser._id,
        type: 'image_loop',
        style: 'test-style',
        tribe: 'test-tribe',
        durationSec: 10,
        region: 'ZA',
        cdn: {
          hlsUrl: 'https://example.com/video.m3u8',
          mp4Url: 'https://example.com/video.mp4',
          thumbUrl: 'https://example.com/thumb.jpg'
        }
      });

      expect(video.stats.views).toBe(0);
      expect(video.stats.likes).toBe(0);
      expect(video.stats.shares).toBe(0);
    });
  });
});

