// pages/activity_signup/activity_signup.js
const activitySinupListUrl = require('../../config').activitySinupListUrl
const userAvatar = require('../../config').userAvatar
const minImgDoc = require('../../config').minImgDoc
const duration = 2000
const app = getApp()

var self

Page({

  data: {
    minImgDoc: minImgDoc,
    userAvatar, userAvatar,
    signList:[],
    currentTab: 0,
    page:1
  },

  onLoad: function(options) {
    self = this
    if (options.tid) {
      this.setData({
        tid: options.tid,
        pid: options.pid
      })
    }
    let pages = getCurrentPages(); //获取当前页面 
    let prevPage = pages[pages.length - 2]; //获取上个页面  
    let special_image = prevPage.data.special_image
    this.setData({
      special_image:special_image,
    });
    this.activitySinupList()
  },
  naviClick(e) {
    this.setData({
      currentTab: e.currentTarget.id
    })
    this.data.page = 1
    this.activitySinupList()
  },
  activitySinupList() {
    var actstatus = 0
    if (this.data.currentTab == 0) {
      actstatus = 1
    }
    var data = {
      tid: self.data.tid,
      pid: self.data.pid,
      actstatus: actstatus
    }
    app.apimanager.getRequest(activitySinupListUrl, data).then(res => {
      wx.stopPullDownRefresh()
      var signList = res.Variables.activityapplylist.applylist
      if (this.data.page > 1) {
        signList = this.data.signList.concat(signList)
      }
      this.setData({
        activityinfo: res.Variables.activityapplylist.activityinfo,
        signList: signList
      })
    }).catch(res => {
      wx.stopPullDownRefresh()
    })

  },
  
  deleteSignup(e) {
    this.originExamine(e,false)
  },
  passSignup(e) {
    var index = e.currentTarget.id
    var item = self.data.signList[index]
    if (item.verified == 0) {
      this.originExamine(e, true)
    }
  },
  originExamine(e,pass) {
    var operation = ''
    var tipTitle = '审核是否通过'
    if (!pass) {
      operation = 'delete'
      tipTitle = '审核是否拒绝'
    }
    var index = e.currentTarget.id
    var item = self.data.signList[index]
    var data = {
      tid: this.data.tid,
      pid: this.data.pid,
      formhash: app.globalData.formhash,
      handlekey:'activity',
      'applyidarray[]': item.applyid,
      reason:'',
      operation: operation
    }
    var url = activitySinupListUrl + '&applylistsubmit=yes'
    wx.showModal({
      title: tipTitle,
      confirmText: '确定',
      success: function(res) {
        
        if (res.confirm) {
          app.apimanager.postRequest(url, data).then(res => {
            if (res.Message.messageval.indexOf('_completion') != -1) {
              self.data.page = 1
              self.activitySinupList()
            }
            var sutip = '审核成功'
            if (!pass) {
              sutip = '删除成功'
            }
            wx.showToast({
              title: sutip,
              icon:'none'
            })
          }).catch(res => {
            console.log(res)
          })
        }
      }
    })
  },

  onPullDownRefresh: function () {
    this.data.page = 1
    this.activitySinupList()
  },

  onReachBottom: function () {
    this.data.page ++
    this.activitySinupList()
  },

})