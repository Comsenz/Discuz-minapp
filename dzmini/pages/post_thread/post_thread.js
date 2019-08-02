// pages/post_thread/post_thread.js
const postThreadUrl = require('../../config').postThreadUrl
const postReplyUrl = require('../../config').postReplyUrl
const postInfoUrl = require('../../config').postInfoUrl
const uploadFileUrl = require('../../config').uploadFileUrl
const replyWorkUrl = require('../../config').replyWorkUrl
const minImgDoc = require('../../config').minImgDoc
const util = require('../../utils/util.js')
const datacheck = require('../../utils/datacheck.js')
var event = require('../../utils/event.js')
const duration = 2000
var self
const app = getApp()
var recordTimeInterval


// 附件分类
var fileCatalog = {
  image: 0,
  audio: 1,
  video: 2
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    minImgDoc: minImgDoc,
    classIndex: 0,
    fid: '',
    tid: '',
    is_quan: false,
    uploadhash: '',
    classTypeList: null,
    imageList: [],
    recordTime: 0,
    recording: false,
    detaiContent: '',
    isreply: false,
    is_fenl: false,
    detailplaceholder: '详细内容',
    audioPrepareUrl: '',
    postLock: false,
    is_parse: 1,
  },

  onReady() {
    this.videoContext = wx.createVideoContext('myVideo')
  },
  detailBegin() {
    this.setData({
      fullScreen: false,
      isText: true
    })
  },

  detailFinish(e) {
    self.setData({
      detaiContent: e.detail.value
    })
  },

  playVideo() {
    self.videoContext.play()
    self.videoContext.requestFullScreen()
  },

  fullScreenChange(e) {
    console.log(e.detail)
    self.setData({
      fullScreen: e.detail.fullScreen
    })
  },

  checkPost() {
    var url = postInfoUrl + '&submodule=checkpost&version=5'
    app.apimanager.getRequest(url, {
      fid: self.data.fid
    }).then(res => {
      
      if (res.Variables.allowperm) {
        self.setData({
          uploadhash: res.Variables.allowperm.uploadhash
        })
      }

      var types = res.Variables.threadtypes.types
      var array = []
      for (let key in types) {
        let value = types[key]
        let data = {
          typeid: key,
          name: value
        }
        array.push(data)
      }
      types = array
      self.setData({
        classTypeList: types,
      })
    }).catch(res => {})
  },

  onHide: function() {
    if (self.data.recording) {
      self.setData({
        recording: false,
        recordTime: 0
      })
      self.stopRecord()
    }
  },

  onUnload: function() {
    if (self.data.recording) {
      self.setData({
        recording: false,
        recordTime: 0
      })
      self.stopRecord()
      this.recorderManager = null
    }
    wx.setKeepScreenOn({
      keepScreenOn: false
    });
  },

  secode() {
    return this.selectComponent('#secode')
  },

  secodeSubmit(e) {
    this.data.postDic['sechash'] = e.detail.sechash
    this.data.postDic['seccodeverify'] = e.detail.seccodeverify
    this.postThread()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    self = this

    this.secode().requestCode('post')

    var fid = options.fid;
    let isreply = options.isreply
    let isevaluate = options.isevaluate
    var is_quan = options.is_quan ? options.is_quan : false

    if (is_quan) {
      self.setData({
        detailplaceholder: '话题',
      })
    }

    if (isreply || isevaluate) {
      let pages = getCurrentPages(); //获取当前页面 
      let prevPage = pages[pages.length - 2]; //获取上个页面  
      let threads = prevPage.data.thread
      var tid = ''
      if (threads) {
        self.setData({
          threads: threads
        })
        fid = threads.fid
        tid = threads.tid
      }
      if (options.tid) {
        tid = options.tid
      }
      if (isevaluate) {
        self.setData({
          isevaluate: isevaluate,
          pid: options.pid
        })
      } else if (isreply) {
        self.setData({
          isreply: isreply
        })
      }
      console.log(tid);
      self.setData({
        tid: tid,
        detailplaceholder: '评论（不少于10个字）'
      })

      if (self.data.isreply || self.data.isevaluate) {
        wx.setNavigationBarTitle({
          title: '回复'
        })
      }

      if (options.type) {
        if (options.type == 'text') {
          self.setData({
            isText: true
          })
        } else if (options.type == 'image') {
          setTimeout(function() {
            self.chooseImage()
          }, 300)
        } else if (options.type == 'audio') {
          self.chooseAudio()
        } else if (options.type == 'video') {
          setTimeout(function() {
            self.chooseVideo()
          }, 300)
        }
      }
    }
    self.setData({
      fid: fid,
      is_quan: is_quan,
    })

    if (self.data.isreply || self.data.isevaluate) {
      var navtitle = '回复'
      wx.setNavigationBarTitle({
        title: navtitle
      })
    }

    self.checkPost()
    // 语音
    this.recorderManager = wx.getRecorderManager();
    this.recorderManager.onError(function(res) {
      var errMsg = res.errMsg
      if (errMsg.indexOf('auth deny') != -1) {
        // errMsg = "没有访问麦克风的权限"
        // wx.showToast({
        //   title: errMsg,
        //   icon: 'none'
        // })
      }

    });
    this.recorderManager.onStop(function(res) {
      self.setData({
        hasRecord: true,
      })
      wx.setKeepScreenOn({
        keepScreenOn: false
      });
      clearInterval(recordTimeInterval)
      var recordTime = Math.floor(res.duration / 1000)
      self.setData({
        recordTime: recordTime
      })
      console.log('self.data.recording', self.data.recording)
      if (self.data.recording) {
        self.setData({
          audioPrepareUrl: res.tempFilePath
        })
        console.log('res.tempFilePath', res.tempFilePath)
        self.uploadFile(res.tempFilePath, fileCatalog.audio)
      }
    })

    this.recorderManager.onPause(function(res) {});
    this.recorderManager.onResume(function(res) {});

    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onTimeUpdate(() => {

      if (!self.data.is_moving_slider) { // 播放中
        self.setData({
          current_process: util.formatTime(
            this.innerAudioContext.currentTime),
          slider_value: Math.floor(
            this.innerAudioContext.currentTime),
          total_process: util.formatTime(
            this.innerAudioContext.duration),
          slider_max: Math.floor(
            this.innerAudioContext.duration)
        })
      }
      if (this.innerAudioContext.currentTime >= self.data.recordTime) {
        self.stopVoice()
      }
    })
  },

  parse: function(e) {
    if (e.currentTarget.dataset.type == 1) {
      this.recorderManager.pause();
      clearInterval(recordTimeInterval)
      this.setData({
        is_parse: 2,
      })
    } else {
      this.recorderManager.resume();
      recordTimeInterval = setInterval(function() {
        const recordTime = self.data.recordTime += 1
        self.setData({
          formatedRecordTime: util.formatTime(self.data.recordTime),
          recordTime
        })
      }, 1000)
      this.setData({
        is_parse: 1,
      })
    }
  },
  classTypeChange(e) {
    var classIndex = e.detail.value;
    console.log(classIndex)
    self.setData({
      classIndex: classIndex
    })
  },

  chooseImage() {
    if (self.data.imageList.length == 9) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none'
      })
      return
    }
    wx.chooseImage({
      count: 9 - self.data.imageList.length,
      success(res) {
        console.log(res)
        for (let key in res.tempFilePaths) {
          let imageSrc = res.tempFilePaths[key]
          self.uploadFile(imageSrc, fileCatalog.image)
        }

      }
    })
  },

  uploadFile(uploadSrc, type) {
    var uploadUrl = uploadFileUrl + '&fid=' + self.data.fid
    let uploadhash = self.data.uploadhash;
    let uid = app.globalData.uid
    let postDic = {
      hash: uploadhash,
      uid: uid,
    }
    wx.showLoading({
      title: '上传附件',
      icon: 'loading'
    })
    console.log(postDic)
    app.apimanager.uploadFile(uploadUrl, uploadSrc, 'Filedata', postDic).then(res => {
      wx.hideLoading()
      var result = datacheck.uploadStatusCheck(res)
      if (result.success) {
        wx.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 1000
        })
        let aid = result.data
        if (type == fileCatalog.image) {
          var imageList = self.data.imageList
          let imgObj = {
            aid: aid,
            src: uploadSrc
          }
          imageList.push(imgObj)
          self.setData({
            imageList: imageList
          })
        } else if (type == fileCatalog.audio) {
          self.setData({
            audioPrepareUrl: ''
          })
          var data = {
            aid: aid,
            src: uploadSrc
          }
          let recordTime = self.data.recordTime
          self.setData({
            audio: data,
            total_process: util.formatTime(recordTime),
            slider_max: Math.floor(recordTime),
            recording: false
          })
        } else if (type == fileCatalog.video) {
          var data = {
            aid: aid,
            src: uploadSrc
          }
          self.setData({
            video: data
          })
        }
      } else {
        wx.showModal({
          content: result.data,
          showCancel: false,
          confirmText: '确定'
        })
      }
    }).catch(res => {
      console.log(res)
      wx.hideLoading()
      wx.showModal({
        content: "上传失败",
        showCancel: false,
        confirmText: '确定'
      })
    })
  },

  previewImage(e) {
    const current = e.target.dataset.src
    var imageSrcArray = [];
    for (let i = 0; i < self.data.imageList.length; i++) {
      let item = self.data.imageList[i]
      imageSrcArray.push(item.src)
    }
    wx.previewImage({
      current,
      urls: imageSrcArray
    })
  },

  chooseAudio() {
    // if (self.data.audio) {
    //   wx.showToast({
    //     title: '最多上传一个语音',
    //     icon: 'none'
    //   })
    //   return
    // }
    if (self.data.recording) {
      return
    }
    self.startRecord()
  },

  chooseVideo() {
    wx.chooseVideo({
      camera: 'back',
      maxDuration: 60,
      success(res) {
        self.uploadFile(res.tempFilePath, fileCatalog.video)
      }
    })
  },
  startRecord() {
    wx.authorize({
      scope: 'scope.record',
      success() {
        console.log("录音授权成功");
        //第一次成功授权后 状态切换为2
        self.setData({
          status: 2,
        })
        // 用户已经同意小程序使用录音功能，后续调用 self.recordStart 接口不会弹窗询问
        self.recordStartNow();
      },
      fail() {
        wx.showModal({
          title: '提示',
          content: '您未授权录音，功能将无法使用',
          showCancel: true,
          confirmText: "授权",
          confirmColor: "#52a2d8",
          success: function(res) {
            if (res.confirm) {
              //确认则打开设置页面（重点）
              wx.openSetting({
                success: (res) => {
                  console.log(res.authSetting);
                  if (!res.authSetting['scope.record']) {
                    //未设置录音授权
                    console.log("未设置录音授权");
                    wx.showModal({
                      title: '提示',
                      content: '您未授权录音，功能将无法使用',
                      showCancel: false,
                      success: function(res) {},
                    })
                  } else {
                    //第二次才成功授权
                    self.setData({
                      status: 2,
                    })
                    self.recordStartNow()
                  }
                },
                fail: function() {
                  console.log("授权设置录音失败");
                }
              })
            } else if (res.cancel) {
              console.log("cancel");
            }
          },
          fail: function() {
            console.log("openfail");
          }
        })
      }
    })
  },

  recordStartNow() {
    clearInterval(recordTimeInterval)
    self.setData({
      recording: true,
      recordTime: 0,
      formatedRecordTime: '00:00',
      audioPrepareUrl: ''
    })
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
    recordTimeInterval = setInterval(function() {
      const recordTime = self.data.recordTime += 1
      self.setData({
        formatedRecordTime: util.formatTime(self.data.recordTime),
        recordTime
      })
    }, 1000)
    this.recorderManager.start({
      format: 'mp3',
      duration: 180000
    });
  },

  stopRecord() {
    clearInterval(recordTimeInterval)
    this.recorderManager.stop()
    if (self.data.audioPrepareUrl) {
      self.uploadFile(self.data.audioPrepareUrl, fileCatalog.audio)
    }
  },

  // 点击播放暂停
  audio_play: function() {
    if (self.data.is_play) {
      self.setData({
        is_play: false
      })
      console.log('暂停')
      self.innerAudioContext.pause()
    } else if (!this.data.is_play && this.data.is_ended) {
      self.playVoice()
      self.setData({
        is_play: true,
        is_ended: false
      })
    } else if (!this.data.is_play) {
      console.log("即将播放")
      self.setData({
        is_play: true
      })
      self.playVoice()
    }
  },

  // 拖动进度条，到指定位置
  hanle_slider_change(e) {
    const position = e.detail.value
    this.seekCurrentAudio(position)
  },

  // 拖动进度条控件
  seekCurrentAudio(position) {
    this.innerAudioContext.seek(position)
    self.setData({
      current_process: util.formatTime(position),
      slider_value: Math.floor(position)
    })
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

  playVoice() {
    var src = this.data.audio.src;
    if (src == '') {
      return;
    }
    this.innerAudioContext.src = src;
    this.innerAudioContext.play()
  },

  stopVoice() {
    this.setData({
      current_process: util.formatTime(0),
      slider_value: Math.floor(
        0),
      is_play: false,
    })
    self.innerAudioContext.stop()
  },

  clear() {
    self.setData({
      is_play: false,
      hasRecord: false,
      recording: false,
      audio: null,
      formatedRecordTime: util.formatTime(0),
      recordTime: 0,
    })
    self.stopRecord()
  },

  deleteVideo(e) {
    var aid = e.currentTarget.id
    console.log(aid)
    self.setData({
      video: null,
    })
  },

  deleteImage(e) {
    var aid = e.currentTarget.id
    var imageList = self.data.imageList;
    var index
    for (let i = 0; i < imageList.length; i++) {
      let data = imageList[i];
      if (data.aid == aid) {
        index = i
      }
    }
    imageList.splice(index, 1);
    self.setData({
      imageList: imageList
    })
    console.log(aid)
  },
  deleteAudio(e) {
    var aid = e.currentTarget.id
    self.setData({
      audio: null,
    })
  },

  formSubmit(e) {

    if (datacheck.isEmojiCharacter(e.detail.value.message) || datacheck.isEmojiCharacter(e.detail.value.subject)) {
      wx.showToast({
        title: '不能使用emoji表情',
        icon: 'none'
      })
      return;
    }
    
    var postDic = {
      formhash: app.globalData.formhash,
    }

    if (e.detail.value.message) {
      if (e.detail.value.message.length > 0) {
        let msg = e.detail.value.message
        postDic['message'] = msg
        if (!self.data.isreply && !self.data.isevaluate) {
          let length = msg.length < 40 ? msg.length : 40
          postDic['subject'] = msg.substr(0, length)
        }
      }
    } else {
      let msg = self.data.detaiContent;
      postDic['message'] = msg
      if (!self.data.isreply && !self.data.isevaluate) {
        let length = msg.length < 40 ? msg.length : 40
        postDic['subject'] = msg.substr(0, length)
      }
    }
    if (e.detail.value.subject) {
      postDic['subject'] = e.detail.value.subject
    } else if (!(self.data.isreply || self.data.isevaluate)) {

      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }

    if (self.data.imageList.length > 0) {
      for (let i = 0; i < self.data.imageList.length; i++) {
        let imgObj = self.data.imageList[i];
        let aid = imgObj['aid']
        let attachKey = "attachnew[" + aid + "][description]"
        postDic[attachKey] = ''
      }
    }
    if (self.data.audio) {
      let attachKey = "attachnew[" + self.data.audio.aid + "][description]"
      postDic[attachKey] = self.data.recordTime
    }

    if (self.data.video) {
      let attachKey = "attachnew[" + self.data.video.aid + "][description]"
      postDic[attachKey] = ''
    }

    if (this.data.classTypeList && this.data.classTypeList.length > 0 && !this.data.isreply && !this.data.isevaluate) {
      if (e.detail.value.classType.length <= 0) {
        e.detail.value.classType = 0
      }
      let typeIndex = parseInt(e.detail.value.classType)
      let classObj = this.data.classTypeList[typeIndex]
      postDic['typeid'] = classObj.typeid
    }

    this.setData({
      postDic: postDic
    })

    if (this.secode().haveCode()) {
      this.setData({
        codeShow: true
      })
      this.setData({
        fullScreen: true
      })
      return
    }
    this.postThread()
  },

  postThread() {
    self.setData({
      postLock: true
    })
    var isRefresh = false

    var url = postThreadUrl
    if (self.data.isreply) { // 交作业
      url = postReplyUrl + '&fid=' + self.data.fid + '&tid=' + self.data.tid
      if (self.data.is_quan) {
        isRefresh = true
      }
    } else if (self.data.isevaluate) { // 回复作业
      url = replyWorkUrl + '&tid=' + self.data.tid + '&pid=' + self.data.pid
    } else { // 发帖 发布作业
      isRefresh = true
      url = url + '&fid=' + self.data.fid
    }

    wx.showLoading({
      title: '发布中...',
      icon: 'loading'
    })
    var postDic = this.data.postDic
    app.apimanager.postRequest(url, postDic).then(res => {
      wx.hideLoading()
      if (res.Message.messageval.indexOf('succeed') != -1 || res.Message.messageval.indexOf('success') != -1) {
        if (isRefresh && self.data.is_quan) { // 发作业题目
          if (self.data.isreply) {
            event.emit('indexChanged', {
              name: 'workRefresh',
              reply: true,
              tid: self.data.tid,
            })
          } else {
            event.emit('indexChanged', {
              name: 'workRefresh',
            })
          }

        } else { // 交作业
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2]; //上一个页面
          prevPage.refreshRequest()
        }
        if (res.Message.messagestr.indexOf('审核') != -1) {
          setTimeout(function () {
            wx.navigateBack()
          }, 2000)
        } else {
          wx.navigateBack()
        }
      } else {
        self.setData({
          postLock: false
        })
      }

      wx.showToast({
        title: res.Message.messagestr,
        icon: 'none',
        mask: true,
        duration,
      })
    }).catch(res => {
      console.log(res)
      wx.hideLoading()
      self.setData({
        postLock: false
      })
      wx.showToast({
        title: '服务器繁忙，请稍后再试！',
        icon: 'none'
      })
    })
  }
})