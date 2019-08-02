import util from '../../utils/util.js';
const groupTypeUrl = require('../../config').groupTypeUrl;
const searchClassUrl = require('../../config').searchClassUrl;
const defaultIcon = require('../../config').defaultIcon;
const userAvatar = require('../../config').userAvatar;
const joinClassUrl = require('../../config').joinClassUrl;
var event = require('../../utils/event.js');
const app = getApp();
var _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultIcon: defaultIcon,
    userAvatar: userAvatar,
    list:[],
    cityList:{},
    areaList:{},
    _areaList:[],
    schoolList:{},
    _schoolList:[],
    isAreaLock:true,
    isSchoolLock:true,
    isShowEmpty:false,
    isShowResult:false,
    keywords:'',
    search_type:0,
    page:1,
    cityIndex:-1,
    areaIndex:-1,
    schoolIndex:-1,
    isback:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    this.loadSelectList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.data.isback){
      this.loadSelectList();
    }
  },
  cleanInput(){
    this.setData({ keywords:''});
  },
  setInput(e){
    if (e.detail.value.length >0){
      this.setData({ isShowEmpty: true });
    }else{
      this.setData({isShowEmpty: false});
    }
    this.setData({
      keywords:e.detail.value,
      page:1,
    })
    this.getResult();
  },
  searchResult(e) {
    var type = e.currentTarget.dataset.type;
    this.setData({
      page: 1,
      search_type:type,
    })
    this.getResult();
  },
  loadSelectList:function(){
    app.apimanager.getRequest(groupTypeUrl).then(res => {
      var grouptype = res.Variables.grouptype;
      if(grouptype){
        util.selectListUpdate(grouptype,function(cityList,areaList,schoolList){
          _this.setData({
            "cityList": cityList,
            "areaList":areaList,
            "schoolList":schoolList,
          })
          if(_this.data.isback){
            if (_this.data.cityIndex >= 0) {
              var city = _this.data.cityList[_this.data.cityIndex];
              _this.setData({
                _areaList: _this.data.areaList[city['fid']],
              });
            }
            if (_this.data.areaIndex >= 0) {
              var area = _this.data._areaList[_this.data.areaIndex];
              _this.setData({
                _schoolList: _this.data.schoolList[area['fid']],
              });
            }
          }
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
    this.setData({ cityIndex: cityIndex, _areaList: _this.data.areaList[city['fid']], isAreaLock: false, _schoolList: [], areaIndex: -1,page:1});
    this.getResult();
  },  
  areaChange(e) {
    var areaIndex = e.detail.value;
    var area = this.data._areaList[areaIndex];
    this.setData({ areaIndex: areaIndex, _schoolList: _this.data.schoolList[area['fid']], isSchoolLock: false, schoolIndex: -1, page: 1});
    this.getResult();
  }, 
  schoolChange(e) {
    var schoolIndex = e.detail.value;
    var school = this.data._schoolList[schoolIndex];
    this.setData({ schoolIndex: schoolIndex, page: 1});
    this.getResult();
  }, 
  getResult(isMore){
    this.setData({
      isShowResult:true,
    })
    var kw = this.data.keywords;
    var groupid = typeof this.data.cityList[this.data.cityIndex] != "undefined"? this.data.cityList[this.data.cityIndex]['fid']:'';
    var forumid = typeof this.data._areaList[this.data.areaIndex] != "undefined"? this.data._areaList[this.data.areaIndex]['fid'] : '';
    var subid = typeof this.data._schoolList[this.data.schoolIndex] != "undefined"? this.data._schoolList[this.data.schoolIndex]['fid'] :'';
    var data = {
      page: this.data.page,
    };
    if(kw != '') data.kw = kw;
    if (groupid != '') data.groupid = groupid;
    if (forumid != '') data.forumid = forumid;
    if (subid != '') data.subid = subid;
    
    app.apimanager.getRequest(searchClassUrl,data).then(res => {
      var grouplist = res.Variables.grouplist;
      if (isMore){
        grouplist = _this.data.list.concat(grouplist);
      }
      if (grouplist.length == 0 && this.data.search_type == 1){
        this.setData({
          search_type: 0,
        })
        wx.showToast({
          title: '没有搜索到该圈子！',
          icon: 'none'
        })
      }
      if (grouplist){
        this.setData({
          page: _this.data.page+1,
          search_type:0,
          list:grouplist,
        })
      }
    }).catch(res => {
    })
  },
  onReachBottom:function(){
    this.getResult(true);
  },
  goToCreateClass:function(){
    wx.navigateTo({
      url: '../create_class/create_class?cityIndex=' + _this.data.cityIndex + '&areaIndex=' + _this.data.areaIndex + '&schoolIndex=' + _this.data.schoolIndex,
    })
  },
  gotoClass:function(e){
    var id = e.currentTarget.dataset.id;
    event.emit('indexChanged', { fid: id, name: "enter" });
    wx.navigateBack();
  },
  joinClass:function(e){
    var id = e.currentTarget.dataset.id;
    app.apimanager.getRequest(joinClassUrl,{fid:id}).then(res => {
      console.log(res)
      if (res.Message) {
        if (res.Message.messageval == "group_join_succeed"){
          event.emit('indexChanged', { fid:id  });
          wx.navigateBack();
        }else{
          wx.showModal({
            showCancel: false,
            content: res.Message.messagestr,
            success(res) {
            }
          })
        }
      }else{

      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  }
})