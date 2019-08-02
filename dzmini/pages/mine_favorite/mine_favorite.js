// pages/mine_favorite/mine_favorite.js
const myFavoriteUrl = require('../../config').myFavoriteUrl
const util = require('../../utils/util.js')
const minImgDoc = require('../../config').minImgDoc
const userAvatar = require('../../config').userAvatar
const app = getApp()
var self
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userAvatar,
    minImgDoc: minImgDoc,
    pagenum:1,
  },
  onReady() {
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    self = this
    self.requestData()

    this.videoContext = wx.createVideoContext('myVideo')
    self.setupAudioPlayer()
  },
  requestData() {
    app.apimanager.getRequest(myFavoriteUrl,{page:self.data.pagenum}).then(res=>{
      wx.stopPullDownRefresh()
      let dataArr = res.Variables.list ? res.Variables.list:[]
      if (dataArr.length > 0) {
        self.setData({noMore:false})
      } else {
        self.setData({noMore:true})
      }
      var usernicknames = res.Variables.usernicknames
      for (let i = 0; i < dataArr.length; i++) {
        let postItem = dataArr[i]
        postItem.nickname = postItem.author ? postItem.author : (postItem.author === null ? "已删除" : "匿名")
        postItem.dateline = util.formatTimeTwo(postItem.dateline, 'Y-M-D')
        if (usernicknames) {
          if (usernicknames[postItem.authorid]) {
            postItem.nickname = usernicknames[postItem.authorid]
          }
        }
        
        // 附件处理
        let attachments = postItem.attachments
        let imageA = []
        let audioA = []
        let videoA = []
        for (let k in attachments) {
          let attItem = attachments[k]
          if (attItem.isimage == -1) {
            imageA.push(attItem)
          }
          else if (attItem.attachment.indexOf('mp3') != -1) {
            let total_process = '00:00'
            if (attItem.description) {
              total_process = util.formatTime(parseInt(attItem.description))
            }
            attItem['toolUse'] = {
              attachment: attItem.attachurl,
              listIndex: i,
              total_process: total_process
            }
            audioA.push(attItem)
          }
          else if (attItem.attachment.indexOf('mp4') != -1) {
            videoA.push(attItem)
          }
        }
        postItem['imageA'] = imageA
        postItem['audioA'] = audioA
        postItem['videoA'] = videoA
        
      }
      if (self.data.pagenum > 1) {
        dataArr = self.data.datalist.concat(dataArr)
      }
      
      self.setData({ datalist: dataArr})
    }).catch(res=>{
      wx.stopPullDownRefresh()
    })
  },
  requestMore(isMore) {
    if (isMore) {
      self.data.pagenum += 1;
    } else {
      self.data.pagenum = 1;
    }
    self.requestData()
  },
  cellClick(e) {
    var tid = self.data.datalist[e.currentTarget.id].id
    wx.navigateTo({
      url: '../thread_detail/thread_detail?tid=' + tid,
    })
  },
  lookImage(e) {
    let cellItem = self.data.datalist[e.currentTarget.dataset.cellindex]
    let imageA = cellItem.imageA
    var imageSrcArray = [];
    for (let i = 0; i < imageA.length; i++) {
      let item = imageA[i]
      imageSrcArray.push(item.attachurl)
    }

    wx.previewImage({
      current: imageSrcArray[e.currentTarget.id],
      urls: imageSrcArray
    })
  },
  /* *********************** 播放语音相关start *********** */
  setupAudioPlayer() {
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.obeyMuteSwitch = false;
    this.innerAudioContext.onEnded((res) => {
      self.stopVoice()
    })
    this.innerAudioContext.onTimeUpdate(() => {
      if (!self.data.is_moving_slider) { // 播放中
        self.data.currentAudio = self.data.datalist[self.data.currentAudio.toolUse.listIndex].audioA[0]

        console.log('cur', self.data.currentAudio)
        let param = {}
        let toolUsestr = "datalist[" + self.data.currentAudio.toolUse.listIndex + "].audioA[0].toolUse"
        let toolUse = self.data.currentAudio.toolUse
        toolUse['current_process'] = util.formatTime(
          this.innerAudioContext.currentTime)
        toolUse['slider_value'] = Math.floor(
          this.innerAudioContext.currentTime)
        toolUse['total_process'] = util.formatTime(
          this.innerAudioContext.duration)
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
    console.log('postItem', postItem)

    var param = {}
    let audioset = "datalist[" + listIndex + "].audioA[0].toolUse.currentAudio";
    param[audioset] = postItem.audioA[0].attachurl

    self.setData(param)
    let currentAudio = postItem.audioA[0]
    console.log('currentaudio', currentAudio)
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
    console.log('currentAudio', currentAudio)
  },
  playVoice() {
    var src = self.data.currentAudio.attachurl
    this.innerAudioContext.src = src
    this.innerAudioContext.play()
  },

  stopVoice() {
    var param = {}
    let listIndex = self.data.currentAudio.toolUse.listIndex
    let toolUsestr = "datalist[" + listIndex + "].audioA[0].toolUse"
    let toolUse = self.data.currentAudio.toolUse
    toolUse['is_play'] = false
    toolUse['slider_value'] = 0
    toolUse['current_process'] = util.formatTime(
      0)
    param[toolUsestr] = toolUse
    self.setData(param)
    self.innerAudioContext.stop()
    let postItem = self.data.datalist[listIndex]
    self.data.currentAudio = postItem.audioA[0]
  },
  /* *********************** 语音end *********** */
  // 视频播放
  clickVideo(e) {
    self.setData({
      currentVideo: e.currentTarget.id
    })

    self.videoContext.play()
    self.videoContext.requestFullScreen({
      direction: 0
    })
  },
  playVideo() {

  },
  fullScreenChange(e) {
    console.log(e.detail)
    if (!e.detail.fullScreen) {
      self.videoContext.stop()
    }
  },

  onPullDownRefresh: function () {
    self.requestMore(false)
  },

  onReachBottom: function () {
    self.requestMore(true)
  },
})