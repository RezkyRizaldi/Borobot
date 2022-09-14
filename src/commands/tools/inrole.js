const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { Pagination } = require('pagination.djs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inrole')
    .setDescription('👥 Show member list with specific role.')
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('🛠️ The member role to show.')
        .setRequired(true),
    ),
  type: 'Chat Input',

  /**
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const role = interaction.options.getRole('role');

    await interaction.deferReply({ ephemeral: true }).then(async () => {
      const membersWithRole = interaction.guild.members.cache
        .filter((member) => member.roles.cache.has(role.id))
        .map((member) => member);

      if (!membersWithRole.length) {
        return interaction.editReply({
          content: `There is no member with role ${role}`,
        });
      }

      const descriptions = membersWithRole.map(
        (member, index) => `${index + 1}. ${member} (${member.user.username})`,
      );

      if (membersWithRole.length > 10) {
        const pagination = new Pagination(interaction, {
          limit: 10,
        });

        pagination.setColor(interaction.guild.members.me.displayHexColor);
        pagination.setTimestamp(Date.now());
        pagination.setFooter({
          text: `${interaction.client.user.username} | Page {pageNumber} of {totalPages}`,
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
        });
        pagination.setAuthor({
          name: `👥 Member list with role ${role.name} (${membersWithRole.length})`,
        });
        pagination.setDescriptions(descriptions);

        return pagination.render();
      }

      const embed = new EmbedBuilder()
        .setColor(interaction.guild.members.me.displayHexColor)
        .setTimestamp(Date.now())
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
        })
        .setAuthor({
          name: `👥 Member list with role ${role.name} (${membersWithRole.length})`,
        })
        .setDescription(descriptions.join('\n'));

      await interaction.editReply({ embeds: [embed] });
    });
  },
};
