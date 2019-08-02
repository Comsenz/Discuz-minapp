// component/select_identifyMask/select_identifyMask.js
const minImgDoc = require('../../config').minImgDoc
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    selectShow: {
      type: Boolean,
      observer: '_selectShowChange',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow:false,
    minImgDoc: minImgDoc,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _selectShowChange(newVal, oldVal) {
      console.log('joinshow',newVal)
      this.setData({isShow:newVal})
    },
    close() {
      this.setData({ isShow:false})
      this.properties.selectShow = false
    },
    mineInfo(e) {
      wx:wx.navigateTo({
        url: '/pages/course_mineInfo/course_mineInfo?selectid=' + e.currentTarget.id,
      })
    }
  }
})
