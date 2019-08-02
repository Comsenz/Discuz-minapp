// pages/question_answer/question_answer.js
const forumdisplayUrl = require('../../config').forumdisplayUrl
const util = require('../../utils/util.js')
const minImgDoc = require('../../config').minImgDoc

const app = getApp()
var self
Page({

  data: {
    minImgDoc: minImgDoc,
    fid:50,
    currentTab:0,
    singleimage:true,
    typeid:'',
    page:1,
    datalist:[],
    threadtypes:{},
  },

  onShow: function() {
    self = this
  },

  onLoad: function (options) {
    console.log('执行了')
    if (options.shareid) {
      wx.navigateTo({
        url: '../question_answer_detail/question_answer_detail?tid=' + options.shareid,
      })
    }

    self = this
    if (options.typeid) {
      self.setData({ typeid: options.typeid })
    }
    self.fourmdisplayRequest()
  },

  refreshRequest() {
    self.data.page = 1
    self.fourmdisplayRequest()
  },

  fourmdisplayRequest(){
    var data = {}
    if (self.data.currentTab == 0) {
      data = {
        'filter':'digest',
        'digest':1,
        'specialtype':'reward',
        'fid': self.data.fid,
        'page': self.data.page,
        mobile_api: 1
      }
    } else if (self.data.currentTab == 1) {
      data = {
        'filter': 'specialtype',
        'specialtype': 'reward',
        'rewardtype':1,
        'fid': self.data.fid,
        'page': self.data.page,
        mobile_api: 1
      }
    } else if (self.data.currentTab == 2) {
      data = {
        'filter': 'specialtype',
        'specialtype': 'reward',
        'rewardtype': 2,
        'fid': self.data.fid,
        'page': self.data.page,
        mobile_api: 1
      }
    }
    if (self.data.typeid) {
      data['filter'] = 'typeid'
      data['typeid'] = self.data.typeid
    }

    app.apimanager.getRequest(forumdisplayUrl, data).then(res => {
      wx.stopPullDownRefresh()
      var usernicknames = res.Variables.usernicknames
      let arr1 = res.Variables.forum_threadlist
      if (res.Variables.threadtypes) {
        self.setData({
          threadtypes: res.Variables.threadtypes
        })
        if (self.data.typeid) {
          wx.setNavigationBarTitle({
            title: self.data.threadtypes.types[self.data.typeid],
          })
        }
      }
      
      for (let i = 0; i < arr1.length; i++) {
        let postItem = arr1[i]
        if (usernicknames) {
          if (usernicknames[postItem.authorid]) {
            postItem.nickname = usernicknames[postItem.authorid]
          }
        }
        if (self.data.threadtypes && postItem.typeid > 0) {
          postItem['typename'] = self.data.threadtypes.types[postItem.typeid]
        }
        if (postItem.message && postItem.message.length > 0) {
          postItem.message = util.filterHtml(postItem.message)
        }

        let attachments = postItem.attachlist
        if (attachments) {
          let imageA = []
          for (let k = 0; k < attachments.length; k++) {
            let attItem = attachments[k]

            let realIndex = i
            if (self.data.page > 1) {
              realIndex = i + self.data.datalist.length
            }
            if (attItem.type == 'image') {
              attItem['toolUse'] = {
                listIndex: realIndex,
                imageIndex: k
              }
              imageA.push(attItem)
            }
          }
          postItem['imageA'] = imageA
        }
       
      }

      if (self.data.page > 1 && arr1.length > 0) {
        arr1 = self.data.datalist.concat(arr1)
      }

      var noMore = false
      if (arr1.length >= res.Variables.forum.threadcount) {
        noMore = true
      }

      self.setData({
        datalist: arr1,
        noMore: noMore,
        dataDic: res
      })
    }).catch(res => { 
      wx.stopPullDownRefresh()
      console.log(res)
    })
  },

  typeClick(e) {
    wx.navigateTo({
      url: '../question_type/question_type?typeid=' + e.currentTarget.id,
    })
  },

  naviClick(e) {
    self.setData({currentTab:e.currentTarget.id,page:1})
    self.fourmdisplayRequest()
  },
  
  cellClick(e) {
    var tid = this.data.datalist[e.currentTarget.id].tid
    wx.navigateTo({
      url: '../question_answer_detail/question_answer_detail?tid=' + tid,
    })
  },

  postEnter() {
    wx.navigateTo({
      url: '../question_answer_post/question_answer_post?fid=' + self.data.fid,
    })
  },

  clickReply(e) {
    wx.navigateTo({
      url: '../post_thread/post_thread?isreply=true&tid=' + e.currentTarget.id + '&fid=' + self.data.fid,
    })
  },

  onPullDownRefresh: function () {
    self.data.page = 1
    self.fourmdisplayRequest()
  },

  onReachBottom: function () {
    if (!self.data.noMore) {
      self.data.page ++
      self.fourmdisplayRequest()
    }
  },

})