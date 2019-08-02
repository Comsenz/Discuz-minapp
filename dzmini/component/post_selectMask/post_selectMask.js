// component/post_selectMask/post_selectMask.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    postShow: {
      type: Boolean,
      observer: '_postShowChange',
    },
    group: {
      type: Object,
      observer: '_groupChange',
    },
    allowspecialonly: {
      type: Number,
      observer: '_allowspecialonlyChange',
    },
    postTypeArr: {
      type: Array,
      observer: '_postTypeArrChange',
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    postShow: false,
    group:{},
    allowspecialonly: 0,
    postTypeArr:[],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _postShowChange(newVal, oldVal) {
      this.setData({
        postShow:newVal,
      });
    },
    _groupChange(newVal, oldVal) {
      this.setData({
        group: newVal,
      });
      console.log(newVal);
    },
    _allowspecialonlyChange(newVal, oldVal) {
      this.setData({
        allowspecialonly: newVal,
      });
      console.log(newVal);
    },
    _postTypeArrChange(newVal, oldVal) {
      this.setData({
        postTypeArr: newVal,
      });
    },

    showPostSelect() {
      if (this.data.postTypeArr.length === 1) {
        return;
      }
      this.setData({
        postShow: true,
      });
    },

    hidePostSelect() {
      this.setData({
        postShow: false,
      });
    },

    postThread(e) {
      this.triggerEvent('postThread',e.currentTarget.id);
      this.setData({
        postShow: false,
      });
    }

  }
})
