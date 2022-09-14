const applyActivity = require('./applyActivity');
const applyAFKTimeout = require('./applyAFKTimeout');
const applyMessageType = require('./applyMessageType');
const applyNSFWLevel = require('./applyNSFWLevel');
const applyPermission = require('./applyPermission');
const applyPresence = require('./applyPresence');
const applyRepeatMode = require('./applyRepeatMode');
const applyText = require('./applyText');
const applyTier = require('./applyTier');
const applyVerificationLevel = require('./applyVerificationLevel');
const getFlag = require('./getFlag');
const getLanguage = require('./getLanguage');
const getMessageType = require('./getMessageType');
const groupMessageByAuthor = require('./groupMessageByAuthor');
const groupMessageByType = require('./groupMessageByType');
const isAutoCorrecting = require('./isAutoCorrecting');
const isValidURL = require('./isValidURL');
const musicSearch = require('./musicSearch');

module.exports = {
  applyActivity,
  applyAFKTimeout,
  applyMessageType,
  applyNSFWLevel,
  applyPermission,
  applyPresence,
  applyRepeatMode,
  applyText,
  applyTier,
  applyVerificationLevel,
  getFlag,
  getLanguage,
  getMessageType,
  groupMessageByAuthor,
  groupMessageByType,
  isAutoCorrecting,
  isValidURL,
  musicSearch,
};
