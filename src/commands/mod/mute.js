const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const { serverMuteChoices, serverMuteTempChoices } = require('../../constants');
const { serverMute } = require('../../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('🚫 Mute member from server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('apply')
        .setDescription('🔒 Apply the server mute for specified member.')
        .addUserOption((option) =>
          option
            .setName('member')
            .setDescription('👤 The member to mute from the server.')
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName('channel_type')
            .setDescription('#️⃣ The channel type for restrict the member from.')
            .setRequired(true)
            .addChoices(...serverMuteChoices),
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('📃 The reason for mute the member.'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('temp')
        .setDescription(
          '🔐 Apply the server mute temporarily for specified member.',
        )
        .addUserOption((option) =>
          option
            .setName('member')
            .setDescription('👤 The member to mute from the server.')
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName('channel_type')
            .setDescription('#️⃣ The channel type for restrict the member from.')
            .addChoices(...serverMuteChoices)
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName('duration')
            .setDescription('⏱️ The duration of the mute.')
            .addChoices(...serverMuteTempChoices)
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('📃 The reason for mute the member.'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('cease')
        .setDescription('🔓 Cease the server mute to specified member.')
        .addUserOption((option) =>
          option
            .setName('member')
            .setDescription('👤 The member to unmute from the server.')
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName('channel_type')
            .setDescription('#️⃣ The channel type for restrict the member from.')
            .addChoices(...serverMuteChoices)
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('📃 The reason for unmute the member.'),
        ),
    ),
  type: 'Chat Input',

  /**
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;

    /** @type {import('discord.js').GuildMember} */
    const member = options.getMember('member');

    await interaction.deferReply({ ephemeral: true }).then(async () => {
      if (!member.manageable) {
        return interaction.editReply({
          content: `You don't have appropiate permissions to mute ${member}.`,
        });
      }

      return serverMute(interaction, options.getSubcommand());
    });
  },
};
