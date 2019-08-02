Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mode:{
      type: String,
      observer:'_modeChange',
    },
    rangeKey: {
      type: String,
      observer: '_rangeKeyChange',
    },    
    range: {
      type: Array,
      observer: '_rangeChange',
    },
    disabled: {
      type: Boolean,
      observer: '_disabledChange',
    },
    title:{
      type: String,
      observer: '_titleChange',
    },
    navTitle: {
      type: String,
      observer: '_navTitleChange',
    },
    navTo: {
      type: String,
      observer: '_navToChange',
    },
    beSelected: {
      type: String,
      observer: '_beSelectedChange',
      value:'-1',
    },
    disabledNavto: {
      type: Boolean,
      observer: '_disabledNavtoChange',
      value:false,
    },    
  },

  /**
   * 组件的初始数据
   */
  data: {
    showSelectList:false,
    keywords:"",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    search(e){
     var keywords = e.detail.value;
     var defaultList = this.data.range;
     var res = this.getResult(keywords, defaultList);
     this.setData({
       range:res,
       keywords: keywords,
     });
    },
    getResult(keywords, defaultList) {
      for (var x in defaultList) {
        if (defaultList[x][this.data.rangeKey].indexOf(keywords) !== -1) {
          defaultList[x]['isHide'] = 0;
        } else {
          defaultList[x]['isHide'] = 1;
        }
      }
      return defaultList;
    },   
    searchChange(e){
      const myEventDetail = { value: e.currentTarget.dataset.index} 
      const myEventOption = {} 
      this.setData({
        beSelected: myEventDetail.value,
        showSelectList:false,
      })
      this.triggerEvent('searchchange', myEventDetail, myEventOption)
    },
    navTo(){
      wx.navigateTo({
        url: this.data.navTo,
      })
    },
    showSelectList(){
      if(!this.data.disabled){
        this.setData({
          showSelectList:true,
        });
        console.log(this.data.mode);
      }
    },
    hideSelectList(){
      this.setData({
        showSelectList: false,
      });
    },
    _modeChange(newVal,oldVal){
      this.setData({mode:newVal});
    },
    _rangeChange(newVal, oldVal) {
      this.setData({ range: newVal });
    },
    _rangeKeyChange(newVal, oldVal) {
      this.setData({ rangeKey: newVal });
    },
    _disabledChange(newVal, oldVal) {
      this.setData({ disabled: newVal });
    },
    _titleChange(newVal, oldVal) {
      this.setData({ title: newVal });
    },   
    _navTitleChange(newVal, oldVal) {
      this.setData({ navTitle: newVal });
    },  
    _navToChange(newVal, oldVal) {
      this.setData({ navTo: newVal });
    },   
    _beSelectedChange(newVal, oldVal){
      console.log(newVal,oldVal);
      this.setData({ beSelected: newVal });
    },
    _disabledNavtoChange(newVal, oldVal) {
      this.setData({ disabledNavto: newVal });
    },
  }
})
