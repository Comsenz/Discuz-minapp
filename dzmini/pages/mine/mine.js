const profileUrl = require('../../config').profileUrl;
const userAvatar = require('../../config').userAvatar;
const minImgDoc = require('../../config').minImgDoc
const loginmanager = require('../../utils/loginManager')
const app = getApp();
var _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    minImgDoc: minImgDoc
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    _this = this;
  },
  onShow: function() {
    var uid = app.globalData.uid;
    if (!uid) {
      wx.switchTab({
        url: '/pages/discovery/discovery',
        complete: function(res) {
          loginmanager.toLogin();
        }
      });
    } else {
      this.setData({
        uid: uid,
      });
      this.requestProfile();
    }

  },

  requestProfile() {
    app.apimanager.getRequest(profileUrl).then(res => {
      var username = res.Variables.member_nickname ? res.Variables.member_nickname : res.Variables.member_username;
      var avatar = res.Variables.member_avatar + "?t=" + Date.parse(new Date());
      _this.setData({
        username: username,
        avatar: avatar,
      });
      if (res.Variables.auth) {
        _this.setData({
          threads: res.Variables.space.threads,
          posts: res.Variables.space.posts,
          credits: res.Variables.space.credits,
          field4: res.Variables.space.field4,
          grouptitle: res.Variables.space.group.grouptitle
        });
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },

  switchLogin() {
    wx.showModal({
      title: '提示',
      content: '切换账号将退出原有账号',
      success: function(res) {
        if (res.confirm) {
          loginmanager.toLogin()
        }
      }
    })
  },

  goToModify() {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../mine_modify/mine_modify',
    })
  },
  goToBound() {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../bound_manage/bound_manage',
    })
  },
  goToFavorite() {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../mine_favorite/mine_favorite',
    })
  },
  goToMineWork() {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../mine_work/mine_work',
    })
  },

  goToMineReply() {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../mine_work/mine_work?is_reply=true',
    })
  },

})