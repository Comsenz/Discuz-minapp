// component/multi_picker/multi_picker.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      observer: '_titleChange',
    },
    hideSearch: {
      type: Boolean,
      observer: '_hideSearchChange'
    },
    teachlist: {
      type: Array,
      observer: '_teachlistChange',
    },
    selectTeacherList: {
      type: Array,
      observer: '_selectTeacherListChange',
    },
    isWeek: {
      type: Boolean,
      observer: '_isWeekChange'
    },
    selectWeekDayList: {
      type: Array,
      observer: '_selectWeekDayListChange',
    },
    isAll: {
      type: Boolean,
      observer: '_isAllChange'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    teachlist: [],
    showTeachers: [],
    selectTeacher: [],
    selectWeekDayList: [],
    keyword: '',
    isWeek: false,
    weekarray: [{
        name: '周一',
        checked: false,
      },
      {
        name: '周二',
        checked: false,
      },
      {
        name: '周三',
        checked: false,
      },
      {
        name: '周四',
        checked: false,
      },
      {
        name: '周五',
        checked: false,
      },
      {
        name: '周六',
        checked: false,
      },
      {
        name: '周日',
        checked: false,
      },
    ],
    allChecked: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _titleChange(newVal, oldVal) {
      this.setData({
        title: newVal
      });
    },
    _hideSearchChange(newVal, oldVal) {
      this.setData({
        hideSearch: newVal
      });
    },
    _teachlistChange(newVal, oldVal) {
      this.setData({
        teachlist: newVal,
        showTeachers: newVal
      });
    },
    _selectTeacherListChange(newVal, oldVal) {
      this.setData({
        selectTeacher: newVal,
      });
    },
    _selectWeekDayListChange(newVal, oldVal) {
      this.setData({
        selectWeekDayList: newVal,
      });
    },
    _isWeekChange(newVal, oldVal) {
      this.setData({
        isWeek: newVal,
      });
    },
    _isAllChange(newVal, oldVal) {
      this.setData({
        isAll: newVal,
      });
    },
    search(e) {
      var keywords = e.detail.value;
    },
    checkboxChange(e) {
      var newChecked = e.detail.value
      if (this.data.selectTeacher.length > 0) { // 之前选过的，是否在showTeachers里面，如果是，判断下是否选择
        for (let i = 0; i < this.data.showTeachers.length; i++) {
          let teacher = this.data.showTeachers[i]
          var index = this.data.selectTeacher.indexOf(teacher.uid);
          if (index != -1) { // 之前选过的有显示
            var newIndex = newChecked.indexOf(teacher.uid)
            if (newIndex != -1) { // 之前选过的依然被选中
              newChecked.splice(newIndex, 1)
            } else { // 之前选过的没有被选中,移除
              this.data.selectTeacher.splice(index, 1)
            }
          }
        }
      }

      newChecked = this.data.selectTeacher.concat(newChecked)
      console.log(newChecked)
      this.setData({
        selectTeacher: newChecked
      })
      this.triggerEvent('teacherSelect', newChecked)
    },
    everyDayChange(e) {
      var weekarray = this.data.weekarray
      var newChecked = []
      if (e.detail.value.length > 0) {
        for (let i = 0; i < weekarray.length; i++) {
          var day = weekarray[i]
          day.checked = true
        }
        newChecked = [0, 1, 2, 3, 4, 5, 6]
      } else {
        for (let i = 0; i < weekarray.length; i++) {
          var day = weekarray[i]
          day.checked = false
        }
      }
      this.setData({
        weekarray: weekarray,
        selectWeekDayList: newChecked
      })
      this.triggerEvent('weekDaySelect', newChecked)
    },
    checkDayChange(e) {
      var newChecked = e.detail.value
      newChecked.sort(function(a, b) {
        return a - b;
      })
      var allChecked = false
      if (newChecked.length == 7) {
        allChecked = true
      }
      this.setData({
        selectWeekDayList: newChecked,
        allChecked: allChecked
      })
      this.triggerEvent('weekDaySelect', newChecked)
    },
    search(e) {
      var keyword = e.detail.value
      var teachShow = []
      for (let i = 0; i < this.data.teachlist.length; i++) {
        var teacher = this.data.teachlist[i]
        if (teacher.realname.indexOf(keyword) != -1) {
          teachShow.push(teacher)
        }
      }
      this.setData({
        showTeachers: teachShow,
        keyword: keyword
      })
      this.setDefaultSelect()
    },

    showSelectList() {
      if (!this.data.disabled) {
        this.setData({
          showSelectList: true,
        });
        this.setDefaultSelect()
      }
    },
    hideSelectList() {
      this.setData({
        showSelectList: false,
      });
    },
    setDefaultSelect() {
      if (this.data.teachlist.length > 0) {
        for (let i = 0; i < this.data.showTeachers.length; i++) {
          let teacher = this.data.showTeachers[i]
          if (this.data.selectTeacher.indexOf(teacher.uid) != -1) {
            teacher.checked = true
          } else {
            teacher.checked = false
          }
        }
        this.setData({
          showTeachers: this.data.showTeachers
        })
      }

      if (this.data.selectWeekDayList.length > 0) {
        for (let i = 0; i < this.data.weekarray.length; i++) {
          let weekDay = this.data.weekarray[i]
          if (this.data.selectWeekDayList.indexOf(i) != -1 || this.data.selectWeekDayList.indexOf(i.toString()) != -1) {
            weekDay.checked = true
          } else {
            weekDay.checked = false
          }
        }
        this.setData({
          weekarray: this.data.weekarray
        })
      }

    },
  }
})