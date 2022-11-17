const {
  bold,
  inlineCode,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const { slowmodeChoices } = require('../../constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('🐌 Set the slowmode for a text channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('off')
        .setDescription('🐌 Turn off slowmode in this channel.')
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('📃 The reason for turn off the slowmode.'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('on')
        .setDescription('🐌 Turn on slowmode in this channel.')
        .addIntegerOption((option) =>
          option
            .setName('duration')
            .setDescription('⏱️ The duration of the slowmode.')
            .addChoices(...slowmodeChoices)
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('📃 The reason for turn on the slowmode.'),
        ),
    ),
  type: 'Chat Input',

  /**
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    /** @type {{ channel: ?import('discord.js').BaseGuildTextChannel, options: Omit<import('discord.js').CommandInteractionOptionResolver<import('discord.js').CacheType>, 'getMessage' | 'getFocused'> }} */
    const { channel, options } = interaction;

    if (!channel) {
      return interaction.deferReply({ ephemeral: true }).then(async () =>
        interaction.editReply({
          content: "Channel doesn't exist.",
        }),
      );
    }

    const reason = options.getString('reason') ?? 'No reason';

    await interaction.deferReply({ ephemeral: true }).then(async () => {
      switch (options.getSubcommand()) {
        case 'on': {
          const duration = options.getInteger('duration', true);

          if (channel.rateLimitPerUser && channel.rateLimitPerUser > 0) {
            return interaction.editReply({
              content: `Slowmode in ${channel} is already turned on for ${inlineCode(
                `${channel.rateLimitPerUser} seconds`,
              )}.`,
            });
          }

          return channel.setRateLimitPerUser(duration, reason).then(
            async (ch) =>
              await interaction.editReply({
                content: `Successfully ${bold(
                  'turned on',
                )} slowmode in ${ch} for ${inlineCode(`${duration} seconds`)}.`,
              }),
          );
        }

        case 'off':
          if (channel.rateLimitPerUser && channel.rateLimitPerUser === 0) {
            return interaction.editReply({
              content: `Slowmode in ${channel} isn't being turned on.`,
            });
          }

          return channel.setRateLimitPerUser(0, reason).then(
            async (ch) =>
              await interaction.editReply({
                content: `Successfully ${bold(
                  'turned off',
                )} slowmode in ${ch}.`,
              }),
          );
      }
    });
  },
};
