// pages/vote_list/vote_list.js
const polloptionUrl = require('../../config').polloptionUrl
const app = getApp()
var self
Page({

  /**
   * 页面的初始数据
   */
  data: {
    polloption:[],
    tid:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    self = this
    self.setData({tid:options.tid})
    app.apimanager.getRequest(polloptionUrl,{tid:options.tid}).then(res=>{
      var data = res.Variables.viewvote.polloptions;
      data.forEach(function(list){
        list.polloption = list.polloption.slice(0,10)+'...';
      });
      self.setData({polloption: res.Variables.viewvote.polloptions})
    }).catch(res=>{})
  },
  voteDetail(e) {
    wx.navigateTo({
      url: '../vote_optiondetail/vote_optiondetail?tid=' + self.data.tid + '&pollid=' + e.currentTarget.id,
    })
  }

})