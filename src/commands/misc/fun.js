const AnimeImages = require('anime-images-api');
const axios = require('axios');
const {
  AttachmentBuilder,
  EmbedBuilder,
  italic,
  SlashCommandBuilder,
} = require('discord.js');
const nekoClient = require('nekos.life');

const { waifuChoices } = require('../../constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fun')
    .setDescription('🎉 Fun command.')
    .addSubcommand((subcommand) =>
      subcommand.setName('ahegao').setDescription('🚫 Send a ahegao image.'),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('boobs').setDescription('🚫 Send a boobs gif.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('cuddle')
        .setDescription('😍 Send a cuddling image/gif.')
        .addUserOption((option) =>
          option
            .setName('target')
            .setDescription('👤 The target member to cuddle.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('feed')
        .setDescription('🧑‍🍼 Send a feeding image/gif.')
        .addUserOption((option) =>
          option
            .setName('target')
            .setDescription('👤 The target member to feed.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('hentai').setDescription('🚫 Send a hentai gif.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('hug')
        .setDescription('🤗 Send a hugging image/gif.')
        .addUserOption((option) =>
          option
            .setName('target')
            .setDescription('👤 The target member to hug.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('kemono')
        .setDescription('😻 Send a kemono image/gif.'),
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
        .setName('kiss')
        .setDescription('😘 Send a kissing image/gif.')
        .addUserOption((option) =>
          option
            .setName('target')
            .setDescription('👤 The target member to kiss.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('lesbian').setDescription('🚫 Send a lesbian gif.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('pat')
        .setDescription('🖐️ Send a patting image/gif.')
        .addUserOption((option) =>
          option
            .setName('target')
            .setDescription('👤 The target member to pat.')
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
        .setName('slap')
        .setDescription('🤚 Send a slapping image/gif.')
        .addUserOption((option) =>
          option
            .setName('target')
            .setDescription('👤 The target member to slap.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('smug')
        .setDescription('😏 Send a smugging image/gif.')
        .addUserOption((option) =>
          option
            .setName('target')
            .setDescription('👤 The target member to smug.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('tickle')
        .setDescription('👉 Send a tickle image/gif.')
        .addUserOption((option) =>
          option
            .setName('target')
            .setDescription('👤 The target member to tickle.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('waifu')
        .setDescription('👰‍♀️ Send a waifu image/gif.')
        .addStringOption((option) =>
          option
            .setName('type')
            .setDescription('🖼️ The image type to send.')
            .setRequired(true)
            .addChoices(...waifuChoices),
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
    ),
  type: 'Chat Input',

  /**
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    /** @type {{ channel: ?import('discord.js').BaseGuildTextChannel, client: import('discord.js').Client<true>, guild: ?import('discord.js').Guild, member: ?import('discord.js').GuildMember, options: Omit<import('discord.js').CommandInteractionOptionResolver<import('discord.js').CacheType>, 'getMessage' | 'getFocused'> }} */
    const { channel, client, guild, member, options } = interaction;

    if (!guild) return;

    const images = new AnimeImages();
    const neko = new nekoClient();

    /** @type {{ channels: { cache: import('discord.js').Collection<String, import('discord.js').BaseGuildTextChannel> } */
    const {
      channels: { cache: baseGuildTextChannels },
    } = guild;

    const NSFWChannels = baseGuildTextChannels.filter((ch) => ch.nsfw);
    const NSFWResponse = NSFWChannels.size
      ? `\n${italic('eg.')} ${[...NSFWChannels.values()].join(', ')}`
      : '';

    /** @type {?import('discord.js').GuildMember} */
    const target = options.getMember('target');

    const embed = new EmbedBuilder().setTimestamp(Date.now()).setFooter({
      text: client.user.username,
      iconURL: client.user.displayAvatarURL({
        dynamic: true,
      }),
    });

    if (!member) {
      return interaction.deferReply({ ephemeral: true }).then(async () =>
        interaction.editReply({
          content: "Member doesn't exist.",
        }),
      );
    }

    switch (options.getSubcommand()) {
      case 'hug':
        if (!target) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Member doesn't exist.",
            }),
          );
        }

        return interaction.deferReply().then(async () => {
          const { url } = await neko.hug();

          /** @type {{ image: String }} */
          const { image } = await images.sfw.hug();
          const imgArr = [url, image];
          const hug = imgArr[Math.floor(Math.random() * imgArr.length)];

          embed.setColor(target.displayHexColor);
          embed.setImage(hug);
          embed.setDescription(`${member} has hugged ${target}!`);

          await interaction.editReply({ embeds: [embed] });
        });

      case 'kiss':
        if (!target) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Member doesn't exist.",
            }),
          );
        }

        return interaction.deferReply().then(async () => {
          const { url } = await neko.kiss();

          /** @type {{ image: String }} */
          const { image } = await images.sfw.kiss();
          const imgArr = [url, image];
          const kiss = imgArr[Math.floor(Math.random() * imgArr.length)];

          embed.setColor(target.displayHexColor);
          embed.setImage(kiss);
          embed.setDescription(`${member} is kissing ${target}!`);

          await interaction.editReply({ embeds: [embed] });
        });

      case 'slap':
        if (!target) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Member doesn't exist.",
            }),
          );
        }

        return interaction.deferReply().then(async () => {
          const { url } = await neko.slap();

          /** @type {{ image: String }} */
          const { image } = await images.sfw.slap();
          const imgArr = [url, image];
          const slap = imgArr[Math.floor(Math.random() * imgArr.length)];

          embed.setColor(target.displayHexColor);
          embed.setImage(slap);
          embed.setDescription(`${member} has slapped ${target}!`);

          await interaction.editReply({ embeds: [embed] });
        });

      case 'punch':
        if (!target) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Member doesn't exist.",
            }),
          );
        }

        return interaction.deferReply().then(
          async () =>
            await images.sfw.punch().then(
              /**
               *
               * @param {{ image: String }}
               */
              async ({ image }) => {
                embed.setColor(target.displayHexColor);
                embed.setImage(image);
                embed.setDescription(`${member} has punched ${target}!`);

                await interaction.editReply({ embeds: [embed] });
              },
            ),
        );

      case 'wink':
        if (!target) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Member doesn't exist.",
            }),
          );
        }

        return interaction.deferReply().then(
          async () =>
            await images.sfw.wink().then(
              /**
               *
               * @param {{ image: String }}
               */
              async ({ image }) => {
                embed.setColor(target.displayHexColor);
                embed.setImage(image);
                embed.setDescription(
                  `${member} is giving a wink for ${target}!`,
                );

                await interaction.editReply({ embeds: [embed] });
              },
            ),
        );

      case 'pat':
        if (!target) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Member doesn't exist.",
            }),
          );
        }

        return interaction.deferReply().then(async () => {
          const { url } = await neko.pat();

          /** @type {{ image: String }} */
          const { image } = await images.sfw.pat();
          const imgArr = [url, image];
          const pat = imgArr[Math.floor(Math.random() * imgArr.length)];

          embed.setColor(target.displayHexColor);
          embed.setImage(pat);
          embed.setDescription(`${member} is giving a pat for ${target}!`);

          await interaction.editReply({ embeds: [embed] });
        });

      case 'kill':
        if (!target) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Member doesn't exist.",
            }),
          );
        }

        return interaction.deferReply().then(
          async () =>
            await images.sfw.kill().then(
              /**
               *
               * @param {{ image: String }}
               */
              async ({ image }) => {
                embed.setColor(target.displayHexColor);
                embed.setImage(image);
                embed.setDescription(`${target} has been killed by ${member}!`);

                await interaction.editReply({ embeds: [embed] });
              },
            ),
        );

      case 'cuddle':
        if (!target) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Member doesn't exist.",
            }),
          );
        }

        return interaction.deferReply().then(async () => {
          const { url } = await neko.cuddle();

          /** @type {{ image: String }} */
          const { image } = await images.sfw.cuddle();
          const imgArr = [url, image];
          const cuddle = imgArr[Math.floor(Math.random() * imgArr.length)];

          embed.setColor(target.displayHexColor);
          embed.setImage(cuddle);
          embed.setDescription(`${member} cuddles ${target}!`);

          await interaction.editReply({ embeds: [embed] });
        });

      case 'tickle':
        if (!target) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Member doesn't exist.",
            }),
          );
        }

        return interaction.deferReply().then(
          async () =>
            await neko.tickle().then(async ({ url }) => {
              embed.setColor(target.displayHexColor);
              embed.setImage(url);
              embed.setDescription(`${member} tickled ${target}!`);

              await interaction.editReply({ embeds: [embed] });
            }),
        );

      case 'feed':
        if (!target) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Member doesn't exist.",
            }),
          );
        }

        return interaction.deferReply().then(
          async () =>
            await neko.feed().then(async ({ url }) => {
              embed.setColor(target.displayHexColor);
              embed.setImage(url);
              embed.setDescription(`${member} feeding ${target}!`);

              await interaction.editReply({ embeds: [embed] });
            }),
        );

      case 'kemono': {
        const endpoints = ['neko', 'nekoGif', 'foxGirl'];

        return interaction.deferReply().then(
          async () =>
            await neko[
              endpoints[Math.floor(Math.random() * endpoints.length)]
            ]().then(
              /**
               *
               * @param {{ url: String }}
               */
              async ({ url }) => {
                embed.setColor(guild.members.me?.displayHexColor ?? null);
                embed.setImage(url);

                await interaction.editReply({ embeds: [embed] });
              },
            ),
        );
      }

      case 'smug':
        if (!target) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Member doesn't exist.",
            }),
          );
        }

        return interaction.deferReply().then(
          async () =>
            await neko.smug().then(async ({ url }) => {
              embed.setColor(target.displayHexColor);
              embed.setImage(url);
              embed.setDescription(`${member} smugged ${target}!`);

              await interaction.editReply({ embeds: [embed] });
            }),
        );

      case 'waifu':
        {
          const type = options.getString('type', true);

          embed.setColor(member.displayHexColor);

          switch (type) {
            case 'image':
              return interaction.deferReply().then(
                async () =>
                  await axios.get('https://api.waifu.pics/sfw/waifu').then(
                    /**
                     *
                     * @param {{ data: { url: String } }}
                     */
                    async ({ data: { url } }) => {
                      embed.setAuthor({
                        name: `${member.user.username} Got a Waifu`,
                        iconURL: member.displayAvatarURL({
                          dynamic: true,
                        }),
                      });
                      embed.setImage(url);

                      await interaction.editReply({ embeds: [embed] });
                    },
                  ),
              );

            case 'pfp':
              return interaction.deferReply().then(async () => {
                const { url } = await neko.avatar();

                /** @type {{ image: String }} */
                const { image } = await images.sfw.waifu();
                const imgArr = [url, image];
                const pfp = imgArr[Math.floor(Math.random() * imgArr.length)];

                embed.setAuthor({
                  name: `${member.user.username} Got a Waifu`,
                  iconURL: member.displayAvatarURL({
                    dynamic: true,
                  }),
                });
                embed.setImage(pfp);

                await interaction.editReply({ embeds: [embed] });
              });

            case 'wallpaper':
              return interaction.deferReply().then(
                async () =>
                  await neko.wallpaper().then(async ({ url }) => {
                    embed.setAuthor({
                      name: `${member.user.username} Got a Waifu`,
                      iconURL: member.displayAvatarURL({
                        dynamic: true,
                      }),
                    });
                    embed.setImage(url);

                    await interaction.editReply({ embeds: [embed] });
                  }),
              );
          }
        }
        break;

      case 'hentai':
        if (!channel) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Channel doesn't exist.",
            }),
          );
        }

        if (!channel.nsfw) {
          return interaction.deferReply({ ephemeral: true }).then(
            async () =>
              await interaction.editReply({
                content: `Please use this command in a NSFW Channel.${NSFWResponse}`,
              }),
          );
        }

        return interaction.deferReply().then(
          async () =>
            await images.nsfw.hentai().then(
              /**
               *
               * @param {{ image: String }}
               */
              async ({ image }) => {
                embed.setColor(guild.members.me?.displayHexColor ?? null);
                embed.setImage(image);

                await interaction.editReply({ embeds: [embed] });
              },
            ),
        );

      case 'boobs':
        if (!channel) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Channel doesn't exist.",
            }),
          );
        }

        if (!channel.nsfw) {
          return interaction.deferReply({ ephemeral: true }).then(
            async () =>
              await interaction.editReply({
                content: `Please use this command in a NSFW Channel.${NSFWResponse}`,
              }),
          );
        }

        return interaction.deferReply().then(
          async () =>
            await images.nsfw.boobs().then(
              /**
               *
               * @param {{ image: String }}
               */
              async ({ image }) => {
                embed.setColor(guild.members.me?.displayHexColor ?? null);
                embed.setImage(image);

                await interaction.editReply({ embeds: [embed] });
              },
            ),
        );

      case 'lesbian':
        if (!channel) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Channel doesn't exist.",
            }),
          );
        }

        if (!channel.nsfw) {
          return interaction.deferReply({ ephemeral: true }).then(
            async () =>
              await interaction.editReply({
                content: `Please use this command in a NSFW Channel.${NSFWResponse}`,
              }),
          );
        }

        return interaction.deferReply().then(
          async () =>
            await images.nsfw.lesbian().then(
              /**
               *
               * @param {{ image: String }}
               */
              async ({ image }) => {
                embed.setColor(guild.members.me?.displayHexColor ?? null);
                embed.setImage(image);

                await interaction.editReply({ embeds: [embed] });
              },
            ),
        );

      case 'ahegao':
        if (!channel) {
          return interaction.deferReply({ ephemeral: true }).then(async () =>
            interaction.editReply({
              content: "Channel doesn't exist.",
            }),
          );
        }

        if (!channel.nsfw) {
          return interaction.deferReply({ ephemeral: true }).then(
            async () =>
              await interaction.editReply({
                content: `Please use this command in a NSFW Channel.${NSFWResponse}`,
              }),
          );
        }

        return axios
          .get(
            `https://api.lolhuman.xyz/api/random/nsfw/ahegao?apikey=${process.env.LOLHUMAN_API_KEY}`,
            {
              responseType: 'arraybuffer',
            },
          )
          .then(
            /**
             *
             * @param {{ data: ArrayBuffer }}
             */
            async ({ data }) => {
              const base64 = Buffer.from(data, 'base64');
              const image = new AttachmentBuilder(base64, {
                name: 'ahegao.png',
                description: 'Ahegao image',
              });

              embed.setColor(guild.members.me?.displayHexColor ?? null);
              embed.setImage('attachment://ahegao.png');

              await interaction.deferReply().then(
                async () =>
                  await interaction.editReply({
                    embeds: [embed],
                    files: [image],
                  }),
              );
            },
          );
    }
  },
};
