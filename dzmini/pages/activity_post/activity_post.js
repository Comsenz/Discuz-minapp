// pages/activity_post/activity_post.js
const postInfoUrl = require('../../config').postInfoUrl
const uploadFileUrl = require('../../config').uploadFileUrl
const postThreadUrl = require('../../config').postThreadUrl
const util = require('../../utils/util.js')
const datacheck = require('../../utils/datacheck.js')
const minImgDoc = require('../../config').minImgDoc
var self
const app = getApp()
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
    imageList: [],
    genderlist: [
      '不限',
      '男',
      '女'
    ],
    genderIndex: 0,
    postLock: false,
    activitytypelist: [],
    activityIndex: -1,
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

    let pages = getCurrentPages(); //获取当前页面 
    let prevPage = pages[pages.length - 2]; //获取上个页面  
    if (prevPage.data.dataDic.Variables.activity_setting.activitytype) {
      let activitytypelist = prevPage.data.dataDic.Variables.activity_setting.activitytype
      activitytypelist.push('自定义');
      self.setData({
        activitytypelist: activitytypelist
      });
    }
    self.checkPost()
  },

  checkPost() {
    var data = {
      fid: self.data.fid
    }
    var url = postInfoUrl + '&submodule=checkpost&version=5'
    app.apimanager.getRequest(url, data).then(res => {
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

    // app.apimanager.getRequest(postActivity, data).then(res => {
    //   if (res.Variables.activitytypelist) {
    //     var activitytypelist = res.Variables.activitytypelist
    //     activitytypelist.push('自定义')
    //     self.setData({
    //       activitytypelist: res.Variables.activitytypelist
    //     })
    //   }
    // }).catch(res => {})
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
          duration: app.globalData.duration
        })
        let aid = result.data
        if (type == fileCatalog.image) {
          var imageList = []
          let imgObj = {
            aid: aid,
            src: uploadSrc
          }
          imageList.push(imgObj)
          self.setData({
            imageList: imageList
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
      console.log(res)
      wx.showModal({
        content: "上传失败",
        showCancel: false,
        confirmText: '确定'
      })
    })
  },

  bindEnrolStartChange(e) {
    self.setData({
      enrolStart: e.detail.value
    })
  },

  bindEnrolEndChange(e) {
    self.setData({
      enrolEnd: e.detail.value
    })
  },

  activityDateStartChange(e) {
    self.setData({
      activityDateStart: e.detail.value
    })
  },

  activityTimeStartChange(e) {
    self.setData({
      activityTimeStart: e.detail.value
    })
  },

  activityDateEndChange(e) {
    self.setData({
      activityDateEnd: e.detail.value
    })
  },

  activityTimeEndChange(e) {
    self.setData({
      activityTimeEnd: e.detail.value
    })
  },

  bindGenderChange(e) {
    self.setData({
      genderIndex: e.detail.value
    })
  },

  activityTypeChange(e) {
    var activityIndex = e.detail.value
    self.setData({
      activityIndex: e.detail.value
    })
    if (activityIndex == self.data.activitytypelist.length - 1) {
      self.setData({
        isSelf: true,
        activitytype: ''
      })

    } else {
      self.setData({
        activitytype: self.data.activitytypelist[activityIndex]
      })
    }
  },

  formSubmit(e) {
    var errorInfo = ''
    var ifError = true
    if (!e.detail.value.subject) {
      errorInfo = '请输入标题'
    } else if (datacheck.isEmojiCharacter(e.detail.value.message) || datacheck.isEmojiCharacter(e.detail.value.subject)) {
      errorInfo = '不能使用emoji表情'
    } else if (!e.detail.value.activitytype) {
      errorInfo = '选择活动类型'
    } else if (!self.data.activityDateStart) {
      errorInfo = '选择活动开始时间'
    } else if (!self.data.activityDateStart) {
      errorInfo = '选择活动结束时间'
    } else if (!e.detail.value.activityplace) {
      errorInfo = '选择活动地点'
    } else {
      ifError = false
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

    var startTime = self.data.activityDateStart + " " + self.data.activityTimeStart
    var endTime = self.data.activityDateEnd + " " + self.data.activityTimeEnd

    var postData = {
      special: 4,
      formhash: app.globalData.formhash,
      allownoticeauthor: 1,
      subject: e.detail.value.subject,
      message: util.filterEmoji(e.detail.value.message),
      activitytime: 1,
      activityclass: e.detail.value.activitytype,
      'starttimefrom[1]': startTime,
      starttimeto: endTime,
      activityplace: e.detail.value.activityplace,
      activitynumber: e.detail.value.activitynumber,
      gender: self.data.genderIndex,
      activitycredit: e.detail.value.activitycredit,
      cost: e.detail.value.cost,
      activitystarttime: self.data.enrolStart,
      activityexpiration: self.data.enrolEnd,
      topicsubmit: 'yes',
    }

    if (self.data.imageList.length > 0) {
      for (let i = 0; i < self.data.imageList.length; i++) {
        let imgObj = self.data.imageList[i];
        let aid = imgObj['aid']
        let attachKey = "attachnew[" + aid + "][description]"
        postData[attachKey] = ''
      }
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
      console.log(res);
      self.setData({
        postLock: false
      })
      wx.hideLoading()
    })
  },

})