import pinyin from './pinyin.js';
function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  time %= 3600
  const minute = parseInt(time / 60, 10)
  time = parseInt(time % 60, 10)
  const second = time

  return ([minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

/** 
 * 时间戳转化为年 月 日 时 分 秒 
 * number: 传入时间戳 
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
*/
function formatTimeTwo(number, format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(number * 1000);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function weekWithDate(date) {
  var weekDay = ["7", "1", "2", "3", "4", "5", "6"];
  return weekDay[date.getDay()]
}

function filterEmoji(name) {
  var str = name.replace(/[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig, "");

  return str;
}

function filterHtml(name) {
  var str = name.replace(/\[p(.*?)\]/gi, "")
    //var str = name.replace(/\[.*?\]/g, "")
  str = str.replace(/\[\/p\]/gi, "")
  str = str.replace(/\[font(.*?)\]/gi, "")
  str = str.replace(/\[\/font\]/gi, "")
  str = str.replace(/\[color(.*?)\]/gi, "")
  str = str.replace(/\[\/color\]/gi, "")
  str = str.replace(/\[size(.*?)\]/gi, "")
  str = str.replace(/\[\/size\]/gi, "")
  return str;
}

function selectListUpdate(grouptype,callback){
  var cityList = new Array();
  var areaList = new Object();
  var schoolList = new Object();
  for(var x in grouptype['first']){
    var city = grouptype['first'][x];
    cityList.push(city);
    areaList[city['fid']] = new Array();
    for (var y in city.secondlist){
      areaList[city['fid']].push(grouptype['second'][city['secondlist'][y]]);
    }
  }
  for(var x in grouptype['second']){
    var area = grouptype['second'][x];
    schoolList[area['fid']] = new Array();
    for (var y in area.threelist) {
      schoolList[area['fid']].push(grouptype['three'][area['threelist'][y]]);
    }
  }
  callback(cityList,areaList,schoolList);
}

function userListUpdate(userlist){
  var userList = {};
  userList['admin'] = new Array();
  userList['user'] = new Object();
  for (var x in userlist) {
    var user = userlist[x];
    if (user.level == 1 || user.level == 2 || user.level == 3) {
      userList['admin'].unshift(user);
    }else{
      var name = user.nickname ? user.nickname : user.realname ?user.realname:user.username;
      var key = pinyin.ucfirst(name);
      if(key == '#'){
        key = "_";
      }
      if (typeof userList['user'][key] == "undefined") {
        userList['user'][key] = new Array();
      }
      userList['user'][key].unshift(user);
    }
  }

  userList['admin'].sort(function (a, b) {
    return a.level - b.level;
  });
  userList['user'] = objKeySort(userList['user']);
  return userList;
}

function searchUserList(keyword,userlist){
  var _userlist = {};
  for(var x in userlist){
    var name = userlist[x].nickname ? userlist[x].nickname : userlist[x].realname? userlist[x].realname:userlist[x].username;
    console.log(keyword, name.indexOf(keyword));
    if(name.indexOf(keyword)>-1){
      _userlist[x] = userlist[x];
    }
  }
  return _userlist;
}

function objKeySort(obj) {
  var newkey = Object.keys(obj).sort();
  if (newkey[0] == '_'){
    newkey.shift();
    newkey.push('_');
  }
  var newObj = {};
  for (var i = 0; i < newkey.length; i++) {
    newObj[newkey[i]] = obj[newkey[i]];
  }
  return newObj;
}

module.exports = {
  formatTime: formatTime,
  formatTimeTwo: formatTimeTwo,
  weekWithDate: weekWithDate,
  filterEmoji: filterEmoji,
  filterHtml: filterHtml,
  selectListUpdate: selectListUpdate,
  userListUpdate: userListUpdate,
  searchUserList: searchUserList,
}
