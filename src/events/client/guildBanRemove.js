const {
  AuditLogEvent,
  EmbedBuilder,
  Events,
  time,
  TimestampStyles,
  WebhookClient,
} = require('discord.js');

module.exports = {
  name: Events.GuildBanRemove,

  /**
   *
   * @param {import('discord.js').GuildBan} ban
   */
  async execute(ban) {
    const { client, guild, user } = ban;

    const UnbanLogger = new WebhookClient({
      id: process.env.MEMBER_GUILD_UNBAN_WEBHOOK_ID,
      token: process.env.MEMBER_GUILD_UNBAN_WEBHOOK_TOKEN,
    });

    const UnbanLog = await guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanRemove,
      })
      .then((audit) => audit.entries.first());

    const message = new EmbedBuilder()
      .setDescription(`${user.tag} has been unbanned by ${UnbanLog.executor}.`)
      .setColor(guild.members.me.displayHexColor)
      .setAuthor({
        name: 'Member Unbanned',
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setFooter({
        text: client.user.tag,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp(Date.now())
      .setFields([
        {
          name: '🆔 Member ID',
          value: user.id,
          inline: true,
        },
        {
          name: '🕒 Unbanned At',
          value: time(
            Math.floor(Date.now() / 1000),
            TimestampStyles.RelativeTime,
          ),
          inline: true,
        },
        {
          name: '📄 Reason',
          value: UnbanLog.reason ?? 'No reason',
        },
      ]);

    if (UnbanLog.target.id === user.id) {
      return UnbanLogger.send({ embeds: [message] }).catch((err) =>
        console.error(err),
      );
    }
  },
};
