import util from '../../utils/util.js';
const createClassUrl = require('../../config').createClassUrl;
const updateClassUrl = require('../../config').updateClassUrl;
const groupTypeUrl = require('../../config').groupTypeUrl;
const forumUrl = require('../../config').forumUrl;
const minImgDoc = require('../../config').minImgDoc;
var event = require('../../utils/event.js');
const datacheck = require('../../utils/datacheck.js');
const app = getApp();
var _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    minImgDoc: minImgDoc,
    fid:0,
    name:"",
    parentid: 0,
    forum: 0,
    fup: 0,
    descriptionnew:"",
    jointype:0,
    iconnew:"",
    iconnew_preview:"",
    cityList: {},
    areaList: {},
    _areaList: [],
    schoolList: {},
    _schoolList: [],
    isAreaLock: true,
    isSchoolLock: true,
    isShowEmpty: false,
    isShowResult: false,
    isUpdate:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    if(options.id){
      this.setData({
        fid:options.id,
        isUpdate:true,
      });
      wx.setNavigationBarTitle({
        title: '修改圈子',
      })
      this.initClassInfo();
    }else{
      this.loadSelectList(options);
    }
  },

  initClassInfo() {
    app.apimanager.getRequest(forumUrl, { fid: this.data.fid }).then(res => {
      _this.setData({ groupInfo: res.Variables.groupinfo });
    }).catch(res => {

    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
          _this.cityChange({ detail: { value: options.cityIndex } });
          _this.areaChange({ detail: { value: options.areaIndex } });
          _this.schoolChange({ detail: { value: options.schoolIndex } });
        });
      }
    }).catch(res => {

    })
  },
  cityChange(e) {
    var cityIndex = e.detail.value;
    var city = this.data.cityList[cityIndex];
    this.setData({ cityIndex: cityIndex, _areaList: _this.data.areaList[city['fid']], isAreaLock: false, _schoolList: [], areaIndex: -1, page: 1 });
  },
  areaChange(e) {
    var areaIndex = e.detail.value;
    var area = this.data._areaList[areaIndex];
    this.setData({ areaIndex: areaIndex, _schoolList: _this.data.schoolList[area['fid']], isSchoolLock: false, schoolIndex: -1, page: 1 });
  },
  schoolChange(e) {
    var schoolIndex = e.detail.value;
    var school = this.data._schoolList[schoolIndex];
    this.setData({ schoolIndex: schoolIndex, page: 1 });
  }, 
  formSubmit(e){
    if(this.data.isUpdate){
      this.update(e);
    }else{
      this.create(e);
    }
  },
  create(e){
    if (datacheck.isEmojiCharacter(e.detail.value.className) || datacheck.isEmojiCharacter(e.detail.value.classInfo)) {
      wx.showToast({
        title: '不能使用emoji表情',
        icon: 'none'
      })
      return;
    }
    var isPrivate = e.detail.value.isPrivate ? 2 : 0;
    var parentid = typeof this.data.cityList[this.data.cityIndex] != "undefined" ? this.data.cityList[this.data.cityIndex]['fid'] : 0;
    var forum = typeof this.data._areaList[this.data.areaIndex] != "undefined" ? this.data._areaList[this.data.areaIndex]['fid'] : 0;
    var fup = typeof this.data._schoolList[this.data.schoolIndex] != "undefined" ? this.data._schoolList[this.data.schoolIndex]['fid'] : 0;
    var data = {
      name: e.detail.value.className,
      descriptionnew: e.detail.value.classInfo,
      jointype: isPrivate,
      parentid: parentid,
      fup: forum,
      formhash: app.globalData.formhash,
      createsubmit: true,
      gviewperm: 1,
    };
    if (data.name.length == 0 || parentid == 0 || forum == 0) {
      this.setData({
        errorInfo: "圈子名称未填写或未选择二级分类",
        showTopTips: true,
      });
      setTimeout(function () {
        _this.setData({
          showTopTips: false,
        });
      }, 2000)
      return false;
    }
    wx.showLoading({
      title: '提交中',
    })
    if (_this.data.iconnew.length > 0) {
      app.apimanager.uploadFile(createClassUrl, _this.data.iconnew, "iconnew", data).then(res => {
        res = JSON.parse(res);
        console.log(res);
        _this.successHandle(res);
      }).catch(res => {
        wx.showToast({
          title: '出错了！',
          icon: 'none'
        })
      })
    } else {
      app.apimanager.postRequest(createClassUrl, data).then(res => {
        _this.successHandle(res);
      }).catch(res => {
        wx.showToast({
          title: '出错了！',
          icon: 'none'
        })
      })
    }
  },
  update(e){
    if (datacheck.isEmojiCharacter(e.detail.value.className) || datacheck.isEmojiCharacter(e.detail.value.classInfo)) {
      wx.showToast({
        title: '不能使用emoji表情',
        icon: 'none'
      })
      return;
    }
    var isPrivate = e.detail.value.isPrivate ? 2 : 0;
    var parentid = this.data.groupInfo.grouptype.first.fid;
    var forum = this.data.groupInfo.grouptype.second.fid;
    var data = {
      name: e.detail.value.className,
      descriptionnew: e.detail.value.classInfo,
      jointypenew: isPrivate,
      parentid: parentid,
      fup: forum,
      formhash: app.globalData.formhash,
      groupmanage: true,
      gviewperm: 1,
      fid:this.data.fid,
    };
    if (data.name.length == 0) {
      this.setData({
        errorInfo: "圈子名未填写",
        showTopTips: true,
      });
      setTimeout(function () {
        _this.setData({
          showTopTips: false,
        });
      }, 2000)
      return false;
    }
    wx.showLoading({
      title: '提交中',
    })
    if (_this.data.iconnew.length > 0) {
      app.apimanager.uploadFile(updateClassUrl, _this.data.iconnew, "iconnew", data).then(res => {
        res = JSON.parse(res);
        _this.successHandle(res);
      }).catch(res => {
        wx.showToast({
          title: '出错了！',
          icon: 'none'
        })
      })
    } else {
      app.apimanager.postRequest(updateClassUrl, data).then(res => {
        _this.successHandle(res);
      }).catch(res => {
        wx.showToast({
          title: '出错了！',
          icon: 'none'
        })
      })
    }
  },
  uploadPic(){
    wx.chooseImage({
      count:1,
      success: function(res) {
        console.log(res.tempFilePaths);
        _this.setData({
          iconnew:res.tempFilePaths[0],
          iconnew_preview: res.tempFilePaths[0],
        });
        console.log(_this.data)
      },
    })
  },
  successHandle(res){
    if (res.Message) {
      if (res.Message.messageval =='group_create_succeed'){
        wx.showModal({
          showCancel: false,
          content: res.Message.messagestr,
          success(data) {
            if (data.confirm) {
              event.emit('indexChanged', { fid: res.Variables.forum.fid, name:'createClass'});
              wx.navigateBack({
                delta: 10,
              })
            }
          }
        })
      }else{
        wx.showModal({
          showCancel: false,
          content: res.Message.messagestr,
          success(data) {
            if (data.confirm) {
              if (res.Message.messageval == 'group_setup_succeed') {
                event.emit('indexChanged', { fid: _this.data.fid });
                wx.navigateBack();
              }
            }
          }
        })

      }
    } else {

    }
    wx.hideLoading()
  }
})