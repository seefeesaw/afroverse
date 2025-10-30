const mongoose = require('mongoose');
const Comment = require('../../../src/models/Comment');
const User = require('../../../src/models/User');
const Video = require('../../../src/models/Video');

describe('Comment Model', () => {
  let testUser, testVideo;

  beforeAll(async () => {
    testUser = await User.create({
      phone: '+1234567890',
      username: 'testuser'
    });

    testVideo = await Video.create({
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
  });

  describe('Schema Validation', () => {
    it('should require videoId field', async () => {
      const comment = new Comment({
        userId: testUser._id,
        text: 'Great video!'
      });

      await expect(comment.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require userId field', async () => {
      const comment = new Comment({
        videoId: testVideo._id,
        text: 'Great video!'
      });

      await expect(comment.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should create comment with required fields', async () => {
      const comment = await Comment.create({
        videoId: testVideo._id,
        userId: testUser._id,
        text: 'Great video!'
      });

      expect(comment.videoId.toString()).toBe(testVideo._id.toString());
      expect(comment.userId.toString()).toBe(testUser._id.toString());
      expect(comment.text).toBe('Great video!');
    });
  });
});


