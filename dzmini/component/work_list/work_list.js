// component/work_list/work_list.js
const workListUrl = require('../../config').workListUrl
const minImgDoc = require('../../config').minImgDoc
const userAvatar = require('../../config').userAvatar
const util = require('../../utils/util.js')
const loginmanager = require('../../utils/loginManager')
const app = getApp()

Component({

  properties: {
    fid: {
      type: String,
      observer: '_fidChange',
    },
    indexPosition: {
      type: Number,
      observer: '_indexPositionChange',
    },
    currentTab: {
      type: Number,
      observer: '_currentTabChange',
    },
    index: Number,
    easyTalk: {
      type: Boolean,
      observer: '_easyTalkTalkChange',
    },
    stateInfo: {
      type: Object,
      observer: '_stateInfoChange',
    },
    usernum: {
      type: Number,
      observer: '_usernumChange',
    },
  },
  lifetimes: {
    ready() {
      wx.getSystemInfo({
        success: (res) => {
          this.setData({
            platform: res.platform
          })
        },
      })
    },
  },

  data: {
    userAvatar: userAvatar,
    minImgDoc: minImgDoc,
    scrollTop: 0,
    page: 1,
    esaySelected: 0,
    toplist: [],
    compOnShow: false,
    usernum:0,
    easyNav: [{
        name: '全部'
      },
      {
        name: '最新'
      },
      {
        name: '热帖'
      },
      {
        name: '精华'
      },
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {

    _indexPositionChange(newVal, oldVal) {
      this.setData({
        indexPosition: newVal
      })
    },

    _currentTabChange(newVal, oldVal) {
      if (this.properties.index != newVal && this.data.compOnShow) {
        this.setData({
          compOnShow: false
        })
      } else {
        this.setData({
          compOnShow: true
        })
      }
    },

    _easyTalkChange(newVal, oldVal) {
      this.setData({
        easyTalk: easyTalk
      })
    },

    _fidChange(newVal, oldVal) {
      this.setData({
        fid: newVal
      });
    },

    _stateInfoChange(newVal, oldVal) {
      this.setData({
        stateInfo: newVal
      });
    },

    _usernumChange(newVal, oldVal) {
      this.setData({
        usernum: newVal
      });
    },

    switchTabTo() {
      if (this.data.datalist) {
        if (this.data.dataDic.Variables.forum.fid != this.data.fid) {
          this.setData({
            dataDic: {},
            datalist: []
          })
          this.data.page = 1
          this.workListRequest()
        }
      } else {
        this.data.page = 1;
        if (!this.data.dataDic) {
          wx.showLoading();
        }
        this.workListRequest()
      }
      this.refreshHeaderHidden()
    },
    getDataSource() {
      return this.data
    },
    workListRequest(order, isRefresh) {
      if (isRefresh) {
        this.data.page = 1
      }
      var data = {
        fid: this.data.fid,
        page: this.data.page
      }
      if (order) {
        switch (order) {
          case '0':
            {}
            break;
          case '1':
            {
              data['filter'] = 'author'
              data['orderby'] = 'dateline'
            }
            break;
          case '2':
            {
              data['filter'] = 'heat'
              data['orderby'] = 'heats'
            }
            break;
          case '3':
            {
              data['filter'] = 'digest'
              data['digest'] = '1'
            }
            break;
        }

      }
      if (this.data.easyTalk) {
        data['mobile_api'] = 1
      }

      app.apimanager.getRequest(workListUrl, data).then(res => {
        this.refreshHeaderHidden();
        wx.hideLoading();
        var usernicknames = res.Variables.usernicknames
        let arr1 = res.Variables.forum_threadlist
        if (res.Variables.threadtypes) {
          this.setData({
            types: res.Variables.threadtypes.types
          })
        }
        var topArr = []
        var commonArr = []
        var topCheckArr = ['1', '2', '3']
        for (let i = 0; i < arr1.length; i++) {
          let postItem = arr1[i]
          if (usernicknames) {
            if (usernicknames[postItem.authorid]) {
              postItem.nickname = usernicknames[postItem.authorid]
            }
          }
          if (postItem.message && postItem.message.length > 0) {
            postItem.message = util.filterHtml(postItem.message)
          }

          let attachments = postItem.attachlist
          if (attachments) {
            let imageA = []
            let audioA = []
            let videoA = []
            for (let k = 0; k < attachments.length; k++) {
              let attItem = attachments[k]

              let realIndex = i
              if (this.data.page > 1) {
                realIndex = i + this.data.datalist.length
                if (this.data.easyTalk) {
                  realIndex += this.data.toplist.length
                }
              }

              if (attItem.type == 'image') {
                attItem['toolUse'] = {
                  listIndex: realIndex,
                  imageIndex: k
                }
                imageA.push(attItem)
              } else if (attItem.type == 'audio') {
                let total_process = '00:00'
                if (attItem.description) {
                  total_process = util.formatTime(parseInt(attItem.description))
                }
                attItem['toolUse'] = {
                  attachment: attItem.attachment,
                  listIndex: realIndex,
                  total_process: total_process,
                }
                audioA.push(attItem)
              } else if (attItem.type == 'video') {
                videoA.push(attItem)
              }
            }
            postItem['imageA'] = imageA
            postItem['audioA'] = audioA
            postItem['videoA'] = videoA
          }
          if (this.data.easyTalk) {
            if (topCheckArr.indexOf(postItem.displayorder) != -1) {
              topArr.push(postItem)
            } else {
              commonArr.push(postItem)
            }
          }
        }

        if (this.data.easyTalk) {
          arr1 = commonArr
          if (this.data.page == 1) {
            this.setData({
              toplist: topArr
            })
          }
        }

        if (this.data.page > 1 && arr1.length > 0) {
          arr1 = this.data.datalist.concat(arr1)
        }

        var noMore = false
        if (arr1.length + this.data.toplist.length >= res.Variables.forum.threadcount) {
          noMore = true
        }

        this.setData({
          datalist: arr1,
          noMore: noMore,
          dataDic: res
        })

      }).catch(res => {
        wx.hideLoading();
        this.refreshHeaderHidden()
      })
    },

    classInfoManage(e) {
      var fid = e.currentTarget.id
      wx.navigateTo({
        url: '/pages/class_setting/class_setting?id=' + fid,
      })
    },

    goToMoreUser(e) {
      wx.navigateTo({
        url: '/pages/more_user/more_user?id=' + e.currentTarget.id,
      })
    },

    easyTalkNavClick(e) {
      let id = e.currentTarget.id
      this.setData({
        esaySelected: id,
        page: 1
      })
      this.workListRequest(id)
    },

    topCellClick(e) {
      var tid = this.data.toplist[e.currentTarget.id].tid
        // + '&is_quan=true'
      wx.navigateTo({
        url: '../thread_detail/thread_detail?tid=' + tid,
      })
    },
    cellClick(e) {
      var tid = this.data.datalist[e.currentTarget.id].tid
      wx.navigateTo({
        url: '../thread_detail/thread_detail?tid=' + tid,
      })
    },

    discClick(e) {
      this.rightBarShow(e.currentTarget.id, true)
      this.data.audiotid = e.currentTarget.dataset.tid
    },

    clickVideo(e) {
      this.triggerEvent('clickVideo', e.currentTarget.id)
    },

    listShare(e) {
      this.rightBarShow(e.currentTarget.id, false)
    },

    disVoice(e) {
      console.log(e);
      if (!loginmanager.isLogin()) {
        loginmanager.toLogin()
        return
      }
      console.log(e);
      var tid = this.data.datalist[e.currentTarget.id].tid
      console.log(tid);
      // var fid = e._currentTabChange
      wx.navigateTo({
        url: '../post_thread/post_thread?isreply=true&type=audio&fid=' + this.data.fid + '&tid=' + tid + '&isreply=true&is_quan=true',
      })

      this.rightBarShow(e.currentTarget.id, false)
      // this.triggerEvent('disVoice', this.data.audiotid)
    },

    rightBarShow(index, isShow) {
      let shareshow = 1
      if (this.data.clickIdx == index) {
        if (this.data.datalist[index].shareshow == 1 || !isShow) {
          shareshow = 0
        }
      }
      let param = {}
      let str = "datalist[" + index + "].shareshow"
      param[str] = shareshow
      this.setData({
        clickIdx: index
      })
      this.setData(param)
    },

    lookImage(e) {
      let cellItem = this.data.datalist[e.currentTarget.dataset.cellindex]
      let imageA = cellItem.imageA
      var imageSrcArray = [];
      for (let i = 0; i < imageA.length; i++) {
        let item = imageA[i]
        imageSrcArray.push(item.attachment)
      }
      wx.previewImage({
        current: imageSrcArray[e.currentTarget.id],
        urls: imageSrcArray
      })
    },

    postEnter() {
      this.triggerEvent('postEnter')
    },

    // 下拉刷新
    refreshHeaderHidden() {
      this.setData({
        isLoading: false,
        scrollTop: 0
      })
    },
    touchStart(e) {
      this.data.isTouch = true
      if (!this.data.isLoading) {
        this.setData({
          refreshMsg: "松开刷新"
        })
      }
    },
    touchMove(event) {
        let currentX = event.touches[0].pageX
        let currentY = event.touches[0].pageY
        let tx = currentX - this.data.lastX
        let ty = currentY - this.data.lastY
        let offsetTop = event.target.offsetTop

        if (Math.abs(tx) > Math.abs(ty)) {
          //左右方向滑动
          if (tx < 0) {
            // console.log("向左滑动")
          } else if (tx > 0) {
            // console.log("向右滑动")
          }
        } else {
          if (ty > 0) {
            // 向下滑动
            if (ty > 10 && offsetTop < 300) {
              this.setData({
                scrollTop: -60 - 5
              })
            }
          }
        }
        this.data.lastX = currentX
        this.data.lastY = currentY
    },
    touchEnd(e) {
      this.data.isTouch = false
      if (this.data.scrollTop < -60) {
        this.setData({
          isLoading: true,
          refreshMsg: "正在刷新",
          page: 1
        })
        if (this.data.easyTalk) {
          this.workListRequest(this.data.esaySelected)
        } else {
          this.workListRequest()
        }

      }
    },
    // 上拉加载
    lower(e) {
      if (!this.data.isLoading && !this.data.noMore) {
        this.data.page++
          if (this.data.easyTalk) {
            this.workListRequest(this.data.esaySelected)
          } else {
            this.workListRequest()
          }
      }
    },
    /* *********************** 播放语音相关start *********** */
    // 拖动进度条，到指定位置
    hanle_slider_change(e) {
      this.triggerEvent('seekCurrentAudio', e.detail.value);
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

    is_moving_slider() {
      return this.data.is_moving_slider
    },

    // 点击播放暂停
    audio_play(e) {
      let listIndex = e.currentTarget.dataset.listindex
      if (this.data.easyTalk) {
        listIndex -= this.data.toplist.length
      }

      let postItem = this.data.datalist[listIndex]
      let currentAudio = postItem.audioA[0]
      this.setData({
        currentAudio: currentAudio
      })

      let isplay = this.data.currentAudio.toolUse.is_play
      var param = {}
      let audioset = "datalist[" + listIndex + "].audioA[0].toolUse.currentAudio";
      let playstr = "datalist[" + listIndex + "].audioA[0].toolUse.is_play";
      param[playstr] = !isplay
      param[audioset] = postItem.audioA[0].attachment
      this.setData(param)

      this.triggerEvent('audio_play', {
        'isplay': isplay,
        'is_ended': this.data.currentAudio.toolUse.is_ended,
        'src': this.data.currentAudio.attachment
      });
    },

    voiceReset() {
      let toolUse = this.data.currentAudio.toolUse
      toolUse['is_play'] = false
      toolUse['slider_value'] = 0
      toolUse['current_process'] = util.formatTime(
        0)
      this.voiceDataUpdate(toolUse)
    },

    voiceDataUpdate(toolUse) {
      var listIndex = this.data.currentAudio.toolUse.listIndex
      if (this.data.easyTalk) {
        listIndex -= this.data.toplist.length
      }
      let param = {}
      let toolUsestr = "datalist[" + listIndex + "].audioA[0].toolUse"
      param[toolUsestr] = toolUse
      this.setData(param)
    },

    currentVoiceUse() {
      if (!this.data.currentAudio) {
        return
      }
      let toolUse = this.data.currentAudio.toolUse
      return toolUse
    }
    /* *********************** 语音end *********** */
  }
})