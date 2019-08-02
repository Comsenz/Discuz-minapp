const userClassUrl = require('../../config').userClassUrl;
const userModifyUrl = require('../../config').userModifyUrl;
const app = getApp();
var _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    var fid = options.id;
    var uid = options.uid;
    if (typeof uid != 'undefined'){
      this.setData({
        uid: uid
      });
    }
    var nickname = decodeURIComponent(options.nickname);
    var mobile = decodeURIComponent(options.mobile);
    if (nickname != '') {
      this.setData({
        nickname: nickname
      })
    }
    if (mobile != 0) {
      this.setData({
        mobile: mobile
      })
    }    
    this.setData({
      fid: fid
    })
  },
  formSubmit(e){
    var data = {
      fid:this.data.fid,
      formhash: app.globalData.formhash,
      nickname: e.detail.value.nickname,
      mobile: e.detail.value.mobile,
      groupusersubmit:true,
    };
    app.apimanager.postRequest(userClassUrl, data).then(res => {
      if (res.Message.messageval == 'update_userinfo_success'){
        wx.showModal({
          showCancel: false,
          content: '信息更新成功',
          success(data) {
            if (data.confirm) {
              wx.navigateBack()
            }
          }
        })
      }else{
        wx.showModal({
          showCancel: false,
          content: res.Message.messagestr,
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },
  userModify:function(e){
    var data = {
      fid: this.data.fid,
      uid:this.data.uid,
      formhash: app.globalData.formhash,
      nickname: e.detail.value.nickname,
      mobile: e.detail.value.mobile,
    };
    app.apimanager.postRequest(userModifyUrl, data).then(res => {
      if (res.Message.messageval == 'update_userinfo_success') {
        wx.showModal({
          showCancel: false,
          content: '信息更新成功',
          success(data) {
            if (data.confirm) {
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
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  }
})