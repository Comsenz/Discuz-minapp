const forumUrl = require('../../config').forumUrl;
const exitClassUrl = require('../../config').exitClassUrl;
const userAvatar = require('../../config').userAvatar;
const deleteClassUrl = require('../../config').deleteClassUrl;
const minImgDoc = require('../../config').minImgDoc

var event = require('../../utils/event.js');
const app = getApp();
var _this;
var fid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    minImgDoc: minImgDoc,
    fid:0,
    groupInfo:{},
    uid:0,
    myInfo:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    fid = options.id;
    var uid = app.globalData.uid;
    console.log(uid);
    _this = this;
    this.setData({
      fid:fid,
      uid:uid,
      userAvatar:userAvatar,
    });
  },
  onShow: function (options) {
    this.initClassInfo(fid);
  },
  initClassInfo(fid){
    app.apimanager.getRequest(forumUrl,{fid:fid}).then(res => {
      var myInfo = res.Variables.groupinfo.userlist[_this.data.uid];
      var userCount = res.Variables.groupinfo.users;
      wx.setNavigationBarTitle({
        title: '圈子信息(' + userCount+')',
      });
      if (res.Variables.groupinfo.ingroup == 0) {
        wx.navigateBack()
        wx.showToast({
          title: '您还不是圈子成员，暂无权限查看',
          icon: 'none'
        })
        return;
      }
      var userList = [];
      //转数组
      for (var x in res.Variables.groupinfo.userlist) {
        userList.unshift(res.Variables.groupinfo.userlist[x]);
      }
      //排序
      userList.sort(function(a,b){
        return a.level - b.level;
      });
      var _userList = userList;
      var userList = [];
      //只留18个显示
      var i = 0;
      for (var x in _userList){
        var max = myInfo.level == 1 || myInfo.level == 2?17:18;
        if(i >max){
          break
        }
        userList.push(_userList[x]);
        i = i + 1;
      }
      _this.setData({ groupInfo: res.Variables.groupinfo, myInfo: myInfo, userList: { userList: userList, userAvatar: userAvatar, myInfo: myInfo }, _userlist: res.Variables.groupinfo.userlist });
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
      console.log(res)
    })
  },
  goToUpdateClass(){
    if (this.data.myInfo.level == 1 || this.data.myInfo.level == 2){
      wx.navigateTo({
        url: '../create_class/create_class?id=' + _this.data.fid,
      })
    }
  },
  setAdmin(){
    if (this.data.myInfo.level == 1 || this.data.myInfo.level == 2) {
      wx.navigateTo({
        url: '../admin_setting/admin_setting?type=set&id=' + _this.data.fid,
      })
    }
  },
  setTeacher() {
    if (this.data.myInfo.level == 1 || this.data.myInfo.level == 2) {
      wx.navigateTo({
        url: '../admin_setting/admin_setting?type=setTeacher&id=' + _this.data.fid,
      })
    }
  },
  giveUpAdmin(){
    if (this.data.myInfo.level == 1) {
      wx.navigateTo({
        url: '../admin_setting/admin_setting?type=giveup&id=' + _this.data.fid,
      })
    }
  },
  goToRemoveUser() {
    if (this.data.myInfo.level == 1 || this.data.myInfo.level == 2) {
      wx.navigateTo({
        url: '../admin_setting/admin_setting?type=remove&id=' + _this.data.fid,
      })
    }
  },
  userAudit() {
    if (this.data.myInfo.level == 1 || this.data.myInfo.level == 2) {
      wx.navigateTo({
        url: '../user_audit/user_audit?id=' + _this.data.fid,
      })
    }
  },
  goToRank(){
    wx.navigateTo({
      url: '../class_rank/class_rank?id=' + _this.data.fid,
    })
  },
  goToTag() {
    wx.navigateTo({
      url: '../class_tag/class_tag?id=' + _this.data.fid,
    })
  },  
  exitClass(){
    app.apimanager.getRequest(exitClassUrl, { fid: this.data.fid }).then(res => {
      if (res.Message.messageval == 'group_exit_succeed'){
        event.emit('indexChanged', { fid: _this.data.fid });
        wx.navigateBack();
      }else{
        wx.showModal({
          content: res.Message.messageval,
          showCancel: false,
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },
  deleteClass() {
    wx.showModal({
      title: '提示',
      content: '解散圈子会删掉圈子的所有信息，包括圈子内容，成员等，你确认需要解散吗？',
      success(res) {
        if (res.confirm) {
          app.apimanager.getRequest(deleteClassUrl, { fid: _this.data.fid }).then(res => {
            if (res.Message.messageval == 'group_delete_succeed') {
              event.emit('indexChanged', { fid: _this.data.fid });
              wx.navigateBack();
            } else {
              wx.showModal({
                content: res.Message.messageval,
                showCancel: false,
              })
            }
          }).catch(res => {
            wx.showToast({
              title: '出错了！',
              icon: 'none'
            })
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  goToUserClass(){
    return;
    wx.navigateTo({
      url: '../user_class_setting/user_class_setting?id=' + _this.data.fid + '&nickname=' + encodeURIComponent(_this.data.myInfo.nickname)  + '&mobile=' + encodeURIComponent(_this.data.myInfo.mobile),
    })
  },
  goToMoreUser() {
    wx.navigateTo({
      url: '../more_user/more_user?id=' + _this.data.fid,
    })
  },
  onShareAppMessage(){
    var title = encodeURIComponent(_this.data.groupInfo.name);
    var content = encodeURIComponent(_this.data.groupInfo.description);
    var img = minImgDoc+'shareClassIcon.png';
    var founderuid = _this.data.groupInfo.founderuid;
    console.log(founderuid);
    var founder = _this.data._userlist[founderuid];
    var nickname = founder.nickname ? founder.nickname : founder.realname ? founder.realname : founder.username;
    return {
      title: nickname + '同学创建了一个叫' + decodeURIComponent(title) + '的圈子，快快去加入讨论吧！',
      path: "/pages/index/index?sharetype=joinclass&shareid=" + _this.data.fid + "&title=" + title + "&content=" + content,
      imageUrl: img,
    }
  }
})