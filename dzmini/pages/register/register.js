// pages/register/register.js
const registerUrl = require('../../config').registerUrl
const loginmanager = require('../../utils/loginManager')
var event = require('../../utils/event.js')
const app = getApp()
var self
Page({

  data: {
    usernamekey:'',
    passwordkey: '',
    password2key: '',
    emailkey: '',
  },

  onUnload: function () {
    event.remove('userInfoChanged', this);
  },

  onLoad: function(options) {
    self = this

    event.on('userInfoChanged', this, function (data) {
      self.setData({
        username: loginmanager.wxname,
      })
    });

    // self.downSeccode()
    if (loginmanager.wxname) {
      this.setData({
        username: loginmanager.wxname,
      })
    }
    var regnameurl = registerUrl + '&mod=' + app.globalData.regname;
    app.apimanager.getRequest(regnameurl).then(res => {
      console.log(res)
      if (res.Variables.reginput.username) {
        this.setData({
          usernamekey: res.Variables.reginput.username,
          passwordkey: res.Variables.reginput.password,
          password2key: res.Variables.reginput.password2,
          emailkey: res.Variables.reginput.email,
        })
      }
    }).catch(res => {
      wx.showToast({
        title: "出错了",
        icon: 'none'
      })
    })
  },

  getWxUserInfo() {
    self.setData({
      username: loginmanager.wxname
    })
  },

  downSeccode() {
    app.apimanager.requstSeccode('register').then(res => {
      if (res.sechash) {
        this.setData({
          sechash: res.sechash,
          imageSrc: res.imageSrc
        })
      }
    })
  },

  formSubmit(e) {
    let param = e.detail.value;
    if (e.detail.value.username.match(app.globalData.emoji)) {
      self.setData({
        errorInfo: '用户名不能包含表情',
        showTopTips: true,
      });
      setTimeout(function () {
        self.setData({
          showTopTips: false,
        });
      }, 2000)
      return
    }
    var data = {
      regsubmit:true,
      formhash: app.globalData.formhash,
      openid: loginmanager.openid
    }
    data[this.data.usernamekey] =  e.detail.value.username;
    data[this.data.passwordkey] =  e.detail.value.password;
    data[this.data.password2key] =  e.detail.value.password2;
    data[this.data.emailkey] =  e.detail.value.email;

    var regnameurl = registerUrl + '&mod=' + app.globalData.regname;
    wx.showLoading();
    app.apimanager.postRequest(regnameurl, data).then(res => {
      wx.hideLoading();
      if (res.Message.messageval.indexOf('succeed') != -1) {
        loginmanager.loginSetUserInfo(res)
        wx.navigateBack({
          delta: 2,
        })
      }
      wx.showToast({
        title: res.Message.messagestr,
        icon: 'none'
      });
    }).catch(res => {
      wx.hideLoading();
      wx.showToast({
        title: "出错了",
        icon: 'none'
      });
    })
  },


})