const MODERATION_ACTIONS = {
  APPROVE: 'approve',
  REJECT: 'reject',
  FLAG: 'flag',
  BAN_USER: 'ban_user',
  DELETE_CONTENT: 'delete_content'
};

const MODERATION_REASONS = {
  NSFW: 'nsfw',
  VIOLENCE: 'violence',
  HATE_SPEECH: 'hate_speech',
  SPAM: 'spam',
  COPYRIGHT: 'copyright',
  OTHER: 'other'
};

module.exports = {
  MODERATION_ACTIONS,
  MODERATION_REASONS
};


