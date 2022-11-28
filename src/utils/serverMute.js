const {
  bold,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Colors,
  inlineCode,
  EmbedBuilder,
  OverwriteType,
} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Pagination } = require('pagination.djs');

/**
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @returns {Promise<import('discord.js').Role>} The muted role.
 */
const findOrCreateRole = async (interaction) => {
  const { guild } = interaction;

  if (!guild) return;

  const memberRole = guild.roles.cache.find(
    (role) => role.id === process.env.MEMBER_ROLE_ID,
  );

  const mutedRole = guild.roles.cache.find(
    (role) => role.name.toLowerCase() === 'muted',
  );

  /** @type {{ channels: { cache: import('discord.js').Collection<String, import('discord.js').BaseGuildTextChannel> } */
  const {
    channels: { cache: baseGuildTextChannels },
  } = guild;

  if (!mutedRole) {
    const role = await guild.roles.create({
      name: 'Muted',
      color: Colors.NotQuiteBlack,
      reason: 'servermute command setup.',
      hoist: false,
      mentionable: false,
      position: memberRole ? memberRole.position + 1 : 1,
      permissions: [],
    });

    baseGuildTextChannels
      .filter(
        (channel) =>
          channel.type !== ChannelType.GuildCategory &&
          channel.type !== ChannelType.GuildVoice &&
          channel.type !== ChannelType.GuildStageVoice,
      )
      .map(async (channel) => {
        if (!channel.parent) {
          await channel.permissionOverwrites.create(
            mutedRole,
            {
              SendMessages: false,
              AddReactions: false,
              CreatePublicThreads: false,
              CreatePrivateThreads: false,
              SendMessagesInThreads: false,
              Speak: false,
            },
            { type: OverwriteType.Role, reason: 'servermute command setup.' },
          );
        }

        /** @type {import('discord.js').CategoryChannel} */
        const categoryChannel =
          await channel.parent.permissionOverwrites.create(
            mutedRole,
            {
              SendMessages: false,
              AddReactions: false,
              CreatePublicThreads: false,
              CreatePrivateThreads: false,
              SendMessagesInThreads: false,
              Speak: false,
            },
            { type: OverwriteType.Role, reason: 'servermute command setup.' },
          );

        categoryChannel.children.cache.map(
          async (c) => await c.lockPermissions(),
        );
      });

    return role;
  }

  baseGuildTextChannels
    .filter(
      (channel) =>
        channel.type !== ChannelType.GuildCategory &&
        channel.type !== ChannelType.GuildVoice &&
        channel.type !== ChannelType.GuildStageVoice,
    )
    .map(async (channel) => {
      if (!channel.parent) {
        await channel.permissionOverwrites.create(
          mutedRole,
          {
            SendMessages: false,
            AddReactions: false,
            CreatePublicThreads: false,
            CreatePrivateThreads: false,
            SendMessagesInThreads: false,
            Speak: false,
          },
          { type: OverwriteType.Role, reason: 'servermute command setup.' },
        );
      }

      /** @type {import('discord.js').CategoryChannel} */
      const categoryChannel = await channel.parent.permissionOverwrites.create(
        mutedRole,
        {
          SendMessages: false,
          AddReactions: false,
          CreatePublicThreads: false,
          CreatePrivateThreads: false,
          SendMessagesInThreads: false,
          Speak: false,
        },
        { type: OverwriteType.Role, reason: 'servermute command setup.' },
      );

      categoryChannel.children.cache.map(
        async (c) => await c.lockPermissions(),
      );
    });

  return new Promise((resolve) => resolve(mutedRole));
};

/**
 *
 * @param {{ interaction: import('discord.js').ChatInputCommandInteraction, type?: String, isTemporary?: Boolean, all?: Boolean }} data
 * @returns {Promise<import('discord.js').Message<Boolean>>} The interaction message responses.
 */
const applyOrRemoveRole = async ({
  interaction,
  type = 'apply',
  isTemporary = false,
  all = false,
}) => {
  const { guild, options } = interaction;

  if (!guild) return;

  /** @type {import('discord.js').GuildMember} */
  const member = options.getMember('member');
  const duration = options.getInteger('duration', true);
  const reason = options.getString('reason') ?? 'No reason';
  const { roles, voice } = member;

  const muted =
    type === 'apply'
      ? roles.cache.find((role) => role.name.toLowerCase() === 'muted')
      : !roles.cache.find((role) => role.name.toLowerCase() === 'muted');

  if (muted) {
    throw `${member} ${
      type === 'apply' ? 'is already' : "isn't"
    } being muted from ${all ? bold(guild) : 'text channels'}.`;
  }

  const role = await findOrCreateRole(interaction);

  if (type === 'apply') {
    await roles.add(role, reason);

    await interaction.editReply({
      content: `Successfully ${bold('muted')} ${member} from ${
        all ? bold(guild) : 'text channels'
      }${
        isTemporary ? ` for ${inlineCode(`${duration / 1000} seconds`)}` : ''
      }.`,
    });

    if (!member.user.bot) {
      await member
        .send({
          content: `You have been ${bold('muted')} from ${bold(
            guild,
          )} for ${inlineCode(reason)}.`,
        })
        .catch(async () => {
          await interaction.followUp({
            content: `Could not send a DM to ${member}.`,
            ephemeral: true,
          });
        });
    }

    if (isTemporary) {
      if (all && !voice.serverMute) {
        await interaction.followUp({
          content: `${member} is not connected to a voice channel.`,
          ephemeral: true,
        });
      }

      await wait(duration);

      await roles.remove(role, 'server mute temporary duration has passed.');

      if (!member.user.bot) {
        return member
          .send({
            content: `Congratulations! You have been ${bold(
              'unmuted',
            )} from ${bold(guild)} for ${inlineCode(
              'server mute duration has passed',
            )}.`,
          })
          .catch(async () => {
            await interaction.followUp({
              content: `Could not send a DM to ${member}.`,
              ephemeral: true,
            });
          });
      }
    }
  }

  if (!role) throw `No one is being muted in ${bold(guild)}.`;

  await roles.remove(role, reason);

  await interaction.editReply({
    content: `Successfully ${bold('unmuted')} ${member} from ${
      all ? bold(guild) : 'text channels'
    }.`,
  });

  if (!member.user.bot) {
    return member
      .send({
        content: `Congratulations! You have been ${bold('unmuted')} from ${bold(
          guild,
        )} for ${inlineCode(reason)}.`,
      })
      .catch(async () => {
        await interaction.followUp({
          content: `Could not send a DM to ${member}.`,
          ephemeral: true,
        });
      });
  }
};

/**
 *
 * @param {{ interaction: import('discord.js').ChatInputCommandInteraction, type?: String, isTemporary?: Boolean, all?: Boolean }} data
 * @returns {Promise<import('discord.js').Message<Boolean>>} The interaction message responses.
 */
const createVoiceMute = async ({
  interaction,
  type = 'apply',
  isTemporary = false,
  all = false,
}) => {
  const { guild, options } = interaction;

  if (!guild) return;

  /** @type {import('discord.js').GuildMember} */
  const member = options.getMember('member');
  const duration = options.getInteger('duration', true);
  const reason = options.getString('reason') ?? 'No reason';
  const { voice } = member;

  if (!voice.channel) {
    if (all && !isTemporary) {
      return interaction.followUp({
        content: `${member} is not connected to a voice channel.`,
        ephemeral: true,
      });
    }

    throw `${member} is not connected to a voice channel.`;
  }

  const muted = type === 'apply' ? voice.serverMute : !voice.serverMute;

  if (muted) {
    throw `${member} ${
      type === 'apply' ? 'is already' : "isn't"
    } being muted from ${all ? bold(guild) : 'voice channels'}.`;
  }

  if (type === 'apply') {
    await voice.setMute(true, reason);

    await interaction.editReply({
      content: `Successfully ${bold('muted')} ${member} from ${
        all ? bold(guild) : 'voice channels'
      }${
        isTemporary ? ` for ${inlineCode(`${duration / 1000} seconds`)}` : ''
      }.`,
    });

    if (!member.user.bot) {
      await member
        .send({
          content: `You have been ${bold('muted')} from ${bold(
            guild,
          )} for ${inlineCode(reason)}.`,
        })
        .catch(async () => {
          await interaction.followUp({
            content: `Could not send a DM to ${member}.`,
            ephemeral: true,
          });
        });
    }

    if (isTemporary) {
      await wait(duration);

      await voice.setMute(false, 'server mute temporary duration has passed.');

      if (!member.user.bot) {
        return member
          .send({
            content: `Congratulations! You have been ${bold(
              'unmuted',
            )} from ${bold(guild)} for ${inlineCode(
              'server mute duration has passed',
            )}.`,
          })
          .catch(async () => {
            await interaction.followUp({
              content: `Could not send a DM to ${member}.`,
              ephemeral: true,
            });
          });
      }
    }
  }

  await voice.setMute(false, reason);

  return interaction.editReply({
    content: `Successfully ${bold('unmuted')} ${member} from ${
      all ? bold(guild) : 'voice channels'
    }.`,
  });
};

/**
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {String} subcommand
 * @returns {Promise<import('discord.js').Message<Boolean>>} The interaction message response.
 */
module.exports = async (interaction, subcommand) => {
  const { client, guild, options, user } = interaction;

  if (!guild) return;

  /** @type {{ paginations: import('discord.js').Collection<String, import('pagination.djs').Pagination> }} */
  const { paginations } = client;

  /** @type {import('discord.js').GuildMember} */
  const member = options.getMember('member');
  const channelType = options.getInteger('channel_type', true);

  if (subcommand !== 'list' && !member.manageable) {
    throw `You don't have appropiate permissions to ${
      subcommand === 'apply' || subcommand === 'temp' ? 'mute' : 'unmute'
    } ${member}.`;
  }

  if (subcommand !== 'list' && member.id === user.id) {
    throw `You can't ${
      subcommand === 'apply' || subcommand === 'temp' ? 'mute' : 'unmute'
    } yourself.`;
  }

  switch (subcommand) {
    case 'apply':
      switch (channelType) {
        case ChannelType.GuildText:
          await applyOrRemoveRole({ interaction });
          break;

        case ChannelType.GuildVoice:
          await createVoiceMute({ interaction });
          break;

        default:
          await applyOrRemoveRole({ interaction, all: true });

          await createVoiceMute({ interaction, all: true });
          break;
      }
      break;

    case 'temp':
      switch (channelType) {
        case ChannelType.GuildText:
          await applyOrRemoveRole({ interaction, isTemporary: true });
          break;

        case ChannelType.GuildVoice:
          await createVoiceMute({ interaction, isTemporary: true });
          break;

        default:
          await applyOrRemoveRole({
            interaction,
            all: true,
            isTemporary: true,
          });

          await createVoiceMute({ interaction, all: true, isTemporary: true });
          break;
      }
      break;

    case 'cease':
      switch (channelType) {
        case ChannelType.GuildText:
          await applyOrRemoveRole({ interaction, type: 'remove' });
          break;

        case ChannelType.GuildVoice:
          await createVoiceMute({ interaction, type: 'remove' });
          break;

        default:
          await applyOrRemoveRole({
            interaction,
            type: 'remove',
            all: true,
          });

          await createVoiceMute({ interaction, type: 'remove', all: true });
          break;
      }
      break;

    case 'list': {
      const embed = new EmbedBuilder()
        .setColor(guild.members.me?.displayHexColor ?? null)
        .setTimestamp(Date.now())
        .setFooter({
          text: client.user.username,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        });

      const mutedRole = member.roles.cache.find(
        (role) => role.name.toLowerCase() === 'muted',
      );

      if (!mutedRole) {
        throw `Can't find role with name ${inlineCode('muted')}.`;
      }

      const textMutedMembers = guild.members.cache.filter(
        (m) => m.id === mutedRole.id,
      );

      const voiceMutedMembers = guild.members.cache.filter(
        (m) => m.voice.serverMute,
      );

      const mutedMembers = guild.members.cache.filter(
        (m) => m.id === mutedRole.id && m.voice.serverMute,
      );

      switch (channelType) {
        case ChannelType.GuildText: {
          if (!textMutedMembers.size) {
            throw 'No one muted in text channels.';
          }

          const descriptions = [...textMutedMembers.values()].map(
            (textMutedMember, index) =>
              `${bold(`${index + 1}.`)} ${textMutedMember} (${
                textMutedMember.user.username
              })`,
          );

          if (textMutedMembers.size > 10) {
            const pagination = new Pagination(interaction, { limit: 10 })
              .setColor(guild.members.me?.displayHexColor ?? null)
              .setTimestamp(Date.now())
              .setFooter({
                text: `${client.user.username} | Page {pageNumber} of {totalPages}`,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
              })
              .setAuthor({
                name: `🔇 Muted Members from Text Channels (${textMutedMembers.size.toLocaleString()})`,
              })
              .setDescriptions(descriptions);

            pagination.buttons = {
              ...pagination.buttons,
              extra: new ButtonBuilder()
                .setCustomId('jump')
                .setEmoji('↕️')
                .setDisabled(false)
                .setStyle(ButtonStyle.Secondary),
            };

            paginations.set(pagination.interaction.id, pagination);

            return pagination.render();
          }

          embed
            .setAuthor({
              name: `🔇 Muted Members from Text Channels (${textMutedMembers.size.toLocaleString()})`,
            })
            .setDescription(descriptions.join('\n'));

          return interaction.editReply({ embeds: [embed] });
        }

        case ChannelType.GuildVoice: {
          if (!voiceMutedMembers.size) {
            throw 'No one muted in voice channels.';
          }

          const descriptions = [...voiceMutedMembers.values()].map(
            (voiceMutedMember, index) =>
              `${bold(`${index + 1}.`)} ${voiceMutedMember} (${
                voiceMutedMember.user.username
              })`,
          );

          if (voiceMutedMembers.size > 10) {
            const pagination = new Pagination(interaction, { limit: 10 })
              .setColor(guild.members.me?.displayHexColor ?? null)
              .setTimestamp(Date.now())
              .setFooter({
                text: `${client.user.username} | Page {pageNumber} of {totalPages}`,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
              })
              .setAuthor({
                name: `🔇 Muted Members from Voice Channels (${voiceMutedMembers.size.toLocaleString()})`,
              })
              .setDescriptions(descriptions);

            pagination.buttons = {
              ...pagination.buttons,
              extra: new ButtonBuilder()
                .setCustomId('jump')
                .setEmoji('↕️')
                .setDisabled(false)
                .setStyle(ButtonStyle.Secondary),
            };

            paginations.set(pagination.interaction.id, pagination);

            return pagination.render();
          }

          embed
            .setAuthor({
              name: `🔇 Muted Members from Voice Channels (${voiceMutedMembers.size.toLocaleString()})`,
            })
            .setDescription(descriptions.join('\n'));

          return interaction.editReply({ embeds: [embed] });
        }

        default: {
          if (!mutedMembers.size) {
            throw `No one muted in ${bold(guild)}.`;
          }

          const descriptions = [...mutedMembers.values()].map(
            (mutedMember, index) =>
              `${bold(`${index + 1}.`)} ${mutedMember} (${
                mutedMember.user.username
              })`,
          );

          if (mutedMembers.size > 10) {
            const pagination = new Pagination(interaction, { limit: 10 })
              .setColor(guild.members.me?.displayHexColor ?? null)
              .setTimestamp(Date.now())
              .setFooter({
                text: `${client.user.username} | Page {pageNumber} of {totalPages}`,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
              })
              .setAuthor({
                name: `🔇 Muted Members from ${guild} (${mutedMembers.size.toLocaleString()})`,
              })
              .setDescriptions(descriptions);

            pagination.buttons = {
              ...pagination.buttons,
              extra: new ButtonBuilder()
                .setCustomId('jump')
                .setEmoji('↕️')
                .setDisabled(false)
                .setStyle(ButtonStyle.Secondary),
            };

            paginations.set(pagination.interaction.id, pagination);

            return pagination.render();
          }

          embed
            .setAuthor({
              name: `🔇 Muted Members from ${guild} (${mutedMembers.size.toLocaleString()})`,
            })
            .setDescription(descriptions.join('\n'));

          return interaction.editReply({ embeds: [embed] });
        }
      }
    }
  }
};
