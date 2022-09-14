const {
  ApplicationCommandType,
  bold,
  ContextMenuCommandBuilder,
  EmbedBuilder,
  italic,
  time,
  TimestampStyles,
} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

const { applyActivity, applyPresence } = require('../../utils');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('User Info')
    .setType(ApplicationCommandType.User),
  type: 'Context Menu',

  /**
   *
   * @param {import('discord.js').ContextMenuCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction
      .deferReply()
      .then(async () => {
        await interaction.guild.members
          .fetch(interaction.targetId)
          .then(async (member) => {
            const userRoles = member.roles.icon
              ? `${member.roles.icon} `
              : member.roles.cache
                  .filter(
                    (role) => role.id !== interaction.guild.roles.everyone.id,
                  )
                  .map((role) => `${role}`)
                  .join(', ') || italic('None');

            const userClientStatus = member.presence?.clientStatus
              ? Object.keys(member.presence.clientStatus)
                  .map(
                    (status) =>
                      `${status.charAt(0).toUpperCase()}${status.slice(1)}`,
                  )
                  .join(', ')
              : italic('None');

            const userActivity =
              member.presence?.activities
                .map(
                  (activity) =>
                    `${applyActivity(activity.type)} ${bold(activity.name)} ${
                      activity.details ?? ''
                    } ${
                      activity.timestamps
                        ? `at ${time(
                            activity.timestamps.start,
                            TimestampStyles.RelativeTime,
                          )}`
                        : ''
                    }`,
                )
                .join('\n') ?? italic('None');

            const embed = new EmbedBuilder()
              .setTitle(`ℹ️ ${member.user.username}'s User Info`)
              .setColor(member.displayHexColor)
              .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
              .setFooter({
                text: member.client.user.username,
                iconURL: member.client.user.displayAvatarURL({ dynamic: true }),
              })
              .setTimestamp(Date.now())
              .setFields([
                {
                  name: '🆔 ID',
                  value: member.user.id,
                  inline: true,
                },
                {
                  name: '🏷️ Tag',
                  value: member.user.tag,
                  inline: true,
                },
                {
                  name: '👥 Nickname',
                  value: member.nickname ?? member.displayName,
                  inline: true,
                },
                {
                  name: `🔐 Roles${
                    member.roles.cache.size > 0 &&
                    ` (${member.roles.cache.size - 1})`
                  }`,
                  value: userRoles,
                },
                {
                  name: '📆 Member Since',
                  value: time(member.joinedAt, TimestampStyles.RelativeTime),
                  inline: true,
                },
                {
                  name: '🎊 Account Created',
                  value: time(
                    member.user.createdAt,
                    TimestampStyles.RelativeTime,
                  ),
                  inline: true,
                },
                {
                  name: '📇 Account Type',
                  value: member.user.bot ? 'Bot' : 'User',
                  inline: true,
                },
                {
                  name: '⭕ Presence Status',
                  value: applyPresence(member.presence?.status) ?? '⚫ Offline',
                  inline: true,
                },
                {
                  name: '🚀 Nitro Status',
                  value: member.premiumSince
                    ? `Boosting since ${time(
                        new Date(member.premiumSinceTimestamp),
                        TimestampStyles.RelativeTime,
                      )}`
                    : 'Not Boosting',
                  inline: true,
                },
                {
                  name: '📶 Online Device',
                  value: userClientStatus,
                  inline: true,
                },
                {
                  name: '🎭 Activity',
                  value: userActivity,
                },
              ]);

            await interaction.editReply({ embeds: [embed] });
          });
      })

      .catch(async (err) => {
        console.error(err);

        await interaction.editReply({ content: err.message });
      })
      .finally(
        async () =>
          await wait(15000).then(async () => await interaction.deleteReply()),
      );
  },
};
