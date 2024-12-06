const fs = require("fs");
const path = require('path');

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

utilItem.importLog = function (content) {
    // 현재 날짜 정보 가져오기
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const fileName = `${year}-${month}-${day}.log`;

    // 로그 폴더 경로와 파일 경로
    const logDir = path.join(__dirname, 'log');
    const logFilePath = path.join(logDir, fileName);

    // 로그 내용 포맷 (현재 시간 + 메시지)
    const timestamp = now.toISOString();
    const logMessage = `[${timestamp}] ${content}\n`;

    // 로그 폴더가 없으면 생성
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // 파일에 로그 추가
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
}

module.exports = utilItem;