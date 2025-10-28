const notificationTemplates = {
  // WhatsApp Templates
  'wa_streak_v1': {
    whatsapp: {
      title: 'Streak At Risk',
      body: '🔥 Your {tribe} needs you! Streak ends in {time_left}. Finish 5 votes to save it. 👉 {deeplink}'
    },
    push: {
      title: 'Streak At Risk',
      body: '🔥 Your {tribe} needs you! Streak ends in {time_left}. Finish 5 votes to save it.'
    },
    inapp: {
      title: 'Streak At Risk',
      body: 'Your {tribe} needs you! Streak ends in {time_left}. Finish 5 votes to save it.'
    }
  },
  
  'wa_battle_live_v1': {
    whatsapp: {
      title: 'Battle Live',
      body: '⚔️ Your battle vs {opponent} is LIVE. Vote tally: {my_votes}-{their_votes}. Rally your tribe now: {deeplink}'
    },
    push: {
      title: 'Battle Live',
      body: '⚔️ Your battle vs {opponent} is LIVE. Vote tally: {my_votes}-{their_votes}. Rally your tribe now!'
    },
    inapp: {
      title: 'Battle Live',
      body: 'Your battle vs {opponent} is LIVE. Vote tally: {my_votes}-{their_votes}. Rally your tribe now!'
    }
  },
  
  'wa_battle_result_v1': {
    whatsapp: {
      title: 'Battle Result',
      body: '🏆 You {result}! {margin}% to {opponent}. Share your victory card: {deeplink}'
    },
    push: {
      title: 'Battle Result',
      body: '🏆 You {result}! {margin}% to {opponent}. Share your victory card!'
    },
    inapp: {
      title: 'Battle Result',
      body: 'You {result}! {margin}% to {opponent}. Share your victory card!'
    }
  },
  
  'wa_otp_v1': {
    whatsapp: {
      title: 'OTP Verification',
      body: 'Your Afroverse verification code is: {otp_code}. This code expires in 5 minutes.'
    },
    push: {
      title: 'OTP Verification',
      body: 'Your Afroverse verification code is: {otp_code}. This code expires in 5 minutes.'
    },
    inapp: {
      title: 'OTP Verification',
      body: 'Your Afroverse verification code is: {otp_code}. This code expires in 5 minutes.'
    }
  },
  
  // Push Templates
  'push_streak_v1': {
    push: {
      title: 'Streak At Risk',
      body: '🔥 Your {tribe} needs you! Streak ends in {time_left}. Finish 5 votes to save it.'
    },
    inapp: {
      title: 'Streak At Risk',
      body: 'Your {tribe} needs you! Streak ends in {time_left}. Finish 5 votes to save it.'
    }
  },
  
  'push_battle_live_v1': {
    push: {
      title: 'Battle Live',
      body: '⚔️ Your battle vs {opponent} is LIVE. Vote tally: {my_votes}-{their_votes}. Rally your tribe now!'
    },
    inapp: {
      title: 'Battle Live',
      body: 'Your battle vs {opponent} is LIVE. Vote tally: {my_votes}-{their_votes}. Rally your tribe now!'
    }
  },
  
  'push_battle_t2h': {
    push: {
      title: 'Battle 2h Left',
      body: '🕒 2h left — hold your lead! You\'re ahead by {margin} votes.'
    },
    inapp: {
      title: 'Battle 2h Left',
      body: '2h left — hold your lead! You\'re ahead by {margin} votes.'
    }
  },
  
  'push_transform': {
    push: {
      title: 'Transformation Ready',
      body: '✨ Your transformation is ready! View your amazing result.'
    },
    inapp: {
      title: 'Transformation Ready',
      body: 'Your transformation is ready! View your amazing result.'
    }
  },
  
  // In-App Templates
  'inapp_streak_v1': {
    inapp: {
      title: 'Streak At Risk',
      body: 'Your {tribe} needs you! Streak ends in {time_left}. Finish 5 votes to save it.'
    }
  },
  
  'inapp_battle_live_v1': {
    inapp: {
      title: 'Battle Live',
      body: 'Your battle vs {opponent} is LIVE. Vote tally: {my_votes}-{their_votes}. Rally your tribe now!'
    }
  },
  
  'inapp_battle_t2h': {
    inapp: {
      title: 'Battle 2h Left',
      body: '2h left — hold your lead! You\'re ahead by {margin} votes.'
    }
  },
  
  'inapp_transform': {
    inapp: {
      title: 'Transformation Ready',
      body: 'Your transformation is ready! View your amazing result.'
    }
  },
  
  'inapp_tribe_hour': {
    inapp: {
      title: 'Tribe Hour',
      body: '⚡ Tribe Hour: double XP live! Join your tribe for bonus rewards.'
    }
  },
  
  'inapp_leaderboard_climb': {
    inapp: {
      title: 'Leaderboard Climb',
      body: '📈 You\'re #{rank}! {points} points to top 10. Keep climbing!'
    }
  },
  
  // Default Templates
  'default_template': {
    whatsapp: {
      title: 'Afroverse Notification',
      body: 'You have a new notification from Afroverse.'
    },
    push: {
      title: 'Afroverse Notification',
      body: 'You have a new notification from Afroverse.'
    },
    inapp: {
      title: 'Afroverse Notification',
      body: 'You have a new notification from Afroverse.'
    }
  }
};

module.exports = notificationTemplates;
