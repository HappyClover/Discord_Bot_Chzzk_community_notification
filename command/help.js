const {EmbedBuilder} = require("discord.js");

const help = {};

help.SendMessage = function (channel) {
    const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("치지직 커뮤니티 알림 봇 명령어")
        .setDescription("치지직 커뮤니티에서 스트리머의 커뮤니티를 1분마다 확인하여 알림을 주는 디스코드 봇입니다.")
        .addFields(
            {
                name: '등록된 알림 리스트 확인',
                value: '!리스트 // !등록리스트 // !list',
                inline: true
            }
        )
        .addFields(
            {
                name: '알림 스트리머 등록',
                value: '!등록 (스트리머 코드)',
                inline: true
            }
        )
        .addFields(
            {
                name: '등록된 알림 리스트 삭제',
                value: '!삭제 (스트리머 코드)',
                inline: true
            }
        )
        .addFields(
            {
                name: '라이센스 확인',
                value: '!라이센스',
                inline: true
            }
        )
        .setTimestamp()

    channel.send({embeds: [exampleEmbed]});
}

help.licence = function (channel) {
    const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("치지직 커뮤니티 알림 봇 라이센스")
        .setDescription("치지직 커뮤니티 알림 봇을 제작하면서 사용된 라이센스 및 소스코드 링크입니다.")
        .addFields(
            {
                name: '벨 아이콘',
                value: 'https://www.flaticon.com/kr/free-icon/bell_17042034?term=bell&page=2&position=41&origin=search&related_id=17042034',
                inline: true
            }
        )
        .addFields(
            {
                name: '치지직 봇 소스코드',
                value: 'https://github.com/HappyClover/Discord_Bot_Chzzk_community_notification',
                inline: true
            }
        )
        .setTimestamp()

    channel.send({embeds: [exampleEmbed]});
}

module.exports = help;

