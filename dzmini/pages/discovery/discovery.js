// pages/discovery/discovery.js
const baseUrl = require('../../config').baseUrl
const newestUrl = require('../../config').newestUrl
const digestUrl = require('../../config').digestUrl
const minImgDoc = require('../../config').minImgDoc 
const userAvatar = require('../../config').userAvatar
const checkUrl = require('../../config').checkUrl

const util = require('../../utils/util.js')
var event = require('../../utils/event.js')

const app = getApp()
var self

Page({

  /**
   * 页面的初始数据
   */
  data: {
    minImgDoc: minImgDoc,
    userAvatar: userAvatar,
    userInfoHidden:true,
    fullScreen: false,
    datalist:[],
    navData: [{
      name: '最新',
      },
      {
        name: '精华'
      }
    ],
    currentTab: 0,
    page: 1,
  },
  onLoad: function(options) {
    self = this
    if (options.shareid) {
      var item = {
        tid: options.shareid,
        special: options.special ? options.special : 0
      }
      this.toDetail(item)
    }

    wx.showLoading();
    this.requestData()
    
    self.setupAudioPlayer()
    self.allowpostcomment()

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              app.globalData.userInfo = res.userInfo
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          self.setData({ userInfoHidden: false })
        }
      }
    })
  },

  onReady() {
    this.videoContext = wx.createVideoContext('detailVideo')
  },


  allowpostcomment: function () {
    var url = checkUrl
    app.apimanager.getRequest(url).then(res => {
      var repliesrank = res.setting.repliesrank;
      var allowpostcomment = res.setting.allowpostcomment;
      app.globalData.repliesrank = repliesrank
      app.globalData.allowpostcomment = allowpostcomment
    }).catch(res => {
    })
  },

  switchNav(event) {
    var cur = event.currentTarget.dataset.current
    if (this.data.currentTab != cur) {
      this.setData({
        currentTab: cur
      })
    }
    this.data.page = 1
    this.requestData()
  },
  requestData() {
    var url = newestUrl
    if (this.data.currentTab == 1) {
      url = digestUrl
    }
    var data = {
      page: self.data.page
    }
    app.apimanager.getRequest(url, data).then(res => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
      var datalist = res.Variables.data ? res.Variables.data : []
      for (let i = 0; i < datalist.length; i++) {
        let postItem = datalist[i]
        var listindex = i + this.data.datalist.length
        // 附件处理
        let attachlist = postItem.attachlist
        let imageA = []
        let audioA = []
        let videoA = []
        let DownloadA = [];
        for (let aidKey in attachlist) {
          let attItem = attachlist[aidKey]
          let newUrl = attItem.attachment
          attItem['newUrl'] = newUrl
          if (attItem.type == 'image') {
            imageA.push(attItem)
          } else if (attItem.type == 'audio') {
            let total_process = '00:00'
            if (attItem.description) {
              total_process = util.formatTime(parseInt(attItem.description))
            }
            attItem['toolUse'] = {
              attachment: newUrl,
              listIndex: listindex,
              total_process: total_process
            }
            // console.log(attItem);
            audioA.push(attItem)
          } else if (attItem.type == 'video') {
            videoA.push(attItem)
          } else if (attItem.ext == 'pdf' || attItem.ext == 'ppt' || attItem.ext == 'pptx' || attItem.ext == 'docx' || attItem.ext == 'doc' || attItem.ext == 'xls' || attItem.ext == 'xlsx') {
            DownloadA.push(attItem);
          }
        }
        postItem['imageA'] = imageA
        postItem['audioA'] = audioA
        postItem['videoA'] = videoA
        postItem['DownloadA'] = DownloadA;
      }
      if (this.data.page > 1) {
        datalist = this.data.datalist.concat(datalist)
      }
      this.setData({
        datalist: datalist
      })
    }).catch(res => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
    })
  },

  cellClick(e) {
    var item = this.data.datalist[e.currentTarget.id]
    this.toDetail(item)
  },

  toDetail(item) {
    var special = item.special
    var tid = item.tid

    var url = '../thread_detail/thread_detail?tid='
    if (special == 1) {
      url = '../questionnaire_detail/questionnaire_detail?tid='
    } else if (special == 3) {
      url = '../question_answer_detail/question_answer_detail?tid='
    } else if (special == 4) {
      url = '../activity_detail/activity_detail?tid='
    }
    url += tid
    wx.navigateTo({
      url: url,
    })
  },
  // 播放视频 -------------------
  clickVideo(e) {
    self.setData({
      currentVideo: e.currentTarget.id
    })

    self.videoContext.play()
    self.videoContext.requestFullScreen({
      direction: 0
    })
    this.setData({
      fullScreen: true,
    })
  },

  fullScreenChange(e) {
    if (!e.detail.fullScreen) {
      self.videoContext.stop()
      self.setData({
        fullScreen: false,
      })
    }
  },

  /* *********************** 语音相关start *********** */
  setupAudioPlayer() {
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.obeyMuteSwitch = false;
    this.innerAudioContext.onEnded((res) => {
      self.data.currentAudio.toolUse.is_ended = true
      self.stopVoice()
    })
    this.innerAudioContext.onTimeUpdate(() => {
      console.log("ontimeupdate")

      if (!self.data.is_moving_slider) { // 播放中
        self.data.currentAudio = self.data.datalist[self.data.currentAudio.toolUse.listIndex].audioA[0]

        let param = {}
        let toolUsestr = "datalist[" + self.data.currentAudio.toolUse.listIndex + "].audioA[0].toolUse"

        let toolUse = self.data.currentAudio.toolUse
        toolUse['current_process'] = util.formatTime(
          this.innerAudioContext.currentTime)
        toolUse['slider_value'] = Math.floor(
          this.innerAudioContext.currentTime)
        toolUse['slider_max'] = Math.floor(
          this.innerAudioContext.duration)
        param[toolUsestr] = toolUse
        self.setData(param)
      }
    })
  },
  // 拖动进度条，到指定位置
  hanle_slider_change(e) {
    const position = e.detail.value
    this.seekCurrentAudio(position)
  },

  // 拖动进度条控件
  seekCurrentAudio(position) {
    this.innerAudioContext.seek(position)
  },
  // 进度条滑动
  handle_slider_move_start() {
    this.setData({
      is_moving_slider: true
    });
  },
  handle_slider_move_end() {
    this.setData({
      is_moving_slider: false
    });
  },
  // 点击播放暂停
  audio_play(e) {

    let listIndex = e.currentTarget.dataset.listindex
    let postItem = self.data.datalist[listIndex]
    let currentAudio = postItem.audioA[0]

    var param = {}
    let audioset = "datalist[" + listIndex + "].audioA[0].toolUse.currentAudio";
    console.log(audioset);
    param[audioset] = currentAudio.newUrl
    self.setData(param)
    self.setData({
      currentAudio: currentAudio
    })
    let isplay = self.data.currentAudio.toolUse.is_play
    let playstr = "datalist[" + listIndex + "].audioA[0].toolUse.is_play";
    param[playstr] = !isplay
    self.setData(param)
    if (isplay) {
      self.innerAudioContext.pause()
      isplay = false
    } else if (!isplay && !self.data.currentAudio.toolUse.is_ended) {
      self.playVoice()
    } else {
      self.innerAudioContext.play()
    }
  },

  onUnload: function () {
    self.innerAudioContext.destroy()
  },


  playVoice() {
    let src = self.data.currentAudio.attachment;
    console.log(self.data.currentAudio.attachment);
    this.innerAudioContext.src = src;
    this.innerAudioContext.play()
  },
  stopVoice() {
    var param = {}
    let toolUsestr = "datalist[" + self.data.currentAudio.toolUse.listIndex + "].audioA[0].toolUse"
    let toolUse = self.data.currentAudio.toolUse
    toolUse['is_play'] = false
    toolUse['slider_value'] = 0
    toolUse['current_process'] = util.formatTime(
      0)
    param[toolUsestr] = toolUse
    self.setData(param)
    self.innerAudioContext.stop()
    self.data.currentAudio = self.data.datalist[self.data.currentAudio.toolUse.listIndex].audioA[0]
  },

  /* *********************** 语音end *********** */
  lookImage(e) {
    let cellItem = self.data.datalist[e.currentTarget.dataset.cellindex]
    let imageA = cellItem.imageA
    var imageSrcArray = [];
    for (let i = 0; i < imageA.length; i++) {
      let item = imageA[i]
      imageSrcArray.push(item.attachment)
    }
    console.log(imageSrcArray[e.currentTarget.id])
    wx.previewImage({
      current: imageSrcArray[e.currentTarget.id],
      urls: imageSrcArray
    })
  },

  onPullDownRefresh: function() {
    this.data.page = 1
    this.requestData()
  },

  onReachBottom: function() {
    this.data.page++
      this.requestData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  getUserInfo: function (e) {
    console.log(e.detail.userInfo)
    if (!e.detail.userInfo) {
      wx.showToast({
        title: "为了您更好的体验,请先同意授权",
        icon: 'none',
        duration: 2000
      });
    }
  },
  hideWelcome() {
    this.setData({
      userInfoHidden: true
    })
  }
})