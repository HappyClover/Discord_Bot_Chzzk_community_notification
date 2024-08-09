const {EmbedBuilder} = require("discord.js");
const fs = require("fs");
const util = require('../utils/util')

const register = {};

register.getList = async function(channel) {
    const notiJson = util.getNotificationFile();
    const index = notiJson.findIndex((e)=>e.channel == channel.id);

    if (index > -1) { //저장된 채널 리스트가 있으면
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

        channel.send({ embeds: [exampleEmbed] });

    } else {
        channel.send("현재 채널에 등록된 스트리머는 없습니다.\n" +
            "!등록 (치지직스트리머아이디) 를 입력해서 등록 해보세요.");
    }
}

register.import = async (channel, streamerId) => {
    const notiJson = util.getNotificationFile();
    const index = notiJson.findIndex((e)=>e.channel == channel.id);

    //먼저 채널에 스트리머가 등록 되어있는지 확인
    if (index > -1) {
        const isAlreadyRegit = notiJson[index].list.findIndex(e => e.id == streamerId);
        if (isAlreadyRegit !== -1) {
            channel.send("해당 채널에 이미 등록된 스트리머 입니다.");
            return;
        }
    }

    const communityInfo = await util.getCommunityRecentlyInfo(streamerId);

    if (communityInfo.result != 200){
        channel.send("스트리머 정보를 가져오지 못했습니다.\n" +
            "해당 현상은 원인이 2가지로 첫번째는 아이디값이 잘못되었을때\n" +
            "두번째는 커뮤니티에 올라온 글이 없을때 입니다.\n" +
            "아이디값은 치지직 스트리머 홈 URL인 https://chzzk.naver.com/(스트리머아이디)/ 에서 찾으실 수 있으며\n" +
            "커뮤니티에 글이 없는경우는 개발자가 귀찮아서 한동안은 구현 예정이 없습니다.\n" +
            "스트리머에게 커뮤니티에 글 하나 써달라고 해보아요");
        return;
    }


    if (index > -1) {
        notiJson[index].list.push({
            "id": streamerId,
            "name": communityInfo.name,
            "recentId": communityInfo.communityId
        })
    } else {
        notiJson.push(  {
            "channel":channel.id,
            "list":[
                {
                    "id": streamerId,
                    "name": communityInfo.name,
                    "recentId": communityInfo.communityId
                }
            ]
        })
    }

    try{
        await util.updateNotificationFile(notiJson);

        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(communityInfo.name+" 등록 완료")
            .setDescription(communityInfo.contents)
            .setThumbnail(communityInfo.profile)
            .setImage(communityInfo.img)
            .setTimestamp()

        channel.send({ embeds: [exampleEmbed] });

    } catch(err) {
        console.log(err);
        channel.send("등록에 실패했습니다.\n개발자 찐빠일 가능성이 높으니 개발자에게 문의하세요." +
            "에러코드 : register_File_93" +
            `메세지 : ${err}`);
    }
}

register.delete = async (channel, streamerId) => {
    const notiJson = util.getNotificationFile();
    const channelindex = notiJson.findIndex((e)=>e.channel == channel.id);

    //채널 인덱스값 확인
    if (channelindex == -1) {
        channel.send("자네. 그 누구도 등록한적도 없으면서 삭제부터 할려는건가?");
        return;
    }

    const streamerIndex = notiJson[channelindex].list.findIndex(e => e.id == streamerId);

    //스트리머 인덱스값 확인
    if (streamerIndex == -1) {
        channel.send("등록 되지 않은 스트리머 아이디값입니다.\n" +
        "등록된 스트리머를 확인할려면 '!리스트'를 입력해주세요.");
        return;
    }

    try{
        notiJson[channelindex].list.splice(streamerIndex,1);
        util.updateNotificationFile(notiJson);

        channel.send(`${streamerId}를 삭제했습니다.`);

    } catch(err) {
        console.log(err);
        channel.send("등록에 실패했습니다.\n개발자 찐빠일 가능성이 높으니 개발자에게 문의하세요." +
            "에러코드 : register_File_127" +
            `메세지 : ${err}`);
    }
}

module.exports = register;