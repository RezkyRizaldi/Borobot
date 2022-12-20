const Canvas = require('@napi-rs/canvas');
const {
  AttachmentBuilder,
  AuditLogEvent,
  bold,
  EmbedBuilder,
  italic,
  time,
  TimestampStyles,
  WebhookClient,
} = require('discord.js');

const { applyText } = require('@/utils');

module.exports = {
  name: 'guildMemberUpdate',

  /**
   *
   * @param {import('discord.js').GuildMember} oldMember
   * @param {import('discord.js').GuildMember} newMember
   */
  async execute(oldMember, newMember) {
    const { client, guild } = newMember;

    const embed = new EmbedBuilder()
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp(Date.now())
      .setColor(newMember.displayHexColor);

    const roleLog = await guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberRoleUpdate,
      })
      .then((audit) => audit.entries.first());

    // If the member has boosted the server
    if (!oldMember.premiumSince && newMember.premiumSince) {
      const canvas = Canvas.createCanvas(700, 250);
      const context = canvas.getContext('2d');
      const background = await Canvas.loadImage(
        './src/assets/images/nitro.png',
      );

      context.drawImage(background, 0, 0, canvas.width, canvas.height);
      context.strokeStyle = '#fcc9b9';
      context.strokeRect(0, 0, canvas.width, canvas.height);
      context.font = applyText(canvas, `${newMember.displayName}!`);
      context.textAlign = 'center';
      context.fillStyle = '#ffffff';
      context.fillText(
        `Welcome to test, ${newMember.displayName}!`,
        canvas.width / 2,
        canvas.height / 1.2,
      );

      const avatar = await Canvas.loadImage(
        newMember.displayAvatarURL({ extension: 'jpg' }),
      );

      context.beginPath();
      context.arc(125, 125, 100, 0, Math.PI * 2, true);
      context.closePath();
      context.clip();
      context.drawImage(avatar, 25, 25, 200, 200);

      const attachment = new AttachmentBuilder(await canvas.encode('png'), {
        name: 'nitro.png',
        description: 'Nitro Booster',
      });

      embed
        .setAuthor({
          name: `${guild.icon ? '🚀 ' : ''}Server Boosted`,
          iconURL: guild.iconURL() ?? undefined,
        })
        .setDescription(
          `Thank you for boosting ${guild}, ${bold(newMember.displayName)}!`,
        );

      await newMember.send({ embeds: [embed] });

      embed
        .setThumbnail(newMember.displayAvatarURL())
        .setImage('attachment://nitro.png');

      if (!guild.systemChannel) return;

      await guild.systemChannel.send({ embeds: [embed], files: [attachment] });
    }

    // If the member roles have changed
    if (roleLog.target.id === newMember.id) {
      const RoleAddLogger = new WebhookClient({
        id: process.env.MEMBER_ROLE_ADD_WEBHOOK_ID,
        token: process.env.MEMBER_ROLE_ADD_WEBHOOK_TOKEN,
      });

      const removedRoles = oldMember.roles.cache.filter(
        (role) => !newMember.roles.cache.has(role.id),
      );

      if (removedRoles.size) {
        embed
          .setAuthor({
            name: 'Member Role Removed',
            iconURL: oldMember.displayAvatarURL(),
          })
          .setDescription(
            `${removedRoles
              .map((role) => `${role}`)
              .join(', ')} have been removed from ${oldMember}'s role by ${
              roleLog.executor
            }.`,
          )
          .setFields([
            {
              name: '🕒 Removed At',
              value: time(
                Math.floor(Date.now() / 1000),
                TimestampStyles.RelativeTime,
              ),
              inline: true,
            },
            { name: '📄 Reason', value: roleLog.reason ?? 'No reason' },
          ]);

        await RoleAddLogger.send({ embeds: [embed] });
      }

      const RoleRemoveLogger = new WebhookClient({
        id: process.env.MEMBER_ROLE_REMOVE_WEBHOOK_ID,
        token: process.env.MEMBER_ROLE_REMOVE_WEBHOOK_TOKEN,
      });

      const addedRoles = newMember.roles.cache.filter(
        (role) => !oldMember.roles.cache.has(role.id),
      );

      if (addedRoles.size) {
        embed
          .setAuthor({
            name: 'Member Roles Added',
            iconURL: newMember.displayAvatarURL(),
          })
          .setDescription(
            `${addedRoles
              .map((role) => `${role}`)
              .join(', ')} have been added to ${newMember}'s role by ${
              roleLog.executor
            }.`,
          )
          .setFields([
            {
              name: '🕒 Added At',
              value: time(
                Math.floor(Date.now() / 1000),
                TimestampStyles.RelativeTime,
              ),
              inline: true,
            },
            { name: '📄 Reason', value: roleLog.reason ?? 'No reason' },
          ]);

        await RoleRemoveLogger.send({ embeds: [embed] });
      }
    }

    const muteLog = await guild
      .fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberRoleUpdate,
      })
      .then((audit) => audit.entries.first());

    const MuteLogger = new WebhookClient({
      id: process.env.MEMBER_TEXT_MUTE_WEBHOOK_ID,
      token: process.env.MEMBER_TEXT_MUTE_WEBHOOK_TOKEN,
    });

    const mutedRole = guild.roles.cache.find(
      (role) => role.name.toLowerCase() === 'muted',
    );

    // If the member muted by a moderator
    if (
      !oldMember.roles.cache.has(mutedRole.id) &&
      newMember.roles.cache.has(mutedRole.id)
    ) {
      embed
        .setAuthor({
          name: 'Member Muted from Text Channel',
          iconURL: newMember.displayAvatarURL(),
        })
        .setDescription(
          `${newMember} has been muted from text channels by ${muteLog.executor}.`,
        )
        .setFields([
          {
            name: '🕒 Muted At',
            value: time(
              Math.floor(Date.now() / 1000),
              TimestampStyles.RelativeTime,
            ),
            inline: true,
          },
          { name: '📄 Reason', value: muteLog.reason ?? 'No reason' },
        ]);

      if (muteLog.target.id === newMember.id) {
        await MuteLogger.send({ embeds: [embed] });
      }
    }

    // If the member unmuted by a moderator
    if (
      oldMember.roles.cache.has(mutedRole.id) &&
      !newMember.roles.cache.has(mutedRole.id)
    ) {
      embed
        .setAuthor({
          name: 'Member Unmuted from Text Channel',
          iconURL: newMember.displayAvatarURL(),
        })
        .setDescription(
          `${newMember} has been unmuted from text channels by ${muteLog.executor}.`,
        )
        .setFields([
          {
            name: '🕒 Unmuted At',
            value: time(
              Math.floor(Date.now() / 1000),
              TimestampStyles.RelativeTime,
            ),
            inline: true,
          },
          { name: '📄 Reason', value: muteLog.reason ?? 'No reason' },
        ]);

      if (muteLog.target.id === newMember.id) {
        await MuteLogger.send({ embeds: [embed] });
      }
    }

    // If the member timed out by a moderator
    if (
      !oldMember.isCommunicationDisabled() &&
      newMember.isCommunicationDisabled()
    ) {
      const TimeoutLogger = new WebhookClient({
        id: process.env.MEMBER_GUILD_TIMEOUT_WEBHOOK_ID,
        token: process.env.MEMBER_GUILD_TIMEOUT_WEBHOOK_TOKEN,
      });

      const timeoutLog = await guild
        .fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MemberUpdate,
        })
        .then((audit) => audit.entries.first());

      embed
        .setAuthor({
          name: 'Member Timed Out',
          iconURL: newMember.displayAvatarURL(),
        })
        .setDescription(
          `${newMember} has been timed out by ${timeoutLog.executor}.`,
        )
        .setFields([
          {
            name: '🕒 Timed Out At',
            value: time(
              Math.floor(Date.now() / 1000),
              TimestampStyles.RelativeTime,
            ),
            inline: true,
          },
          {
            name: '🕒 Timed Out Until',
            value: time(
              newMember.communicationDisabledUntil,
              TimestampStyles.RelativeTime,
            ),
            inline: true,
          },
          { name: '📄 Reason', value: timeoutLog.reason ?? 'No reason' },
        ]);

      if (timeoutLog.target.id === newMember.id) {
        await TimeoutLogger.send({ embeds: [embed] });
      }
    }

    // If the member timeout removed by a moderator
    if (
      oldMember.isCommunicationDisabled() &&
      !newMember.isCommunicationDisabled()
    ) {
      const TimeoutRemoveLogger = new WebhookClient({
        id: process.env.MEMBER_GUILD_TIMEOUT_REMOVE_WEBHOOK_ID,
        token: process.env.MEMBER_GUILD_TIMEOUT_REMOVE_WEBHOOK_TOKEN,
      });

      const timeoutRemoveLog = await guild
        .fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MemberUpdate,
        })
        .then((audit) => audit.entries.first());

      embed
        .setAuthor({
          name: 'Member Timeout Removed',
          iconURL: newMember.displayAvatarURL(),
        })
        .setDescription(
          `${newMember} timeout has been removed by ${timeoutRemoveLog.executor}.`,
        )
        .setFields([
          {
            name: '🕒 Timeout Removed At',
            value: time(
              Math.floor(Date.now() / 1000),
              TimestampStyles.RelativeTime,
            ),
            inline: true,
          },
          { name: '📄 Reason', value: timeoutRemoveLog.reason ?? 'No reason' },
        ]);

      if (timeoutRemoveLog.target.id === newMember.id) {
        await TimeoutRemoveLogger.send({ embeds: [embed] });
      }
    }

    // If the member's nickname changed.
    if (oldMember.nickname !== newMember.nickname) {
      const NicknameLogger = new WebhookClient({
        id: process.env.MEMBER_NICKNAME_WEBHOOK_ID,
        token: process.env.MEMBER_NICKNAME_WEBHOOK_TOKEN,
      });

      const nicknameLog = await guild
        .fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MemberUpdate,
        })
        .then((audit) => audit.entries.first());

      embed
        .setAuthor({
          name: 'Member Nickname Changed',
          iconURL: newMember.displayAvatarURL(),
        })
        .setDescription(
          `${newMember} nickname has been changed by ${nicknameLog.executor}.`,
        )
        .setFields(
          {
            name: '🕒 Before',
            value: oldMember.nickname ?? italic('None'),
            inline: true,
          },
          {
            name: '🕒 After',
            value: newMember.nickname ?? italic('None'),
            inline: true,
          },
          {
            name: '🕒 Edited At',
            value: time(
              Math.floor(Date.now() / 1000),
              TimestampStyles.RelativeTime,
            ),
          },
          { name: '📄 Reason', value: nicknameLog.reason ?? 'No reason' },
        );

      if (nicknameLog.target.id === newMember.id) {
        await NicknameLogger.send({ embeds: [embed] });
      }
    }
  },
};
