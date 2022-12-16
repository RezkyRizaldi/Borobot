const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { Pagination } = require('pagination.djs');

/**
 *
 * @param {{ interaction: import('discord.js').ChatInputCommandInteraction, limit: Number|undefined, attachments: (import('discord.js').AttachmentBuilder | import('discord.js').Attachment | import('discord.js').BufferResolvable | import('stream').Stream | import('discord.js').JSONEncodable<import('discord.js').APIAttachment> | import('discord.js').AttachmentPayload)[]|undefined }}
 */
module.exports = ({ interaction, limit = 5, attachments }) => {
  const { client, guild } = interaction;

  if (!guild) throw "Guild doesn't exists.";

  /** @type {{ paginations: import('discord.js').Collection<String, import('pagination.djs').Pagination> }} */
  const { paginations } = client;

  const pagination = new Pagination(interaction, { limit, attachments })
    .setColor(guild.members.me?.displayColor ?? null)
    .setTimestamp(Date.now());

  if (limit) {
    pagination.setFooter({
      text: `${client.user.username} | Page {pageNumber} of {totalPages}`,
      iconURL: client.user.displayAvatarURL(),
    });
  }

  pagination.buttons = {
    ...pagination.buttons,
    extra: new ButtonBuilder()
      .setCustomId('jump')
      .setEmoji('↕️')
      .setDisabled(false)
      .setStyle(ButtonStyle.Secondary),
  };

  paginations.set(pagination.interaction.id, pagination);

  return pagination;
};
