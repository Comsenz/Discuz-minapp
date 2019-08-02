const rankUrl = require('../../config').rankUrl;
const userAvatar = require('../../config').userAvatar;
const app = getApp();
var _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rank:{},
    type:'week',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var fid = options.id;
    var uid = app.globalData.uid;
    console.log(uid);
    _this = this;
    this.setData({
      fid: fid,
      uid: uid,
      userAvatar: userAvatar,
    });
    this.changeRank({ currentTarget:{dataset:{type:this.data.type}}});
  },
  changeRank(e){
    var type = e.currentTarget.dataset.type;
    this.setData({
      type:type,
    });
    this.getRankByType(type);
  },
  getRankByType(type){
    var data = {
      fid:this.data.fid,
    };
    if(type == 'day') data.day=1;
    if (type == 'week') data.day = 7;
    if (type == 'month') data.day = 30;
    if (type == 'all') data.day = 0;
    app.apimanager.getRequest(rankUrl,data).then(res => {
      var avatar = res.Variables.member_avatar;
        _this.setData({
          avatar:avatar,
          rank: res.Variables.ranklist,
          level: res.Variables.rankinfo.rank,
          num: res.Variables.rankinfo.support,
          unickname:res.Variables.usernicknames,
          gnickname: res.Variables.groupusernicknames,
        });
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
      console.log(res)
    })
  }
})