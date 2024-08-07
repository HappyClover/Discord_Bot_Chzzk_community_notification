// Require the necessary discord.js classes
const { token } = require('./config.json');
const { Client, IntentsBitField, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const schedule = require('node-schedule');

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
    const channel = client.channels.fetch(message.channelId);

    if (msg.substring(0,1) === "!"){
        const msg_array = msg.split(" ");
        const notiJson = JSON.parse(fs.readFileSync("./notification.json", "utf8"));
        const index = notiJson.findIndex((e)=>e.channel == message.channelId);

        switch (msg_array[0]) {
            case "!도움말":
            case "!헬프":
            case "!help":
                const exampleEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle("치지직 커뮤니티 알림 봇 명령어")
                    .setDescription("치지직 커뮤니티에서 스트리머가 새로운 글을 올릴때 알림을 주는 디스코드 봇입니다.")
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
                    .setTimestamp()
                // .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

                await channel.then(async (c) => {
                    await c.send({ embeds: [exampleEmbed] });
                });
                break;

            case "!리스트":
            case "!등록리스트":
            case "!list":
                if (index > -1) {
                    const exampleEmbed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`해당 채널에 등록된 스트리머는 ${notiJson[index].list.length} 명 입니다.`)
                        .setTimestamp()

                    notiJson[index].list.map(item => {
                        exampleEmbed.addFields({
                            name: item.name,
                            value: item.id,
                            inline: true
                        })
                    })

                    await channel.then(async (c) => {
                        await c.send({ embeds: [exampleEmbed] });
                    });
                    break;
                } else {
                    message.channel.send("현재 채널에 등록된 스트리머는 없습니다.\n" +
                        "!등록 (치지직스트리머아이디) 를 입력해서 등록 해보세요.");
                }

                break;

            case "!등록":
                if (index > -1) {
                    const isAlreadyRegit = notiJson[index].list.findIndex(e => e.id == msg_array[1]);
                    if (isAlreadyRegit !== -1) {
                        message.channel.send("해당 채널에 이미 등록된 스트리머 입니다.");
                        break;
                    }
                }

                const communityInfo = await getCommunityRecentlyInfo(msg_array[1]);
                console.log(communityInfo);

                if (communityInfo.result != 200){
                    message.channel.send("스트리머 정보를 가져오지 못했습니다.\n" +
                        "아이디 값을 다시 확인 해주세요." +
                        "아이디값은 치지직 스트리머 홈 URL인 https://chzzk.naver.com/(스트리머아이디)/ 에서 찾으실 수 있습니다.");
                    break;
                }


                if (index > -1) {
                    notiJson[index].list.push({
                        "id": msg_array[1],
                        "name": communityInfo.name,
                        "recentId": communityInfo.communityId
                    })
                } else {
                    notiJson.push(  {
                        "channel":message.channelId,
                        "list":[
                            {
                                "id": msg_array[1],
                                "name": communityInfo.name,
                                "recentId": communityInfo.communityId
                            }
                        ]
                    })
                }

                try{
                    fs.writeFileSync("./notification.json", JSON.stringify(notiJson));

                    const exampleEmbed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(communityInfo.name+" 등록 완료")
                        .setDescription(communityInfo.contents)
                        .setThumbnail(communityInfo.profile)
                        .setImage(communityInfo.img)
                        .setTimestamp()

                    await channel.then(async (c) => {
                        await c.send({ embeds: [exampleEmbed] });
                    });
                } catch(err) {
                    console.log(err);
                    message.channel.send("등록에 실패했습니다. 개발자가 버그 못잡은듯 하니 개발자에게 문의하세요." +
                        `메세지 : ${err}`);
                }
                break;

            case "!삭제":
                break;
        }
    }
});

const job = schedule.scheduleJob('0 * * * * *', async function () {
    const notiJson = JSON.parse(fs.readFileSync("./notification.json", "utf8"));


    notiJson.map(async (item,i) => {
        const channel = client.channels.fetch(item.channel);
        console.log(item.list);

        item.list.map(async (listItem,j) => {
            let contents = await getCommunityRecentlyInfo(listItem.id);

            if (listItem.recentId < contents.communityId){
                const exampleEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(contents.name)
                    .setURL(`https://chzzk.naver.com/${contents.id}/community/detail/${contents.communityId}`)
                    .setDescription(contents.contents)
                    .setThumbnail(contents.profile)
                    .setImage(contents.img)
                    .setTimestamp()

                await channel.then(async (c) => {
                    await c.send({ embeds: [exampleEmbed] });
                });

                notiJson[i].list[j].recentId = contents.communityId;

                fs.writeFileSync("./notification.json", JSON.stringify(notiJson));

                await wait(10);
            }
        })
    })
});

async function getCommunityRecentlyInfo(streamerId) {
    let getData = await (await fetch(`https://apis.naver.com/nng_main/nng_comment_api/v1/type/CHANNEL_POST/id/${streamerId}/comments?limit=10&offset=0&orderType=DESC&pagingType=PAGE`, {
        method: "GET",
        headers: new Headers({
            'Content-Type': "application/xml",
        }),
    })).json();

    try{
        return {
            result: getData.code,
            name: getData.content.comments.data[0].user.userNickname,
            profile: getData.content.comments.data[0].user.profileImageUrl,
            communityId: getData.content.comments.data[0].comment.commentId,
            contents: getData.content.comments.data[0].comment.content,
            img:getData.content.comments.data[0].comment.attaches ? getData.content.comments.data[0].comment.attaches[0].attachValue : null
        };
    }catch (err){
        return {
            result: err
        }
    }

}

client.login(token);