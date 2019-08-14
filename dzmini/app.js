//app.js
import apimanager from './utils/apimanager.js'
const commonLoginUrl = require('config').commonLoginUrl
const checkUrl = require('config').checkUrl
const loginmanager = require('./utils/loginManager')

App({
  onLaunch: function() {
    this.apimanager.getRequest(checkUrl).then(res => {
      this.globalData.regname = res.regname;
    });
    this.globalData.uid = wx.getStorageSync('uid')
    this.relogin(true)

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    });
  },

  relogin(isInit) {
    // 登录
    wx.login({
      success: res => {
        let dic = {
          code: res.code
        }
        this.apimanager.getRequest(commonLoginUrl, dic).then(res => {
          if (res.Message.messageval == "login_succeed") {
            this.globalData.uid = res.Variables.member_uid
            if (!isInit) {
              wx.showToast({
                title: '登录成功！',
                icon: 'none'
              })
            }
          } else if (res.Message.messageval == 'no_bind') {
            loginmanager.openid = res.Variables.openid;
            loginmanager.unionid = res.Variables.unionid;
            loginmanager.toLogin();
          }
        }).catch(res => {

        })
      }
    })
  },

  globalData: {
    userInfo: null,
    uid: '',
    formhash: '',
    repliesrank: '',
    regname: '',
    allowpostcomment: [],
    duration: 2000,
  },
  apimanager: new apimanager(),
})