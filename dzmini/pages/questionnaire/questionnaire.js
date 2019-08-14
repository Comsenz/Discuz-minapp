// pages/questionnaire/questionnaire.js
const workListUrl = require('/../../config').forumdisplayUrl
const minImgDoc = require('../../config').minImgDoc
const app = getApp()
var self
Page({

  /**
   * 页面的初始数据
   */
  data: {
    minImgDoc: minImgDoc,
    datalist: [],
    loading: false,
    pagenum: 1,
    fid:36,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    self = this;
    self.shareManage(options)
    self.makeRequest();
  },
  shareManage(options) {
    // sharetype = work & shareid=
    if (options.shareid) {
      wx.navigateTo({
        url: '../questionnaire_detail/questionnaire_detail?tid=' + options.shareid,
      })
    }
  },

  makeRequest() {
    self.setData({
      loading: true
    })
    let getdata = {
      fid: self.data.fid,
      page: self.data.pagenum,
      // mobile_api:1
    }
    app.apimanager.getRequest(workListUrl, getdata).then(res => {
      wx.stopPullDownRefresh()
      wx.hideLoading()
      let arr1 = res.Variables.forum_threadlist;

      for (let i =0; i< arr1.length; i++) {
        var thread = arr1[i]
        thread.nickname = res.Variables.usernicknames[thread.authorid] ? res.Variables.usernicknames[thread.authorid]:thread.author
      }
      if (self.data.pagenum > 1) {
        arr1 = self.data.datalist.concat(arr1);
      } 
      var noMore = false
      if (arr1.length >= res.Variables.forum.threadcount) {
        noMore = true
      }

      self.setData({
        loading: false,
        datalist: arr1,
        noMore:noMore
      })

    }).catch(res => {
      wx.stopPullDownRefresh()
      wx.hideLoading()
      self.setData({
        loading: false,
      })
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },

  stopPullDownRefresh() {
    wx.stopPullDownRefresh({
      complete(res) {
        wx.hideToast()
      }
    })
  },

  onPullDownRefresh: function () {
    wx.showLoading({
      title: 'loading...',
      icon: 'loading'
    })

    self.requestMore(false);
  },

  onReachBottom: function () {
    if (!self.data.noMore) {
      self.requestMore(true);
    }
  },

  requestMore(isMore) {

    let pagenum = self.data.pagenum;
    if (isMore) {
      pagenum += 1;
    } else {
      pagenum = 1;
    }
    self.setData({
      pagenum: pagenum, // 更新当前页数
    })
    self.makeRequest(); // 重新调用请求获取下一页数据 或者刷新数据
  },

  cellClick(e) {
    const id = e.currentTarget.id;
    wx.navigateTo({
      url: '../questionnaire_detail/questionnaire_detail?tid=' + id,
    })
  },
  postEnter() {
    wx.navigateTo({
      url: '../post_question/post_question?fid=' + self.data.fid,
    })
  },
})