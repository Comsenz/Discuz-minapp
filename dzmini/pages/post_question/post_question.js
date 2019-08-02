// pages/post_question/post_question.js
const postInfoUrl = require('../../config').postInfoUrl
const uploadFileUrl = require('../../config').uploadFileUrl
const postThreadUrl = require('../../config').postThreadUrl
const minImgDoc = require('../../config').minImgDoc
const util = require('../../utils/util.js')
const datacheck = require('../../utils/datacheck.js')
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

  /**
   * 页面的初始数据
   */
  data: {
    minImgDoc: minImgDoc,
    choices: 1,
    slide_list: [{
        image: {},
        text: '',
        marginL: 0
      },
      {
        image: {},
        text: '',
        marginL: 0
      }
    ],
    visibilitypoll: 1,
    overt: 0,
    postLock: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    self = this
    if (options.fid) {
      this.setData({
        fid: options.fid
      })
    }
    self.checkPost()
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
      self.setData({
        classTypeList: array,
        typeObj: res.Variables.threadtypes.types
      })
    }).catch(res => {})
  },

  touchS: function(e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },

  touchM: function(e) {
    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = 130;
      var marginL = "";
      if (disX == 0 || disX < 0) {
        marginL = 0;
      } else if (disX > 0) {
        if (disX >= delBtnWidth) {
          disX = delBtnWidth;
        }
        marginL = -disX;
      }
      var index = e.currentTarget.dataset.index;
      var slide_list = this.data.slide_list;
      for (var i = 0; i < slide_list.length; i++) {
        slide_list[i].marginL = 0;
      }
      slide_list[index].marginL = marginL;
      this.setData({
        slide_list: slide_list,
      });
    }
  },

  touchE: function(e) {
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = 130;
      var marginL = disX > delBtnWidth / 2 ? -130 : 0;
      var index = e.currentTarget.dataset.index;
      var slide_list = this.data.slide_list;
      slide_list[index].marginL = marginL;
      //更新列表的状态
      this.setData({
        slide_list: slide_list,
      });
    }
  },

  radioChange(e) {
    self.setData({
      choices: e.detail.value
    })
  },

  addPolloption() {
    if (this.data.slide_list.length >= 20) {
      self.setData({
        errorInfo: '最多添加20个选项',
        showTopTips: true,
      });
      setTimeout(function () {
        self.setData({
          showTopTips: false,
        });
      }, 2000)
      return;
    }
    var newPolloption = {}
    this.data.slide_list.push(newPolloption)
    this.setData({
      slide_list: this.data.slide_list
    })
  },

  deletePolloption(e) {
    if (this.data.slide_list.length <= 2) {
      self.setData({
        errorInfo: '最少两个选项',
        showTopTips: true,
      });
      setTimeout(function() {
        self.setData({
          showTopTips: false,
        });
      }, 2000)
      return
    }
    var index = e.currentTarget.id
    console.log(index);
    this.data.slide_list.splice(index, 1)
    this.setData({
      slide_list: this.data.slide_list
    })
  },

  chooseImage(e) {
    var index = e.currentTarget.id
    wx.chooseImage({
      count: 1,
      success(res) {
        for (let key in res.tempFilePaths) {
          let imageSrc = res.tempFilePaths[key]
          self.uploadFile(imageSrc, fileCatalog.image, index)
        }

      }
    })
  },

  uploadFile(uploadSrc, type, index) {
    var uploadUrl = uploadFileUrl + '&operation=poll&fid=' + self.data.fid
    let uid = app.globalData.uid
    let postDic = {
      hash: self.data.uploadhash,
      uid: uid
    }
    wx.showLoading({
      title: '上传附件',
      icon: 'loading'
    })
    app.apimanager.uploadFile(uploadUrl, uploadSrc, 'Filedata', postDic).then(res => {
      var result = JSON.parse(res)
      wx.hideLoading()
      if (result.aid) {
        var aid = result.aid
        let image = {
          aid: aid,
          src: uploadSrc
        }
        self.data.slide_list[index].image = image
        self.setData({
          slide_list: self.data.slide_list,
        })
      } else {
        wx.showModal({
          content: '上传失败1',
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

  radioChange(e) {
    this.setData({
      choices: e.detail.value
    })
  },

  checkboxChange(e) {
    console.log(e.detail.value)
    if (e.detail.value.length == 0) {
      this.setData({
        overt: 0,
        visibilitypoll: 0
      })
    } else {
      if (e.detail.value.indexOf('visibilitypoll') != -1) {
        this.setData({
          visibilitypoll: 1
        })
      } else {
        this.setData({
          visibilitypoll: 0
        })
      }
      if (e.detail.value.indexOf('overt') != -1) {
        this.setData({
          overt: 1
        })
      } else {
        this.setData({
          overt: 0
        })
      }
    }
  },

  inputNameChange(e) {
    var index = e.currentTarget.id;
    if (datacheck.isEmojiCharacter(e.detail.value)) {
      errorInfo = '不能使用emoji表情'
      ifError = true
    }
    this.data.slide_list[index]['text'] = e.detail.value;
  },

  formSubmit(e) {
    var errorInfo = ''
    var ifError = false
    var polloption = []
    var pollimage = []
    for (let i = 0; i < this.data.slide_list.length; i++) {
      var slide = this.data.slide_list[i]
      if (slide.text) {
        polloption.push(util.filterEmoji(slide.text))
      } else {
        var errorInfo = '投票选项为空'
        ifError = true
        break
      }
      if (slide.image && slide.image.aid) {
        pollimage.push(slide.image.aid)
      }
    }
    if (!e.detail.value.subject) {
      errorInfo = '请输入标题'
      ifError = true
    } else if (e.detail.value.subject.match(getApp().globalData.emoji)) {
      errorInfo = '标题不能使用emoji表情'
      ifError = true
    }
    else if (datacheck.isEmojiCharacter(e.detail.value.message) || datacheck.isEmojiCharacter(e.detail.value.subject)) {
      errorInfo = '不能使用emoji表情'
      ifError = true
    }

    if (ifError) {
      self.setData({
        errorInfo: errorInfo,
        showTopTips: true,
      });
      setTimeout(function() {
        self.setData({
          showTopTips: false,
        });
      }, 2000)
      return
    }

    var maxchoices = (this.data.choices == 1 ? 1 : self.data.slide_list.length)
    var postData = {
      formhash: app.globalData.formhash,
      allownoticeauthor: 1,
      maxchoices: maxchoices,
      subject: e.detail.value.subject,
      message: util.filterEmoji(e.detail.value.message),
      visibilitypoll: this.data.visibilitypoll,
      overt: this.data.overt,
      expiration: e.detail.value.expiration,
      special: 1,
      topicsubmit:'yes',
    }

    for (let i = 0; i < polloption.length; i++) {
      let pokey = "polloption[" + i + "]"
      postData[pokey] = polloption[i]
    }
    for (let i = 0; i < pollimage.length; i++) {
      let poimgkey = "pollimage[" + i + "]"
      postData[poimgkey] = pollimage[i]
    }

    let requestUrl = postThreadUrl + '&fid=' + self.data.fid
    wx.showLoading({
      title: '发布中...',
      icon: 'loading'
    })
    self.setData({
      postLock: true
    })
    app.apimanager.postRequest(requestUrl, postData).then(res => {
      wx.hideLoading()
      self.setData({
        postLock: false
      })
      if (res.Message.messageval.indexOf('succeed') != -1) {
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2]; //上一个页面
        prevPage.refreshRequest()
        wx.navigateBack({})
      }
      wx.showToast({
        title: res.Message.messagestr,
        icon: 'none'
      })
    }).catch(res => {
      self.setData({
        postLock: false
      })
      wx.hideLoading()
    })
  },

})