const threadTypeUrl = require('../../config').threadTypeUrl;
const app = getApp();
var _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_remove:-1,
    uid: false,
    slide_list: [

    ],
    new_slide_list: [

    ]    
  },
  inputSortChange(e){
    var dataset = e.currentTarget.dataset;
    var index = dataset.index;
    var value = e.detail.value;
    if(dataset.type == 'old'){
      var slide_list = this.data.slide_list;
      slide_list[index]['displayorder'] = value;
      this.setData({
        slide_list: slide_list
      })
    }else{
      var new_slide_list = this.data.new_slide_list;
      new_slide_list[index]['displayorder'] = value;
      this.setData({
        new_slide_list: new_slide_list
      })
    }
  },
  inputNameChange(e) {
    var dataset = e.currentTarget.dataset;
    var index = dataset.index;
    var value = e.detail.value;
    if (dataset.type == 'old') {
      var slide_list = this.data.slide_list;
      slide_list[index]['name'] = value;
      this.setData({
        slide_list: slide_list
      })
    } else {
      var new_slide_list = this.data.new_slide_list;
      new_slide_list[index]['name'] = value;
      this.setData({
        new_slide_list: new_slide_list
      })
    }
  },  
  no_remove:function(){
    var that = this;
    that.setData({
      is_remove: -1,
      is_remove_new:-1,
    }) 
  },
  remove:function(e){
    var that=this;
    if (e.currentTarget.dataset.index==that.data.is_remove){
      that.setData({
        is_remove: -1,
        is_remove_new: -1,
      }) 
    }else{
      that.setData({
        is_remove: e.currentTarget.dataset.index,
        is_remove_new:-1,
      })
    }
  },
  removeNew: function (e) {
    var that = this;
    if (e.currentTarget.dataset.index == that.data.is_remove) {
      that.setData({
        is_remove: -1,
        is_remove_new:-1,
      })
    } else {
      that.setData({
        is_remove:-1,
        is_remove_new: e.currentTarget.dataset.index
      })
    }
  },  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    var fid = options.id;
    this.setData({
      fid: fid
    });
    this.getTagsByFid(fid);
  },
  getTagsByFid: function (fid) {
    var data = {
      fid:fid
    };
    app.apimanager.getRequest(threadTypeUrl, data).then(res => {
      for (var x in res.Variables.threadtypes){
        res.Variables.threadtypes[x]['marginL'] = 0;
      }
      this.setData({
        slide_list:res.Variables.threadtypes,
      });
      console.log(res.Variables.threadtypes);
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },
  addMore:function(e){
    var length = this.data.new_slide_list.length + this.data.slide_list.length;
    if(length == 20){
      return false;
    }
    var new_slide_list = this.data.new_slide_list;
    new_slide_list.push({
      marginL:0,
    });
    this.setData({
      new_slide_list: new_slide_list
    });
  },
  formSubmit(e) {
    var data = {
      fid: this.data.fid,
      formhash: app.globalData.formhash,
    };
    var slide_list = this.data.slide_list;
    console.log('old data',slide_list);
    var new_slide_list = this.data.new_slide_list;

    // if (slide_list.length == 0 && new_slide_list.length == 0) {
    //   wx.showToast({
    //     title: '至少添加一个分类！',
    //     icon: 'none'
    //   })
    //   return;
    // }
    
    console.log('new data', new_slide_list);
    for(var x in slide_list){
      if (slide_list[x]['name'] != ''){
        data['name[' + slide_list[x]['typeid'] + ']'] = slide_list[x]['name'];
        data['displayorder[' + slide_list[x]['typeid'] + ']'] = slide_list[x]['displayorder'];
      }
    }
    for (var x in new_slide_list) {
      if (typeof new_slide_list[x]['name'] != "undefined"){
        data['newname[' + x + ']'] = new_slide_list[x]['name'];
        data['newdisplayorder[' + x + ']'] = new_slide_list[x]['displayorder'];
      }
    }    
    console.log(data);
    app.apimanager.postRequest(threadTypeUrl, data).then(res => {
      if (res.Message && res.Message.messageval == "group_threadtype_edit_succeed"){
        wx.showModal({
          showCancel: false,
          content: '保存成功',
          success(data) {
            if (data.confirm) {
              wx.navigateBack({});
            }
          }
        })
      }else{
        if (res.Message && res.Message.messagestr) {
          wx.showModal({
            showCancel: false,
            content: res.Message.messagestr,
          })
        }
      }
    }).catch(res => {
      console.log(res);
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },
  deleteTag(e) {
    var id = e.currentTarget.dataset.id;
    var data = {
      fid: this.data.fid,
      formhash: app.globalData.formhash,
    };
    data['delete['+id+']'] = id;
    app.apimanager.postRequest(threadTypeUrl, data).then(res => {
      if (res.Message.messageval == "group_threadtype_edit_succeed") {
        _this.getTagsByFid(_this.data.fid);
      } else {
        wx.showModal({
          showCancel: false,
          content: res.Message.messagestr,
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },  
  deleteTagNew(e){
    var index = e.currentTarget.dataset.index;
    var new_slide_list = [];
    for (var x in this.data.new_slide_list){
      if(x != index){
        new_slide_list.push(this.data.new_slide_list[x]);
      }
    }
    this.setData({
      new_slide_list: new_slide_list
    })
  }
})