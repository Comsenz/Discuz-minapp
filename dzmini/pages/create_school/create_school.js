import util from '../../utils/util.js';
const createTypeUrl = require('../../config').createTypeUrl;
const groupTypeUrl = require('../../config').groupTypeUrl;
const datacheck = require('../../utils/datacheck.js');
const app = getApp();
var _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    schoolType: ["幼儿园", "小学", "初中","培训机构"],
    isAreaLock:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    this.loadSelectList(options);
  },
  schoolTypeChange:function(e){
    var index = e.detail.value;
    this.setData({
      schoolTypeIndex:index,
    });
  },
  cityChange(e) {
    var cityIndex = e.detail.value;
    var city = this.data.cityList[cityIndex];
    console.log(city);
    console.log(_this.data.areaList[city['fid']]);
    this.setData({ cityIndex: cityIndex, _areaList: _this.data.areaList[city['fid']], isAreaLock: false,  areaIndex: -1, page: 1 });
  },
  areaChange(e) {
    var areaIndex = e.detail.value;
    var area = this.data._areaList[areaIndex];
    this.setData({ areaIndex: areaIndex});
  },  
  loadSelectList: function (options) {
    app.apimanager.getRequest(groupTypeUrl).then(res => {
      var grouptype = res.Variables.grouptype;
      if (grouptype) {
        util.selectListUpdate(grouptype, function (cityList, areaList, schoolList) {
          _this.setData({
            "cityList": cityList,
            "areaList": areaList,
          })
        });
      }
    }).catch(res => {
      console.log(res);
    })
  },  
  formSubmit:function(e){
    var parentid = typeof this.data.cityList[this.data.cityIndex] != "undefined" ? this.data.cityList[this.data.cityIndex]['fid'] : 0;
    var forum = typeof this.data._areaList[this.data.areaIndex] != "undefined" ? this.data._areaList[this.data.areaIndex]['fid'] : 0;
    var schoolType = typeof this.data.schoolType[this.data.schoolTypeIndex] != "undefined" ? this.data.schoolType[this.data.schoolTypeIndex] : "";
    var data = {
      parentid: parentid,
      formhash: app.globalData.formhash,
      forumtype: 3,      
      forumid: forum,
      schooltype: schoolType,
      name: e.detail.value.schoolName,
      description: e.detail.value.schoolInfo,
      siteurl: e.detail.value.website,
      zipcode: e.detail.value.postcode,
      address: e.detail.value.address,
      mobile: e.detail.value.tel,
    };
    if (data.parentid == 0) {
      this.setData({
        errorInfo: "请选择城市",
        showTopTips: true,
      });
      setTimeout(function () {
        _this.setData({
          showTopTips: false,
        });
      }, 2000)
      return false;
    }
    if (data.forumid == 0) {
      this.setData({
        errorInfo: "请选择地区",
        showTopTips: true,
      });
      setTimeout(function () {
        _this.setData({
          showTopTips: false,
        });
      }, 2000)
      return false;
    }    
    if (data.name.length == 0) {
      this.setData({
        errorInfo: "请输入学校名",
        showTopTips: true,
      });
      setTimeout(function () {
        _this.setData({
          showTopTips: false,
        });
      }, 2000)
      return false;
    }
    if (datacheck.isEmojiCharacter(data.name)) {
      wx.showModal({
        showCancel: false,
        content: '不能使用emoji表情',
      })
      return false;
    }  
    wx.showLoading({
      title: '提交中',
    })
    app.apimanager.postRequest(createTypeUrl, data).then(res => {
      if (res.Message.messageval == 'forumtype_create_succeed') {
        wx.showModal({
          showCancel: false,
          content: '创建成功',
          success(data) {
            if (data.confirm) {
              var pages = getCurrentPages();
              var prevPage = pages[pages.length - 2];
              prevPage.setData({
                isback: true,
              })        
              wx.navigateBack()
            }
          }
        })
      } else {
        wx.showModal({
          showCancel: false,
          content: res.Message.messagestr,
        })
      }
      wx.hideLoading();
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })    
  },
})