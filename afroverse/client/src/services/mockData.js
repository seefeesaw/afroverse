// Mock data for testing UI without server
// Set VITE_USE_MOCK_DATA=true in your .env file to enable

const TRIBES = [
  { id: '1', name: 'Zulu Warriors', icon: '⚔️', color: '#FF6B6B' },
  { id: '2', name: 'Maasai Legends', icon: '🦁', color: '#4ECDC4' },
  { id: '3', name: 'Yoruba Kings', icon: '👑', color: '#FFD93D' },
  { id: '4', name: 'Egyptian Pharaohs', icon: '🏛️', color: '#95E1D3' },
  { id: '5', name: 'Kongo Empire', icon: '🌟', color: '#AA96DA' },
];

const MOCK_USERS = [
  {
    id: 'user1',
    username: 'african_warrior',
    displayName: 'African Warrior',
    phone: '+27123456789',
    tribe: TRIBES[0],
    vibranium: 15420,
    level: 12,
    xp: 3450,
    nextLevelXp: 5000,
    rank: 45,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=warrior',
    bio: 'Dancing through life 💃 | Zulu Pride 🔥 | Battle Champion',
    stats: {
      followers: 1250,
      following: 380,
      totalViews: 125000,
      totalLikes: 8500,
      winRate: 0.73,
      streak: 7,
    },
    achievements: ['first_win', 'streak_7', 'viral_video'],
    isCreator: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user2',
    username: 'maasai_dancer',
    displayName: 'Maasai Dancer',
    phone: '+254987654321',
    tribe: TRIBES[1],
    vibranium: 22100,
    level: 15,
    xp: 4200,
    nextLevelXp: 6000,
    rank: 23,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dancer',
    bio: 'Keeping traditions alive through dance 🎭',
    stats: {
      followers: 2850,
      following: 520,
      totalViews: 280000,
      totalLikes: 15200,
      winRate: 0.81,
      streak: 12,
    },
    achievements: ['first_win', 'streak_7', 'streak_14', 'battle_master'],
    isCreator: true,
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'user3',
    username: 'yoruba_king',
    displayName: 'Yoruba King',
    phone: '+234555444333',
    tribe: TRIBES[2],
    vibranium: 8900,
    level: 8,
    xp: 2100,
    nextLevelXp: 3500,
    rank: 128,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=king',
    bio: 'Royal moves only 👑',
    stats: {
      followers: 580,
      following: 210,
      totalViews: 45000,
      totalLikes: 3200,
      winRate: 0.65,
      streak: 3,
    },
    isCreator: true,
    createdAt: '2024-02-01T10:00:00Z',
  },
];

const MOCK_VIDEOS = [
  {
    id: 'video1',
    userId: 'user1',
    user: MOCK_USERS[0],
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://picsum.photos/400/600?random=1',
    caption: 'Bringing the heat with this Zulu war dance! 🔥⚔️ #ZuluWarriors #AfricanCulture',
    tribe: TRIBES[0],
    style: 'traditional',
    region: 'ZA',
    duration: 15,
    views: 15420,
    likes: 1250,
    shares: 180,
    comments: 95,
    isLiked: false,
    isBattle: false,
    createdAt: '2024-10-27T15:30:00Z',
    tags: ['dance', 'traditional', 'warrior'],
  },
  {
    id: 'video2',
    userId: 'user2',
    user: MOCK_USERS[1],
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://picsum.photos/400/600?random=2',
    caption: 'Maasai jumping challenge! Can you beat this? 🦁',
    tribe: TRIBES[1],
    style: 'challenge',
    region: 'KE',
    duration: 18,
    views: 28900,
    likes: 2840,
    shares: 420,
    comments: 215,
    isLiked: true,
    isBattle: false,
    createdAt: '2024-10-27T14:20:00Z',
    tags: ['challenge', 'jumping', 'maasai'],
  },
  {
    id: 'video3',
    userId: 'user3',
    user: MOCK_USERS[2],
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://picsum.photos/400/600?random=3',
    caption: 'Royal Yoruba celebration dance 👑✨',
    tribe: TRIBES[2],
    style: 'celebration',
    region: 'NG',
    duration: 20,
    views: 12350,
    likes: 980,
    shares: 145,
    comments: 67,
    isLiked: false,
    isBattle: false,
    createdAt: '2024-10-27T12:45:00Z',
    tags: ['celebration', 'royal', 'yoruba'],
  },
];

const MOCK_BATTLES = [
  {
    id: 'battle1',
    challenger: MOCK_USERS[0],
    defender: MOCK_USERS[1],
    challengerVideo: { ...MOCK_VIDEOS[0], id: 'battle_video1' },
    defenderVideo: { ...MOCK_VIDEOS[1], id: 'battle_video2' },
    status: 'active',
    startedAt: '2024-10-27T10:00:00Z',
    endsAt: '2024-10-28T10:00:00Z',
    votes: {
      challenger: 1250,
      defender: 1580,
      total: 2830,
    },
    prize: 5000,
    tribe: TRIBES[0],
    hasVoted: false,
  },
  {
    id: 'battle2',
    challenger: MOCK_USERS[2],
    defender: MOCK_USERS[0],
    challengerVideo: { ...MOCK_VIDEOS[2], id: 'battle_video3' },
    defenderVideo: null,
    status: 'pending',
    startedAt: '2024-10-27T16:00:00Z',
    endsAt: '2024-10-29T16:00:00Z',
    votes: {
      challenger: 0,
      defender: 0,
      total: 0,
    },
    prize: 3000,
    tribe: TRIBES[2],
    hasVoted: false,
  },
];

const MOCK_LEADERBOARD = [
  {
    rank: 1,
    user: MOCK_USERS[1],
    score: 22100,
    change: 2,
    tribe: TRIBES[1],
  },
  {
    rank: 2,
    user: MOCK_USERS[0],
    score: 15420,
    change: -1,
    tribe: TRIBES[0],
  },
  {
    rank: 3,
    user: MOCK_USERS[2],
    score: 8900,
    change: 0,
    tribe: TRIBES[2],
  },
  // Add more dummy entries
  ...Array.from({ length: 20 }, (_, i) => ({
    rank: i + 4,
    user: {
      id: `user_${i + 4}`,
      username: `warrior_${i + 4}`,
      displayName: `Warrior ${i + 4}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 4}`,
      tribe: TRIBES[i % TRIBES.length],
    },
    score: 8000 - (i * 200),
    change: Math.floor(Math.random() * 5) - 2,
    tribe: TRIBES[i % TRIBES.length],
  })),
];

const MOCK_CHALLENGES = [
  {
    id: 'challenge1',
    name: 'Zulu War Dance',
    description: 'Master the traditional Zulu warrior dance',
    difficulty: 'medium',
    prize: 2000,
    participants: 342,
    endsAt: '2024-10-30T23:59:59Z',
    thumbnail: 'https://picsum.photos/400/300?random=10',
    tribe: TRIBES[0],
    requirements: ['15 second video', 'Traditional moves', 'Battle ready'],
  },
  {
    id: 'challenge2',
    name: 'Maasai Jump Challenge',
    description: 'Show us your highest Maasai jump!',
    difficulty: 'hard',
    prize: 5000,
    participants: 521,
    endsAt: '2024-11-02T23:59:59Z',
    thumbnail: 'https://picsum.photos/400/300?random=11',
    tribe: TRIBES[1],
    requirements: ['10 second video', 'Clear jump height', 'Traditional attire'],
  },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif1',
    type: 'battle_challenge',
    title: 'New Battle Challenge!',
    message: 'african_warrior challenged you to a battle',
    data: { battleId: 'battle1', userId: 'user1' },
    read: false,
    createdAt: '2024-10-27T16:30:00Z',
  },
  {
    id: 'notif2',
    type: 'like',
    title: 'New Like',
    message: 'maasai_dancer liked your video',
    data: { videoId: 'video1', userId: 'user2' },
    read: false,
    createdAt: '2024-10-27T15:45:00Z',
  },
  {
    id: 'notif3',
    type: 'follow',
    title: 'New Follower',
    message: 'yoruba_king started following you',
    data: { userId: 'user3' },
    read: true,
    createdAt: '2024-10-27T14:20:00Z',
  },
  {
    id: 'notif4',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: 'You earned the "7 Day Streak" achievement',
    data: { achievementId: 'streak_7', reward: 500 },
    read: true,
    createdAt: '2024-10-27T10:00:00Z',
  },
];

const MOCK_ACHIEVEMENTS = [
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first battle',
    icon: '🏆',
    reward: 100,
    unlocked: true,
    unlockedAt: '2024-10-20T10:00:00Z',
  },
  {
    id: 'streak_7',
    name: '7 Day Streak',
    description: 'Post for 7 consecutive days',
    icon: '🔥',
    reward: 500,
    unlocked: true,
    unlockedAt: '2024-10-27T10:00:00Z',
  },
  {
    id: 'viral_video',
    name: 'Viral Star',
    description: 'Get 10,000+ views on a video',
    icon: '⭐',
    reward: 1000,
    unlocked: true,
    unlockedAt: '2024-10-25T15:30:00Z',
  },
  {
    id: 'battle_master',
    name: 'Battle Master',
    description: 'Win 10 battles',
    icon: '⚔️',
    reward: 2000,
    unlocked: false,
    progress: 7,
    total: 10,
  },
  {
    id: 'tribe_champion',
    name: 'Tribe Champion',
    description: 'Reach #1 in your tribe',
    icon: '👑',
    reward: 5000,
    unlocked: false,
    progress: 0,
    total: 1,
  },
];

const MOCK_WALLET = {
  balance: 15420,
  transactions: [
    {
      id: 'tx1',
      type: 'earn',
      amount: 100,
      description: 'Battle victory',
      timestamp: '2024-10-27T15:30:00Z',
    },
    {
      id: 'tx2',
      type: 'earn',
      amount: 500,
      description: 'Achievement unlocked: 7 Day Streak',
      timestamp: '2024-10-27T10:00:00Z',
    },
    {
      id: 'tx3',
      type: 'spend',
      amount: -50,
      description: 'Video boost',
      timestamp: '2024-10-26T18:20:00Z',
    },
    {
      id: 'tx4',
      type: 'earn',
      amount: 200,
      description: 'Video went viral',
      timestamp: '2024-10-26T14:00:00Z',
    },
  ],
  pendingRewards: 850,
};

const MOCK_COMMENTS = [
  {
    id: 'comment1',
    videoId: 'video1',
    user: MOCK_USERS[1],
    text: 'This is fire! 🔥🔥',
    likes: 45,
    replies: 3,
    createdAt: '2024-10-27T15:45:00Z',
  },
  {
    id: 'comment2',
    videoId: 'video1',
    user: MOCK_USERS[2],
    text: 'Can you teach me this move?',
    likes: 12,
    replies: 1,
    createdAt: '2024-10-27T15:50:00Z',
  },
];

const MOCK_EVENTS = [
  {
    id: 'event1',
    name: 'African Dance Festival',
    description: 'Join the biggest African dance competition!',
    startDate: '2024-11-01T00:00:00Z',
    endDate: '2024-11-07T23:59:59Z',
    prize: 50000,
    participants: 1250,
    thumbnail: 'https://picsum.photos/600/400?random=20',
    status: 'upcoming',
    requirements: ['Level 5+', 'Verified account'],
  },
  {
    id: 'event2',
    name: 'Tribe Wars',
    description: 'Battle for your tribe\'s honor',
    startDate: '2024-10-28T00:00:00Z',
    endDate: '2024-10-31T23:59:59Z',
    prize: 30000,
    participants: 2100,
    thumbnail: 'https://picsum.photos/600/400?random=21',
    status: 'active',
    requirements: ['Be part of a tribe'],
  },
];

export const mockData = {
  // Current user
  currentUser: MOCK_USERS[0],
  
  // Users
  users: MOCK_USERS,
  
  // Videos
  videos: MOCK_VIDEOS,
  
  // Battles
  battles: MOCK_BATTLES,
  
  // Leaderboard
  leaderboard: MOCK_LEADERBOARD,
  
  // Challenges
  challenges: MOCK_CHALLENGES,
  
  // Notifications
  notifications: MOCK_NOTIFICATIONS,
  
  // Achievements
  achievements: MOCK_ACHIEVEMENTS,
  
  // Wallet
  wallet: MOCK_WALLET,
  
  // Comments
  comments: MOCK_COMMENTS,
  
  // Events
  events: MOCK_EVENTS,
  
  // Tribes
  tribes: TRIBES,
};

// Helper to generate more videos
export const generateMoreVideos = (count = 10, startIndex = 4) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `video${startIndex + i}`,
    userId: MOCK_USERS[i % MOCK_USERS.length].id,
    user: MOCK_USERS[i % MOCK_USERS.length],
    videoUrl: `https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
    thumbnailUrl: `https://picsum.photos/400/600?random=${startIndex + i}`,
    caption: `Amazing dance video #${startIndex + i} 🔥`,
    tribe: TRIBES[i % TRIBES.length],
    style: ['traditional', 'challenge', 'celebration', 'freestyle'][i % 4],
    region: ['ZA', 'KE', 'NG', 'GH'][i % 4],
    duration: 10 + Math.floor(Math.random() * 20),
    views: Math.floor(Math.random() * 50000) + 1000,
    likes: Math.floor(Math.random() * 5000) + 100,
    shares: Math.floor(Math.random() * 500) + 10,
    comments: Math.floor(Math.random() * 200) + 5,
    isLiked: Math.random() > 0.7,
    isBattle: false,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['dance', 'african', 'culture'],
  }));
};

export default mockData;

