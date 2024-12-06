// Require the necessary discord.js classes
const { token } = require('./config.json');
const { Client, IntentsBitField, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const schedule = require('node-schedule');

//명령어들
const command_Help = require('./command/help');
const command_register = require('./command/register');

const util = require('./utils/util');

const wait = (timeToDelay) => new Promise((resolve) => setTimeout(resolve, timeToDelay))

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.once("ready", (c) => {
    console.log(`${c.user.tag} is online.`);
});

client.on("messageCreate", async (message) => {
    const msg = message.content;
    const channel = await client.channels.fetch(message.channelId);

    if (msg.substring(0,1) === "!"){
        const msg_array = msg.split(" ");

        switch (msg_array[0]) {
            case "!도움말":
            case "!헬프":
            case "!help":
                command_Help.SendMessage(channel);
                break;

            case "!리스트":
            case "!등록리스트":
            case "!list":
                await command_register.getList(channel);
                break;

            case "!등록":
                await command_register.import(channel, msg_array[1]);
                break;

            case "!삭제":
                await command_register.delete(channel, msg_array[1]);
                break;

            case "!라이센스":
                command_Help.licence(channel);
                break;
        }
    }
});

const job = schedule.scheduleJob('0 * * * * *', async function () {
    const notiJson = util.getNotificationFile();

    notiJson.map(async (item,i) => {
        let channel = null;

        try {
            channel = await client.channels.fetch(item.channel);
            console.log(item.list);

            item.list.map(async (listItem,j) => {

                let contents = await util.getCommunityRecentlyInfo(listItem.id);

                if (listItem.recentId < contents.communityId){
                    const exampleEmbed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(contents.name)
                        .setURL(`https://chzzk.naver.com/${listItem.id}/community/detail/${contents.communityId}`)
                        .setDescription(contents.contents)
                        .setThumbnail(contents.profile)
                        .setImage(contents.img)
                        .setTimestamp()

                    await channel.send({ embeds: [exampleEmbed] });

                    notiJson[i].list[j].recentId = contents.communityId;

                    util.updateNotificationFile(notiJson);

                    await wait(10);
                }
            })
        } catch (e){
            console.log("메세지 전송 에러 발생 : ", e.rawError);

            switch (e.rawError.code) {
                case 10003:
                    console.log(`${e.rawError.message} : 알수 없는 채널 인식으로 ${notiJson[i].channel} 채널 값 삭제`);
                    notiJson.splice(i,1);
                    util.updateNotificationFile(notiJson);
                    await wait(10);

                    break;
            }


        }

    })
});

client.login(token);