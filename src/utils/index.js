const applyActivity = require('./applyActivity');
const applyAFKTimeout = require('./applyAFKTimeout');
const applyHexColor = require('./applyHexColor');
const applyMessageType = require('./applyMessageType');
const applyNSFWLevel = require('./applyNSFWLevel');
const applyPresence = require('./applyPresence');
const applyRepeatMode = require('./applyRepeatMode');
const serverMute = require('./serverMute');
const applyText = require('./applyText');
const applyTier = require('./applyTier');
const applyVerificationLevel = require('./applyVerificationLevel');
const getTranslateFlag = require('./getTranslateFlag');
const getImageReadLocale = require('./getImageReadLocale');
const getLanguage = require('./getLanguage');
const getMessageType = require('./getMessageType');
const groupMessageByAuthor = require('./groupMessageByAuthor');
const groupMessageByType = require('./groupMessageByType');
const isValidURL = require('./isValidURL');
const truncate = require('./truncate');

module.exports = {
  applyActivity,
  applyAFKTimeout,
  applyHexColor,
  applyMessageType,
  applyNSFWLevel,
  applyPresence,
  applyRepeatMode,
  serverMute,
  applyText,
  applyTier,
  applyVerificationLevel,
  getTranslateFlag,
  getImageReadLocale,
  getLanguage,
  getMessageType,
  groupMessageByAuthor,
  groupMessageByType,
  isValidURL,
  truncate,
};
