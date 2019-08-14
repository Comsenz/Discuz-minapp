const detailUrl = require('/../../config').detailUrl
const baseUrl = require('../../config').baseUrl
const collectUrl = require('/../../config').collectUrl
const unCollectUrl = require('/../../config').unCollectUrl
const sendFlowerUrl = require('/../..//config').sendFlowerUrl
const workCountUrl = require('/../..//config').workCountUrl
const joinClassUrl = require('../../config').joinClassUrl
const deleteModUrl = require('../../config').deleteModUrl
const deletePostUrl = require('../../config').deletePostUrl
const deleteSelfPostUrl = require('../../config').deleteSelfPostUrl
const commentMoreUrl = require('../../config').commentMoreUrl
const minImgDoc = require('../../config').minImgDoc
const userAvatar = require('../../config').userAvatar
const checkUrl = require('../../config').checkUrl
const loginmanager = require('../../utils/loginManager')
const util = require('../../utils/util.js')
var event = require('../../utils/event.js')
const app = getApp()
var self
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userAvatar,
    minImgDoc: minImgDoc,
    baseUrl: baseUrl,
    nickname: '',
    datalist: [],
    thread: {},
    tid: "",
    fid: "",
    is_quan: true,
    loading: false,
    pagenum: 1,
    ppp: 10,
    favorited: 0,
    collecttext: "收藏",
    sortdefault: false,
    listSortType: '按时间',
    sortListShow: false,
    workinfo: null,
    isShare: false,
    isJoin: false,
    showLock: {},
    commentMoreLock: {},
  },
  commentMore(e) {
    var pid = e.currentTarget.dataset.pid;
    var page = this.data.commentMoreLock[pid];
    var index = e.currentTarget.dataset.index;

    if (typeof page == "undefined") {
      page = 2;
    }
    var data = {
      pid: pid,
      tid: this.data.tid,
      page: page,
    }
    app.apimanager.getRequest(commentMoreUrl, data).then(res => {
      var comments = res.Variables.comments[pid];
      var usernicknames = res.Variables.usernicknames;
      if (comments.length > 0) {
        page++;
        self.data.commentMoreLock[pid] = page;
        for (let key in comments) {
          let item = comments[key]
          if (usernicknames) {
            item.nickname = usernicknames[item.authorid]
          }
        }
        self.data.datalist[index].comments = self.data.datalist[index].comments.concat(comments);
        self.setData({
          commentMoreLock: self.data.commentMoreLock,
          datalist: self.data.datalist
        })
      } else {
        self.data.commentMoreLock[pid] = false;
        self.setData({
          commentMoreLock: self.data.commentMoreLock
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },

  onReady() {
    this.videoContext = wx.createVideoContext('detailVideo')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    self = this
    var tid = options.tid;
    var is_quan = options.is_quan ? options.is_quan : false
    var uid = app.globalData.uid
    var repliesrank = app.globalData.repliesrank;
    var allowpostcomment = app.globalData.allowpostcomment;
    self.setData({
      tid: tid,
      pagenum: 1,
      is_quan: is_quan,
      repliesrank: repliesrank,
      allowpostcomment: allowpostcomment,
      uid: uid
    })
    if (options.type == 'share') {
      self.data.isShare = true
    }

    wx.showLoading();
    self.refreshRequest()
    self.setupAudioPlayer()
  },

  deleteThread() {
    var data = {
      fid: this.data.fid,
      formhash: app.globalData.formhash,
    };
    data['moderate[' + this.data.tid + ']'] = this.data.tid;
    wx.showModal({
      content: "删除后不可找回，确认删除？",
      success(res) {
        if (res.confirm) {
          app.apimanager.postRequest(deleteModUrl, data).then(res => {
            if (res.Message.messageval == "admin_succeed") {
              event.emit('indexChanged', {
                name: 'workRefresh'
              })
              wx.navigateBack()
            } else {
              wx.showModal({
                showCancel: false,
                content: res.Message.messagestr,
              })
            }
          }).catch(res => {
            console.log(res)
          })
        }
      }
    })
  },
  
  deleteSelfPost(e) {
    var type = e.currentTarget.dataset.thread ? true : false;
    var pid = e.currentTarget.dataset.pid;
    var data = {
      fid: this.data.fid,
      tid: this.data.tid,
      formhash: app.globalData.formhash,
      'delete': 1,
      pid: pid,
    };
    wx.showModal({
      content: "删除后不可找回，确认删除？",
      success(res) {
        if (res.confirm) {
          app.apimanager.postRequest(deleteSelfPostUrl, data).then(res => {
            if (res.Message.messageval == "post_edit_delete_succeed") {
              if (type) {
                event.emit('indexChanged', {
                  name: 'workRefresh'
                })
                wx.navigateBack()
              } else {
                self.refreshRequest()
              }
            } else {
              wx.showModal({
                showCancel: false,
                content: res.Message.messagestr,
              })
            }
          }).catch(res => {
            console.log(res)
          })
        }
      }
    })
  },
  deletePost(e) {
    var pid = e.currentTarget.dataset.pid;
    var data = {
      fid: this.data.fid,
      tid: this.data.tid,
      formhash: app.globalData.formhash,
    };
    data['topiclist[' + pid + ']'] = pid;
    wx.showModal({
      content: "删除后不可找回，确认删除？",
      success(res) {
        if (res.confirm) {
          app.apimanager.postRequest(deletePostUrl, data).then(res => {
            if (res.Message.messageval == "admin_succeed") {
              var showLock = self.data.showLock;
              showLock[pid] = true;
              self.setData({
                showLock: showLock,
              });
            } else {
              wx.showModal({
                showCancel: false,
                content: res.Message.messagestr,
              })
            }
          }).catch(res => {
            console.log(res)
          })
        }
      }
    })
  },

  workCountRequest() {
    let getDic = {
      tid: self.data.tid,
    }
    app.apimanager.getRequest(workCountUrl, getDic).then(res => {
      var usernicknames = res.Variables.usernicknames
      if (usernicknames) {
        if (res.Variables.workinfo) {
          for (let key in res.Variables.workinfo.submitted.list) {
            let item = res.Variables.workinfo.submitted.list[key]
            item.showName = usernicknames[item.uid] ? usernicknames[item.uid] : item.username
          }

          for (let key in res.Variables.workinfo.unsubmitlist.list) {
            let item = res.Variables.workinfo.unsubmitlist.list[key]
            item.showName = usernicknames[item.uid] ? usernicknames[item.uid] : item.username
          }
        }
      }
      self.setData({
        workinfo: res.Variables.workinfo,
        level: res.Variables.level
      })
    }).catch(res => {})
  },

  makeRequest() {
    self.setData({
      loading: true
    })
    let ordertype = 1
    if (self.data.sortdefault) {
      self.setData({
        listSortType: '默认顺序'
      })
      ordertype = 2
    }
    let getDic = {
      tid: self.data.tid,
      page: self.data.pagenum,
      ppp: self.data.ppp,
      ordertype: ordertype
    }
    app.apimanager.getRequest(detailUrl, getDic).then(res => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      let threads = res.Variables.thread;
      self.data.fid = threads.fid
      let nickname = res.Variables.member_nickname ? res.Variables.member_nickname : res.Variables.member_username
      self.setData({
        nickname: nickname
      })
      if (res.Message) {
        let messageval = res.Message.messageval

        if (messageval == 'forum_group_noallowed') {
          console.log(77777);
          wx.showModal({
            title: "提示",
            content: res.Message.messagestr,
            showCancel: false,
            confirmText: "知道了",
            success: function(res) {
              if (res.confirm) {
                wx.navigateBack()
              }
            },
          })
          return
        }
        if (messageval.indexOf('nonexistence') != -1 ||
          messageval.indexOf('nopermission') != -1 ||
          messageval.indexOf('beoverdue') != -1 ||
          messageval.indexOf('nomedal') != -1) {
          wx.showModal({
            title: "提示",
            content: res.Message.messagestr,
            showCancel: false,
            confirmText: "知道了",
            success: function(res) {
              if (res.confirm) {
                wx.navigateBack()
              }
            },
          })
          return
        }
      }

      if (this.data.is_quan) {
        let userlevel = res.Variables.forum.userlevel
        if ((userlevel == -1 || !userlevel)) { // 没有加入该群组
          // 
          wx.showModal({
            content: "对不起，目前你还不是圈子成员，请先申请加入圈子吧",
            showCancel: false,
            confirmText: "加入圈子",
            success: function(res) {
              if (res.confirm) {
                self.joinClassRequest(self.data.fid)
              }
            },
          })
          return
        } else if (userlevel == 0) { // 审核状态

          wx.showModal({
            content: "已提交加入圈子申请，请耐心等待审核",
            showCancel: false,
            confirmText: '知道了',
            success: function(res) {
              if (res.confirm) {
                wx.navigateBack()
              }
            },
          })
          return
        } else if (userlevel > 0) { // 已加入
        }
      }

      self.setData({
        favorited: threads.favorited
      });
      self.resetCollectState();

      var usernicknames = res.Variables.usernicknames

      console.log('success', res);
      let arr1 = self.data.datalist;
      let listArray = res.Variables.postlist;
      for (let i = 0; i < listArray.length; i++) {
        let postItem = listArray[i]
        if (usernicknames) {
          if (usernicknames[postItem.authorid]) {
            postItem.nickname = usernicknames[postItem.authorid]
          }
        }
        postItem.message = postItem.message.replace(/\<img/gi, '<img class="rich-img"')
        postItem.message = postItem.message.replace(/<font (.*?)>/gi, "");
        postItem.message = postItem.message.replace(/<\/font>/gi, "");
        // 作业评论处理
        let comments = res.Variables.comments
        if (comments && comments.length != 0) {
          if (comments[postItem.pid]) {
            let comment = comments[postItem.pid]
            for (let key in comment) {
              let item = comment[key]
              if (usernicknames) {
                item.nickname = usernicknames[item.authorid]
              }
            }
            postItem.comments = comment
          }
        }

        var listindex = i + self.data.datalist.length
        // 附件处理
        let attachments = postItem.attachments
        let imageA = []
        let audioA = []
        let videoA = []
        let DownloadA = [];
        for (let aidKey in attachments) {
          let attItem = attachments[aidKey]
          let newUrl = baseUrl + '/' + attItem.url + attItem.attachment
          attItem['newUrl'] = newUrl
          if (attItem.isimage != 0) {
            imageA.push(attItem)
          } else if (attItem.ext == 'mp3') {
            let total_process = '00:00'
            console.log(attItem.description);
            if (attItem.description) {
              total_process = util.formatTime(parseInt(attItem.description))
            }
            attItem['toolUse'] = {
              attachment: newUrl,
              listIndex: listindex,
              total_process: total_process
            }
            audioA.push(attItem)
          } else if (attItem.ext == 'mp4' || attItem.ext == 'avi') {
            videoA.push(attItem)
          } else if (attItem.ext == 'pdf' || attItem.ext == 'ppt' || attItem.ext == 'pptx' || attItem.ext == 'docx' || attItem.ext == 'doc' || attItem.ext == 'xls' || attItem.ext == 'xlsx') {
            DownloadA.push(attItem);
          }
        }
        postItem['imageA'] = imageA
        postItem['audioA'] = audioA
        postItem['videoA'] = videoA
        postItem['DownloadA'] = DownloadA;
      }

      if (self.data.pagenum > 1) {
        arr1 = arr1.concat(listArray);
      } else {
        arr1 = listArray;
      }

      if (arr1.length - 1 >= threads.replies) {
        self.setData({
          hasMore: false
        })
      } else {
        self.setData({
          hasMore: true
        })
      }
      console.log(arr1);
      self.setData({
        loading: false,
        datalist: arr1,
        thread: threads,
      })
    }).catch(res => {
      wx.stopPullDownRefresh()
      wx.hideLoading();
      self.setData({
        loading: false
      })
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },
  showSort() {
    self.setData({
      sortListShow: !self.data.sortListShow
    })
  },
  sortClick(e) {
    let id = e.currentTarget.id
    let sortdefault = true
    let listSortType = '默认顺序'
    if (id == 1) {
      sortdefault = false
      listSortType = '按时间'
    }
    self.data.pagenum = 1
    self.setData({
      sortdefault: sortdefault,
      listSortType: listSortType,
      sortListShow: false
    })
    self.makeRequest()
  },

  joinClassRequest(fid) {
    var data = {
      fid: fid
    }
    app.apimanager.getRequest(joinClassUrl, data).then(res => {
      if (res.Message.messageval == "group_join_succeed") {
        wx.showToast({
          title: res.Message.messagestr,
          icon: 'none'
        })
        self.data.isJoin = true
        self.makeRequest()
        var pages = getCurrentPages(); //获取当前页面 
        var prevPage = pages[pages.length - 2]; //获取上个页面 

        let myFidArr = prevPage.data.myFid
        if (myFidArr && myFidArr.length > 0) {
          if (myFidArr.indexOf(fid) <= -1) {
            myFidArr.push(fid)
            prevPage.setData({
              myFid: myFidArr
            })
          }
        }
      } else {
        if (res.Message.messageval == "group_has_joined") {
          self.makeRequest()
        } else {
          wx.showModal({
            content: res.Message.messagestr,
            showCancel: false,
            confirmText: '知道了',
            success: function(res) {
              if (res.confirm) {
                wx.navigateBack()
              }
            },
          })
        }
      }
    }).catch(res => {})
  },

  resetCollectState() {
    let collecttext = self.data.collecttext
    if (self.data.favorited == 1) {
      collecttext = "已收藏"
    } else {
      collecttext = "收藏"
    }
    self.setData({
      collecttext: collecttext,
    })
  },
  previewDoc(e) {
    var url = e.currentTarget.dataset.url;
    var name = e.currentTarget.dataset.filename;
    var ext = e.currentTarget.dataset.ext;
    if (this.data.previewLock) {
      return false;
    }
    this.setData({
      previewLock: true
    })
    wx.showLoading({
      title: '下载中',
    })
    wx.downloadFile({
      url: url,
      success(res) {
        if (res.statusCode === 200) {
          self.setData({
            previewLock: false
          })
          console.log(res.tempFilePath)
          wx.hideLoading();
          wx.openDocument({
            fileType: ext,
            filePath: res.tempFilePath,
            fail(e) {
              console.log(e)
            }
          })
        }
      },
      fail(e) {
        console.log(e)
      }
    })
  },
  collectThread() {
    if (self.data.favorited == 1) { // 已收藏 取消收藏
      this.unCollect()
    } else { // 未收藏 去收藏
      this.collect()
    }
  },

  collect() {
    let formhash = app.globalData.formhash
    let data = {
      formhash: formhash,
      id: self.data.tid
    }
    app.apimanager.getRequest(collectUrl, data).then(res => {
      if (res.Message.messageval === "favorite_do_success") {
        self.setData({
          favorited: 1
        })
        self.resetCollectState()
      } else {
        if (res.Message.messageval === "favorite_repeat") {
          self.resetCollectState()
        }
        wx.showToast({
          title: res.Message.messagestr,
          icon: 'none'
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },

  unCollect() {
    let url = unCollectUrl + "&id=" + self.data.tid + "&type=thread";
    let formhash = app.globalData.formhash
    let postData = {
      formhash: formhash,
      deletesubmit: true
    }
    app.apimanager.postRequest(url, postData).then(res => {
      if (res.Message.messageval == "do_success") {
        self.setData({
          favorited: 0
        })
        self.resetCollectState()
      } else {
        wx.showToast({
          title: res.Message.messagestr,
          icon: 'none'
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了！',
        icon: 'none'
      })
    })
  },

  toReply() {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../post_thread/post_thread?isreply=true',
    })
  },
  replyText() {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../post_thread/post_thread?isreply=true&type=text',
    })
  },
  replyAudio() {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../post_thread/post_thread?isreply=true&type=audio',
    })
  },
  replyImage() {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../post_thread/post_thread?isreply=true&type=image',
    })
  },
  replyVideo() {
    if (!loginmanager.isLogin()) {
      return
    }
    wx.navigateTo({
      url: '../post_thread/post_thread?isreply=true&type=video',
    })
  },
  replyWork(e) {
    if (!loginmanager.isLogin()) {
      return
    }
    // if (this.data.allowpostcomment.length == 0){
    var url = checkUrl
    wx.request({
      url: url,
      method: 'POST',
      success: function(res) {
        if (res.data.setting.allowpostcomment.length == 0) {
          wx.showToast({
            title: '该功能暂未开启',
            icon: 'none'
          })
          return;
        } else {
          wx.navigateTo({
            url: '../post_thread/post_thread?isevaluate=true&pid=' + e.currentTarget.id,
          })
        }
      }
    })
    // }
    // wx.navigateTo({
    //   url: '../post_thread/post_thread?isevaluate=true&pid=' + e.currentTarget.id,
    // })
  },
  sendFlower(e) {
    let index = parseInt(e.currentTarget.id)
    let replyItem = self.data.datalist[index]

    let formhash = app.globalData.formhash
    let data = {
      tid: self.data.tid,
      pid: replyItem.pid,
      hash: formhash
    }

    app.apimanager.getRequest(sendFlowerUrl, data).then(res => {
      if (res.Message.messageval == "thread_poll_succeed") {
        replyItem.issupport = 1

        if (replyItem.postreview && replyItem.postreview.support) {
          replyItem.postreview.support = parseInt(replyItem.postreview.support) + 1;
        } else {
          var postreview = {
            support: 1
          };

          replyItem['postreview'] = postreview;
        }
        let param = {}
        let str = 'datalist[' + index + ']'
        param[str] = replyItem
        self.setData(param)

        // console.log(self.data.datalist);
      } else {
        if (this.data.repliesrank == '0' && res.Message.messageval == "to_login") {
          wx.showToast({
            title: '该功能暂未开启',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: res.Message.messagestr,
            icon: 'none'
          })
        }
      }
    }).catch(res => {
      wx.showToast({
        title: '出错了',
        icon: 'none'
      })
    })
  },
  // 播放视频 -------------------
  clickVideo(e) {
    self.setData({
      currentVideo: e.currentTarget.id
    })
    self.videoContext.requestFullScreen({
      direction: 0
    })
  },

  fullScreenChange(e) {
    if (!e.detail.fullScreen) {
      self.videoContext.stop()
    }
  },

  /* *********************** 语音相关start *********** */
  setupAudioPlayer() {
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.obeyMuteSwitch = false;
    this.innerAudioContext.onEnded((res) => {
      self.data.currentAudio.toolUse.is_ended = true
      self.stopVoice()
    })
    this.innerAudioContext.onTimeUpdate(() => {
      console.log("ontimeupdate")

      if (!self.data.is_moving_slider) { // 播放中
        self.data.currentAudio = self.data.datalist[self.data.currentAudio.toolUse.listIndex].audioA[0]

        let param = {}
        let toolUsestr = "datalist[" + self.data.currentAudio.toolUse.listIndex + "].audioA[0].toolUse"

        let toolUse = self.data.currentAudio.toolUse
        toolUse['current_process'] = util.formatTime(
          this.innerAudioContext.currentTime)
        toolUse['slider_value'] = Math.floor(
          this.innerAudioContext.currentTime)
        toolUse['slider_max'] = Math.floor(
          this.innerAudioContext.duration)
        param[toolUsestr] = toolUse
        self.setData(param)
      }
    })
  },
  // 拖动进度条，到指定位置
  hanle_slider_change(e) {
    const position = e.detail.value
    this.seekCurrentAudio(position)
  },

  // 拖动进度条控件
  seekCurrentAudio(position) {
    this.innerAudioContext.seek(position)
  },
  // 进度条滑动
  handle_slider_move_start() {
    this.setData({
      is_moving_slider: true
    });
  },
  handle_slider_move_end() {
    this.setData({
      is_moving_slider: false
    });
  },
  // 点击播放暂停
  audio_play(e) {

    let listIndex = e.currentTarget.dataset.listindex
    let postItem = self.data.datalist[listIndex]
    let currentAudio = postItem.audioA[0]

    var param = {}
    let audioset = "datalist[" + listIndex + "].audioA[0].toolUse.currentAudio";
    param[audioset] = currentAudio.newUrl
    self.setData(param)
    self.setData({
      currentAudio: currentAudio
    })
    let isplay = self.data.currentAudio.toolUse.is_play
    let playstr = "datalist[" + listIndex + "].audioA[0].toolUse.is_play";
    param[playstr] = !isplay
    self.setData(param)
    if (isplay) {
      self.innerAudioContext.pause()
      isplay = false
    } else if (!isplay && !self.data.currentAudio.toolUse.is_ended) {
      self.playVoice()
    } else {
      self.innerAudioContext.play()
    }
  },
  playVoice() {
    var src = self.data.currentAudio.newUrl;
    this.innerAudioContext.src = src;
    this.innerAudioContext.play()
  },
  stopVoice() {
    var param = {}
    let toolUsestr = "datalist[" + self.data.currentAudio.toolUse.listIndex + "].audioA[0].toolUse"
    let toolUse = self.data.currentAudio.toolUse
    toolUse['is_play'] = false
    toolUse['slider_value'] = 0
    toolUse['current_process'] = util.formatTime(
      0)
    param[toolUsestr] = toolUse
    self.setData(param)
    self.innerAudioContext.stop()
    self.data.currentAudio = self.data.datalist[self.data.currentAudio.toolUse.listIndex].audioA[0]
  },
  /* *********************** 语音end *********** */
  lookImage(e) {
    let cellItem = self.data.datalist[e.currentTarget.dataset.cellindex]
    let imageA = cellItem.imageA
    var imageSrcArray = [];
    for (let i = 0; i < imageA.length; i++) {
      let item = imageA[i]
      imageSrcArray.push(item.newUrl)
    }
    console.log(imageSrcArray)
    wx.previewImage({
      current: imageSrcArray[e.currentTarget.id],
      urls: imageSrcArray
    })
  },
  requestMore(isMore) {
    let pagenum = self.data.pagenum;
    if (isMore) {
      pagenum += 1;
    } else {
      pagenum = 1;
    }
    self.setData({
      pagenum: pagenum, // 更新当前页数
    })
    self.makeRequest(); // 重新调用请求获取下一页数据 或者刷新数据
  },
  /**
   * 分享
   */
  onShareAppMessage: function(res) {
    self.setData({
      shareHidden: true
    })
    var path = "/pages/discovery/discovery?shareid=" + self.data.tid + '&special=' + self.data.thread.special
    var placehold = "邀请你参与论坛话题交流，快快加入讨论吧"
    if (self.data.is_quan) {
      path = "/pages/index/index?sharetype=work&shareid=" + self.data.tid
      placehold = "邀请你参与圈子话题交流，快快加入讨论吧"
    }
    var title = self.data.thread.subject ? self.data.thread.subject : self.data.nickname + placehold

    var reg = /<[^<>]+>/g;
    title = title.replace(reg, '');

    var imagePath = minImgDoc + "kehoushare.png"
    if (self.data.datalist[0].imageA.length > 0) {
      imagePath = self.data.datalist[0].imageA[0].newUrl
    }
    return {
      title: title,
      path: path,
      imageUrl: imagePath,
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      commentMoreLock: {}
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    if (self.data.isShare) {
      event.emit('indexChanged', {
        fid: self.data.fid,
        name: "detail",
        join: self.data.isJoin
      });
    }
    self.innerAudioContext.destroy()
  },
  refreshRequest() {
    self.requestMore(false)
    if (this.data.is_quan) {
      this.workCountRequest()
    }

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    self.refreshRequest()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (self.data.hasMore) {
      self.requestMore(true)
    }
  },
})