const fs = require('fs');
const path = require('path');

const baseUrl = '{{baseUrl}}';
const authHeader = {'key': 'Authorization', 'value': 'Bearer {{token}}'};
const contentType = {'key': 'Content-Type', 'value': 'application/json'};

const collection = {
  info: {
    name: 'Afroverse API - Complete',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    description: 'Comprehensive Afroverse API collection covering all routes'
  },
  variable: [
    {key: 'baseUrl', value: 'http://localhost:3000', type: 'string'},
    {key: 'token', value: '', type: 'string'},
    {key: 'userId', value: '', type: 'string'},
    {key: 'videoId', value: '', type: 'string'},
    {key: 'battleId', value: '', type: 'string'},
    {key: 'tribeId', value: '', type: 'string'},
    {key: 'commentId', value: '', type: 'string'},
    {key: 'achievementId', value: '', type: 'string'}
  ],
  item: [
    // Health Check
    {
      name: 'Health Check',
      request: {
        method: 'GET',
        url: `${baseUrl}/api/health`,
        header: []
      }
    },
    // Auth Module
    {
      name: 'Auth',
      item: [
        {
          name: 'Start Authentication',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/auth/start`,
            header: [contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({phone: '+10000000001'}, null, 2)
            }
          }
        },
        {
          name: 'Verify Authentication',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/auth/verify`,
            header: [contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({phone: '+10000000001', code: '000000'}, null, 2)
            }
          }
        },
        {
          name: 'Get Current User',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/auth/me`,
            header: [authHeader]
          }
        },
        {
          name: 'Refresh Token',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/auth/refresh`,
            header: [contentType],
            body: {mode: 'raw', raw: JSON.stringify({refreshToken: '{{refreshToken}}'}, null, 2)}
          }
        },
        {
          name: 'Logout',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/auth/logout`,
            header: [authHeader]
          }
        }
      ]
    },
    // Battle Module
    {
      name: 'Battles',
      item: [
        {
          name: 'Create Battle',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/battles/create`,
            header: [authHeader, contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                transformId: '{{transformId}}',
                challengeMethod: 'link',
                challengeTarget: 'public',
                message: 'Challenge accepted!'
              }, null, 2)
            }
          }
        },
        {
          name: 'Get Battle',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/battles/{{battleShortCode}}`,
            header: []
          }
        },
        {
          name: 'List Active Battles',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/battles/active/list`,
            header: []
          }
        },
        {
          name: 'Accept Battle',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/battles/accept/{{battleId}}`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({transformId: '{{transformId}}'}, null, 2)}
          }
        },
        {
          name: 'Vote on Battle',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/battles/vote/{{battleId}}`,
            header: [contentType],
            body: {mode: 'raw', raw: JSON.stringify({votedFor: 'challenger'}, null, 2)}
          }
        },
        {
          name: 'Report Battle',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/battles/{{battleId}}/report`,
            header: [contentType],
            body: {mode: 'raw', raw: JSON.stringify({reason: 'nsfw', details: 'Inappropriate content'}, null, 2)}
          }
        }
      ]
    },
    // Video Module
    {
      name: 'Videos',
      item: [
        {
          name: 'Create Video',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/video/create`,
            header: [authHeader],
            body: {
              mode: 'formdata',
              formdata: [
                {key: 'image', type: 'file', src: ''},
                {key: 'variant', value: 'loop', type: 'text'},
                {key: 'style', value: 'maasai', type: 'text'}
              ]
            }
          }
        },
        {
          name: 'Create Full Body Video',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/video/fullbody/create`,
            header: [authHeader, contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                transformId: '{{transformId}}',
                style: 'maasai',
                motionPack: 'amapiano',
                durationSec: 10
              }, null, 2)
            }
          }
        },
        {
          name: 'Get Video Status',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/video/status/{{videoId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Video History',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/video/history`,
            header: [authHeader]
          }
        },
        {
          name: 'Delete Video',
          request: {
            method: 'DELETE',
            url: `${baseUrl}/api/video/{{videoId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Share Video',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/video/{{videoId}}/share`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({platform: 'whatsapp'}, null, 2)}
          }
        },
        {
          name: 'View Video',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/video/{{videoId}}/view`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Public Video',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/video/{{videoId}}/public`,
            header: []
          }
        },
        {
          name: 'Get Motion Packs',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/video/motion-packs`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Recommended Motion Packs',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/video/motion-packs/recommended`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Full Body Stats',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/video/fullbody/stats`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Audio Tracks',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/video/audio-tracks`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Video Styles',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/video/styles`,
            header: [authHeader]
          }
        }
      ]
    },
    // Transform Module
    {
      name: 'Transform',
      item: [
        {
          name: 'Create Transformation',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/transform/create`,
            header: [authHeader],
            body: {
              mode: 'formdata',
              formdata: [
                {key: 'image', type: 'file', src: ''},
                {key: 'style', value: 'maasai', type: 'text'}
              ]
            }
          }
        },
        {
          name: 'Get Transformation Status',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/transform/status/{{jobId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Transformation History',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/transform/history`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Public Transformation',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/transform/public/{{shareCode}}`,
            header: []
          }
        },
        {
          name: 'Get Available Styles',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/transform/styles`,
            header: [authHeader]
          }
        }
      ]
    },
    // Tribe Module
    {
      name: 'Tribes',
      item: [
        {
          name: 'Get All Tribes',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/tribes`,
            header: []
          }
        },
        {
          name: 'Get My Tribe',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/tribes/my-tribe`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Tribe',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/tribes/{{tribeId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Join Tribe',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/tribes/join`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({tribeId: '{{tribeId}}'}, null, 2)}
          }
        },
        {
          name: 'Get Tribe Leaderboard',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/tribes/leaderboard`,
            header: [authHeader]
          }
        },
        {
          name: 'Award Tribe Points',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/tribes/points/award`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({reason: 'battle_win', points: 50}, null, 2)}
          }
        }
      ]
    },
    // Feed Module
    {
      name: 'Feed',
      item: [
        {
          name: 'Get Feed - For You',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/feed/foryou`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Feed - Following',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/feed/following`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Feed - Tribe',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/feed/tribe`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Feed - Battles',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/feed/battles`,
            header: [authHeader]
          }
        },
        {
          name: 'Like Video',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/feed/video/{{videoId}}/like`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({on: true}, null, 2)}
          }
        },
        {
          name: 'Share Video',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/feed/video/{{videoId}}/share`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({channel: 'wa'}, null, 2)}
          }
        },
        {
          name: 'Track View',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/feed/video/{{videoId}}/view`,
            header: [authHeader, contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                watchedMs: 5000,
                completed: true,
                replayed: 0,
                sessionId: 'session123',
                tab: 'foryou',
                position: 0
              }, null, 2)
            }
          }
        },
        {
          name: 'Report Video',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/feed/video/{{videoId}}/report`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({reason: 'spam'}, null, 2)}
          }
        },
        {
          name: 'Follow Creator',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/feed/video/{{videoId}}/follow`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Video',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/feed/video/{{videoId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Public Video',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/feed/public/{{videoId}}`,
            header: []
          }
        },
        {
          name: 'Vote on Battle',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/feed/battles/{{battleId}}/vote`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({side: 'challenger'}, null, 2)}
          }
        },
        {
          name: 'Get Feed Analytics',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/feed/analytics`,
            header: [authHeader]
          }
        }
      ]
    },
    // Leaderboard Module
    {
      name: 'Leaderboard',
      item: [
        {
          name: 'Get Tribe Leaderboard',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/leaderboard/tribes`,
            header: []
          }
        },
        {
          name: 'Get User Leaderboard',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/leaderboard/users`,
            header: []
          }
        },
        {
          name: 'Get Country Leaderboard',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/leaderboard/users/country/ZA`,
            header: []
          }
        },
        {
          name: 'Get My Rank',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/leaderboard/me`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Weekly Champions',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/leaderboard/weekly-champions`,
            header: []
          }
        },
        {
          name: 'Get Recent Champions',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/leaderboard/recent-champions`,
            header: []
          }
        },
        {
          name: 'Search Leaderboard',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/leaderboard/search?q=warrior`,
            header: []
          }
        }
      ]
    },
    // Wallet Module
    {
      name: 'Wallet',
      item: [
        {
          name: 'Get Wallet',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/wallet`,
            header: [authHeader]
          }
        },
        {
          name: 'Earn Coins',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/wallet/earn`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({action: 'daily_login', amount: 10}, null, 2)}
          }
        },
        {
          name: 'Spend Coins',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/wallet/spend`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({action: 'boost_video', amount: 50}, null, 2)}
          }
        },
        {
          name: 'Purchase Coins',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/wallet/purchase`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({packId: 'pack_100', paymentMethod: 'stripe'}, null, 2)}
          }
        },
        {
          name: 'Get Transaction History',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/wallet/history`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Earning Opportunities',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/wallet/opportunities`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Spending Options',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/wallet/spending-options`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Coin Packs',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/wallet/coin-packs`,
            header: [authHeader]
          }
        },
        {
          name: 'Check Action',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/wallet/check-action`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({action: 'boost_video'}, null, 2)}
          }
        },
        {
          name: 'Save Streak',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/wallet/save-streak`,
            header: [authHeader]
          }
        },
        {
          name: 'Battle Boost',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/wallet/battle-boost`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({battleId: '{{battleId}}'}, null, 2)}
          }
        },
        {
          name: 'Priority Transformation',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/wallet/priority-transformation`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({transformId: '{{transformId}}'}, null, 2)}
          }
        },
        {
          name: 'Retry Transformation',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/wallet/retry-transformation`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({transformId: '{{transformId}}'}, null, 2)}
          }
        },
        {
          name: 'Tribe Support',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/wallet/tribe-support`,
            header: [authHeader]
          }
        }
      ]
    },
    // Achievement Module
    {
      name: 'Achievements',
      item: [
        {
          name: 'Get All Achievements',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/achievements`,
            header: []
          }
        },
        {
          name: 'Get Achievement',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/achievements/{{achievementId}}`,
            header: []
          }
        },
        {
          name: 'Get Categories',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/achievements/categories`,
            header: []
          }
        },
        {
          name: 'Get Rarities',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/achievements/rarities`,
            header: []
          }
        },
        {
          name: 'Get Achievement Stats',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/achievements/stats`,
            header: []
          }
        },
        {
          name: 'Get Achievement Leaderboard',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/achievements/leaderboard`,
            header: []
          }
        },
        {
          name: 'Get User Achievements',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/achievements/me`,
            header: [authHeader]
          }
        },
        {
          name: 'Claim Achievement Reward',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/achievements/claim/{{achievementId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Initialize Achievements',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/achievements/initialize`,
            header: [authHeader]
          }
        },
        {
          name: 'Update Progress',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/achievements/progress`,
            header: [authHeader, contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({userId: '{{userId}}', metric: 'battles_won', value: 1}, null, 2)
            }
          }
        }
      ]
    },
    // Challenge Module
    {
      name: 'Challenges',
      item: [
        {
          name: 'Get Daily Challenge',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/challenge/daily`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Weekly Challenge',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/challenge/weekly`,
            header: [authHeader]
          }
        },
        {
          name: 'Update Progress',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/challenge/progress`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({activityType: 'transform', value: 1}, null, 2)}
          }
        },
        {
          name: 'Complete Challenge',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/challenge/complete`,
            header: [authHeader, contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({userChallengeId: '{{challengeId}}', challengeType: 'daily'}, null, 2)
            }
          }
        },
        {
          name: 'Get Challenge Stats',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/challenge/stats`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Challenge History',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/challenge/history`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Challenge Leaderboard',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/challenge/leaderboard`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Tribe Weekly Challenge',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/challenge/tribe-weekly`,
            header: [authHeader]
          }
        }
      ]
    },
    // Notification Module
    {
      name: 'Notifications',
      item: [
        {
          name: 'Get Notifications',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/notifications`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Unread Count',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/notifications/unread-count`,
            header: [authHeader]
          }
        },
        {
          name: 'Mark as Read',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/notifications/{{notificationId}}/read`,
            header: [authHeader]
          }
        },
        {
          name: 'Mark All as Read',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/notifications/read-all`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Settings',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/notifications/settings`,
            header: [authHeader]
          }
        },
        {
          name: 'Update Settings',
          request: {
            method: 'PUT',
            url: `${baseUrl}/api/notifications/settings`,
            header: [authHeader, contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({channels: {push: true, inapp: true, whatsapp: false}}, null, 2)
            }
          }
        },
        {
          name: 'Register Device Token',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/notifications/device-token`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({token: 'device_token_123', platform: 'ios'}, null, 2)}
          }
        },
        {
          name: 'Remove Device Token',
          request: {
            method: 'DELETE',
            url: `${baseUrl}/api/notifications/device-token`,
            header: [authHeader]
          }
        },
        {
          name: 'Register WhatsApp Phone',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/notifications/whatsapp-phone`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({phone: '+27123456789'}, null, 2)}
          }
        },
        {
          name: 'Remove WhatsApp Phone',
          request: {
            method: 'DELETE',
            url: `${baseUrl}/api/notifications/whatsapp-phone`,
            header: [authHeader]
          }
        },
        {
          name: 'Send Test Notification',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/notifications/test`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Stats',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/notifications/stats`,
            header: [authHeader]
          }
        }
      ]
    },
    // Referral Module
    {
      name: 'Referral',
      item: [
        {
          name: 'Get My Referral Code',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/referral/my-code`,
            header: [authHeader]
          }
        },
        {
          name: 'Generate Referral Code',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/referral/generate`,
            header: [authHeader]
          }
        },
        {
          name: 'Redeem Referral Code',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/referral/redeem`,
            header: [authHeader, contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({referralCode: 'REF123', phone: '+27123456789'}, null, 2)
            }
          }
        },
        {
          name: 'Get Invite Link Info',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/referral/invite-link/{{referralCode}}`,
            header: []
          }
        },
        {
          name: 'Get Referral Stats',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/referral/stats`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Top Recruiters',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/referral/leaderboard/recruiters`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Top Recruiting Tribes',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/referral/leaderboard/tribes`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Referral Rewards',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/referral/rewards`,
            header: [authHeader]
          }
        },
        {
          name: 'Claim Referral Reward',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/referral/claim-reward`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({rewardType: 'coins'}, null, 2)}
          }
        },
        {
          name: 'Track Referral Share',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/referral/share`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({platform: 'whatsapp', referralCode: 'REF123'}, null, 2)}
          }
        }
      ]
    },
    // Chat Module
    {
      name: 'Chat',
      item: [
        {
          name: 'Send Tribe Message',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/chat/tribe/{{tribeId}}/send`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({text: 'Hello tribe!', type: 'message'}, null, 2)}
          }
        },
        {
          name: 'Get Tribe Messages',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/chat/tribe/{{tribeId}}/messages`,
            header: [authHeader]
          }
        },
        {
          name: 'Mute User in Tribe',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/chat/tribe/{{tribeId}}/mute/{{userId}}`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({durationHours: 24, reason: 'spam'}, null, 2)}
          }
        },
        {
          name: 'Send Direct Message',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/chat/dm/{{userId}}/send`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({text: 'Hey there!'}, null, 2)}
          }
        },
        {
          name: 'Get Direct Messages',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/chat/dm/{{userId}}/messages`,
            header: [authHeader]
          }
        },
        {
          name: 'Mark Messages as Read',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/chat/dm/{{conversationId}}/read`,
            header: [authHeader]
          }
        },
        {
          name: 'Toggle Reaction',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/chat/react`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({messageId: '{{messageId}}', emoji: '🔥'}, null, 2)}
          }
        },
        {
          name: 'Block User',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/chat/block/{{userId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Chat Settings',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/chat/settings?tribeId={{tribeId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Update Chat Settings',
          request: {
            method: 'PUT',
            url: `${baseUrl}/api/chat/settings`,
            header: [authHeader, contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({tribeId: '{{tribeId}}', notificationSettings: {muted: false}}, null, 2)
            }
          }
        },
        {
          name: 'Get Conversations',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/chat/conversations`,
            header: [authHeader]
          }
        }
      ]
    },
    // Comments Module
    {
      name: 'Comments',
      item: [
        {
          name: 'Get Comments',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/comments/{{videoId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Replies',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/comments/{{commentId}}/replies`,
            header: [authHeader]
          }
        },
        {
          name: 'Create Comment',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/comments`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({videoId: '{{videoId}}', text: 'Great video!'}, null, 2)}
          }
        },
        {
          name: 'Toggle Like',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/comments/{{commentId}}/like`,
            header: [authHeader]
          }
        },
        {
          name: 'Report Comment',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/comments/{{commentId}}/report`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({reason: 'spam'}, null, 2)}
          }
        },
        {
          name: 'Pin Comment',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/comments/{{commentId}}/pin`,
            header: [authHeader]
          }
        },
        {
          name: 'Unpin Comment',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/comments/{{commentId}}/unpin`,
            header: [authHeader]
          }
        },
        {
          name: 'Delete Comment',
          request: {
            method: 'DELETE',
            url: `${baseUrl}/api/comments/{{commentId}}`,
            header: [authHeader]
          }
        }
      ]
    },
    // Creator Module
    {
      name: 'Creator',
      item: [
        {
          name: 'Get Public Share Page',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/creator/public/profile/{{username}}`,
            header: []
          }
        },
        {
          name: 'Get Creator Profile',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/creator/profile/{{username}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Creator Feed',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/creator/profile/{{username}}/feed`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Creator Stats',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/creator/profile/{{username}}/stats`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Follow Status',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/creator/profile/{{username}}/follow-status`,
            header: [authHeader]
          }
        },
        {
          name: 'Update Creator Profile',
          request: {
            method: 'PUT',
            url: `${baseUrl}/api/creator/profile`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({bio: 'Creative warrior', bannerUrl: ''}, null, 2)}
          }
        },
        {
          name: 'Follow Creator',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/creator/follow/{{userId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Unfollow Creator',
          request: {
            method: 'DELETE',
            url: `${baseUrl}/api/creator/follow/{{userId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Followers',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/creator/followers/{{userId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Following',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/creator/following/{{userId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Top Creators',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/creator/creators/top`,
            header: [authHeader]
          }
        },
        {
          name: 'Promote to Creator',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/creator/profile/promote-to-creator`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({userId: '{{userId}}'}, null, 2)}
          }
        }
      ]
    },
    // Boost Module
    {
      name: 'Boost',
      item: [
        {
          name: 'Boost Video',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/boost/video`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({videoId: '{{videoId}}', tier: 'bronze'}, null, 2)}
          }
        },
        {
          name: 'Boost Tribe',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/boost/tribe`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({tribeId: '{{tribeId}}', tier: 'rally'}, null, 2)}
          }
        },
        {
          name: 'Get Video Boost',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/boost/video/{{videoId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Tribe Boost',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/boost/tribe/{{tribeId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Boost Tiers',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/boost/tiers`,
            header: [authHeader]
          }
        }
      ]
    },
    // Events Module
    {
      name: 'Events',
      item: [
        {
          name: 'Get Current Event',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/events/current`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Upcoming Event',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/events/upcoming`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Clan War Standings',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/events/war/standings`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Power Hour Status',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/events/power-hour`,
            header: [authHeader]
          }
        },
        {
          name: 'Update Clan War Score',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/events/war/score`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({activityType: 'battle_win', value: 1}, null, 2)}
          }
        },
        {
          name: 'Get User Event Stats',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/events/stats`,
            header: [authHeader]
          }
        },
        {
          name: 'Get User Event History',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/events/history`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Event Leaderboard',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/events/leaderboard`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Tribe War Status',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/events/tribe-war`,
            header: [authHeader]
          }
        }
      ]
    },
    // Progression Module
    {
      name: 'Progression',
      item: [
        {
          name: 'Get User Progression',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/progression/progression`,
            header: [authHeader]
          }
        },
        {
          name: 'Grant XP',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/progression/xp`,
            header: [contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({userId: '{{userId}}', xp: 100, reason: 'battle_win'}, null, 2)
            }
          }
        },
        {
          name: 'Mark Qualifying Action',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/progression/qualify`,
            header: [contentType],
            body: {mode: 'raw', raw: JSON.stringify({userId: '{{userId}}', action: 'transform'}, null, 2)}
          }
        },
        {
          name: 'Get Streak Status',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/progression/streak`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Qualifying Actions Status',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/progression/qualifying-actions`,
            header: [authHeader]
          }
        },
        {
          name: 'Use Freeze',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/progression/freeze/use`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({confirm: true}, null, 2)}
          }
        },
        {
          name: 'Grant Freeze',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/progression/freeze/grant`,
            header: [contentType],
            body: {mode: 'raw', raw: JSON.stringify({userId: '{{userId}}', count: 1, source: 'reward'}, null, 2)}
          }
        },
        {
          name: 'Claim Reward',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/progression/reward/claim`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({rewardId: 'reward_123'}, null, 2)}
          }
        },
        {
          name: 'Handle Daily Login',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/progression/daily-login`,
            header: [authHeader]
          }
        }
      ]
    },
    // Rewards Module
    {
      name: 'Rewards',
      item: [
        {
          name: 'Get User Achievements',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/rewards/achievements`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Unclaimed Rewards',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/rewards/inbox`,
            header: [authHeader]
          }
        },
        {
          name: 'Claim Reward',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/rewards/claim`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({rewardId: 'reward_123'}, null, 2)}
          }
        },
        {
          name: 'Equip Cosmetic',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/rewards/equip`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({slot: 'frame', key: 'golden_frame'}, null, 2)}
          }
        },
        {
          name: 'Get User Inventory',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/rewards/inventory`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Equipped Cosmetics',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/rewards/equipped`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Achievements by Category',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/rewards/achievements/category/battle`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Achievements by Rarity',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/rewards/achievements/rarity/legendary`,
            header: [authHeader]
          }
        },
        {
          name: 'Get All Rewards',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/rewards/achievements/all`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Achievement by Key',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/rewards/achievements/{{achievementKey}}`,
            header: [authHeader]
          }
        }
      ]
    },
    // Moderation Module
    {
      name: 'Moderation',
      item: [
        {
          name: 'Submit Report',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/moderation/report`,
            header: [authHeader, contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({targetType: 'video', targetId: '{{videoId}}', reason: 'spam'}, null, 2)
            }
          }
        },
        {
          name: 'Get Report Reasons',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/moderation/reasons`,
            header: [authHeader]
          }
        },
        {
          name: 'Block User',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/moderation/block`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({blockedUserId: '{{userId}}'}, null, 2)}
          }
        },
        {
          name: 'Unblock User',
          request: {
            method: 'DELETE',
            url: `${baseUrl}/api/moderation/block`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({blockedUserId: '{{userId}}'}, null, 2)}
          }
        },
        {
          name: 'Get Blocked Users',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/moderation/blocked-users`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Blockers',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/moderation/blockers`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Moderation History',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/moderation/history`,
            header: [authHeader]
          }
        },
        {
          name: 'Get User Reports',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/moderation/reports`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Reports Against User',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/moderation/reports-against`,
            header: [authHeader]
          }
        },
        {
          name: 'Moderate Text',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/moderation/moderate-text`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({text: 'Sample text to moderate'}, null, 2)}
          }
        },
        {
          name: 'Check Block',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/moderation/check-block/{{userId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Moderation Stats',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/moderation/stats`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Moderation Status',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/moderation/status`,
            header: [authHeader]
          }
        }
      ]
    },
    // Payment Module
    {
      name: 'Payments',
      item: [
        {
          name: 'Create Checkout Session',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/payments/checkout-session`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({plan: 'monthly'}, null, 2)}
          }
        },
        {
          name: 'Create Payment Intent',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/payments/payment-intent`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({type: 'boost', metadata: {}}, null, 2)}
          }
        },
        {
          name: 'Get Subscription Status',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/payments/subscription/status`,
            header: [authHeader]
          }
        },
        {
          name: 'Cancel Subscription',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/payments/subscription/cancel`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Subscription History',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/payments/subscription/history`,
            header: [authHeader]
          }
        },
        {
          name: 'Create Trial Subscription',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/payments/subscription/trial`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({days: 7}, null, 2)}
          }
        }
      ]
    },
    // Fraud Detection Module
    {
      name: 'Fraud Detection',
      item: [
        {
          name: 'Get Fraud Detections',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/fraud-detection/fraud-detections`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Pending Fraud Detections',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/fraud-detection/pending-fraud-detections`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Fraud Detection Statistics',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/fraud-detection/fraud-detection-statistics`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Trust Score',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/fraud-detection/trust-score`,
            header: [authHeader]
          }
        },
        {
          name: 'Update Trust Score',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/fraud-detection/trust-score/update`,
            header: [authHeader, contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                userId: '{{userId}}',
                points: -10,
                reason: 'spam',
                action: 'penalize'
              }, null, 2)
            }
          }
        },
        {
          name: 'Get Low Trust Users',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/fraud-detection/low-trust-users`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Shadowbanned Users',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/fraud-detection/shadowbanned-users`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Device Fingerprints',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/fraud-detection/device-fingerprints`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Suspicious Devices',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/fraud-detection/suspicious-devices`,
            header: [authHeader]
          }
        }
      ]
    },
    // Admin Module
    {
      name: 'Admin',
      item: [
        {
          name: 'Admin Login',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/admin/auth/login`,
            header: [contentType],
            body: {
              mode: 'raw',
              raw: JSON.stringify({email: 'admin@afroverse.com', password: 'admin123'}, null, 2)
            }
          }
        },
        {
          name: 'Admin Get Profile',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/admin/profile`,
            header: [authHeader]
          }
        },
        {
          name: 'Admin Update Profile',
          request: {
            method: 'PUT',
            url: `${baseUrl}/api/admin/profile`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({name: 'Admin User'}, null, 2)}
          }
        },
        {
          name: 'Get Dashboard',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/admin/dashboard`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Moderation Queue',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/admin/moderation/queue`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Moderation Job',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/admin/moderation/jobs/{{jobId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Assign Moderation Job',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/admin/moderation/jobs/{{jobId}}/assign`,
            header: [authHeader]
          }
        },
        {
          name: 'Make Moderation Decision',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/admin/moderation/jobs/{{jobId}}/decision`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({decision: 'approve', reason: 'Clean'}, null, 2)}
          }
        },
        {
          name: 'Get Users',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/admin/users`,
            header: [authHeader]
          }
        },
        {
          name: 'Get User',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/admin/users/{{userId}}`,
            header: [authHeader]
          }
        },
        {
          name: 'Get User Details',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/admin/users/{{userId}}/details`,
            header: [authHeader]
          }
        },
        {
          name: 'Ban User',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/admin/users/{{userId}}/ban`,
            header: [authHeader, contentType],
            body: {mode: 'raw', raw: JSON.stringify({reason: 'TOS violation'}, null, 2)}
          }
        },
        {
          name: 'Unban User',
          request: {
            method: 'POST',
            url: `${baseUrl}/api/admin/users/{{userId}}/unban`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Tribes',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/admin/tribes`,
            header: [authHeader]
          }
        },
        {
          name: 'Get Audit Logs',
          request: {
            method: 'GET',
            url: `${baseUrl}/api/admin/audit/logs`,
            header: [authHeader]
          }
        }
      ]
    }
  ]
};

// Write to file
fs.writeFileSync(
  path.join(__dirname, 'afroverse.postman_collection.json'),
  JSON.stringify(collection, null, 2)
);

console.log('✅ Postman collection generated successfully!');
console.log(`📝 Total endpoints: ${collection.item.reduce((acc, item) => {
  if (item.item) return acc + item.item.length;
  return acc + 1;
}, 0)}`);

