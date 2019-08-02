// pages/question_answer_post/question_answer_post.js
const uploadFileUrl = require('../../config').uploadFileUrl
const postInfoUrl = require('../../config').postInfoUrl
const postThreadUrl = require('../../config').postThreadUrl
const searchThreadUrl = require('../../config').searchThreadUrl
const util = require('../../utils/util.js')
const datacheck = require('../../utils/datacheck.js')
const minImgDoc = require('../../config').minImgDoc
var recordTimeInterval
const duration = 2000

const app = getApp()
var self

// 附件分类
var fileCatalog = {
  image: 0,
  audio: 1,
  video: 2
}

Page({

  data: {
    minImgDoc: minImgDoc,
    searchKeyChange: false,
    toAddDetail: false,
    keyboardHeight: 0,
    title: '',
    keyword: '',
    page: 1,
    hasMore: true,
    recordTime: 0,
    recording: false,
    searchResultList: [],
    singleResultArr: [],
    imageList: []
  },

  onReady() {
    this.videoContext = wx.createVideoContext('myVideo')
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
    wx.setKeepScreenOn({
      keepScreenOn: false
    });
  },

  onLoad: function(options) {
    self = this

    if (options.fid) {
      self.setData({
        fid: options.fid
      })
    }
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
      console.log(recordTime)

      if (self.data.recording) {
        self.setData({
          audioPrepareUrl: res.tempFilePath
        })
        self.uploadFile(res.tempFilePath, fileCatalog.audio)
      }
    })

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

    self.checkPost()

    self.setData({
      keyword: '如何提高写作能力'
    })
    var singleResultArr = self.getHilightStrArray('如何提高写作能力？使写作水平提高', self.data.keyword)
    self.setData({
      singleResultArr: singleResultArr
    })
  },

  getHilightStrArray: function(str, key) {
    return str.replace(new RegExp(`${key}`, 'g'), `%%${key}%%`).split('%%');
  },

  checkPost() {
    app.apimanager.getRequest(postInfoUrl, {
      fid: self.data.fid
    }).then(res => {
      if (res.Variables.swfconfig) {
        self.setData({
          uploadhash: res.Variables.swfconfig.hash,
          cityid: res.Variables.member_city,
          districtid: res.Variables.member_district,
          schoolid: res.Variables.member_school
        })
      }
      self.setData({
        classTypeList: res.Variables.threadtypes.newtypes,
        typeObj: res.Variables.threadtypes.types
      })
    }).catch(res => {})
  },

  searchThread() {
    var data = {
      subject: self.data.keyword,
      fid: self.data.fid,
      page: self.data.page,
      formhash: app.globalData.formhash
    }
    app.apimanager.getRequest(searchThreadUrl, data).then(res => {
      if (res.Variables) {
        var arr = res.Variables.thread
        for (let i = 0; i < arr.length; i++) {
          let resultItem = arr[i]
          var subjectArr = self.getHilightStrArray(resultItem.subject, self.data.keyword)
          resultItem['subjectArr'] = subjectArr
        }
        if (self.data.page > 1) {
          arr = self.data.searchResultList.concat(arr)
        }
        self.setData({
          searchResultList: arr,
          hasMore: true
        })
      } else {
        if (self.data.page == 1) {
          self.setData({
            searchResultList: []
          })
        }
        self.setData({
          hasMore: false
        })
      }
    }).catch(res => {})
  },

  addDetail(e) {
    self.setData({
      toAddDetail: true
    })
  },

  inputFocus(e) {
    self.setData({
      keyboardHeight: e.detail.height
    })
  },

  bindBlur(e) {
    self.setData({
      keyboardHeight: 0
    })
  },

  titleInput(e) {
    if (self.data.title != e.detail.value) {
      self.setData({
        toAddDetail: false
      })
      if (e.detail.value) {
        self.setData({
          searchKeyChange: true
        })
        self.setData({
          page: 1,
          keyword: e.detail.value
        })
        self.searchThread()
      } else {
        self.setData({
          searchKeyChange: false
        })
      }
    }
    self.setData({
      title: e.detail.value
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
      uid: uid
    }

    wx.showLoading({
      title: '上传附件',
      icon: 'loading'
    })
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
          console.log("图片")
          let imgObj = {
            aid: aid,
            src: uploadSrc
          }
          imageList.push(imgObj)
          self.setData({
            imageList: imageList
          })
        } else if (type == fileCatalog.audio) {
          console.log("音频")
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
      wx.hideLoading()
      wx.showModal({
        content: "上传失败",
        showCancel: false,
        confirmText: '确定'
      })
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
    if (self.data.audio) {
      wx.showToast({
        title: '最多上传一个语音',
        icon: 'none'
      })
      return
    }
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
      formatedRecordTime: '00:00'
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

  classTypeChange(e) {
    var classIndex = e.detail.value;
    console.log(classIndex)
    self.setData({
      classIndex: classIndex
    })
  },

  formSubmit(e) {
    let msg = e.detail.value.message
    let subject = e.detail.value.subject

    let isError = false
    let errStr = ''
    if (!subject) {
      isError = true
      errStr = '请输入标题'
    }

    var postDic = {
      formhash: app.globalData.formhash,
      message: util.filterEmoji(msg),
      subject: subject,
      special: 3, // 悬赏
      rewardprice: 1, // 悬赏金钱
      cityid: self.data.cityid,
      districtid: self.data.districtid,
      schoolid: self.data.schoolid
    }

    if (self.data.classTypeList) {
      if (!e.detail.value.classType) {
        isError = true
        errStr = '请选择提问类型'
      } else {
        let typeIndex = parseInt(e.detail.value.classType)
        let classObj = self.data.classTypeList[typeIndex]
        postDic['typeid'] = classObj.typeid
      }
    }

    if (isError) {
      self.setData({
        errorInfo: errStr,
        showTopTips: true,
      });
      setTimeout(function() {
        self.setData({
          showTopTips: false,
        });
      }, 2000)
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

    wx.showLoading({
      title: '发布中...',
      icon: 'loading'
    })
    self.setData({
      postLock: true
    })
    var url = postThreadUrl + '&fid=' + self.data.fid
    app.apimanager.postRequest(url, postDic).then(res => {
      wx.hideLoading()
      self.setData({
        postLock: false
      })
      if (res.Message.messageval.indexOf('succeed') != -1 || res.Message.messageval.indexOf('success') != -1) {
        let pages = getCurrentPages(); //获取当前页面 
        let prevPage = pages[pages.length - 2]; //获取上个页面 
        prevPage.setData({
          currentTab: 1
        })
        prevPage.refreshRequest()
        wx.navigateBack()
        wx.showToast({
          title: '发表成功',
          icon: 'success',
          mask: true,
          duration: 3000,
        })
      } else {
        wx.showToast({
          title: res.Message.messagestr,
          icon: 'none'
        })
      }
    }).catch(res => {
      console.log(res)
      wx.hideLoading()
      self.setData({
        postLock: false
      })
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },

  cellClick(e) {
    wx.navigateTo({
      url: '../question_answer_detail/question_answer_detail?tid=' + e.currentTarget.id,
    })
  },

  onPullDownRefresh: function() {

  },

  onReachBottom: function() {
    if (self.data.hasMore) {
      self.data.page++
        self.searchThread()
    }

  },

})