const {
  AuditLogEvent,
  bold,
  EmbedBuilder,
  Events,
  time,
  TimestampStyles,
  WebhookClient,
} = require('discord.js');

module.exports = {
  name: Events.ThreadDelete,

  /**
   *
   * @param {import('discord.js').ThreadChannel} thread
   */
  async execute(thread) {
    const { client, guild } = thread;

    const ThreadLogger = new WebhookClient({
      id: process.env.CHANNEL_THREAD_WEBHOOK_ID,
      token: process.env.CHANNEL_THREAD_WEBHOOK_TOKEN,
    });

    const deleteLog = await guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ThreadDelete,
      })
      .then((audit) => audit.entries.first());

    const embed = new EmbedBuilder()
      .setColor(guild.members.me?.displayColor ?? null)
      .setTimestamp(Date.now())
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setAuthor({ name: '💭 Thread Channel Deleted' })
      .setDescription(
        `A thread channel ${
          thread.parent ? `in ${thread.parent}` : ''
        } was ${bold('deleted')} by ${deleteLog.executor}.`,
      )
      .setFields([
        { name: '🔤 Name', value: thread.name, inline: true },
        {
          name: '🕒 Created At',
          value: time(thread.createdAt, TimestampStyles.RelativeTime),
          inline: true,
        },
        {
          name: '🕒 Deleted At',
          value: time(
            Math.floor(Date.now() / 1000),
            TimestampStyles.RelativeTime,
          ),
          inline: true,
        },
        { name: '📄 Reason', value: deleteLog.reason ?? 'No reason' },
      ]);

    return ThreadLogger.send({ embeds: [embed] });
  },
};
