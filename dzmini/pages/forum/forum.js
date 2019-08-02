// pages/forum/forum.js
const forumindexUrl = require('../../config').forumindexUrl
const minImgDoc = require('../../config').minImgDoc
const app = getApp()
var self
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onLoad: function(options) {
    wx.showLoading();
    this.forumIndexRequest()
  },

  onShow: function(options) {
    wx.setNavigationBarTitle({
      title: '版块'
    });
  },

  forumIndexRequest() {
    app.apimanager.getRequest(forumindexUrl).then(res => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      var catlist = res.Variables.catlist
      var forumlist = res.Variables.forumlist
      forumlist.forEach(function(data){
        data.name = data.name.substring(0, 20)
      })
      for (let i = 0; i < catlist.length; i++) {
        catlist[i].name = catlist[i].name.substring(0,20)
        let forums = catlist[i].forums
        for (let j = 0; j < forums.length; j++) {
          let fid = forums[j]
          for (let k = 0; k < forumlist.length; k++) {
            let info = forumlist[k]
            if (fid == info.fid) {
              forums[j] = info
              break
            }
          }
        }
      }
      this.setData({
        catlist: catlist
      })
    }).catch(res => {
      wx.stopPullDownRefresh();
      wx.hideLoading();
    })
  },

  toFourmdisplay(e) {
    var fid = e.currentTarget.id
    wx.navigateTo({
      url: '../forumdisplay/forumdisplay?fid=' + fid,
    })
  },

  onPullDownRefresh: function() {
    this.forumIndexRequest();
  },
})