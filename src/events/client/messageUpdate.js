const {
  AuditLogEvent,
  bold,
  EmbedBuilder,
  Events,
  hyperlink,
  time,
  TimestampStyles,
  WebhookClient,
} = require('discord.js');

const { applyMessageType, truncate } = require('../../utils');

module.exports = {
  name: Events.MessageUpdate,

  /**
   *
   * @param {import('discord.js').Message} oldMessage
   * @param {import('discord.js').Message} newMessage
   */
  async execute(oldMessage, newMessage) {
    if (!oldMessage.guild) return;

    const embed = new EmbedBuilder()
      .setColor(oldMessage.guild.members.me?.displayColor ?? null)
      .setTimestamp(Date.now())
      .setFooter({
        text: oldMessage.client.user.username,
        iconURL: oldMessage.client.user.displayAvatarURL(),
      });

    // If the message pinned
    if (!oldMessage.pinned && newMessage.pinned) {
      const PinLogger = new WebhookClient({
        id: process.env.MESSAGE_PIN_WEBHOOK_ID,
        token: process.env.MESSAGE_PIN_WEBHOOK_TOKEN,
      });

      const pinLog = await newMessage.guild
        .fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MessagePin,
        })
        .then((audit) => audit.entries.first());

      embed
        .setAuthor({
          name: 'Message Pinned',
          value: newMessage.author.displayAvatarURL(),
        })
        .setDescription(
          `A ${hyperlink(
            'message',
            newMessage.url,
            'Click here to jump to message',
          )} by ${newMessage.author} was ${bold('pinned')} by ${
            pinLog.executor
          } in ${newMessage.channel}.`,
        )
        .setFields([
          {
            name: '🕒 Pinned At',
            value: time(
              Math.floor(Date.now() / 1000),
              TimestampStyles.RelativeTime,
            ),
          },
          { name: '📄 Reason', value: pinLog.reason ?? 'No reason' },
        ]);

      await PinLogger.send({ embeds: [embed] });
    }

    // If the message unpinned
    if (oldMessage.pinned && !newMessage.pinned) {
      const UnpinLogger = new WebhookClient({
        id: process.env.MESSAGE_UNPIN_WEBHOOK_ID,
        token: process.env.MESSAGE_UNPIN_WEBHOOK_TOKEN,
      });

      const unpinLog = await newMessage.guild
        .fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MessageUnpin,
        })
        .then((audit) => audit.entries.first());

      embed
        .setAuthor({
          name: 'Message Unpinned',
          value: newMessage.author.displayAvatarURL(),
        })
        .setDescription(
          `A ${hyperlink(
            'message',
            newMessage.url,
            'Click here to jump to message',
          )} by ${newMessage.author} was ${bold('unpinned')} by ${
            unpinLog.executor
          } in ${newMessage.channel}.`,
        )
        .setFields([
          {
            name: '🕒 Unpinned At',
            value: time(
              Math.floor(Date.now() / 1000),
              TimestampStyles.RelativeTime,
            ),
          },
          { name: '📄 Reason', value: unpinLog.reason ?? 'No reason' },
        ]);

      await UnpinLogger.send({ embeds: [embed] });
    }

    const MessageLogger = new WebhookClient({
      id: process.env.MESSAGE_EDIT_WEBHOOK_ID,
      token: process.env.MESSAGE_EDIT_WEBHOOK_TOKEN,
    });

    if (oldMessage.partial || !oldMessage.author) {
      embed
        .setAuthor({ name: '✏️ Message Edited' })
        .setDescription(
          `A message was ${bold('edited')} in ${oldMessage.channel} at ${time(
            Math.floor(Date.now() / 1000),
            TimestampStyles.RelativeTime,
          )}.`,
        );

      await MessageLogger.send({ embeds: [embed] });
    }

    if (oldMessage.author.bot) return;

    if (oldMessage.author.id === oldMessage.client.user.id) return;

    if (oldMessage.cleanContent === newMessage.cleanContent) return;

    embed
      .setAuthor({
        name: 'Message Edited',
        iconURL: oldMessage.author.displayAvatarURL(),
      })
      .setDescription(
        `A ${hyperlink(
          'message',
          newMessage.url,
          'Click here to jump to message',
        )} by ${newMessage.author} was ${bold('edited')} in ${
          newMessage.channel
        } at ${time(newMessage.editedAt, TimestampStyles.RelativeTime)}.`,
      )
      .setFields(
        {
          name: '🕒 Before',
          value: truncate(applyMessageType(oldMessage), 1024),
        },
        {
          name: '🕒 After',
          value: truncate(applyMessageType(newMessage, true), 1024),
        },
      );

    return MessageLogger.send({ embeds: [embed] });
  },
};
