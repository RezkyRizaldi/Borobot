const {
  bold,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('🔌 Disconnect a member from voice channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
    .addUserOption((option) =>
      option
        .setName('member')
        .setDescription('👤 The member to disconnect from.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('📃 The reason for disconnecting the member.'),
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
    const reason = options.getString('reason') ?? 'No reason';
    const { voice } = member;

    await interaction.deferReply({ ephemeral: true }).then(async () => {
      if (!voice.channel) {
        return interaction.editReply({
          content: `${member} is not connected to a voice channel.`,
        });
      }

      await voice.disconnect(reason).then(
        async (m) =>
          await interaction.editReply({
            content: `Successfully ${bold('disconnected')} ${m}.`,
          }),
      );
    });
  },
};
