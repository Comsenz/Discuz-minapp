const forumUrl = require('../../config').forumUrl;
const userAvatar = require('../../config').userAvatar;
const setAdminUrl = require('../../config').setAdminUrl;
const addAdminUrl = require('../../config').addAdminUrl;

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
    userList: {},
    allUserList: {},
    selectRemove:{},
    pwd:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var fid = options.id;
    var type = options.type;
    var uid = app.globalData.uid;
    console.log(uid);
    _this = this;
    this.setData({
      fid: fid,
      uid: uid,
      userAvatar: userAvatar,
      type:type,
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
      });
      var selectSingle = res.Variables.groupinfo.founderuid;
      var selectMuti = new Array();
      var selectMutiTeacher = new Array();

      for (var x in res.Variables.groupinfo.userlist){
        if (res.Variables.groupinfo.userlist[x].level == 2) {
          selectMuti[res.Variables.groupinfo.userlist[x].uid] = res.Variables.groupinfo.userlist[x].uid;
        }
      }
      for (var x in res.Variables.groupinfo.userlist) {
        if (res.Variables.groupinfo.userlist[x].level == 3) {
          selectMutiTeacher[res.Variables.groupinfo.userlist[x].uid] = res.Variables.groupinfo.userlist[x].uid;
        }
      }

      var userList = util.userListUpdate(res.Variables.groupinfo.userlist);
      _this.setData({ userList: userList, userAvatar: userAvatar, allUserList: res.Variables.groupinfo.userlist, selectSingle: selectSingle, selectMuti: selectMuti, selectMutiTeacher: selectMutiTeacher});
    }).catch(res => {
      console.log(res)
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
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
  seaInput: function (e) {
    if (e.detail.value.length != 0) {
      var keyword = e.detail.value;
      var searchUserList = util.searchUserList(keyword, this.data.allUserList);
      var userList = util.userListUpdate(searchUserList);
      _this.setData({ userList: userList });
    } else {
      var userList = util.userListUpdate(this.data.allUserList);
      _this.setData({ userList: userList });
    }
  },
  selectSuperAdmin(e){
    var uid = e.currentTarget.dataset.uid;
    this.setData({
      selectSingle:uid,
    });
  },
  selectNormalAdmin(e){
    var uid = e.currentTarget.dataset.uid;
    var selectMuti = this.data.selectMuti;
    if (this.data.type == 'remove') {
      if (uid == app.globalData.uid) {
        wx.showToast({
          title: '不能踢出自己！',
          icon: 'none'
        })
        return;
      }
      var selectMuti = this.data.selectRemove;
    }
    if(selectMuti[uid]){
      delete selectMuti[uid];
    }else{
      selectMuti[uid] = uid;
    }
    this.setData({
      selectMuti: selectMuti,
      selectRemove: selectMuti,
    });
  },
  passwordChange(e) {
    var password = e.detail.value;
    console.log(password)
    this.setData({
      pwd:password
    })
  },
  setAdmin(){
    var data = {
      fid:this.data.fid,
      formhash: app.globalData.formhash,
      groupdemise:1,
      suid:this.data.selectSingle,
      grouppwd: this.data.pwd
    };
    app.apimanager.postRequest(setAdminUrl, data).then(res => {
      if (res.Message.messageval =='group_demise_succeed'){
        wx.showModal({
          content: res.Message.messagestr,
          showCancel: false,
          success:function(res){
            if (res.confirm) {
              wx.navigateBack({});
            }
          }
        })
      }else{
        wx.showModal({
          content: res.Message.messagestr,
          showCancel: false,
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
      console.log(res)
    })
  },
  addAdmin(){
    var data = {
      fid: this.data.fid,
      formhash: app.globalData.formhash,
      targetlevel : 2,
      managetype:1,
    };
    for(var x in this.data.selectMuti){
      var key = 'muid['+x+']';
      data[key] = x;
    }
    app.apimanager.postRequest(addAdminUrl, data).then(res => {
      if (res.Message.messageval == 'group_setup_succeed') {
        wx.showModal({
          content: res.Message.messagestr,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack({});
            }
          }
        })
      } else {
        wx.showModal({
          content: res.Message.messagestr,
          showCancel: false,
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
      console.log(res)
    })
  },
  selectTeacher(e) {
    var uid = e.currentTarget.dataset.uid;
    var selectMutiTeacher = this.data.selectMutiTeacher;
    console.log(selectMutiTeacher)
    if (this.data.type == 'remove') {
      var selectMutiTeacher = this.data.selectRemove;
    }
    if (selectMutiTeacher[uid]) {
      delete selectMutiTeacher[uid];
    } else {
      selectMutiTeacher[uid] = uid;
    }
    this.setData({
      selectMutiTeacher: selectMutiTeacher,
      selectRemove: selectMutiTeacher,
    });
  },
  setTeacher() {
    var data = {
      fid: this.data.fid,
      formhash: app.globalData.formhash,
      targetlevel: 3,
      managetype:2,
    };
    for (var x in this.data.selectMutiTeacher) {
      var key = 'muid[' + x + ']';
      data[key] = x;
    }
    app.apimanager.postRequest(addAdminUrl, data).then(res => {
      if (res.Message.messageval == 'group_setup_succeed') {
        wx.showModal({
          content: res.Message.messagestr,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack({});
            }
          }
        })
      } else {
        wx.showModal({
          content: res.Message.messagestr,
          showCancel: false,
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
      console.log(res)
    })
  },
  removeUser(){
    var data = {
      fid: this.data.fid,
      formhash: app.globalData.formhash,
      targetlevel: 5,
    };
    for (var x in this.data.selectRemove) {
      var key = 'muid[' + x + ']';
      data[key] = x;
    }
    app.apimanager.postRequest(addAdminUrl, data).then(res => {
      if (res.Message.messageval == 'group_setup_succeed') {
        wx.showModal({
          content: res.Message.messagestr,
          showCancel: false,
        })
        this.initClassInfo();
      } else {
        if (res.Message.messageval.indexOf('group_member_level_admin_noallowed') != -1) {
          wx.showModal({
            content: "抱歉，您的管理权限无法踢出该用户",
            showCancel: false,
          });
          return;
        }

        wx.showModal({
          content: res.Message.messagestr,
          showCancel: false,
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
      console.log(res)
    })
  },
  jumpTo: function (e) {
    var id = e.currentTarget.dataset.id;
    this.setData({
      toView: 'view_' + id
    })
  }
})