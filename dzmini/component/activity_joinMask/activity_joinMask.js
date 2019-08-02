// component/activity_joinMask/activity_joinMask.js
const minImgDoc = require('../../config').minImgDoc
const activityAppliesUrl = require('../../config').activityAppliesUrl
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
    specialActivity: {
      type: Object,
      observer: '_specialActivityChange',
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
    joinShow: true,
    specialActivity: {},
    joinfield: {},
    acPostData:{}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _joinShowChange(newVal, oldVal) {
      this.setData({
        joinShow: newVal
      });
      console.log('jajajajajaja')
    },
    _specialActivityChange(newVal, oldVal) {
      if (newVal) {
        this.setData({
          specialActivity: newVal,
          joinfield: newVal.joinfield
        });
      }
      console.log(this.data.joinfield)
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
    formSubmit(e) {
      
      wx.showLoading({
        title: '正在报名',
        icon: 'loading'
      })
      console.log(this.data.acPostData)
      var dic = e.detail.value;
      dic['tid'] = this.data.acPostData.tid;
      dic['fid'] = this.data.acPostData.fid;
      dic['pid'] = this.data.acPostData.pid;
      dic['formhash'] = app.globalData.formhash
      dic['activitysubmit'] = true

      app.apimanager.postRequest(activityAppliesUrl, dic).then(res => {
        wx.hideLoading()
        if (res.Message.messageval == 'activity_completion') {
          this.setData({
            joinShow: false
          })
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
    },

  }
})