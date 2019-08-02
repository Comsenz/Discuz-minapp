const forumUrl = require('../../config').forumUrl;
const userAvatar = require('../../config').userAvatar;

import util from '../../utils/util.js';

const app = getApp();
var _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fid: 0,
    groupInfo: {},
    uid: 0,
    myInfo: {},
    showSea: 0,
    userList:{},
    allUserList:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var fid = options.id;
    var uid = app.globalData.uid;
    console.log(uid);
    _this = this;
    this.setData({
      fid: fid,
      uid: uid,
      userAvatar: userAvatar,
    });
  },
  onShow: function (options) {
    this.initClassInfo();
  },
  initClassInfo() {
    app.apimanager.getRequest(forumUrl, { fid: this.data.fid }).then(res => {
      var myInfo = res.Variables.groupinfo.userlist[_this.data.uid];
      var userCount = res.Variables.groupinfo.users;
      wx.setNavigationBarTitle({
        title: '成员(' + userCount + ')',
      })
      var userList = util.userListUpdate(res.Variables.groupinfo.userlist);
      _this.setData({ myInfo:myInfo,userList: userList, userAvatar: userAvatar, allUserList: res.Variables.groupinfo.userlist});
    }).catch(res => {
      console.log(res)
    })
  },
  showSea: function () {
    this.setData({
      showSea: 1
    })
  },
  seablur: function (e) {
    if (e.detail.value.length == 0) {
      this.setData({
        showSea: 0
      })
    }
  },
  seaInput:function(e){
    if (e.detail.value.length != 0) {
      var keyword = e.detail.value;
      var searchUserList = util.searchUserList(keyword, this.data.allUserList);
      var userList = util.userListUpdate(searchUserList);
      _this.setData({ userList: userList });
    }else{
      var userList = util.userListUpdate(this.data.allUserList);
      _this.setData({ userList: userList});
    }
  },
  jumpTo:function(e){
    var id = e.currentTarget.dataset.id;
    this.setData({
      toView:'view_'+id
    })
  },
  userModify:function(e){
    return;
    if (this.data.myInfo.level == 1 || this.data.myInfo.level == 2) {
      wx.navigateTo({
        url: '../user_class_setting/user_class_setting?uid=' + e.currentTarget.dataset.uid + '&id=' + this.data.fid + '&nickname=' + encodeURIComponent(e.currentTarget.dataset.nickname) + '&mobile=' + encodeURIComponent(e.currentTarget.dataset.mobile),
      })
    }
  }
})