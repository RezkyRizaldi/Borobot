const axios = require('axios');
const { capitalCase } = require('change-case');
const {
  AttachmentBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  hyperlink,
  inlineCode,
  italic,
  SlashCommandBuilder,
  time,
  TimestampStyles,
} = require('discord.js');
const Scraper = require('images-scraper').default;
const NewsAPI = require('newsapi');
const wait = require('node:timers/promises').setTimeout;
const { Pagination } = require('pagination.djs');
const pluralize = require('pluralize');

const {
  animeCharacterSearchOrderChoices,
  animeSearchOrderChoices,
  animeSearchStatusChoices,
  animeSearchTypeChoices,
  mangaSearchOrderChoices,
  mangaSearchStatusChoices,
  mangaSearchTypeChoices,
  mdnLocaleChoices,
  searchSortingChoices,
  newsCountries,
} = require('../../constants');
const {
  isAlphabeticLetter,
  truncate,
  isNumericString,
} = require('../../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('🔍 Search command.')
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName('anime')
        .setDescription('🖼️ Anime command.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('character')
            .setDescription('👤 Search anime characters from MyAnimeList.')
            .addStringOption((option) =>
              option
                .setName('name')
                .setDescription("🔤 The anime character's name search query."),
            )
            .addStringOption((option) =>
              option
                .setName('order')
                .setDescription("🔤 The anime character's order search query.")
                .addChoices(...animeCharacterSearchOrderChoices),
            )
            .addStringOption((option) =>
              option
                .setName('sort')
                .setDescription("🔣 The anime character's sort search query.")
                .addChoices(...searchSortingChoices),
            )
            .addStringOption((option) =>
              option
                .setName('initial')
                .setDescription(
                  "🔣 The anime character's initial search query.",
                )
                .setMaxLength(1),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('info')
            .setDescription(
              '🖥️ Search the information about an anime from MyAnimeList.',
            )
            .addStringOption((option) =>
              option
                .setName('title')
                .setDescription('🔤 The anime title search query.'),
            )
            .addStringOption((option) =>
              option
                .setName('type')
                .setDescription('🔤 The anime type search query.')
                .addChoices(...animeSearchTypeChoices),
            )
            .addIntegerOption((option) =>
              option
                .setName('score')
                .setDescription('🔤 The anime score search query.')
                .setMinValue(1)
                .setMaxValue(10),
            )
            .addStringOption((option) =>
              option
                .setName('status')
                .setDescription('🔤 The anime status search query.')
                .addChoices(...animeSearchStatusChoices),
            )
            .addStringOption((option) =>
              option
                .setName('order')
                .setDescription('🔤 The anime order search query.')
                .addChoices(...animeSearchOrderChoices),
            )
            .addStringOption((option) =>
              option
                .setName('sort')
                .setDescription('🔣 The anime sort search query.')
                .addChoices(...searchSortingChoices),
            )
            .addStringOption((option) =>
              option
                .setName('initial')
                .setDescription('🔣 The anime initial search query.')
                .setMaxLength(1),
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('definition')
        .setDescription(
          '❓ Search the definition of a term from Urban Dictionary.',
        )
        .addStringOption((option) =>
          option
            .setName('term')
            .setDescription("🔠 The definition's term.")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('image')
        .setDescription('🖼️ Search any images from Google.')
        .addStringOption((option) =>
          option
            .setName('query')
            .setDescription('🔠 The image search query.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('manga')
        .setDescription('📔 Search manga from MyAnimeList.')
        .addStringOption((option) =>
          option
            .setName('title')
            .setDescription('🔤 The manga title search query.'),
        )
        .addStringOption((option) =>
          option
            .setName('type')
            .setDescription('🔤 The manga type search query.')
            .addChoices(...mangaSearchTypeChoices),
        )
        .addIntegerOption((option) =>
          option
            .setName('score')
            .setDescription('🔤 The manga score search query.')
            .setMinValue(1)
            .setMaxValue(10),
        )
        .addStringOption((option) =>
          option
            .setName('status')
            .setDescription('🔤 The manga status search query.')
            .addChoices(...mangaSearchStatusChoices),
        )
        .addStringOption((option) =>
          option
            .setName('order')
            .setDescription('🔤 The manga order search query.')
            .addChoices(...mangaSearchOrderChoices),
        )
        .addStringOption((option) =>
          option
            .setName('sort')
            .setDescription('🔣 The manga sort search query.')
            .addChoices(...searchSortingChoices),
        )
        .addStringOption((option) =>
          option
            .setName('initial')
            .setDescription('🔣 The manga initial search query.')
            .setMaxLength(1),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('mdn')
        .setDescription(
          '📖 Search the documentation of a term from MDN Web Docs.',
        )
        .addStringOption((option) =>
          option
            .setName('term')
            .setDescription("🔠 The documentation's term.")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('language')
            .setDescription("🔠 The documentation's preferred locale.")
            .addChoices(...mdnLocaleChoices),
        ),
    )
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName('news')
        .setDescription('📰 News command.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('country')
            .setDescription(
              '🌏 Search top headline news from provided country.',
            )
            .addStringOption((option) =>
              option
                .setName('name')
                .setDescription('🔤 The country name search query.')
                .setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('list')
            .setDescription('🌐 View available news countries.'),
        ),
    )
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName('nhentai')
        .setDescription('📔 Doujin command.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('tag')
            .setDescription('🏷️ Search doujin from NHentai by tag.')
            .addStringOption((option) =>
              option
                .setName('tag')
                .setDescription('🏷️ The doujin tag.')
                .setMinLength(5)
                .setMaxLength(6)
                .setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('query')
            .setDescription('🔤 Search doujin from NHentai by query.')
            .addStringOption((option) =>
              option
                .setName('query')
                .setDescription('🔤 The doujin search query.')
                .setRequired(true),
            ),
        ),
    ),
  type: 'Chat Input',

  /**
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    /** @type {{ channel: ?import('discord.js').BaseGuildTextChannel, client: import('discord.js').Client<true>, guild: ?import('discord.js').Guild, options: Omit<import('discord.js').CommandInteractionOptionResolver<import('discord.js').CacheType>, 'getMessage' | 'getFocused'> }} */
    const { channel, client, guild, options } = interaction;

    if (!guild) return;

    /** @type {{ paginations: import('discord.js').Collection<String, import('pagination.djs').Pagination> }} */
    const { paginations } = client;

    /** @type {{ channels: { cache: import('discord.js').Collection<String, import('discord.js').BaseGuildTextChannel> } */
    const {
      channels: { cache: baseGuildTextChannels },
    } = guild;

    const NSFWChannels = baseGuildTextChannels.filter((ch) => ch.nsfw);
    const NSFWResponse = NSFWChannels.size
      ? `\n${italic('eg.')} ${[...NSFWChannels.values()].join(', ')}`
      : '';

    const embed = new EmbedBuilder()
      .setColor(guild.members.me?.displayHexColor ?? null)
      .setTimestamp(Date.now())
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL({
          dynamic: true,
        }),
      });

    switch (options.getSubcommandGroup()) {
      case 'anime':
        switch (options.getSubcommand()) {
          case 'info': {
            const title = options.getString('title');
            const type = options.getString('type');
            const score = options.getInteger('score');
            const status = options.getString('status');
            const order = options.getString('order');
            const sort = options.getString('sort');
            const letter = options.getString('initial');

            const query = new URLSearchParams();

            if (!channel.nsfw) {
              query.append('sfw', 'true');
            }

            if (title) {
              query.append('q', encodeURIComponent(title));
            }

            if (type) {
              query.append('type', type);
            }

            if (score) {
              query.append(
                'score',
                Number(`${score}`.replace(/,/g, '.')).toFixed(1),
              );
            }

            if (status) {
              query.append('status', status);
            }

            if (order) {
              query.append('order_by', order);
            }

            if (sort) {
              query.append('sort', sort);
            }

            if (letter) {
              if (!isAlphabeticLetter(letter)) {
                return interaction.deferReply({ ephemeral: true }).then(
                  async () =>
                    await interaction.editReply({
                      content: 'You have to specify an alphabetic character.',
                    }),
                );
              }

              query.append('letter', letter);
            }

            return axios.get(`https://api.jikan.moe/v4/anime?${query}`).then(
              /**
               *
               * @param {{ data: { data: import('../../constants/types').AnimeInfo[] } }}
               */
              async ({ data: { data } }) => {
                if (!data.length) {
                  return interaction.deferReply({ ephemeral: true }).then(
                    async () =>
                      await interaction.editReply({
                        content: `No anime found with title ${inlineCode(
                          title,
                        )} or maybe it's contains NSFW stuff. Try to use this command in a NSFW Channel.${NSFWResponse}`,
                      }),
                  );
                }

                await interaction.deferReply().then(async () => {
                  /** @type {import('discord.js').EmbedBuilder[]} */
                  const embeds = data.map((item, index, array) =>
                    new EmbedBuilder()
                      .setColor(guild.members.me?.displayHexColor ?? null)
                      .setTimestamp(Date.now())
                      .setFooter({
                        text: `${client.user.username} | Page ${index + 1} of ${
                          array.length
                        }`,
                        iconURL: client.user.displayAvatarURL({
                          dynamic: true,
                        }),
                      })
                      .setAuthor({
                        name: 'Anime Search Results',
                        iconURL:
                          'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png',
                      })
                      .setThumbnail(
                        item.images.jpg.image_url ?? item.images.webp.image_url,
                      )
                      .setFields([
                        {
                          name: '🔤 Title',
                          value: hyperlink(item.title, item.url),
                          inline: true,
                        },
                        {
                          name: '🔠 Type',
                          value: item.type ?? italic('Unknown'),
                          inline: true,
                        },
                        {
                          name: '🎬 Episode',
                          value: `${
                            item.episodes
                              ? `${item.episodes.toLocaleString()} ${pluralize(
                                  'episode',
                                  item.episodes,
                                )}`
                              : '??? episodes'
                          } (${item.duration})`,
                          inline: true,
                        },
                        {
                          name: '📊 Stats',
                          value:
                            item.score ||
                            item.scored_by ||
                            item.members ||
                            item.rank ||
                            item.favorites ||
                            item.rating
                              ? `${item.score ? `⭐ ${item.score}` : ''}${
                                  item.scored_by
                                    ? ` (by ${item.scored_by.toLocaleString()} ${pluralize(
                                        'user',
                                        item.scored_by,
                                      )})`
                                    : ''
                                }${
                                  item.members
                                    ? ` | 👥 ${item.members.toLocaleString()}`
                                    : ''
                                }${item.rank ? ` | #️⃣ #${item.rank}` : ''}${
                                  item.favorites
                                    ? ` | ❤️ ${item.favorites}`
                                    : ''
                                }${item.rating ? ` | 🔞 ${item.rating}` : ''}`
                              : italic('None'),
                          inline: true,
                        },
                        {
                          name: '⌛ Status',
                          value: item.status,
                          inline: true,
                        },
                        {
                          name: '📆 Aired',
                          value: item.aired.string ?? italic('Unknown'),
                          inline: true,
                        },
                        {
                          name: '📆 Premiered',
                          value:
                            item.season || item.year
                              ? `${
                                  item.season ? capitalCase(item.season) : ''
                                } ${item.year ?? ''}`
                              : italic('Unknown'),
                          inline: true,
                        },
                        {
                          name: '🏢 Studios',
                          value: item.studios.length
                            ? item.studios
                                .map((studio) =>
                                  hyperlink(studio.name, studio.url),
                                )
                                .join(', ')
                            : italic('Unknown'),
                          inline: true,
                        },
                        {
                          name: '🔠 Genres',
                          value:
                            item.genres.length ||
                            item.explicit_genres.length ||
                            item.themes.length ||
                            item.demographics.length
                              ? [
                                  ...item.genres,
                                  ...item.explicit_genres,
                                  ...item.themes,
                                  ...item.demographics,
                                ]
                                  .map((genre) =>
                                    hyperlink(genre.name, genre.url),
                                  )
                                  .join(', ')
                              : italic('Unknown'),
                          inline: true,
                        },
                        {
                          name: '💫 Synopsis',
                          value: item.synopsis
                            ? item.synopsis.includes('[Written by MAL Rewrite]')
                              ? truncate(
                                  item.synopsis.replace(
                                    '[Written by MAL Rewrite]',
                                    '',
                                  ),
                                  1024,
                                )
                              : truncate(item.synopsis, 1024)
                            : italic('No available'),
                        },
                        {
                          name: '🎞️ Trailer',
                          value: item.trailer.url ?? italic('No available'),
                        },
                      ]),
                  );

                  const pagination = new Pagination(interaction);

                  pagination.setEmbeds(embeds);

                  pagination.buttons = {
                    ...pagination.buttons,
                    extra: new ButtonBuilder()
                      .setCustomId('jump')
                      .setEmoji('↕️')
                      .setDisabled(false)
                      .setStyle(ButtonStyle.Secondary),
                  };

                  paginations.set(pagination.interaction.id, pagination);

                  await pagination.render();
                });
              },
            );
          }

          case 'character': {
            const name = options.getString('name');
            const order = options.getString('order');
            const sort = options.getString('sort');
            const letter = options.getString('initial');

            const query = new URLSearchParams();

            if (name) {
              query.append('q', encodeURIComponent(name));
            }

            if (order) {
              query.append('order_by', order);
            }

            if (sort) {
              query.append('sort', sort);
            }

            if (letter) {
              if (!isAlphabeticLetter(letter)) {
                return interaction.deferReply({ ephemeral: true }).then(
                  async () =>
                    await interaction.editReply({
                      content: 'You have to specify an alphabetic character.',
                    }),
                );
              }

              query.append('letter', letter);
            }

            return axios
              .get(`https://api.jikan.moe/v4/characters?${query}`)
              .then(
                /**
                 *
                 * @param {{ data: { data: import('../../constants/types').AnimeCharacter[] } }}
                 */
                async ({ data: { data } }) => {
                  if (!data.length) {
                    return interaction.deferReply({ ephemeral: true }).then(
                      async () =>
                        await interaction.editReply({
                          content: `No anime character found with name ${inlineCode(
                            name,
                          )}`,
                        }),
                    );
                  }

                  await interaction.deferReply().then(async () => {
                    const embeds = data.map((item, index, array) =>
                      new EmbedBuilder()
                        .setColor(guild.members.me?.displayHexColor ?? null)
                        .setTimestamp(Date.now())
                        .setFooter({
                          text: `${client.user.username} | Page ${
                            index + 1
                          } of ${array.length}`,
                          iconURL: client.user.displayAvatarURL({
                            dynamic: true,
                          }),
                        })
                        .setDescription(
                          truncate(
                            item.about?.replace(/\n\n\n/g, '\n\n'),
                            4096,
                          ),
                        )
                        .setAuthor({
                          name: 'Anime Character Search Results',
                          iconURL:
                            'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png',
                        })
                        .setThumbnail(
                          item.images.jpg.image_url ??
                            item.images.webp.image_url,
                        )
                        .setFields([
                          {
                            name: '🔤 Name',
                            value: hyperlink(
                              `${item.name} (${item.name_kanji})`,
                              item.url,
                            ),
                            inline: true,
                          },
                          {
                            name: '🔤 Nickname',
                            value: item.nicknames.length
                              ? item.nicknames.join(', ')
                              : italic('None'),
                            inline: true,
                          },
                          {
                            name: '❤️ Favorite',
                            value: `${item.favorites.toLocaleString()} ${pluralize(
                              'favorite',
                              item.favorites,
                            )}`,
                            inline: true,
                          },
                        ]),
                    );

                    const pagination = new Pagination(interaction);

                    pagination.setEmbeds(embeds);

                    pagination.buttons = {
                      ...pagination.buttons,
                      extra: new ButtonBuilder()
                        .setCustomId('jump')
                        .setEmoji('↕️')
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Secondary),
                    };

                    paginations.set(pagination.interaction.id, pagination);

                    await pagination.render();
                  });
                },
              );
          }
        }
        break;

      case 'news':
        switch (options.getSubcommand()) {
          case 'list': {
            const countries = Object.values(newsCountries);

            const responses = countries.map(
              (country, index) => `${bold(`${index + 1}.`)} ${country}`,
            );

            const pagination = new Pagination(interaction, {
              limit: 10,
            });

            pagination.setColor(guild.members.me?.displayHexColor ?? null);
            pagination.setTimestamp(Date.now());
            pagination.setFooter({
              text: `${client.user.username} | Page {pageNumber} of {totalPages}`,
              iconURL: client.user.displayAvatarURL({
                dynamic: true,
              }),
            });
            pagination.setAuthor({
              name: `🌐 News Country Lists (${countries.length.toLocaleString()})`,
            });
            pagination.setDescriptions(responses);

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

          case 'country': {
            const name = options.getString('name', true);
            const newsapi = new NewsAPI(process.env.NEWSAPI_API_KEY);
            const country = Object.values(newsCountries).find(
              (c) => c.toLowerCase() === name.toLowerCase(),
            );

            if (!country) {
              return interaction.deferReply({ ephemeral: true }).then(
                async () =>
                  await interaction.editReply({
                    content: `No country available with name ${inlineCode(
                      name,
                    )}.`,
                  }),
              );
            }

            return newsapi.v2
              .topHeadlines({
                country: Object.keys(newsCountries).find(
                  (key) =>
                    newsCountries[key].toLowerCase() === country.toLowerCase(),
                ),
              })
              .then(
                /**
                 *
                 * @param {{ articles: import('../../constants/types').News[] }}
                 */
                async ({ articles }) => {
                  if (!articles.length) {
                    return interaction.deferReply({ ephemeral: true }).then(
                      async () =>
                        await interaction.editReply({
                          content: `No news found in ${inlineCode(country)}.`,
                        }),
                    );
                  }

                  await interaction.deferReply().then(async () => {
                    /** @type {import('discord.js').EmbedBuilder[]} */
                    const embeds = articles.map((article, index, array) =>
                      new EmbedBuilder()
                        .setColor(guild.members.me?.displayHexColor ?? null)
                        .setTimestamp(Date.now())
                        .setFooter({
                          text: `${client.user.username} | Page ${
                            index + 1
                          } of ${array.length}`,
                          iconURL: client.user.displayAvatarURL({
                            dynamic: true,
                          }),
                        })
                        .setDescription(
                          truncate(
                            article.content
                              ?.slice(0, article.content?.indexOf('[+'))
                              ?.replace(/<ul>/gi, '')
                              ?.replace(/<li>/gi, '')
                              ?.replace(/<\/li>/gi, ''),
                            4096,
                          ),
                        )
                        .setThumbnail(article.urlToImage)
                        .setAuthor({
                          name: `📰 ${country} News Lists`,
                        })
                        .setFields([
                          {
                            name: '🔤 Headline',
                            value: hyperlink(article.title, article.url),
                            inline: true,
                          },
                          {
                            name: '🔤 Subheadline',
                            value: article.description ?? italic('None'),
                            inline: true,
                          },
                          {
                            name: '📆 Published At',
                            value: time(
                              new Date(article.publishedAt),
                              TimestampStyles.RelativeTime,
                            ),
                            inline: true,
                          },
                          {
                            name: '✒️ Author',
                            value: article.author ?? italic('Unknown'),
                            inline: true,
                          },
                          {
                            name: '🔢 Source',
                            value: article.source.name,
                            inline: true,
                          },
                        ]),
                    );

                    const pagination = new Pagination(interaction);

                    pagination.setEmbeds(embeds);

                    pagination.buttons = {
                      ...pagination.buttons,
                      extra: new ButtonBuilder()
                        .setCustomId('jump')
                        .setEmoji('↕️')
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Secondary),
                    };

                    paginations.set(pagination.interaction.id, pagination);

                    await pagination.render();
                  });
                },
              );
          }
        }
        break;

      case 'nhentai':
        {
          const baseURL = 'https://api.lolhuman.xyz/api';

          const attachment = new AttachmentBuilder(
            './src/assets/images/nhentai-logo.png',
            {
              name: 'nhentai-logo.png',
            },
          );

          if (!channel.nsfw) {
            return interaction.deferReply({ ephemeral: true }).then(
              async () =>
                await interaction.editReply({
                  content: `Please use this command in a NSFW Channel.${NSFWResponse}`,
                }),
            );
          }

          switch (options.getSubcommand()) {
            case 'tag': {
              const tag = options.getString('tag', true);

              if (!isNumericString(tag)) {
                return interaction.deferReply({ ephemeral: true }).then(
                  async () =>
                    await interaction.editReply({
                      content: 'Please enter a number.',
                    }),
                );
              }

              return axios
                .get(
                  `${baseURL}/nhentai/${tag}?apikey=${process.env.LOLHUMAN_API_KEY}`,
                )
                .then(
                  /**
                   *
                   * @param {{ data: { result: import('../../constants/types').NHentai[] } }}
                   */
                  async ({ data: { result } }) => {
                    const pagination = new Pagination(interaction, {
                      attachments: [attachment],
                    });

                    embed.setAuthor({
                      name: result.title_native,
                      iconURL: 'attachment://nhentai-logo.png',
                    });
                    embed.setFields([
                      {
                        name: '🏷️ Tags',
                        value: result.tags.join(', '),
                      },
                    ]);

                    /** @type {import('discord.js').EmbedBuilder[]} */
                    const imagesEmbed = result.image.map((url) =>
                      new EmbedBuilder()
                        .setColor(guild?.members.me?.displayHexColor ?? null)
                        .setTimestamp(Date.now())
                        .setAuthor({
                          name: result.title_native,
                          iconURL: 'attachment://nhentai-logo.png',
                        })
                        .setImage(url),
                    );

                    let embeds = [embed, ...imagesEmbed];

                    embeds = embeds.map((emb, index, array) =>
                      emb.setFooter({
                        text: `${client.user.username} | Page ${index + 1} of ${
                          array.length
                        }`,
                        iconURL: client.user.displayAvatarURL({
                          dynamic: true,
                        }),
                      }),
                    );

                    pagination.setEmbeds(embeds);

                    pagination.buttons = {
                      ...pagination.buttons,
                      extra: new ButtonBuilder()
                        .setCustomId('jump')
                        .setEmoji('↕️')
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Secondary),
                    };

                    paginations.set(pagination.interaction.id, pagination);

                    await pagination.render();
                  },
                );
            }

            case 'query': {
              const query = options.getString('query', true);

              return axios
                .get(
                  `${baseURL}/nhentaisearch?query=${query}&apikey=${process.env.LOLHUMAN_API_KEY}`,
                )
                .then(
                  /**
                   *
                   * @param {{ data: { result: import('../../constants/types').NHentaiSearch[] } }}
                   */
                  async ({ data: { result } }) => {
                    await interaction.deferReply().then(async () => {
                      /** @type {import('discord.js').EmbedBuilder[]} */
                      const embeds = result.map((item, index, array) =>
                        new EmbedBuilder()
                          .setColor(guild.members.me?.displayHexColor ?? null)
                          .setTimestamp(Date.now())
                          .setFooter({
                            text: `${client.user.username} | Page ${
                              index + 1
                            } of ${array.length}`,
                            iconURL: client.user.displayAvatarURL({
                              dynamic: true,
                            }),
                          })
                          .setAuthor({
                            name: 'Doujin Search Result',
                            iconURL: 'attachment://nhentai-logo.png',
                          })
                          .setFields([
                            {
                              name: '🔤 Title',
                              value: hyperlink(
                                item.title_native,
                                `https://nhentai.net/g/${item.id}`,
                              ),
                              inline: true,
                            },
                            {
                              name: '📄 Total Page',
                              value: `${item.page.toLocaleString()} ${pluralize(
                                'page',
                                item.page,
                              )}`,
                              inline: true,
                            },
                          ]),
                      );

                      const pagination = new Pagination(interaction, {
                        attachments: [attachment],
                      });

                      pagination.setEmbeds(embeds);

                      pagination.buttons = {
                        ...pagination.buttons,
                        extra: new ButtonBuilder()
                          .setCustomId('jump')
                          .setEmoji('↕️')
                          .setDisabled(false)
                          .setStyle(ButtonStyle.Secondary),
                      };

                      paginations.set(pagination.interaction.id, pagination);

                      await pagination.render();
                    });
                  },
                );
            }
          }
        }
        break;
    }

    switch (options.getSubcommand()) {
      case 'manga': {
        const title = options.getString('title');
        const type = options.getString('type');
        const score = options.getInteger('score');
        const status = options.getString('status');
        const order = options.getString('order');
        const sort = options.getString('sort');
        const letter = options.getString('initial');

        const query = new URLSearchParams();

        if (!channel.nsfw) {
          query.append('sfw', 'true');
        }

        if (title) {
          query.append('q', encodeURIComponent(title));
        }

        if (type) {
          query.append('type', type);
        }

        if (score) {
          query.append(
            'score',
            Number(`${score}`.replace(/,/g, '.')).toFixed(1),
          );
        }

        if (status) {
          query.append('status', status);
        }

        if (order) {
          query.append('order_by', order);
        }

        if (sort) {
          query.append('sort', sort);
        }

        if (letter) {
          if (!isAlphabeticLetter(letter)) {
            return interaction.deferReply({ ephemeral: true }).then(
              async () =>
                await interaction.editReply({
                  content: 'You have to specify an alphabetic character.',
                }),
            );
          }

          query.append('letter', letter);
        }

        return axios.get(`https://api.jikan.moe/v4/manga?${query}`).then(
          /**
           *
           * @param {{ data: { data: import('../../constants/types').MangaInfo[] } }}
           */
          async ({ data: { data } }) => {
            if (!data.length) {
              return interaction.deferReply({ ephemeral: true }).then(
                async () =>
                  await interaction.editReply({
                    content: `No manga found with title ${inlineCode(
                      title,
                    )} or maybe it's contains NSFW stuff. Try to use this command in a NSFW Channel.${NSFWResponse}`,
                  }),
              );
            }

            await interaction.deferReply().then(async () => {
              /** @type {import('discord.js').EmbedBuilder[]} */
              const embeds = data.map((item, index, array) =>
                new EmbedBuilder()
                  .setColor(guild.members.me?.displayHexColor ?? null)
                  .setTimestamp(Date.now())
                  .setFooter({
                    text: `${client.user.username} | Page ${index + 1} of ${
                      array.length
                    }`,
                    iconURL: client.user.displayAvatarURL({
                      dynamic: true,
                    }),
                  })
                  .setThumbnail(
                    item.images.jpg.image_url ?? item.images.webp.image_url,
                  )
                  .setAuthor({
                    name: 'Manga Search Results',
                    iconURL:
                      'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png',
                  })
                  .setFields([
                    {
                      name: '🔤 Title',
                      value: hyperlink(item.title, item.url),
                      inline: true,
                    },
                    {
                      name: '🔠 Type',
                      value: item.type ?? italic('Unknown'),
                      inline: true,
                    },
                    {
                      name: '📚 Volume & Chapter',
                      value: `${
                        item.volumes
                          ? `${item.volumes.toLocaleString()} ${pluralize(
                              'volume',
                              item.volumes,
                            )}`
                          : '??? volumes'
                      } ${
                        item.chapters
                          ? `${item.chapters.toLocaleString()} (${pluralize(
                              'chapter',
                              item.chapters,
                            )})`
                          : ''
                      }`,
                      inline: true,
                    },
                    {
                      name: '📊 Stats',
                      value:
                        item.score ||
                        item.scored_by ||
                        item.members ||
                        item.rank ||
                        item.favorites
                          ? `${item.score ? `⭐ ${item.score}` : ''}${
                              item.scored_by
                                ? ` (by ${item.scored_by.toLocaleString()} ${pluralize(
                                    'user',
                                    item.scored_by,
                                  )})`
                                : ''
                            }${
                              item.members
                                ? ` | 👥 ${item.members.toLocaleString()}`
                                : ''
                            }${item.rank ? ` | #️⃣ #${item.rank}` : ''}${
                              item.favorites ? ` | ❤️ ${item.favorites}` : ''
                            }`
                          : italic('None'),
                      inline: true,
                    },
                    {
                      name: '⌛ Status',
                      value: item.status ?? italic('Unknown'),
                      inline: true,
                    },
                    {
                      name: '📆 Published',
                      value: item.published.string ?? italic('Unknown'),
                      inline: true,
                    },
                    {
                      name: '📝 Authors',
                      value: item.authors.length
                        ? item.authors
                            .map((author) => hyperlink(author.name, author.url))
                            .join(', ')
                        : italic('Unknown'),
                      inline: true,
                    },
                    {
                      name: '📰 Serializations',
                      value: item.serializations.length
                        ? item.serializations
                            .map((serialization) =>
                              hyperlink(serialization.name, serialization.url),
                            )
                            .join(', ')
                        : italic('Unknown'),
                      inline: true,
                    },
                    {
                      name: '🔠 Genres',
                      value:
                        item.genres.length ||
                        item.explicit_genres.length ||
                        item.themes.length ||
                        item.demographics.length
                          ? [
                              ...item.genres,
                              ...item.explicit_genres,
                              ...item.themes,
                              ...item.demographics,
                            ]
                              .map((genre) => hyperlink(genre.name, genre.url))
                              .join(', ')
                          : italic('Unknown'),
                      inline: true,
                    },
                    {
                      name: '💫 Synopsis',
                      value: item.synopsis
                        ? item.synopsis.includes('[Written by MAL Rewrite]')
                          ? truncate(
                              item.synopsis.replace(
                                '[Written by MAL Rewrite]',
                                '',
                              ),
                              1024,
                            )
                          : truncate(item.synopsis, 1024)
                        : italic('No available'),
                    },
                  ]),
              );

              const pagination = new Pagination(interaction);

              pagination.setEmbeds(embeds);

              pagination.buttons = {
                ...pagination.buttons,
                extra: new ButtonBuilder()
                  .setCustomId('jump')
                  .setEmoji('↕️')
                  .setDisabled(false)
                  .setStyle(ButtonStyle.Secondary),
              };

              paginations.set(pagination.interaction.id, pagination);

              await pagination.render();
            });
          },
        );
      }

      case 'image': {
        const query = options.getString('query', true);

        const google = new Scraper({
          puppeteer: {
            waitForInitialPage: true,
          },
        });

        return interaction.deferReply({ ephemeral: true }).then(async () => {
          await wait(4000);

          await google.scrape(query, 5).then(async (results) => {
            const pagination = new Pagination(interaction, {
              limit: 1,
            });

            pagination.setColor(guild.members.me?.displayHexColor ?? null);
            pagination.setTimestamp(Date.now());
            pagination.setFooter({
              text: `${client.user.username} | Page {pageNumber} of {totalPages}`,
              iconURL: client.user.displayAvatarURL({
                dynamic: true,
              }),
            });
            pagination.setAuthor({
              name: 'Image Search Results',
              iconURL:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/480px-Google_%22G%22_Logo.svg.png',
            });
            pagination.setImages(results.map((result) => result.url));

            pagination.buttons = {
              ...pagination.buttons,
              extra: new ButtonBuilder()
                .setCustomId('jump')
                .setEmoji('↕️')
                .setDisabled(false)
                .setStyle(ButtonStyle.Secondary),
            };

            paginations.set(pagination.interaction.id, pagination);

            await pagination.render();
          });
        });
      }

      case 'definition': {
        const term = options.getString('term', true);
        const query = new URLSearchParams({ term });

        return axios
          .get(`https://api.urbandictionary.com/v0/define?${query}`)
          .then(
            /**
             *
             * @param {{ data: { list: import('../../constants/types').UrbanDictionary[] } }}
             */
            async ({ data: { list } }) => {
              if (!list.length) {
                return interaction.deferReply({ ephemeral: true }).then(
                  async () =>
                    await interaction.editReply({
                      content: `No result found for ${inlineCode(term)}.`,
                    }),
                );
              }

              const {
                author,
                definition,
                example,
                permalink,
                thumbs_down,
                thumbs_up,
                word,
                written_on,
              } = list[Math.floor(Math.random() * list.length)];

              const formattedCite = `\n${italic(
                `by ${author} — ${time(
                  new Date(written_on),
                  TimestampStyles.RelativeTime,
                )}`,
              )}`;

              embed.setAuthor({
                name: capitalCase(word),
                url: permalink,
                iconURL:
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Urban_Dictionary_logo.svg/320px-Urban_Dictionary_logo.svg.png',
              });
              embed.setFields([
                {
                  name: '🔤 Definition',
                  value: `${truncate(
                    definition,
                    1024 - formattedCite.length - 3,
                  )}${formattedCite}`,
                },
                {
                  name: '🔤 Example',
                  value: truncate(example, 1024),
                },
                {
                  name: '⭐ Rating',
                  value: `${thumbs_up.toLocaleString()} 👍 | ${thumbs_down.toLocaleString()} 👎`,
                },
              ]);

              await interaction
                .deferReply()
                .then(
                  async () => await interaction.editReply({ embeds: [embed] }),
                );
            },
          );
      }

      case 'mdn': {
        const term = options.getString('term', true);
        const language = options.getString('language');
        const query = new URLSearchParams({
          q: term,
          locale: language ?? 'en-US',
        });
        const baseURL = 'https://developer.mozilla.org';

        return axios.get(`${baseURL}/api/v1/search?${query}`).then(
          /**
           *
           * @param {{ data: { documents: import('../../constants/types').MDNDocument[], suggestions: import('../../constants/types').MDNSuggestion[] } }}
           */
          async ({ data: { documents, suggestions } }) => {
            if (!documents.length) {
              if (!suggestions.length) {
                return interaction.deferReply({ ephemeral: true }).then(
                  async () =>
                    await interaction.editReply({
                      content: `No result found for ${inlineCode(term)}.`,
                    }),
                );
              }

              const newQuery = new URLSearchParams({
                q: suggestions[0].text,
                locale: language ?? 'en-US',
              });

              return axios.get(`${baseURL}/api/v1/search?${newQuery}`).then(
                /**
                 *
                 * @param {{ data: { documents: import('../../constants/types').MDNDocument[] } }}
                 */
                async ({ data: { documents: docs } }) => {
                  const fields = docs.map((doc) => ({
                    name: doc.title,
                    value: `${doc.summary}\n${hyperlink(
                      'View Documentation',
                      `${baseURL}${doc.mdn_url}`,
                      'Click here to view the documentation.',
                    )}`,
                  }));

                  embed.setAuthor({
                    name: 'Documentation Search Results',
                    iconURL:
                      'https://pbs.twimg.com/profile_images/1511434207079407618/AwzUxnVf_400x400.png',
                  });
                  embed.setFields(fields);

                  await interaction
                    .deferReply()
                    .then(
                      async () =>
                        await interaction.editReply({ embeds: [embed] }),
                    );
                },
              );
            }

            const fields = documents.map((doc) => ({
              name: doc.title,
              value: `${doc.summary}\n${hyperlink(
                'View Documentation',
                `${baseURL}${doc.mdn_url}`,
                'Click here to view the documentation.',
              )}`,
            }));

            embed.setAuthor({
              name: '📖 Documentation Search Results',
            });
            embed.setFields(fields);

            await interaction
              .deferReply()
              .then(
                async () => await interaction.editReply({ embeds: [embed] }),
              );
          },
        );
      }
    }
  },
};
