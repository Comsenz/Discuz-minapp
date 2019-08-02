// pages/login/login.js
const commonLoginUrl = require('/../../config').commonLoginUrl
const loginmanager = require('../../utils/loginManager')
const minImgDoc = require('/../../config').minImgDoc
const profileUpdateUrl = require('/../../config').profileUpdateUrl
const duration = 2000
const app = getApp()
var event = require('../../utils/event.js')
var self

Page({

  data: {
    minImgDoc,
    userInfoHidden:true,
    isRequest:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    self = this
    if (loginmanager.openid) {
      this.setData({
        openid: loginmanager.openid
      })
      if (loginmanager.wxname) {
        this.setData({
          username: loginmanager.wxname
        })
      }
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权
          wx.getUserInfo({
            success: res => {
              this.setData({
                username: res.userInfo.nickName
              })
              loginmanager.wxname = res.userInfo.nickName
            }
          })
        } else {
          self.setData({ userInfoHidden: false })
        }
      }
    })

    if (app.globalData.uid) {
      loginmanager.loginOut()
    }

    this.downSeccode()
  },

  downSeccode() {
    app.apimanager.requstSeccode('login').then(res => {
      if (res.sechash) {
        this.setData({
          sechash: res.sechash,
          imageSrc: res.imageSrc
        })
      }
      
    })
  },

  formSubmit(e) {
    // if (!loginmanager.wxname && !this.data.isRequest) {
    //   this.data.isRequest = true;
    //   return;
    // }
    let param = e.detail.value;
    if (this.data.sechash) { // 有验证码
      param['sechash'] = self.data.sechash
    }
    if (this.data.openid) {
      param['openid'] = this.data.openid
    }
    wx.showLoading({
      title: '登录中',
      icon:'loading'
    })
    app.apimanager.postRequest(commonLoginUrl, param).then(res => {
      wx.hideLoading()
      if (res.Message.messageval == 'login_succeed') {
        loginmanager.loginSetUserInfo(res)
        wx.navigateBack()
      }
      wx.showToast({
        title: res.Message.messagestr,
        icon: 'none'
      })
    }).catch(res => {
      wx.hideLoading()
      wx.showToast({
        title: "出错了",
        icon: 'none'
      })
    })
  },

  toRegister() {
    wx.navigateTo({
      url: '../register/register',
    })
  },

  inputNameChange(e) {
    this.setData({
      username: e.detail.value,
    });
  },

  getUserInfo: function (e) {
    console.log(e.detail.userInfo)
    if (e.detail.userInfo) {
      var data = {
        avatarUrl: e.detail.userInfo.avatarUrl,
      };
      this.setData({
        userInfoHidden:true
      })
      if (!this.data.username) {
        this.setData({
          username: e.detail.userInfo.nickName,
        })
      }
      loginmanager.wxname = e.detail.userInfo.nickName
      event.emit('userInfoChanged', { username: e.detail.userInfo.nickName});
    } else {
      wx.showToast({
        title: "为了您更好的体验,请先同意授权",
        icon: 'none',
        duration: 2000
      });
    }
  },

})