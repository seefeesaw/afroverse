// Mock API handler for testing without server
import mockData, { generateMoreVideos } from './mockData';

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockApi = {
  // Auth endpoints
  'POST /auth/start': async (data) => {
    await delay();
    return {
      success: true,
      message: 'OTP sent successfully',
      sessionId: 'mock_session_123',
    };
  },

  'POST /auth/verify': async (data) => {
    await delay();
    return {
      success: true,
      accessToken: 'mock_access_token_' + Date.now(),
      user: mockData.currentUser,
    };
  },

  'POST /auth/refresh': async () => {
    await delay();
    return {
      success: true,
      accessToken: 'mock_access_token_' + Date.now(),
    };
  },

  'GET /auth/me': async () => {
    await delay();
    return {
      success: true,
      user: mockData.currentUser,
    };
  },

  'POST /auth/logout': async () => {
    await delay();
    return { success: true };
  },

  // Feed endpoints
  'GET /feed/:tab': async (params) => {
    await delay();
    const videos = params.tab === 'following' 
      ? mockData.videos.filter(v => v.user.id !== mockData.currentUser.id)
      : [...mockData.videos, ...generateMoreVideos(7)];
    
    return {
      success: true,
      videos: videos.slice(0, params.limit || 10),
      hasMore: true,
      nextCursor: 'mock_cursor_' + Date.now(),
    };
  },

  'POST /feed/video/:videoId/like': async (params, data) => {
    await delay();
    return {
      success: true,
      liked: data.on,
      likesCount: Math.floor(Math.random() * 1000) + 500,
    };
  },

  'POST /feed/video/:videoId/share': async (params) => {
    await delay();
    return {
      success: true,
      sharesCount: Math.floor(Math.random() * 100) + 50,
    };
  },

  'POST /feed/video/:videoId/view': async (params) => {
    await delay();
    return { success: true };
  },

  'GET /feed/video/:videoId': async (params) => {
    await delay();
    const video = mockData.videos.find(v => v.id === params.videoId) || mockData.videos[0];
    return {
      success: true,
      video,
    };
  },

  // Creator endpoints
  'GET /creator/profile/:username': async (params) => {
    await delay();
    const user = mockData.users.find(u => u.username === params.username) || mockData.users[0];
    return {
      success: true,
      profile: user,
    };
  },

  'GET /creator/profile/:username/feed': async (params) => {
    await delay();
    const user = mockData.users.find(u => u.username === params.username);
    const videos = mockData.videos.filter(v => v.userId === user?.id);
    return {
      success: true,
      videos,
      hasMore: false,
    };
  },

  'GET /creator/profile/:username/stats': async (params) => {
    await delay();
    const user = mockData.users.find(u => u.username === params.username) || mockData.users[0];
    return {
      success: true,
      stats: user.stats,
    };
  },

  'GET /creator/profile/:username/follow-status': async (params) => {
    await delay();
    return {
      success: true,
      isFollowing: Math.random() > 0.5,
    };
  },

  'POST /creator/follow/:userId': async (params) => {
    await delay();
    return {
      success: true,
      isFollowing: true,
      followersCount: Math.floor(Math.random() * 1000) + 100,
    };
  },

  'DELETE /creator/follow/:userId': async (params) => {
    await delay();
    return {
      success: true,
      isFollowing: false,
      followersCount: Math.floor(Math.random() * 1000) + 100,
    };
  },

  'GET /creator/followers/:userId': async (params) => {
    await delay();
    return {
      success: true,
      followers: mockData.users.slice(0, 5),
      hasMore: true,
      nextCursor: 'mock_cursor',
    };
  },

  'GET /creator/following/:userId': async (params) => {
    await delay();
    return {
      success: true,
      following: mockData.users.slice(1, 6),
      hasMore: true,
      nextCursor: 'mock_cursor',
    };
  },

  'GET /creator/creators/top': async (params) => {
    await delay();
    return {
      success: true,
      creators: mockData.users,
      hasMore: false,
    };
  },

  'PUT /creator/profile': async (data) => {
    await delay();
    return {
      success: true,
      profile: { ...mockData.currentUser, ...data },
    };
  },

  // Battle endpoints
  'GET /battles': async (params) => {
    await delay();
    return {
      success: true,
      battles: mockData.battles,
      hasMore: false,
    };
  },

  'GET /battles/:battleId': async (params) => {
    await delay();
    const battle = mockData.battles.find(b => b.id === params.battleId) || mockData.battles[0];
    return {
      success: true,
      battle,
    };
  },

  'POST /battles/create': async (data) => {
    await delay();
    return {
      success: true,
      battle: {
        id: 'battle_' + Date.now(),
        ...data,
        status: 'pending',
        votes: { challenger: 0, defender: 0, total: 0 },
      },
    };
  },

  'POST /battles/:battleId/respond': async (params, data) => {
    await delay();
    return {
      success: true,
      battle: mockData.battles[0],
    };
  },

  'POST /battles/:battleId/vote': async (params, data) => {
    await delay();
    return {
      success: true,
      vote: data.side,
      votes: {
        challenger: Math.floor(Math.random() * 1000) + 500,
        defender: Math.floor(Math.random() * 1000) + 500,
        total: Math.floor(Math.random() * 2000) + 1000,
      },
    };
  },

  // Leaderboard endpoints
  'GET /leaderboard': async (params) => {
    await delay();
    return {
      success: true,
      leaderboard: mockData.leaderboard,
      userRank: {
        rank: 45,
        score: mockData.currentUser.vibranium,
        change: 2,
      },
    };
  },

  'GET /leaderboard/tribe/:tribeId': async (params) => {
    await delay();
    const tribeLeaderboard = mockData.leaderboard.filter(
      entry => entry.tribe.id === params.tribeId
    );
    return {
      success: true,
      leaderboard: tribeLeaderboard,
    };
  },

  'GET /leaderboard/weekly-champions': async () => {
    await delay();
    return {
      success: true,
      current: {
        weekStart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        weekEnd: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        tribesTop: mockData.tribes.slice(0, 3).map((tribe, index) => ({
          tribeId: tribe.id,
          name: tribe.name,
          displayName: tribe.name,
          emblem: { icon: tribe.icon },
          points: 50000 - (index * 10000),
          members: Math.floor(Math.random() * 1000) + 500,
          rank: index + 1,
        })),
        usersTop: mockData.users.slice(0, 3).map((user, index) => ({
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          points: user.vibranium,
          streak: user.stats?.streak || 7,
          rank: index + 1,
        })),
      },
    };
  },

  'GET /leaderboard/recent-champions': async () => {
    await delay();
    return {
      success: true,
      recent: [
        {
          weekStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          weekEnd: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          tribesTop: mockData.tribes.slice(0, 3).map((tribe, index) => ({
            tribeId: tribe.id,
            name: tribe.name,
            displayName: tribe.name,
            points: 45000 - (index * 8000),
            members: Math.floor(Math.random() * 1000) + 400,
          })),
          usersTop: mockData.users.slice(0, 3).map((user, index) => ({
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            points: user.vibranium - 1000,
            streak: 5,
          })),
        },
      ],
    };
  },

  'GET /leaderboard/tribes': async (params) => {
    await delay();
    return {
      success: true,
      items: mockData.leaderboard.slice(0, 10),
      nextCursor: mockData.leaderboard.length > 10 ? 'cursor_10' : null,
      loading: false,
      error: null,
    };
  },

  'GET /leaderboard/users': async (params) => {
    await delay();
    return {
      success: true,
      items: mockData.leaderboard.slice(0, 10),
      nextCursor: mockData.leaderboard.length > 10 ? 'cursor_10' : null,
      loading: false,
      error: null,
    };
  },

  'GET /leaderboard/my-rank': async (params) => {
    await delay();
    return {
      success: true,
      rank: 45,
      points: mockData.currentUser.vibranium,
      change: 2,
    };
  },

  // Challenge endpoints
  'GET /challenges': async (params) => {
    await delay();
    return {
      success: true,
      challenges: mockData.challenges,
    };
  },

  'GET /challenges/:challengeId': async (params) => {
    await delay();
    const challenge = mockData.challenges.find(c => c.id === params.challengeId) || mockData.challenges[0];
    return {
      success: true,
      challenge,
    };
  },

  'POST /challenges/:challengeId/submit': async (params, data) => {
    await delay();
    return {
      success: true,
      submission: {
        id: 'submission_' + Date.now(),
        ...data,
        status: 'pending',
      },
    };
  },

  // Notification endpoints
  'GET /notifications': async (params) => {
    await delay();
    return {
      success: true,
      notifications: mockData.notifications,
      unreadCount: mockData.notifications.filter(n => !n.read).length,
    };
  },

  'PUT /notifications/:notificationId/read': async (params) => {
    await delay();
    return { success: true };
  },

  'PUT /notifications/read-all': async () => {
    await delay();
    return { success: true };
  },

  // Achievement endpoints
  'GET /achievements': async () => {
    await delay();
    return {
      success: true,
      achievements: mockData.achievements,
      totalUnlocked: mockData.achievements.filter(a => a.unlocked).length,
      totalRewards: mockData.achievements
        .filter(a => a.unlocked)
        .reduce((sum, a) => sum + a.reward, 0),
    };
  },

  // Wallet endpoints
  'GET /wallet': async () => {
    await delay();
    return {
      success: true,
      wallet: mockData.wallet,
    };
  },

  'GET /wallet/transactions': async (params) => {
    await delay();
    return {
      success: true,
      transactions: mockData.wallet.transactions,
      hasMore: false,
    };
  },

  'POST /wallet/withdraw': async (data) => {
    await delay();
    return {
      success: true,
      transaction: {
        id: 'tx_' + Date.now(),
        type: 'withdraw',
        amount: -data.amount,
        description: 'Withdrawal',
        timestamp: new Date().toISOString(),
        status: 'pending',
      },
    };
  },

  // Video endpoints
  'POST /video/upload': async (data) => {
    await delay(1000); // Longer delay for upload simulation
    return {
      success: true,
      video: {
        id: 'video_' + Date.now(),
        ...data,
        status: 'processing',
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
      },
    };
  },

  'GET /video/:videoId': async (params) => {
    await delay();
    const video = mockData.videos.find(v => v.id === params.videoId) || mockData.videos[0];
    return {
      success: true,
      video,
    };
  },

  // Comment endpoints
  'GET /comments/:videoId': async (params) => {
    await delay();
    const comments = mockData.comments.filter(c => c.videoId === params.videoId);
    return {
      success: true,
      comments,
    };
  },

  'POST /comments/:videoId': async (params, data) => {
    await delay();
    return {
      success: true,
      comment: {
        id: 'comment_' + Date.now(),
        videoId: params.videoId,
        user: mockData.currentUser,
        text: data.text,
        likes: 0,
        replies: 0,
        createdAt: new Date().toISOString(),
      },
    };
  },

  // Event endpoints
  'GET /events': async () => {
    await delay();
    return {
      success: true,
      events: mockData.events,
    };
  },

  'GET /events/:eventId': async (params) => {
    await delay();
    const event = mockData.events.find(e => e.id === params.eventId) || mockData.events[0];
    return {
      success: true,
      event,
    };
  },

  'POST /events/:eventId/join': async (params) => {
    await delay();
    return {
      success: true,
      joined: true,
    };
  },

  // Tribe endpoints
  'GET /tribes': async () => {
    await delay();
    return {
      success: true,
      tribes: mockData.tribes,
    };
  },

  'GET /tribes/:tribeId': async (params) => {
    await delay();
    const tribe = mockData.tribes.find(t => t.id === params.tribeId) || mockData.tribes[0];
    return {
      success: true,
      tribe: {
        ...tribe,
        members: Math.floor(Math.random() * 10000) + 1000,
        totalVibranium: Math.floor(Math.random() * 1000000) + 100000,
      },
    };
  },

  'POST /tribes/:tribeId/join': async (params) => {
    await delay();
    return {
      success: true,
      tribe: mockData.tribes.find(t => t.id === params.tribeId),
    };
  },

  // Profile endpoints
  'GET /profile/:username': async (params) => {
    await delay();
    const user = mockData.users.find(u => u.username === params.username) || mockData.currentUser;
    return {
      success: true,
      profile: user,
    };
  },

  'PUT /profile': async (data) => {
    await delay();
    return {
      success: true,
      profile: { ...mockData.currentUser, ...data },
    };
  },

  // Chat endpoints
  'GET /chat/conversations': async () => {
    await delay();
    return {
      success: true,
      conversations: [
        {
          id: 'conv1',
          user: mockData.users[1],
          lastMessage: {
            text: 'Great video!',
            timestamp: '2024-10-27T15:30:00Z',
            read: false,
          },
          unreadCount: 2,
        },
      ],
    };
  },

  'GET /chat/messages/:conversationId': async (params) => {
    await delay();
    return {
      success: true,
      messages: [
        {
          id: 'msg1',
          senderId: mockData.users[1].id,
          text: 'Hey, loved your recent video!',
          timestamp: '2024-10-27T15:25:00Z',
        },
        {
          id: 'msg2',
          senderId: mockData.currentUser.id,
          text: 'Thanks! Appreciate it 🙏',
          timestamp: '2024-10-27T15:28:00Z',
        },
      ],
    };
  },

  'POST /chat/send': async (data) => {
    await delay();
    return {
      success: true,
      message: {
        id: 'msg_' + Date.now(),
        senderId: mockData.currentUser.id,
        text: data.text,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

// Mock API handler function
export const handleMockRequest = async (method, url, data = null, params = null) => {
  // Parse URL and extract params
  const urlParts = url.split('?')[0].split('/');
  const queryParams = url.includes('?') 
    ? Object.fromEntries(new URLSearchParams(url.split('?')[1]))
    : {};

  // Find matching mock endpoint
  let handler = null;
  let extractedParams = { ...queryParams };

  // Try to match URL pattern
  for (const [pattern, handlerFn] of Object.entries(mockApi)) {
    const [patternMethod, patternUrl] = pattern.split(' ');
    
    if (patternMethod !== method) continue;

    const patternParts = patternUrl.split('/');
    
    if (urlParts.length !== patternParts.length) continue;

    let matches = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        // Extract parameter
        const paramName = patternParts[i].substring(1);
        extractedParams[paramName] = urlParts[i];
      } else if (patternParts[i] !== urlParts[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      handler = handlerFn;
      break;
    }
  }

  if (!handler) {
    console.warn(`Mock API: No handler found for ${method} ${url}`);
    return {
      success: false,
      message: 'Endpoint not found (mock)',
    };
  }

  try {
    const response = await handler({ ...extractedParams, ...params }, data);
    return response;
  } catch (error) {
    console.error('Mock API error:', error);
    return {
      success: false,
      message: error.message || 'Mock API error',
    };
  }
};

export default mockApi;

