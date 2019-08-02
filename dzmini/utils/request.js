import cookies from '../vendor/weapp-cookie/dist/weapp-cookie'
const host = require('/../config').host

class request {
  constructor() {
    this._header = {}
  }

  /**
   * 设置统一的异常处理
   */
  setErrorHandler(handler) {
    this._errorHandler = handler;
  }

  /**
   * GET类型的网络请求
   */
  getRequest(url, data, header) {
    return this.requestAll(url, data, header, 'GET')
  }

  /**
   * DELETE类型的网络请求
   */
  deleteRequest(url, data, header = this._header) {
    return this.requestAll(url, data, header, 'DELETE')
  }

  /**
   * PUT类型的网络请求
   */
  putRequest(url, data, header = this._header) {
    return this.requestAll(url, data, header, 'PUT')
  }

  /**
   * POST类型的网络请求
   */
  postRequest(url, data, header = this._header) {
    header = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    return this.requestAll(url, data, header, 'POST')
  }


  /**
   * 上传附件的网络请求
   */
  uploadFile(url, filePath, name, data) {
    this.cookieManage()
    var requestCookies = cookies.getRequestCookies(host, '/');
    return new Promise((resolve, reject) => {
    wx.uploadFile({
      header: {
        Cookie: requestCookies,
      },
      url: url,
      filePath: filePath,
      name: name,
      formData: data,
      
      success(res) {
        resolve(res)
      },
      fail({errMsg}) {
        reject(errMsg)
      }
    })
    })

  }

  /**
   * 网络请求
   */
  requestAll(url, data, header, method) {

    this.cookieManage()

    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        success: (res => {
          
          if (res.statusCode === 200) {
            //200: 服务端业务处理正常结束
            if (res.data.Variables) {
              if (res.data.Variables.formhash) {
                getApp().globalData.formhash = res.data.Variables.formhash
              }
            }
            
            if (typeof res.data.Variables != "undefined" && res.data.Variables && res.data.Variables.member_uid==0){
              if (getApp().globalData.uid) {
                //如果member_uid为空则重新执行下登录
                getApp().relogin();
              } else if (res.data.Message != "undefined" && res.data.Message && res.data.Message.messageval.indexOf('to_login') != -1) {
                getApp().relogin();
              }
            }
            if (typeof res.data.Variables != "undefined" && res.data.Variables) {
              wx.setStorageSync('cookiepre', res.data.Variables.cookiepre)
            }
            resolve(res);
          } else {
            //其它错误，提示用户错误信息
            if (this._errorHandler != null) {
              //如果有统一的异常处理，就先调用统一异常处理函数对异常进行处理
              this._errorHandler(res)
            }
            reject(res)
          }
        }),
        fail: (res => {
          if (this._errorHandler != null) {
            this._errorHandler(res)
          }
          reject(res)
        })
      })
    })
  }

  /**
   * cookie编码
   */
  cookieManage() {
    let cookieJson = cookies.dir(host)
    let hostCookies = cookieJson[host]
    let pattern = /^[\u4E00-\u9FA5]{1,5}$|\t|\||\+|\/|,/;
    for (let cookiekey in hostCookies) {
      let cookieV = hostCookies[cookiekey]
      if (pattern.test(cookieV)) {
        let encodeCookieV = encodeURIComponent(cookieV)
        cookies.set(cookiekey, encodeCookieV, { domain: host })
      }
    }
  }
}
export default request