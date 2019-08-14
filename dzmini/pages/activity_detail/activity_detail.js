// pages/activity_detail/activity_detail.js
const detailUrl = require('/../../config').detailUrl
const baseUrl = require('../../config').baseUrl
const pollvoteUrl = require('../../config').pollvoteUrl
const collectUrl = require('/../../config').collectUrl
const sendFlowerUrl = require('/../..//config').sendFlowerUrl
const joinClassUrl = require('../../config').joinClassUrl
const bestanswerUrl = require('../../config').bestanswerUrl
const commentMoreUrl = require('../../config').commentMoreUrl
const activityAppliesUrl = require('../../config').activityAppliesUrl
const minImgDoc = require('../../config').minImgDoc
const userAvatar = require('../../config').userAvatar
const loginmanager = require('../../utils/loginManager')

const util = require('../../utils/util.js')
const app = getApp()
var self
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userAvatar: userAvatar,
    minImgDoc: minImgDoc,
    baseUrl: baseUrl,
    nickname: '',
    datalist: [],
    thread: {},
    tid: "",
    fid: "",
    loading: false,
    pagenum: 1,
    ppp: 10,
    favoriteinfo: '',
    collecttext: "收藏",
    favid: 0,
    sortdefault: false,
    listSortType: '按时间',
    sortListShow: false,
    workinfo: null,
    isShare: false,
    isJoin: false,
    isExpirations: false,
    commentMoreLock: {},
    special_activity: {}
  },
  commentMore(e) {
    var pid = e.currentTarget.dataset.pid;
    var page = this.data.commentMoreLock[pid];
    var index = e.currentTarget.dataset.index;

    if (typeof page == "undefined") {
      page = 2;
    }
    var data = {
      pid: pid,
      tid: this.data.tid,
      page: page,
    }
    app.apimanager.getRequest(commentMoreUrl, data).then(res => {
      var comments = res.Variables.comments[pid];
      var usernicknames = res.Variables.usernicknames;
      if (comments.length > 0) {
        page++;
        self.data.commentMoreLock[pid] = page;
        for (let key in comments) {
          let item = comments[key]
          item.nickname = usernicknames[item.authorid]
        }
        self.data.datalist[index].comments = self.data.datalist[index].comments.concat(comments);
        self.setData({
          commentMoreLock: self.data.commentMoreLock,
          datalist: self.data.datalist
        })
      } else {
        self.data.commentMoreLock[pid] = false;
        self.setData({
          commentMoreLock: self.data.commentMoreLock
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },
  onShow: function() {
    this.setData({
      commentMoreLock: {}
    })
  },
  onReady() {
    this.videoContext = wx.createVideoContext('detailVideo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    self = this

    var tid = options.tid;
    self.setData({
      tid: tid,
      pagenum: 1,
    })
    if (options.type == 'share') {
      self.data.isShare = true
    }

    wx.showLoading();
    self.refreshRequest()
    self.setupAudioPlayer()
  },

  makeRequest() {
    self.setData({
      loading: true
    })
    let ordertype = 2
    if (self.data.sortdefault) {
      self.setData({
        listSortType: '默认顺序'
      })
      ordertype = 1
    }
    let getDic = {
      tid: self.data.tid,
      page: self.data.pagenum,
      ppp: self.data.ppp,
      ordertype: ordertype
    }
    app.apimanager.getRequest(detailUrl, getDic).then(res => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
      let threads = res.Variables.thread;
      self.data.fid = threads.fid
      let nickname = res.Variables.member_nickname ? res.Variables.member_nickname : res.Variables.member_username
      self.setData({
        nickname: nickname
      })
      if (res.Message) {
        let messageval = res.Message.messageval

        if (messageval.indexOf('nonexistence') != -1 ||
          messageval.indexOf('nopermission') != -1 ||
          messageval.indexOf('beoverdue') != -1 ||
          messageval.indexOf('nomedal') != -1 ||
          messageval == 'forum_group_noallowed') {
          wx.showModal({
            title: "提示",
            content: res.Message.messagestr,
            showCancel: false,
            confirmText: "知道了",
            success: function(res) {
              if (res.confirm) {
                wx.navigateBack()
              }
            },
          })
          return
        }
      }

      if (threads.favoriteinfo && threads.favoriteinfo != '') {
        console.log(threads.favoriteinfo)
        self.setData({
          favoriteinfo: threads.favoriteinfo,
          favid: threads.favoriteinfo.favid
        })
        self.resetCollectState()
      }
      var usernicknames = res.Variables.usernicknames
      let arr1 = self.data.datalist;
      let listArray = res.Variables.postlist;
      for (let i = 0; i < listArray.length; i++) {
        let postItem = listArray[i]
        if (usernicknames) {
          if (usernicknames[postItem.authorid]) {
            postItem.nickname = usernicknames[postItem.authorid]
          }
        }
        postItem.message = postItem.message.replace(/\<img/gi, '<img class="rich-img"')
        postItem.message = postItem.message.replace(/<font (.*?)>/gi, "");
        postItem.message = postItem.message.replace(/<\/font>/gi, "");
        // 作业评论处理
        let comments = res.Variables.comments
        if (comments && comments.length != 0) {
          if (comments[postItem.pid]) {
            let comment = comments[postItem.pid]
            for (let key in comment) {
              let item = comment[key]
              if (usernicknames) {
                item.nickname = usernicknames[item.authorid]
              }
            }
            postItem.comments = comment
          }

        }

        var listindex = i + self.data.datalist.length
        // 附件处理
        let attachments = postItem.attachments
        let imageA = []
        let audioA = []
        let videoA = []
        for (let aidKey in attachments) {
          let attItem = attachments[aidKey]
          let newUrl = baseUrl + '/' + attItem.url + attItem.attachment
          attItem['newUrl'] = newUrl
          if (attItem.isimage != 0) {
            imageA.push(attItem)
          } else if (attItem.ext == 'mp3') {
            let total_process = '00:00'
            if (attItem.description) {
              total_process = util.formatTime(parseInt(attItem.description))
            }
            attItem['toolUse'] = {
              attachment: newUrl,
              listIndex: listindex,
              total_process: total_process
            }
            audioA.push(attItem)
          } else if (attItem.ext == 'mp4') {
            videoA.push(attItem)
          }
        }
        postItem['imageA'] = imageA
        postItem['audioA'] = audioA
        postItem['videoA'] = videoA
      }

      if (self.data.pagenum > 1) {
        arr1 = arr1.concat(listArray);
      } else {
        arr1 = listArray;
      }

      if (arr1.length - 1 >= threads.replies) {
        self.setData({
          hasMore: false
        })
      } else {
        self.setData({
          hasMore: true
        })
      }

      if (res.Variables.special_activity) {
        self.setData({
          special_activity: res.Variables.special_activity
        })
        if (self.data.special_activity.attachurl) {
          var special_image = baseUrl + '/' + self.data.special_activity.attachurl
          self.setData({
            special_image: special_image
          })
        } else if (arr1[0].attachments){
          var attachments = arr1[0].attachments;
          for (let aidKey in attachments) {
            let attItem = attachments[aidKey]
            if (!self.data.special_image) {
              self.setData({
                special_image: baseUrl + '/' + attItem.url + attItem.attachment
              })
            }
          }
        }
        if (res.Variables.applylist) {
          self.setData({
            applylist: res.Variables.applylist
          })
        }

        var strbutton = self.data.special_activity.button
        var strclosed = self.data.special_activity.closed
        var isActivity = false
        if (strbutton == 'join' && strclosed == 0) {
          isActivity = true
        }
        self.setData({
          isActivity: isActivity
        })

        if (arr1[0].pid) {
          self.setData({ pid: arr1[0].pid })
        }
      }

      self.setData({
        loading: false,
        datalist: arr1,
        thread: threads,
        member_uid: res.Variables.member_uid
      })
    }).catch(res => {
      wx.stopPullDownRefresh()
      wx.hideLoading();
      self.setData({
        loading: false
      })
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },
  showSort() {
    self.setData({
      sortListShow: !self.data.sortListShow
    })
  },
  sortClick(e) {
    let id = e.currentTarget.id
    let sortdefault = true
    let listSortType = '默认顺序'
    if (id == 1) {
      sortdefault = false
      listSortType = '按时间'
    }
    self.data.pagenum = 1
    self.setData({
      sortdefault: sortdefault,
      listSortType: listSortType,
      sortListShow: false
    })
    self.makeRequest()
  },

  resetCollectState() {
    let collecttext = self.data.collecttext

    if (self.data.favid != 0) {
      collecttext = "已收藏"
    } else {
      collecttext = "收藏"
    }
    console.log(collecttext)
    self.setData({
      collecttext: collecttext,
    })
  },

  collectThread() {
    if (self.data.favid != 0) { // 已收藏 取消收藏
      let url = collectUrl + "&op=delete&deletesubmit=yes"
      let formhash = app.globalData.formhash
      let postData = {
        formhash: formhash,
        favid: self.data.favid
      }
      app.apimanager.postRequest(url, postData).then(res => {
        if (res.Message.messageval == "do_success") {
          self.setData({
            favoriteinfo: '',
            favid: 0
          })
          self.resetCollectState()
        } else {
          wx.showToast({
            title: res.Message.messagestr,
            icon: 'none'
          })
        }
      }).catch(res => {
        wx.showToast({
          title: '出错了！',
          icon: 'none'
        })
      })

    } else { // 未收藏 去收藏
      let formhash = app.globalData.formhash
      let data = {
        formhash: formhash,
        id: self.data.tid
      }
      app.apimanager.getRequest(collectUrl, data).then(res => {
        if (res.Message.messageval == "favorite_do_success") {
          self.setData({
            favid: res.Variables.favid
          })
          self.resetCollectState()
        } else {
          wx.showToast({
            title: res.Message.messagestr,
            icon: 'none'
          })
        }
      }).catch(res => {
        wx.showToast({
          title: '出错了！',
          icon: 'none'
        })
      })
    }
  },
  postEnter() {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../post_thread/post_thread?isreply=true',
    })
  },

  replyWork(e) {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../post_thread/post_thread?isevaluate=true&pid=' + e.currentTarget.id,
    })
  },
  sendFlower(e) {
    let index = parseInt(e.currentTarget.id)
    let replyItem = self.data.datalist[index]

    let formhash = app.globalData.formhash
    let data = {
      tid: self.data.tid,
      pid: replyItem.pid,
      hash: formhash
    }
    app.apimanager.getRequest(sendFlowerUrl, data).then(res => {
      if (res.Message.messageval == "thread_poll_succeed") {
        if (replyItem.postreview && replyItem.postreview.support) {
          replyItem.postreview.support = parseInt(replyItem.postreview.support) + 1;
        } else {
          var postreview = {
            support: 1
          };
          replyItem['postreview'] = postreview;
        }
        let param = {}
        let str = 'datalist[' + index + ']'
        param[str] = replyItem
        self.setData(param)
      } else {
        wx.showToast({
          title: res.Message.messagestr,
          icon: 'none'
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了',
        icon: 'none'
      })
    })
  },

  bestanswer(e) {
    var data = {
      tid: self.data.tid,
      pid: e.currentTarget.id,
      formhash: app.globalData.formhash
    }
    wx.showLoading({
      title: '操作中',
    })
    app.apimanager.postRequest(bestanswerUrl, data).then(res => {
      wx.hideLoading()
      if (res.Message.messageval == 'reward_completion') {
        self.refreshRequest()
      }
      wx.showToast({
        title: res.Message.messagestr,
        icon: 'none'
      })
    }).catch(res => {
      wx.hideLoading()
    })
  },

  // 播放视频 -------------------
  clickVideo(e) {
    self.setData({
      currentVideo: e.currentTarget.id
    })
    self.videoContext.requestFullScreen({
      direction: 0
    })
  },

  fullScreenChange(e) {
    if (!e.detail.fullScreen) {
      self.videoContext.stop()
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
  playVoice() {
    var src = self.data.currentAudio.newUrl;
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
      imageSrcArray.push(item.newUrl)
    }
    console.log(imageSrcArray)
    wx.previewImage({
      current: imageSrcArray[e.currentTarget.id],
      urls: imageSrcArray
    })
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
  /**
   * 分享
   */
  onShareAppMessage: function(res) {
    self.setData({
      shareHidden: true
    })
    var title = self.data.thread.subject ? self.data.thread.subject : self.data.nickname + "邀请你参与活动，快快加入吧"
    var path = "/pages/discovery/discovery?shareid=" + self.data.tid + '&special=' + self.data.thread.special
    var imagePath = minImgDoc + "kehoushare.png"
    if (self.data.datalist[0].imageA.length > 0) {
      imagePath = self.data.datalist[0].imageA[0].newUrl
    }

    return {
      title: title,
      path: path,
      imageUrl: imagePath,
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    self.innerAudioContext.destroy()
  },

  refreshRequest() {
    self.requestMore(false)
  },

  onPullDownRefresh: function() {
    self.refreshRequest()
  },

  onReachBottom: function() {
    if (self.data.hasMore) {
      self.requestMore(true)
    }
  },
  replyText() {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../post_thread/post_thread?isreply=true&type=text',
    })
  },

  joinActivity() {
    if (self.data.special_activity.closed == 1) {
      return
    }
    var acPostData = {
      fid: self.data.fid,
      tid: self.data.tid,
      pid: self.data.pid,
      formhash: app.globalData.formhash
    }
    if (self.data.isActivity) {
      self.setData({
        joinShow: true,
        acPostData: acPostData
      })
    } else {
      acPostData['activitycancel'] = true
      app.apimanager.postRequest(activityAppliesUrl, acPostData).then(res => {
        if (res.Message.messageval.indexOf('_success') != -1) {
          self.refreshRequest()
        }
        wx.showModal({
          content: res.Message.messagestr,
          showCancel: false,
          confirmText: '知道了'
        })
      }).catch(res => {

      })
    }
    
  },
  joinSucceed() {
    self.refreshRequest()
  },

  activityManage() {
    wx.navigateTo({
      url: '../activity_signup/activity_signup?tid='+self.data.tid + '&pid=' + self.data.pid,
    })
  },
})