import util from '../../utils/util.js';
const profileUrl = require('../../config').profileUrl;
const userAvatar = require('../../config').userAvatar;
const groupTypeUrl = require('../../config').groupTypeUrl;
const profileUpdateUrl = require('../../config').profileUpdateUrl;
const avatarUpdateUrl = require('../../config').avatarUpdateUrl;
const app = getApp();
var _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconnew:'',
    iconnew_preview:'',
    username: "",
    field1: 0,
    field2: 0,
    field3: 0,
    field4: false,
    mobile: "",
    cityList: {},
    areaList: {},
    _areaList: [],
    schoolList: {},
    _schoolList: [],
    isAreaLock: true,
    isSchoolLock: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var uid = app.globalData.uid;
    _this = this;
    this.setData({
      uid: uid,
      userAvatar: userAvatar,
    });
    app.apimanager.getRequest(profileUrl).then(res => {
      var username = res.Variables.member_nickname ? res.Variables.member_nickname : res.Variables.member_username;
      var avatar = res.Variables.member_avatar;
      _this.setData({
        username: username,
        avatar: avatar,
        field1: res.Variables.space.field1,
        field2: res.Variables.space.field2,
        field3: res.Variables.space.field3,
        field4: res.Variables.space.field4,
        mobile: res.Variables.space.mobile,
      });
      // this.loadSelectList({ cityIndex: res.Variables.space.field1, areaIndex: res.Variables.space.field2, schoolIndex: res.Variables.space.field3});
      console.log(res)
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
      console.log(res)
    })
  },
  loadSelectList: function (options) {
    app.apimanager.getRequest(groupTypeUrl).then(res => {
      var grouptype = res.Variables.grouptype;
      if (grouptype) {
        util.selectListUpdate(grouptype, function (cityList, areaList, schoolList) {
          _this.setData({
            "cityList": cityList,
            "areaList": areaList,
            "schoolList": schoolList,
          })
          var indexs = {
            cityIndex:'',
            areaIndex:'',
            schoolIndex:'',
          };
          for(var x in cityList){
            if (cityList[x].fid == options.cityIndex){
              indexs.cityIndex = x;
            }
          }
          for (var x in areaList[options.cityIndex]) {
            if (areaList[options.cityIndex][x].fid == options.areaIndex) {
              indexs.areaIndex = x;
            }
          }
          for (var x in schoolList[options.areaIndex]) {
            if (schoolList[options.areaIndex][x].fid == options.schoolIndex) {
              indexs.schoolIndex = x;
            }
          }
          console.log(indexs);
          _this.cityChange({ detail: { value: indexs.cityIndex } });
          _this.areaChange({ detail: { value: indexs.areaIndex } });
          _this.schoolChange({ detail: { value: indexs.schoolIndex } });
        });
      }
    }).catch(res => {
      console.log(res);
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },
  cityChange(e) {
    var cityIndex = e.detail.value;
    var city = this.data.cityList[cityIndex];
    if (!city) {
      var _areaList = [];
    } else {
      var _areaList = _this.data.areaList[city['fid']]
    }    
    this.setData({ cityIndex: cityIndex, _areaList: _areaList, isAreaLock: false, _schoolList: [], areaIndex: null, page: 1 });
  },
  areaChange(e) {
    var areaIndex = e.detail.value;
    var area = this.data._areaList[areaIndex];
    if(!area){
      var _schoolList = [];
    }else{
      var _schoolList = _this.data.schoolList[area['fid']]
    }
    this.setData({ areaIndex: areaIndex, _schoolList: _schoolList, isSchoolLock: false, schoolIndex: null, page: 1 });
  },
  schoolChange(e) {
    var schoolIndex = e.detail.value;
    var school = this.data._schoolList[schoolIndex];
    this.setData({ schoolIndex: schoolIndex, page: 1 });
  },

  formSubmit(e){
    this.setData({
      disabled:true,
    })
    if (_this.data.iconnew.length > 0) {
      app.apimanager.uploadFile(avatarUpdateUrl, _this.data.iconnew, "Filedata", {}).then(res => {
        res = JSON.parse(res);
        console.log(res);
        wx.showModal({
          showCancel: false,
          content: '修改成功',
          success: function (res) {
            wx.navigateBack();
          },
        })
        wx.hideLoading()
      }).catch(res => {
        wx.showModal({
          showCancel: false,
          content: '修改失败',
          success: function (res) {
            _this.setData({
              disabled: false,
            })
          },
        })
        wx.hideLoading()
      })
    }else{
      wx.showModal({
        showCancel: false,
        content: '请先上传头像在保存',
        success: function (res) {
          _this.setData({
            disabled: false,
          })
        },
      })
    }
  },
  // formSubmit(e) {
  //   var field1 = typeof this.data.cityList[this.data.cityIndex] != "undefined" ? this.data.cityList[this.data.cityIndex]['fid'] : 0;
  //   var field2 = typeof this.data._areaList[this.data.areaIndex] != "undefined" ? this.data._areaList[this.data.areaIndex]['fid'] : 0;
  //   var field3 = typeof this.data._schoolList[this.data.schoolIndex] != "undefined" ? this.data._schoolList[this.data.schoolIndex]['fid'] : 0;
  //   var field4 = this.data.field4;
  //   var data = {
  //     realname: e.detail.value.username,
  //     field4: field4,
  //     field1: field1,
  //     field2: field2,
  //     field3: field3,
  //     mobile: e.detail.value.mobile,
  //     formhash: app.globalData.formhash,
  //     profilesubmit: true,
  //   };
  //   if (data.realname.length == 0) {
  //     this.setData({
  //       errorInfo: "昵称不可为空",
  //       showTopTips: true,
  //     });
  //     setTimeout(function () {
  //       _this.setData({
  //         showTopTips: false,
  //       });
  //     }, 2000);
  //     return false;
  //   }
  //   wx.showLoading({
  //     title: '提交中',
  //   })
  //   app.apimanager.postRequest(profileUpdateUrl, data,{},'html').then(res => {
  //     if(res.indexOf('show_success') != -1){
  //       if (_this.data.iconnew.length > 0) {
  //         app.apimanager.uploadFile(avatarUpdateUrl, _this.data.iconnew, "Filedata", {}).then(res => {
  //           res = JSON.parse(res);
  //           console.log(res);
  //           wx.showModal({
  //             showCancel: false,
  //             content: '修改成功',
  //           })
  //           wx.hideLoading()
  //         }).catch(res => {
  //           wx.hideLoading()
  //         })
  //       } else {
  //         wx.showModal({
  //           showCancel: false,
  //           content: '修改成功',
  //         })
  //         wx.hideLoading()
  //       }
  //     }else{
  //       if (res.indexOf('show_error("mobile"') != -1){
  //         wx.showModal({
  //           showCancel: false,
  //           content: '手机号格式不正确',
  //         })
  //       }else{
  //         wx.showModal({
  //           showCancel: false,
  //           content: '参数异常',
  //         })
  //       }
  //       wx.hideLoading()
  //     }
  //   }).catch(res => {
  //     wx.hideLoading()
  //   })
  // },
  uploadPic() {
    wx.chooseImage({
      count: 1,
      success: function (res) {
        _this.setData({
          iconnew: res.tempFilePaths[0],
          iconnew_preview: res.tempFilePaths[0],
        });
      },
    })
  },
  tishi:function(){
    wx.showModal({
      showCancel: false,
      content: '本版本暂不支持修改昵称',
    })
  },
  changeField4(e){
    this.setData({
      field4: e.currentTarget.dataset.name,
    });
  }
})