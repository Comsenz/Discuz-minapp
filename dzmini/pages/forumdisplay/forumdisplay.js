// pages/forumdisplay/forumdisplay.js
const minImgDoc = require('../../config').minImgDoc
const forumdisplayUrl = require('../../config').forumdisplayUrl
const userAvatar = require('../../config').userAvatar
const util = require('../../utils/util.js')
const loginmanager = require('../../utils/loginManager')
const app = getApp()
var self
Page({

  data: {
    userAvatar,
    minImgDoc,
    fid: '',
    toplist: [],
    pagenum: 1,
    notThisFidCount: 0,
    order: 0,
    fullScreen: false,
    easyNav: [{
        name: '全部'
      },
      {
        name: '最新'
      },
      {
        name: '热帖'
      },
      {
        name: '精华'
      },
    ]
  },

  onLoad: function(options) {
    self = this;
    this.data.fid = options.fid;
    wx.showLoading();
    this.requestData();
    self.setupAudioPlayer();
  },

  onReady() {
    this.videoContext = wx.createVideoContext('myVideo')
  },

  navClick(e) {
    this.setData({
      order: e.currentTarget.id,
      pagenum: 1
    })
    this.requestData()
  },

  refreshRequest() {
    this.data.pagenum = 1
    this.requestData()
  },

  requestData() {
    var data = {
      fid: this.data.fid,
      page: this.data.pagenum,
      submodule: 'checkpost'
    }
    if (this.data.order) {
      switch (this.data.order) {
        case '0':
          {}
          break;
        case '1':
          {
            data['filter'] = 'author'
            data['orderby'] = 'dateline'
          }
          break;
        case '2':
          {
            data['filter'] = 'heat'
            data['orderby'] = 'heats'
          }
          break;
        case '3':
          {
            data['filter'] = 'digest'
            data['digest'] = '1'
          }
          break;
      }
    }

    app.apimanager.getRequest(forumdisplayUrl, data).then(res => {
      wx.stopPullDownRefresh();
      wx.hideLoading();
      if (res.Message) {
        let messageval = res.Message.messageval
        if (messageval.indexOf('nonexistence') != -1 ||
          messageval.indexOf('nopermission') != -1 ||
          messageval.indexOf('beoverdue') != -1 ||
          messageval.indexOf('nomedal') != -1) {
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

      let arr1 = res.Variables.forum_threadlist
      if (res.Variables.threadtypes) {
        this.setData({
          types: res.Variables.threadtypes.types
        })
      }
      var topArr = []
      var commonArr = []
      var topCheckArr = ['1', '2', '3']
      for (let i = 0; i < arr1.length; i++) {
        let postItem = arr1[i]
        if (postItem.message && postItem.message.length > 0) {
          postItem.message = util.filterHtml(postItem.message)
        }

        let attachments = postItem.attachlist
        if (attachments) {
          let imageA = []
          let audioA = []
          let videoA = []
          for (let k = 0; k < attachments.length; k++) {
            let attItem = attachments[k]
            let realIndex = commonArr.length;
            if (this.data.pagenum > 1) {
              realIndex = commonArr.length + this.data.datalist.length
            }

            if (attItem.type == 'image') {
              attItem['toolUse'] = {
                listIndex: realIndex,
                imageIndex: k
              }
              imageA.push(attItem)
            } else if (attItem.type == 'audio') {
              let total_process = '00:00'
              if (attItem.description) {
                total_process = util.formatTime(parseInt(attItem.description))
              }
              attItem['toolUse'] = {
                attachment: attItem.attachment,
                listIndex: realIndex,
                total_process: total_process,
              }
              audioA.push(attItem)
            } else if (attItem.type == 'video') {
              videoA.push(attItem)
            }
          }

          postItem['imageA'] = imageA
          postItem['audioA'] = audioA
          postItem['videoA'] = videoA
        }
        if (topCheckArr.indexOf(postItem.displayorder) != -1) {
          if (this.data.pagenum == 1) {
            if (this.data.fid != postItem.fid) {
              this.data.notThisFidCount++;
            }
          }
          topArr.push(postItem)
        } else {
          commonArr.push(postItem)
        }
      }
      if (this.data.pagenum == 1) {
        this.setData({
          toplist: topArr
        })
      }

      arr1 = commonArr
      if (this.data.pagenum > 1 && arr1.length > 0) {
        arr1 = this.data.datalist.concat(arr1)
      }
      this.setData({
        datalist: arr1,
        dataDic: res
      })

      var group = res.Variables.group;
      var postTypeArr = [];
      if (res.Variables.forum.allowspecialonly == 0) {
        postTypeArr.push(0);
      }
      if (group) {
        if (group.allowpostpoll) {
          postTypeArr.push(1);
        }
        if (group.allowpostactivity) {
          postTypeArr.push(4);
        }
      }
      this.setData({
        postTypeArr: postTypeArr,
      });

      var noMore = false
      var getTotal = this.data.datalist.length + this.data.toplist.length;
      var threadCount = parseInt(res.Variables.forum.threadcount) + this.data.notThisFidCount
      if (getTotal >= threadCount) {
        noMore = true
      }

      this.setData({
        noMore: noMore
      })

      wx.setNavigationBarTitle({
        title: res.Variables.forum.name
      })

    }).catch(res => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
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
      fullScreen: true
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
    self.setData({
      currentAudio: currentAudio
    })

    var param = {}
    let audioset = "datalist[" + listIndex + "].audioA[0].toolUse.currentAudio";
    param[audioset] = currentAudio.attachment
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

  onUnload: function() {
    self.innerAudioContext.destroy()
  },

  playVoice() {
    this.innerAudioContext.src = self.data.currentAudio.attachment;
    this.innerAudioContext.play();
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
    wx.previewImage({
      current: imageSrcArray[e.currentTarget.id],
      urls: imageSrcArray
    })
  },

  topCellClick(e) {
    var item = this.data.toplist[e.currentTarget.id]
    this.toDetail(item)
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

  onPullDownRefresh: function() {
    this.data.pagenum = 1;
    this.data.notThisFidCount = 0;
    this.requestData();
  },

  onReachBottom: function() {
    if (!this.data.noMore) {
      this.data.pagenum++
        this.requestData()
    }
  },

  postEnter() {
    if (!loginmanager.isLogin()) {
      return;
    }
    if (this.data.postTypeArr.length > 1) {
      return;
    }

    var special = this.data.postTypeArr[0];
    this.postSelect(special);
  },

  postThreadType(e) {
    this.postSelect(e.detail);
  },

  postSelect(special) {
    if (special == 0) {
      wx.navigateTo({
        url: '../post_thread/post_thread?fid=' + this.data.fid,
      });
    } else if (special == 1) {
      wx.navigateTo({
        url: '../post_question/post_question?fid=' + this.data.fid,
      });
    } else if (special == 4) {
      wx.navigateTo({
        url: '../activity_post/activity_post?fid=' + this.data.fid
      });
    }
  }

})