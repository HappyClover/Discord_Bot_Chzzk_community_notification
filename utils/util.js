const fs = require("fs");
const utilItem = {};

utilItem.getCommunityRecentlyInfo = async function (streamerId) {
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

utilItem.getNotificationFile = function () {

    return JSON.parse(fs.readFileSync("./notification.json", "utf8"));
}

utilItem.updateNotificationFile = function (json) {
    try{
        fs.writeFileSync("./notification.json", JSON.stringify(json));
        return true;
    }catch (err){
        console.log(err);
        return false;
    }
}

module.exports = utilItem;