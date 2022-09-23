const AnimeImages = require('anime-images-api');
const { EmbedBuilder, italic, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fun')
    .setDescription('🎉 Fun command.')
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName('sfw')
        .setDescription('✅ Send a SFW anime gif.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('hug')
            .setDescription('🤗 Send a hugging gif.')
            .addUserOption((option) =>
              option
                .setName('target')
                .setDescription('👤 The target member to hug.')
                .setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('kiss')
            .setDescription('😘 Send a kissing gif.')
            .addUserOption((option) =>
              option
                .setName('target')
                .setDescription('👤 The target member to kiss.')
                .setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('slap')
            .setDescription('🤚 Send a slapping gif.')
            .addUserOption((option) =>
              option
                .setName('target')
                .setDescription('👤 The target member to slap.')
                .setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('punch')
            .setDescription('👊 Send a punching gif.')
            .addUserOption((option) =>
              option
                .setName('target')
                .setDescription('👤 The target member to punch.')
                .setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('wink')
            .setDescription('😉 Send a winking gif.')
            .addUserOption((option) =>
              option
                .setName('target')
                .setDescription('👤 The target member to wink.')
                .setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('pat')
            .setDescription('🖐️ Send a patting gif.')
            .addUserOption((option) =>
              option
                .setName('target')
                .setDescription('👤 The target member to pat.')
                .setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('kill')
            .setDescription('⚰️ Send a killing gif.')
            .addUserOption((option) =>
              option
                .setName('target')
                .setDescription('👤 The target member to kill.')
                .setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('cuddle')
            .setDescription('😍 Send a cuddling gif.')
            .addUserOption((option) =>
              option
                .setName('target')
                .setDescription('👤 The target member to cuddle.')
                .setRequired(true),
            ),
        ),
    )
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName('nsfw')
        .setDescription('⚠️ Send a NSFW anime gif.')
        .addSubcommand((subcommand) =>
          subcommand.setName('hentai').setDescription('🚫 Send a hentai gif.'),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName('boobs').setDescription('🚫 Send a boobs gif.'),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('lesbian')
            .setDescription('🚫 Send a lesbian gif.'),
        ),
    ),
  type: 'Chat Input',

  /**
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    /** @type {{ channel: import('discord.js').TextChannel, client: import('discord.js').Client, guild: import('discord.js').Guild|null, member: import('discord.js').GuildMember, options: Omit<import('discord.js').CommandInteractionOptionResolver<import('discord.js').CacheType>, 'getMessage' | 'getFocused'> }} */
    const { channel, client, guild, member, options } = interaction;

    const images = new AnimeImages();

    const embed = new EmbedBuilder()
      .setColor(guild.members.me.displayHexColor)
      .setTimestamp(Date.now())
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL({
          dynamic: true,
        }),
      });

    switch (options.getSubcommandGroup()) {
      case 'sfw':
        {
          /** @type {import('discord.js').GuildMember} */
          const target = options.getMember('target');

          embed.setColor(target.displayHexColor);

          switch (options.getSubcommand()) {
            case 'hug':
              return interaction.deferReply().then(
                async () =>
                  await images.sfw.hug().then(async ({ image }) => {
                    embed.setImage(image);
                    embed.setDescription(`${member} has hugged ${target}!`);

                    await interaction.editReply({ embeds: [embed] });
                  }),
              );

            case 'kiss':
              return interaction.deferReply().then(
                async () =>
                  await images.sfw.kiss().then(async ({ image }) => {
                    embed.setImage(image);
                    embed.setDescription(`${member} is kissing ${target}!`);

                    await interaction.editReply({ embeds: [embed] });
                  }),
              );

            case 'slap':
              return interaction.deferReply().then(
                async () =>
                  await images.sfw.slap().then(async ({ image }) => {
                    embed.setImage(image);
                    embed.setDescription(`${member} has slapped ${target}!`);

                    await interaction.editReply({ embeds: [embed] });
                  }),
              );

            case 'punch':
              return interaction.deferReply().then(
                async () =>
                  await images.sfw.punch().then(async ({ image }) => {
                    embed.setImage(image);
                    embed.setDescription(`${member} has punched ${target}!`);

                    await interaction.editReply({ embeds: [embed] });
                  }),
              );

            case 'wink':
              return interaction.deferReply().then(
                async () =>
                  await images.sfw.wink().then(async ({ image }) => {
                    embed.setImage(image);
                    embed.setDescription(
                      `${member} is giving a wink for ${target}!`,
                    );

                    await interaction.editReply({ embeds: [embed] });
                  }),
              );

            case 'pat':
              return interaction.deferReply().then(
                async () =>
                  await images.sfw.pat().then(async ({ image }) => {
                    embed.setImage(image);
                    embed.setDescription(
                      `${member} is giving a pat for ${target}!`,
                    );

                    await interaction.editReply({ embeds: [embed] });
                  }),
              );

            case 'kill':
              return interaction.deferReply().then(
                async () =>
                  await images.sfw.kill().then(async ({ image }) => {
                    embed.setImage(image);
                    embed.setDescription(
                      `${target} has been killed by ${member}!`,
                    );

                    await interaction.editReply({ embeds: [embed] });
                  }),
              );

            case 'cuddle':
              return interaction.deferReply().then(
                async () =>
                  await images.sfw.cuddle().then(async ({ image }) => {
                    embed.setImage(image);
                    embed.setDescription(`${member} cuddles ${target}!`);

                    await interaction.editReply({ embeds: [embed] });
                  }),
              );
          }
        }
        break;

      case 'nsfw':
        {
          if (!channel.nsfw) {
            const NSFWChannels = guild.channels.cache
              .filter((ch) => ch.nsfw)
              .map((ch) => ch)
              .join(', ');

            return interaction.deferReply({ ephemeral: true }).then(
              async () =>
                await interaction.editReply({
                  content: `Please use this command in a NSFW Channel.\n${italic(
                    'eg.',
                  )} ${NSFWChannels}`,
                }),
            );
          }

          switch (options.getSubcommand()) {
            case 'hentai':
              return interaction.deferReply().then(
                async () =>
                  await images.nsfw.hentai().then(async ({ image }) => {
                    embed.setImage(image);

                    await interaction.editReply({ embeds: [embed] });
                  }),
              );

            case 'boobs':
              return interaction.deferReply().then(
                async () =>
                  await images.nsfw.boobs().then(async ({ image }) => {
                    embed.setImage(image);

                    await interaction.editReply({ embeds: [embed] });
                  }),
              );

            case 'lesbian':
              return interaction.deferReply().then(
                async () =>
                  await images.nsfw.lesbian().then(async ({ image }) => {
                    embed.setImage(image);

                    await interaction.editReply({ embeds: [embed] });
                  }),
              );
          }
        }
        break;
    }
  },
};
