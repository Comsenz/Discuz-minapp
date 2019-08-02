// component/secode/secode.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    codeShow:{
      type: Boolean,
      observer: '_codeShowChange',
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    codeShow:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _codeShowChange(newVal, oldVal) {
      this.setData({
        codeShow: newVal
      })
    },

    requestCode(type) {
      this.setData({
        codetype:type
      })
      app.apimanager.requstSeccode(type).then(res => {
        if (res.sechash) {
          this.setData({
            sechash: res.sechash,
            imageSrc: res.imageSrc
          })
        }
      }).catch(res => { })
    },

    haveCode() {
      if (this.data.sechash) {
        return true
      }
      return false
    },

    formSubmit(e) {
      if (this.data.sechash) {
        var options = {
          sechash: this.data.sechash,
          seccodeverify: e.detail.value.seccodeverify
        }
        this.triggerEvent('secodeSubmit', options)
      }
    },

    downSeccode() {
      this.requestCode(this.data.codetype)
    },

    showSecode() {
      this.setData({
        codeShow: true
      })
    },

    hideSecode() {
      this.setData({
        codeShow:false
      })
    },
    contain() {

    }
  }
})
