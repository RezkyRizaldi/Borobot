const { EmbedBuilder } = require('discord.js');
const { Events: DistubeEvents } = require('distube');

module.exports = {
  name: DistubeEvents.EMPTY,

  /**
   *
   * @param {import('distube').Queue} queue
   */
  async execute(queue) {
    const { client, clientMember, textChannel, voiceChannel } = queue;

    const embed = new EmbedBuilder()
      .setColor(clientMember.displayHexColor)
      .setTimestamp(Date.now())
      .setDescription(`${voiceChannel} is empty! Leaving the channel...`)
      .setAuthor({
        name: '🚫 Channel Empty',
      })
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      });

    await textChannel.send({ embeds: [embed] });
  },
};
