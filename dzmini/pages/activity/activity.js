// pages/activity/activity.js
const workListUrl = require('/../../config').workListUrl
const minImgDoc = require('../../config').minImgDoc
const duration = 2000
const app = getApp()
var self
Page({

  /**
   * 页面的初始数据
   */
  data: {
    minImgDoc: minImgDoc,
    member_identity: '',
    datalist: [],
    loading: false,
    pagenum: 1,
    fid: 70,
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
        url: '../activity_detail/activity_detail?tid=' + options.shareid,
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
      mobile_api: 1
    }
    app.apimanager.getRequest(workListUrl, getdata).then(res => {
      wx.stopPullDownRefresh()
      wx.hideLoading()
      let arr1 = res.Variables.forum_threadlist;

      for (let i = 0; i < arr1.length; i++) {
        var thread = arr1[i]
        thread.nickname = res.Variables.usernicknames[thread.authorid] ? res.Variables.usernicknames[thread.authorid] : thread.author
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
        noMore: noMore
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    self.setData({ member_identity: app.globalData.member_identity })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showLoading({
      title: 'loading...',
      icon: 'loading'
    })

    self.requestMore(false);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
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

  joinActivity(e) {
    self.setData({
      currenttid:e.currentTarget.id,
      joinShow:true
    })
  },

  activityClick(e) {
    const index = e.currentTarget.id
    var item = self.data.datalist[index]
    wx.navigateTo({
      url: '../activity_detail/activity_detail?tid=' + item.tid + '&pid=' + item.pid,
    })
  },
  postEnter() {
    if (app.globalData.member_identity == 2 && app.globalData.member_status != 1) {
      wx.showModal({
        content: '老师身份正在审核，请耐心等待',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }
    wx.navigateTo({
      url: '../activity_post/activity_post?fid=' + self.data.fid,
    })
  },
})