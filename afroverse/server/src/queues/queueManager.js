const battleQueue = require('./battleQueue');
const feedQueue = require('./feedQueue');
const leaderboardQueue = require('./leaderboardQueue');
const notificationQueue = require('./notificationQueue');
const paymentQueue = require('./paymentQueue');
const progressionQueue = require('./progressionQueue');
const transformQueue = require('./transformQueue');

const queues = {
  battleQueue,
  feedQueue,
  leaderboardQueue,
  notificationQueue,
  paymentQueue,
  progressionQueue,
  transformQueue,
  referralQueue: null, // Will be created if needed
};

/**
 * Get a queue by name
 * @param {string} name - Queue name
 * @returns {Object} Queue instance
 */
function getQueue(name) {
  const queueName = `${name}Queue`;
  return queues[queueName] || queues[name];
}

/**
 * Initialize all queues
 */
async function initializeQueues() {
  // Add any initialization logic here
  return Promise.resolve();
}

module.exports = {
  getQueue,
  initializeQueues,
  queues
};


