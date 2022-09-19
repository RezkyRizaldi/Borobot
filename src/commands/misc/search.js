const axios = require('axios').default;
const {
  EmbedBuilder,
  inlineCode,
  italic,
  SlashCommandBuilder,
} = require('discord.js');
const Scraper = require('images-scraper').default;
const moment = require('moment');
const wait = require('node:timers/promises').setTimeout;
const { Pagination } = require('pagination.djs');

const { truncate } = require('../../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('🔍 Search command.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('image')
        .setDescription('🖼️ Search an image from Google.')
        .addStringOption((option) =>
          option
            .setName('query')
            .setDescription('🔠 The image search query.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('definition')
        .setDescription(
          '🖼️ Search the definition of a term from Urban Dictionary.',
        )
        .addStringOption((option) =>
          option
            .setName('term')
            .setDescription("🔠 The definition's term.")
            .setRequired(true),
        ),
    ),
  type: 'Chat Input',

  /**
   *
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;

    switch (options.getSubcommand()) {
      case 'image': {
        const query = options.getString('query');

        const google = new Scraper({
          puppeteer: {
            waitForInitialPage: true,
          },
        });

        return interaction.deferReply({ ephemeral: true }).then(async () => {
          await wait(4000);

          await google.scrape(query, 5).then(
            /**
             *
             * @param {import('images-scraper').Scraper.ScrapeResult[]} results
             */
            async (results) => {
              const pagination = new Pagination(interaction, {
                limit: 1,
              });

              pagination.setColor(interaction.guild.members.me.displayHexColor);
              pagination.setTimestamp(Date.now());
              pagination.setFooter({
                text: `${interaction.client.user.username} | Page {pageNumber} of {totalPages}`,
                iconURL: interaction.client.user.displayAvatarURL({
                  dynamic: true,
                }),
              });
              pagination.setImages(results.map((result) => result.url));

              await pagination.render();
            },
          );
        });
      }

      case 'definition': {
        const term = options.getString('term');
        const query = new URLSearchParams({ term });

        return interaction
          .deferReply()
          .then(
            async () =>
              await axios
                .get(`https://api.urbandictionary.com/v0/define?${query}`)
                .then(async ({ data: { list } }) => {
                  if (!list.length) {
                    return interaction.editReply({
                      content: `No results found for ${inlineCode(term)}`,
                    });
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

                  const utc = moment(written_on).utc().format('YYYY-MM-DD');
                  const day = moment(utc).day();
                  const month = moment(utc).month();
                  const year = moment(utc).year();
                  const formattedCite = `\n${italic(
                    `by ${author} — ${moment([year, month, day]).fromNow()}`,
                  )}`;

                  const embed = new EmbedBuilder()
                    .setColor(interaction.guild.members.me.displayHexColor)
                    .setTimestamp(Date.now())
                    .setFooter({
                      text: interaction.client.user.username,
                      iconURL: interaction.client.user.displayAvatarURL({
                        dynamic: true,
                      }),
                    })
                    .setAuthor({
                      name: word,
                      url: permalink,
                    })
                    .setFields([
                      {
                        name: 'Definition',
                        value: truncate(
                          `${definition}${formattedCite}`,
                          1024,
                          formattedCite.length + 3,
                        ),
                      },
                      {
                        name: 'Example',
                        value: truncate(example, 1024),
                      },
                      {
                        name: 'Rating',
                        value: `${thumbs_up} 👍 | ${thumbs_down} 👎`,
                      },
                    ]);

                  await interaction.editReply({ embeds: [embed] });
                }),
          )
          .catch(async (err) => {
            console.error(err);

            await interaction.editReply({ content: err.message });
          })
          .finally(
            async () =>
              await wait(15000).then(
                async () => await interaction.deleteReply(),
              ),
          );
      }
    }
  },
};