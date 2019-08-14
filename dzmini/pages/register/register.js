// pages/register/register.js
const registerUrl = require('../../config').registerUrl;
const loginmanager = require('../../utils/loginManager');
const datacheck = require('../../utils/datacheck.js');
var event = require('../../utils/event.js');
const app = getApp();
var self;
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
        username: data.username,
      })
    });

    console.log(app.globalData.userInfo);
    // self.downSeccode()
    if (app.globalData.userInfo.nickName) {
      this.setData({
        username: app.globalData.userInfo.nickName,
      })
    }
    var regnameurl = registerUrl + '&mod=' + app.globalData.regname;
    app.apimanager.getRequest(regnameurl).then(res => {
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
    if (datacheck.isEmojiCharacter(e.detail.value.username)) {
      self.setData({
        errorInfo: '用户名不能包含表情',
        showTopTips: true,
      });
      setTimeout(function () {
        self.setData({
          showTopTips: false,
        });
      }, app.globalData.duration)
      return
    }
    var data = {
      regsubmit:true,
      formhash: app.globalData.formhash,
    }
    data[this.data.usernamekey] =  e.detail.value.username;
    data[this.data.passwordkey] =  e.detail.value.password;
    data[this.data.password2key] =  e.detail.value.password2;
    data[this.data.emailkey] =  e.detail.value.email;
    if (loginmanager.openid) {
      param['openid'] = loginmanager.openid
    }
    if (loginmanager.unionid) {
      param['unionid'] = loginmanager.unionid
    }
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