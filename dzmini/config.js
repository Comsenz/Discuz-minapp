// const host = 'bbs.comsenz-service.com'
const host = 'guanjia.comsenz-service.com'
const httpPre = 'https://'
const baseUrl = httpPre + host
const apiUrl = baseUrl + '/api/mobile/?'
const indexUrl = baseUrl + '/api/mobile/index.php?'
const defaultIcon = baseUrl+"/static/image/common/groupicon.gif";
const userAvatar = baseUrl +"/uc_server/avatar.php?size=middle&uid=";
const minImgDoc = 'https://guanjia.comsenz-service.com' + '/data/attachment/xiaochengxu/minimg/'
const config = {
  // 下面的地址配合云端 Server 工作
  host,
  baseUrl,
  apiUrl,
  defaultIcon,
  userAvatar,
  minImgDoc,
  
  courseProfile: `${apiUrl}module=spacecp_profile&version=4`,
  pollvoteUrl: `${apiUrl}module=pollvote&pollsubmit=yes&version=4`,
  polloptionUrl: `${apiUrl}module=forummisc&action=viewvote&version=5`,
  forumdisplayUrl: `${apiUrl}module=forumdisplay&version=5`,
  searchThreadUrl: `${apiUrl}module=threadsearch&&version=4`,
  bestanswerUrl: `${apiUrl}module=bestanswer&version=4`,
  saveformidUrl: `${apiUrl}module=saveformid&version=4`,
  payInfoUrl: `${apiUrl}module=minapp_payment&version=4`,
  postActivity: `${apiUrl}module=newactivity&version=4`,
  activitySinupListUrl: `${apiUrl}module=forummisc&action=activityapplylist&version=5`,
  activityAppliesUrl: `${apiUrl}module=activityapplies&version=5`,
  digestUrl: `${indexUrl}module=forumguide&view=digest&version=5`,
  newestUrl: `${indexUrl}module=forumguide&view=newthread&version=5`,
  commonLoginUrl: `${apiUrl}module=login&version=5&loginsubmit=yes&loginfield=auto`,
  seccodeUrl: `${apiUrl}module=secure&version=4`,
  codeImageUrl: `${apiUrl}module=seccode&version=5`,
  registerUrl: `${apiUrl}module=register&version=5`,
  // registerUrl: `${apiUrl}module=register&mod=register&version=5`,
 
  loginUrl: `${apiUrl}module=code2session&version=5`,
  checkUrl: `${apiUrl}module=check&version=5`,
  forumUrl: `${apiUrl}module=group&version=5`,
  workListUrl: `${apiUrl}module=forumdisplay&action=list&version=5`,
  postInfoUrl: `${apiUrl}module=newthread&version=4`,
  postThreadUrl: `${apiUrl}module=newthread&topicsubmit=yes&version=4`,
  detailUrl: `${apiUrl}module=viewthread&version=5`,
  postReplyUrl: `${apiUrl}module=sendreply&replysubmit=yes&version=4`,
  replyWorkUrl: `${apiUrl}module=sendreply&comment=yes&commentsubmit=yes&version=4`,
  uploadFileUrl: `${apiUrl}module=forumupload&simple=1&version=4`,
  collectUrl: `${apiUrl}module=favthread&version=1`,
  unCollectUrl: `${apiUrl}module=favorite&version=5&op=delete`,
  sendFlowerUrl: `${apiUrl}module=support&version=5`,
  myFavoriteUrl: `${apiUrl}module=myfavthread&version=1`,
  myWorkUrl: `${apiUrl}module=mythread&version=1`,
  workCountUrl: `${apiUrl}module=workinfo&version=4`,
  forumindexUrl: `${apiUrl}module=forumindex&version=4`,
  joinClassUrl: `${apiUrl}module=forum&action=join&version=5`,
  createClassUrl: `${apiUrl}module=forum&action=create&op=group&version=5`,
  groupTypeUrl:`${apiUrl}module=forum&m=grouptype&version=5`,
  searchClassUrl: `${apiUrl}module=group&version=5`,
  manageClassUrl: `${apiUrl}module=forum&action=manage&version=4`,
  updateClassUrl: `${apiUrl}module=forum&action=manage&op=group&version=5`,
  exitClassUrl: `${apiUrl}module=forum&action=out&version=5`,
  userClassUrl:`${apiUrl}module=groupuser&version=5`,
  userAuditUrl: `${apiUrl}module=forum&&action=manage&op=checkuser&version=5`,
  userAuditHandlerUrl:`${apiUrl}module=forum&action=manage&op=checkuser&version=5`,
  setAdminUrl: `${apiUrl}module=forum&action=manage&op=demise&version=5`,
  addAdminUrl: `${apiUrl}module=forum&action=manage&op=manageuser&manageuser=true&version=5`,
  rankUrl: `${apiUrl}module=rank&version=4`,
  profileUrl: `${apiUrl}module=profile&version=4`,
  profileUpdateUrl:`${apiUrl}module=profile&mod=spacecp&ac=profile&op=base&version=4`,
  avatarUpdateUrl:`${apiUrl}module=uploadavatar&version=2`,
  deleteClassUrl: `${apiUrl}module=forum&action=delete&version=5`,
  createTypeUrl: `${apiUrl}module=forumtype&action=createtype&version=4`,
  userModifyUrl: `${apiUrl}module=groupuser&action=manage&op=manageuser&version=5`,
  threadTypeUrl: `${apiUrl}module=threadclass&action=manage&op=threadtype&version=5`,
  deleteModUrl: `${apiUrl}module=deletemoderate&version=5`,
  deletePostUrl: `${apiUrl}module=deletepost&version=5`,
  deleteSelfPostUrl: `${apiUrl}module=deleteselfpost&version=5`,
  commentMoreUrl: `${apiUrl}module=viewcomment&version=5`,
}

module.exports = config