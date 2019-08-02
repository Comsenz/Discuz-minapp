var datacheck = {
  _uploadErrorDic: {
    "-1": "内部服务器错误",
    "0": "上传成功",
    "1": "不支持此类扩展名",
    "2": "服务器限制无法上传那么大的附件",
    "3": "用户组限制无法上传那么大的附件",
    "4": "不支持此类扩展名",
    "5": "文件类型限制无法上传那么大的附件",
    "6": "今日您已无法上传更多的附件",
    "7": "请选择图片文件",
    "8": "附件文件无法保存",
    "9": "没有合法的文件被上传",
    "10": "非法操作",
    "11": "今日您已无法上传那么大的附件"
  },

  getUploadError: function() {
    return this._uploadErrorDic;
  },
  
  uploadStatusCheck: function(res) {
    let dataArr;
    if (res.length > 0) {
      dataArr = res.split('|')
    }

    if (dataArr.length > 0) {
      if (dataArr[1] == 0) {
        return {
          data: dataArr[2],
          success: true
        }
      }
    }
    let errMsg = this._uploadErrorDic[dataArr[1]]
    return {
      data: errMsg,
      success: false
    }
  },
  // emoj判断正则
  isEmojiCharacter(substring) {
    if (!substring || substring.length == 0) {
      return false;
    } 
    for (let i = 0; i < substring.length; i++) {
      let hs = substring.charCodeAt(i)
      if (hs >= 0xd800 && hs <= 0xdbff) {
        if (substring.length > 1) {
          let ls = substring.charCodeAt(i + 1)
          let uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000
          if (uc >= 0x1d000 && uc <= 0x1f77f) {
            return true
          }
        }
      } else if (substring.length > 1) {
        let ls = substring.charCodeAt(i + 1)
        if (ls === 0x20e3) {
          return true
        }
      } else {
        if (hs >= 0x2100 && hs <= 0x27ff) {
          return true
        } else if (hs >= 0x2B05 && hs <= 0x2b07) {
          return true
        } else if (hs >= 0x2934 && hs <= 0x2935) {
          return true
        } else if (hs >= 0x3297 && hs <= 0x3299) {
          return true
        } else if (hs === 0xa9 || hs === 0xae || hs === 0x303d || hs === 0x3030 || hs === 0x2b55 || hs === 0x2b1c || hs === 0x2b1b || hs === 0x2b50) {
          return true
        }
      }
    }
    return false
  },
}

module.exports = datacheck