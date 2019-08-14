// pages/bound_manage/bound_manage.js
const profileUrl = require('../../config').profileUrl;
const userAvatar = require('../../config').userAvatar;
const minImgDoc = require('../../config').minImgDoc;
const oauthsUrl = require('../../config').oauthsUrl;
const unBindThirdUrl = require('../../config').unBindThirdUrl;
const loginmanager = require('../../utils/loginManager');
const commonLoginUrl = require('../../config').commonLoginUrl;

const app = getApp();
var self;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{}
  },

  onLoad: function (options) {
    self = this;
  },

  onShow: function () {
    this.requestData();
  },

  requestData() {
    app.apimanager.getRequest(oauthsUrl).then(res=> {
      this.setData({
        info: res.Variables
      });
    });
  },

  boundChange(e) {
    var index = e.currentTarget.id;
    var boundItem = this.data.info.users[index];
    if (boundItem.status == 1) {
      var title = '解除绑定？';
      var content = '解绑后，APP将不能使用三方登录，登录此账号'
      if (boundItem.type == 'minapp') {
        title = '温馨提示';
        content = '解绑后,下回使用小程序需要重新登录'
        
      }
      var data = {
        unbind: "yes",
        type: boundItem.type,
        formhash: app.globalData.formhash
      };
      wx.showModal({
        title: title,
        content: content,
        success: function (res) {
          self.unBound(data);
        }
      });
    } else {
      if (boundItem.type !== "minapp") {
        wx.showModal({
          title: '提示',
          content: '请前往APP进行绑定',
          showCancel: false,
        });
        return;
      }

      var param = {};
      if (loginmanager.openid) {
        param['openid'] = loginmanager.openid
      }
      if (loginmanager.unionid) {
        param['unionid'] = loginmanager.unionid
      }
      param['loginsubmit'] = "yes"
      wx.showLoading({
        title: '绑定中',
        icon: 'loading'
      })
      app.apimanager.postRequest(commonLoginUrl, param).then(res => {
        wx.hideLoading()
        if (res.Message.messageval.indexOf('succeed') != -1) {
          wx.showToast({
            title: '绑定成功！',
            icon: 'none'
          });
          this.requestData();
        }
        
      }).catch(res => {
        wx.hideLoading()
        wx.showToast({
          title: "出错了",
          icon: 'none'
        })
      });

    }

  },

  unBound(data) {
    app.apimanager.postRequest(unBindThirdUrl, data).then(res => {
      if (data.type == 'minapp') {
        
      }
      if (res.Message.messageval.indexOf('succeed') != -1) {
        wx.showToast({
          title: '解绑成功！',
          icon: 'none'
        });
        this.requestData();
      } else {
        wx.showToast({
          title: '解绑失败！',
          icon: 'none'
        });
      }
    });
  }

})