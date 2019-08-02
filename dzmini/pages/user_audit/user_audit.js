const forumUrl = require('../../config').forumUrl;
const userAuditUrl = require('../../config').userAuditUrl;
const userAvatar = require('../../config').userAvatar;
const updateClassUrl = require('../../config').updateClassUrl;
const userAuditHandlerUrl = require('../../config').userAuditHandlerUrl;
const app = getApp();
var _this;
Page({

  data: {
    fid: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var fid = options.id;
    _this = this;
    this.setData({
      fid: fid,
      userAvatar: userAvatar,
    });
    this.getAuditList();
    this.initClassInfo();
  },

  getAuditList(){
    app.apimanager.getRequest(userAuditUrl, { fid: this.data.fid }).then(res => {
      var checkusers = res.Variables.checkusers;
      var realname = res.Variables.usernicknames;
      _this.setData({ checkUsers: res.Variables.checkusers ,realname:realname});
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
      console.log(res)
    })
  },
  initClassInfo() {
    app.apimanager.getRequest(forumUrl, { fid: this.data.fid }).then(res => {
      _this.setData({ groupInfo: res.Variables.groupinfo });
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
      console.log(res)
    })
  },
  updatePrivate(e){
    var isPrivate = e.detail.value ? 2 : 0;
    var data = {
      jointypenew: isPrivate,
      fid: this.data.fid,
      formhash: app.globalData.formhash,
      groupmanage: true,
    };    
    app.apimanager.postRequest(updateClassUrl, data).then(res => {

    }).catch(res => {
      console.log(res);
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },
  agree(e){
    var uid = e.currentTarget.dataset.uid;
    app.apimanager.getRequest(userAuditHandlerUrl, { fid: this.data.fid, uid:uid,checktype:1}).then(res => {
      if (res.Message.messageval == "group_moderate_succeed"){
        var list = _this.data.checkUsers;
        delete list[uid];
        _this.setData({
          checkUsers:list,
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
  refuse(e) {
    var uid = e.currentTarget.dataset.uid;
    app.apimanager.getRequest(userAuditHandlerUrl, { fid: this.data.fid, uid: uid, checktype: 2 }).then(res => {
      if (res.Message.messageval == "group_moderate_failed") {
        var list = _this.data.checkUsers;
        delete list[uid];
        _this.setData({
          checkUsers: list,
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
  }
})