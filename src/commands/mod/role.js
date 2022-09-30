const {
  bold,
  Colors,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  PermissionsBitField,
} = require('discord.js');
const { Pagination } = require('pagination.djs');

const { roleCreatePermissionChoices } = require('../../constants');
const { applyHexColor } = require('../../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('🛠️ Set the roles for a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('➕ Add a role to a member.')
        .addUserOption((option) =>
          option
            .setName('member')
            .setDescription('👤 The member to be added a new role.')
            .setRequired(true),
        )
        .addRoleOption((option) =>
          option
            .setName('role')
            .setDescription('‍🛠️ The role to add.')
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('📃 The reason for adding the role.'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('🆕 Create a new role.')
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription("🆕 The role's name.")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option.setName('color').setDescription("🎨 The role's color."),
        )
        .addBooleanOption((option) =>
          option
            .setName('hoist')
            .setDescription(
              '🪢 Whether to display the role separately or not.',
            ),
        )
        .addBooleanOption((option) =>
          option
            .setName('mentionable')
            .setDescription(
              '🏷️ Whether to allow members to mention the role or not.',
            ),
        )
        .addRoleOption((option) =>
          option
            .setName('position')
            .setDescription(
              "🛠️ The role's position to be specified on top of this role.",
            ),
        )
        .addIntegerOption((option) =>
          option
            .setName('permission')
            .setDescription("🔐 The role's permissions.")
            .addChoices(...roleCreatePermissionChoices),
        )
        .addIntegerOption((option) =>
          option
            .setName('permission2')
            .setDescription("🔐 The role's permissions.")
            .addChoices(...roleCreatePermissionChoices),
        )
        .addIntegerOption((option) =>
          option
            .setName('permission3')
            .setDescription("🔐 The role's permissions.")
            .addChoices(...roleCreatePermissionChoices),
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('📃 The reason for creating the role.'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('🗑️ Delete a role.')
        .addRoleOption((option) =>
          option
            .setName('role')
            .setDescription('‍🛠️ The role to delete.')
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('📃 The reason for deleting the role.'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('📄 Show list of server roles.'),
    )
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName('modify')
        .setDescription('➕ Modify a role.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('color')
            .setDescription('🎨 Modify the role color.')
            .addRoleOption((option) =>
              option
                .setName('role')
                .setDescription('🛠️ The role to modify.')
                .setRequired(true),
            )
            .addStringOption((option) =>
              option
                .setName('color')
                .setDescription("🎨 The role's new color.")
                .setRequired(true),
            )
            .addStringOption((option) =>
              option
                .setName('reason')
                .setDescription('📃 The reason for adding the role.'),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('name')
            .setDescription('🔤 Modify the role name.')
            .addRoleOption((option) =>
              option
                .setName('role')
                .setDescription('🛠️ The role to modify.')
                .setRequired(true),
            )
            .addStringOption((option) =>
              option
                .setName('name')
                .setDescription("🔤 The role's new name.")
                .setRequired(true),
            )
            .addStringOption((option) =>
              option
                .setName('reason')
                .setDescription('📃 The reason for adding the role.'),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('position')
            .setDescription('🎨 Modify the role position (hierarchy).')
            .addRoleOption((option) =>
              option
                .setName('role')
                .setDescription('🛠️ The role to modify.')
                .setRequired(true),
            )
            .addRoleOption((option) =>
              option
                .setName('to_role')
                .setDescription('🛠️ The role to be modified.')
                .setRequired(true),
            )
            .addStringOption((option) =>
              option
                .setName('reason')
                .setDescription('📃 The reason for adding the role.'),
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('➖ Delete a role.')
        .addUserOption((option) =>
          option
            .setName('member')
            .setDescription('👤 The member whose role to be removed.')
            .setRequired(true),
        )
        .addRoleOption((option) =>
          option
            .setName('role')
            .setDescription('🛠️ The role to remove.')
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('📃 The reason for removing the role.'),
        ),
    ),
  type: 'Chat Input',

  /**
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { client, guild, options } = interaction;

    /** @type {import('discord.js').GuildMember} */
    const member = options.getMember('member');

    /** @type {import('discord.js').Role} */
    const role = options.getRole('role');
    const name = options.getString('name');
    const color = options.getString('color');
    const reason = options.getString('reason') ?? 'No reason';
    const convertedColor =
      color !== null ? applyHexColor(color) : Colors.Default;

    switch (options.getSubcommandGroup()) {
      case 'modify':
        return interaction.deferReply({ ephemeral: true }).then(async () => {
          if (!role.editable) {
            return interaction.editReply({
              content: `You don't have appropiate permissions to modify the ${role} role.`,
            });
          }

          switch (options.getSubcommand()) {
            case 'name':
              if (name.toLowerCase() === role.name.toLowerCase()) {
                return interaction.editReply({
                  content: 'You have to specify a different name to modify.',
                });
              }

              return role.setName(name, reason).then(
                async (r) =>
                  await interaction.editReply({
                    content: `Successfully ${bold('modified')} ${r}.`,
                  }),
              );

            case 'color':
              if (
                convertedColor.toLowerCase() === role.hexColor.toLowerCase()
              ) {
                return interaction.editReply({
                  content: 'You have to specify a different color to modify.',
                });
              }

              return role.setColor(convertedColor, reason).then(
                async (r) =>
                  await interaction.editReply({
                    content: `Successfully ${bold('modified')} ${r}.`,
                  }),
              );

            case 'position': {
              /** @type {import('discord.js').Role} */
              const target = options.getRole('to_role');

              if (target.permissions.bitfield > role.permissions.bitfield) {
                return interaction.editReply({
                  content: `You don't have appropiate permissions to modify ${target} role's position.`,
                });
              }

              if (role.position === target.position) {
                return interaction.editReply({
                  content:
                    'You have to specify a different position to modify.',
                });
              }

              return role.setPosition(target.position, { reason }).then(
                async (r) =>
                  await interaction.editReply({
                    content: `Successfully ${bold('modified')} ${r}.`,
                  }),
              );
            }
          }
        });
    }

    switch (options.getSubcommand()) {
      case 'create': {
        const hoist = options.getBoolean('hoist') ?? false;
        const mentionable = options.getBoolean('mentionable') ?? false;

        /** @type {import('discord.js').Role} */
        const position = options.getRole('position');
        const permission = options.getInteger('permission');
        const permission2 = options.getInteger('permission2');
        const permission3 = options.getInteger('permission3');
        /* global BigInt */
        const permissionArray = [permission, permission2, permission3]
          .filter((perm) => !!perm)
          .map((perm) => BigInt(perm));

        return interaction.deferReply({ ephemeral: true }).then(
          async () =>
            await guild.roles
              .create({
                name,
                color: convertedColor,
                hoist,
                mentionable,
                reason,
                position: position ? position.position + 1 : 1,
                permissions: permissionArray.length
                  ? [...new Set(permissionArray)]
                  : PermissionsBitField.Default,
              })
              .then(
                async (r) =>
                  await interaction.editReply({
                    content: `${r} role created successfully.`,
                  }),
              ),
        );
      }

      case 'delete':
        return interaction.deferReply({ ephemeral: true }).then(async () => {
          if (
            role.managed ||
            role.position > guild.members.me.roles.highest.position
          ) {
            return interaction.editReply({
              content: `You don't have appropiate permissions to delete ${role} role.`,
            });
          }

          await guild.roles.delete(role, reason).then(
            async () =>
              await interaction.editReply({
                content: 'Role deleted successfully.',
              }),
          );
        });

      case 'add':
        return interaction.deferReply({ ephemeral: true }).then(async () => {
          if (!member.manageable) {
            return interaction.editReply({
              content: `You don't have appropiate permissions to add ${role} role to ${member}.`,
            });
          }

          if (member.roles.cache.has(role.id)) {
            return interaction.editReply({
              content: `${member} is already have ${role} role.`,
            });
          }

          await member.roles.add(role, reason).then(
            async (m) =>
              await interaction.editReply({
                content: `Successfully ${bold('added')} ${role} role to ${m}.`,
              }),
          );
        });

      case 'remove':
        return interaction.deferReply({ ephemeral: true }).then(async () => {
          if (!member.manageable) {
            return interaction.editReply({
              content: `You don't have appropiate permissions to remove ${role} role from ${member}.`,
            });
          }

          if (!member.roles.cache.has(role.id)) {
            return interaction.editReply({
              content: `${member} doesn't have ${role} role.`,
            });
          }

          await member.roles.remove(role, reason).then(
            async (m) =>
              await interaction.editReply({
                content: `Successfully ${bold(
                  'removed',
                )} ${role} role from ${m}.`,
              }),
          );
        });

      case 'list':
        return interaction.deferReply().then(
          async () =>
            await guild.roles.fetch().then(async (rls) => {
              if (!rls.size) {
                return interaction.editReply({
                  content: `${bold(guild)} doesn't have any role.`,
                });
              }

              const descriptions = [...rls.values()]
                .filter((r) => r.id !== guild.roles.everyone.id)
                .sort((a, b) => b.position - a.position)
                .map((r, index) => `${bold(`${index + 1}.`)} ${r}`);

              if (rls.size > 10) {
                const pagination = new Pagination(interaction, {
                  limit: 10,
                });

                pagination.setColor(guild.members.me.displayHexColor);
                pagination.setTimestamp(Date.now());
                pagination.setFooter({
                  text: `${client.user.username} | Page {pageNumber} of {totalPages}`,
                  iconURL: client.user.displayAvatarURL({
                    dynamic: true,
                  }),
                });
                pagination.setAuthor({
                  name: `🔐 ${guild} Role Lists (${rls.size})`,
                });
                pagination.setDescriptions(descriptions);

                return pagination.render();
              }

              const embed = new EmbedBuilder()
                .setColor(guild.members.me.displayHexColor)
                .setTimestamp(Date.now())
                .setFooter({
                  text: client.user.username,
                  iconURL: client.user.displayAvatarURL({
                    dynamic: true,
                  }),
                })
                .setAuthor({
                  name: `🔐 ${guild} Role Lists (${rls.size})`,
                })
                .setDescription(descriptions.join('\n'));

              await interaction.editReply({ embeds: [embed] });
            }),
        );
    }
  },
};
