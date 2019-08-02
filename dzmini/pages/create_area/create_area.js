import util from '../../utils/util.js';
const createTypeUrl = require('../../config').createTypeUrl;
const groupTypeUrl = require('../../config').groupTypeUrl;
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
    this.loadSelectList(options);
  },
  cityChange(e) {
    var cityIndex = e.detail.value;
    var city = this.data.cityList[cityIndex];
    this.setData({ cityIndex: cityIndex});
  },
  loadSelectList: function (options) {
    app.apimanager.getRequest(groupTypeUrl).then(res => {
      var grouptype = res.Variables.grouptype;
      if (grouptype) {
        util.selectListUpdate(grouptype, function (cityList, areaList, schoolList) {
          _this.setData({
            "cityList": cityList,
          })
        });
      }
    }).catch(res => {
      console.log(res);
    })
  },
  formSubmit: function (e) {
    var parentid = typeof this.data.cityList[this.data.cityIndex] != "undefined" ? this.data.cityList[this.data.cityIndex]['fid'] : 0;
    var data = {
      formhash: app.globalData.formhash,
      forumtype: 2,
      parentid: parentid,
      name: e.detail.value.areaName,
    };
    if (data.parentid == 0) {
      this.setData({
        errorInfo: "请选择城市",
        showTopTips: true,
      });
      setTimeout(function () {
        _this.setData({
          showTopTips: false,
        });
      }, 2000)
      return false;
    }    
    if (data.name.length == 0) {
      this.setData({
        errorInfo: "请输入地区名",
        showTopTips: true,
      });
      setTimeout(function () {
        _this.setData({
          showTopTips: false,
        });
      }, 2000)
      return false;
    }
    if (data.name.match(getApp().globalData.emoji)) {
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
                isback: true,
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