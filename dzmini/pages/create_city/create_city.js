import util from '../../utils/util.js';
const createTypeUrl = require('../../config').createTypeUrl;
const datacheck = require('../../utils/datacheck.js');
const app = getApp();
var _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
  },
  formSubmit: function (e) {
    var data = {
      formhash: app.globalData.formhash,
      forumtype:1,
      name: e.detail.value.cityName,
    };
    if (data.name.length == 0) {
      this.setData({
        errorInfo: "请输入城市名",
        showTopTips: true,
      });
      setTimeout(function () {
        _this.setData({
          showTopTips: false,
        });
      }, 2000)
      return false;
    }
    if (datacheck.isEmojiCharacter(data.name)) {
      wx.showModal({
        showCancel: false,
        content: '不能使用emoji表情',
      })
      return false;
    }     
    wx.showLoading({
      title: '提交中',
    })    
    app.apimanager.postRequest(createTypeUrl, data).then(res => {
      if (res.Message.messageval == 'forumtype_create_succeed') {
        wx.showModal({
          showCancel: false,
          content: '创建成功',
          success(data) {
            if (data.confirm) {
              var pages = getCurrentPages();
              var prevPage = pages[pages.length - 2];
              prevPage.setData({
                isback:true,
              })        
              wx.navigateBack()
            }
          }
        })
      } else {
        wx.showModal({
          showCancel: false,
          content: res.Message.messagestr,
        })
      }
      wx.hideLoading();
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },
})