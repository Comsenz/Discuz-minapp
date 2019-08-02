// component/course_joinMask/course_joinMask.js
const courseSignupUrl = require('../../config').courseSignupUrl
const courseProfile = require('../../config').courseProfile
const saveformidUrl = require('../../config').saveformidUrl
const activityAppliesUrl = require('../../config').activityAppliesUrl
const minImgDoc = require('../../config').minImgDoc
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    joinShow: {
      type: Boolean,
      observer: '_joinShowChange',
    },
    cid: {
      type: String,
      observer: '_cidChange',
    },
    acPostData: {
      type: Object,
      observer: '_acPostDataChange',
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    minImgDoc: minImgDoc,
    joinShow: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _joinShowChange(newVal, oldVal) {
      this.setData({
        joinShow: newVal
      })
      if (newVal == true) {
        this.loadProfile()
      }
    },
    _cidChange(newVal, oldVal) {
      this.setData({
        cid: newVal
      })
    },
    _acPostDataChange(newVal, oldVal) {
      this.setData({
        acPostData: newVal
      })
    },
    closeMask() {
      this.setData({
        joinShow: false
      })
    },

    loadProfile() {
      app.apimanager.getRequest(courseProfile).then(res => {
        var data = res.Variables.data
        var myDate = new Date();

        var grade = 0
        if (myDate.getFullYear() >= data.enrollmentyear) {
          grade = myDate.getFullYear() - data.enrollmentyear
          if (myDate.getMonth >= 9) {
            grade += 1
          }
        }
        this.setData({
          userinfo: data,
          grade: grade
        })
        self.loadSelectList()
      }).catch(res => {})
    },

    formSubmit(e) {
      this.setData({
        joinShow: false
      })

      wx.showLoading({
        title: '正在报名',
        icon: 'loading'
      })
      if (this.data.cid) {
        if (e.detail.formId) {
          var formId = e.detail.formId
          if (formId.indexOf('fail') == -1 && formId.indexOf('mock') == -1) {
            app.apimanager.getRequest(saveformidUrl, {
              formid: formId
            }).then(res => {}).catch(res => {})
          }
        }

        var data = {
          cid: this.data.cid,
          formhash: app.globalData.formhash,
          classtosignupsubmit: true
        }
        
        app.apimanager.postRequest(courseSignupUrl, data).then(res => {
          wx.hideLoading()
          if (res.Variables.code == -1) { // 参数错

          } else if (res.Variables.code == 0) { // 成功
            this.triggerEvent('joinSucceed')
          } else if (res.Variables.code == -2) { // 报过了

          }
          wx.showModal({
            content: res.Variables.message,
            showCancel: false,
            confirmText: '知道了'
          })

        }).catch(res => {
          wx.hideLoading()
        })
      } else {
        var dic = this.data.acPostData
        dic['activitysubmit'] = true
        if (e.detail.value.message) {
          dic['message'] = e.detail.value.message
        }

        app.apimanager.postRequest(activityAppliesUrl, dic).then(res => {
          wx.hideLoading()
          if (res.Message.messageval == 'activity_completion') {
            this.triggerEvent('joinSucceed')
          }
          wx.showModal({
            content: res.Message.messagestr,
            showCancel: false,
            confirmText: '知道了'
          })
        }).catch(res => {
          wx.hideLoading()
        })
      }

    }
  }
})