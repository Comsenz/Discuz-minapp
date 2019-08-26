import cookies from '../vendor/weapp-cookie/dist/weapp-cookie'

function loginOut() {
  let uid = getApp().globalData.uid
  if (uid) {
    getApp().globalData.uid = ''
    getApp().globalData.avatar = ''
    getApp().globalData.username = ''
    wx.removeStorageSync('uid')
    let cookiepre = wx.getStorageSync('cookiepre')
    let authKey = cookiepre + "auth"
    if (cookies.has(authKey)) {
      cookies.remove(authKey)
    }
  }
}

function loginSetUserInfo(obj) {
  wx.setStorageSync('uid', obj.Variables.member_uid)
  getApp().globalData.uid = obj.Variables.member_uid
  getApp().globalData.avatar = obj.Variables.member_avatar
  getApp().globalData.username = obj.Variables.member_username
}

function isLogin() {
  if (getApp().globalData.uid) {
    return true
  }
  toLogin()
  return false
}

function toLogin() {
  wx.navigateTo({
    url: '/pages/login/login',
  });
}

var openid = ''
var unionid = ''

module.exports = {
  loginOut: loginOut,
  loginSetUserInfo: loginSetUserInfo,
  isLogin: isLogin,
  toLogin: toLogin,
  openid: openid,
  unionid: unionid
}