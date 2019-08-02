//app.js
import apimanager from './utils/apimanager.js'
const loginUrl = require('config').loginUrl
const checkUrl = require('config').checkUrl
const loginmanager = require('./utils/loginManager')

App({
  onLaunch: function() {
    console.log("v1.0.0(beta).1110");
    this.apimanager.getRequest(checkUrl).then(res => {
      this.globalData.regname = res.regname;
    });
    this.globalData.uid = wx.getStorageSync('uid')
    this.relogin(true)
  },

  relogin(isInit) {
    // 登录
    wx.login({
      success: res => {
        let dic = {
          code: res.code
        }
        this.apimanager.getRequest(loginUrl, dic).then(res => {
          if (res.message == "login_success") {
            this.globalData.uid = res.data.uid
            if (!isInit) {
              wx.showToast({
                title: '自动登录成功！',
                icon:'none'
              })
            }
          } else if (res.message == 'no_user') {
            loginmanager.openid = res.openid
            loginmanager.toLogin()
          }
        }).catch(res => { 

        })
      }
    })
  },

  globalData: {
    userInfo: null,
    emoji: /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g,
    easyfid: 2,
    uid: '',
    formhash: '',
    repliesrank:'',
    regname:'',
    allowpostcomment:[],
    member_identity: '',
    member_status: ''
  },
  apimanager: new apimanager(),
})