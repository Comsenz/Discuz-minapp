import request from './request.js'
const seccodeUrl = require('/../config').seccodeUrl
const codeImageUrl = require('/../config').codeImageUrl
const host = require('/../config').host

class apimanager {
  constructor() {
    this._defaultHeader = { 
      'Content-Type': 'application/json',
     }
    this._request = new request
    this._request.setErrorHandler(this.errorHander)
  }

  /**
   * 统一的异常处理方法
   */
  errorHander(res) {
    console.error(res)
  }

  /**
   * get请求
   */
  getRequest(url,data) {
    return this._request.getRequest(url, data, this._defaultHeader).then(res => res.data)
  }

  /**
   * post请求
   */
  postRequest(url, data) {
    return this._request.postRequest(url, data, this._defaultHeader).then(res => res.data)
  }

  /**
   * 上传附件请求
   */
  uploadFile(url, filePath, name, data) {
    return this._request.uploadFile(url, filePath, name, data).then(res => res.data)
  }

  // 封装验证码方法
  requstSeccode(type) {
    return this.reuestSeccodeUrl(type)
  }

  reuestSeccodeUrl(type) {
    var dic = { "type": type }
    return this._request.getRequest(seccodeUrl, dic, this._defaultHeader).then(res => {
      if (res.data.Variables && res.data.Variables.sechash) {
        let sechash = res.data.Variables.sechash
        let seccode = res.data.Variables.seccode
        return this.downloadSeccodeImage(seccode, sechash)
      } else {
        return res
      }
    })
  }

  downloadSeccodeImage(seccode, sechash) {
    var codeUrl = codeImageUrl + '&sechash=' + sechash
    return new Promise((resolve, reject) => {
      if (seccode) {
        wx.request({
          url: codeUrl,
          responseType: 'arraybuffer',
          success: (res => {
            let base64 = wx.arrayBufferToBase64(res.data)
            let imageSrc = 'data:image/jpg;base64,' + base64
            var dic = {
              imageSrc: imageSrc,
              seccode: seccode,
              sechash: sechash
            }
            resolve(dic)
          }),
          fail: (res => {
            reject(res)
          })
        })
      } else {
        reject(res)
      }
    })
  }
}
export default apimanager