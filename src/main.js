var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "56f2cff845240.gz.cdb.myqcloud.com",
  port: 17816,
  user: "cdb_outerroot",
  password: "cdb_outerroot",
  database: "match_db",
});

connection.connect();

// connection.query(
//   "select m.*,mr.had_result,mr.had_result_odds from t_fb_match m left join t_fb_match_result mr on m.id = mr.id where playtime > '2018-01-01' and had_single = 1 order by playtime asc;",
//   function (error, results, fields) {
//     if (error) throw error;
//     console.log("The solution is: ", results[0]);
//   }
// );
var fs = require("fs");
var child_process = require("child_process");
function initData(data) {
  // console.log(data);
  // initData({"status":{"code":8000,"message":"OK"},"data":{"result":[{"id":"75243","num":"\u5468\u4e94003","date":"2016-01-01","time":"23:00:00","l_id":"20","l_cn":"\u82f1\u683c\u5170\u51a0\u519b\u8054\u8d5b","h_id":"41","h_cn":"\u5e03\u8d56\u987f","a_id":"64","a_cn":"\u72fc\u961f","match_status":"Final","message":null,"pool_status":"Payout","fixedodds":"-1.00","result_status":"Conclude","half":"0:1","final":"0:1","l_cn_abbr":"\u82f1\u51a0","h_cn_abbr":"\u5e03\u8d56\u987f","a_cn_abbr":"\u72fc\u961f","status":"\u5df2\u5b8c\u6210"},{"id":"75242","num":"\u5468\u4e94002","date":"2016-01-01","time":"16:40:00","l_id":"2","l_cn":"\u6fb3\u5927\u5229\u4e9a\u8d85\u7ea7\u8054\u8d5b","h_id":"1686","h_cn":"\u897f\u6089\u5c3c\u6f2b\u6b65\u8005","a_id":"1096","a_cn":"\u963f\u5fb7\u83b1\u5fb7\u8054","match_status":"Final","message":null,"pool_status":"Payout","fixedodds":"-1.00","result_status":"Conclude","half":"0:0","final":"0:0","l_cn_abbr":"\u6fb3\u8d85","h_cn_abbr":"\u897f\u6089\u5c3c","a_cn_abbr":"\u963f\u5fb7\u83b1\u5fb7","status":"\u5df2\u5b8c\u6210"},{"id":"75241","num":"\u5468\u4e94001","date":"2016-01-01","time":"13:15:00","l_id":"45","l_cn":"\u65e5\u672c\u5929\u7687\u676f","h_id":"560","h_cn":"\u6d66\u548c\u7ea2\u94bb","a_id":"549","a_cn":"\u5927\u962a\u94a2\u5df4","match_status":"Final","message":null,"pool_status":"Payout","fixedodds":"-1.00","result_status":"Conclude","half":"1:1","final":"1:2","l_cn_abbr":"\u5929\u7687\u676f","h_cn_abbr":"\u6d66\u548c\u7ea2\u94bb","a_cn_abbr":"\u5927\u962a\u94a2\u5df4","status":"\u5df2\u5b8c\u6210"}],"league":{"20":{"l_id":"20","l_cn_abbr":"\u82f1\u51a0"},"2":{"l_id":"2","l_cn_abbr":"\u6fb3\u8d85"},"45":{"l_id":"45","l_cn_abbr":"\u5929\u7687\u676f"}}}})
  if ((data.status.code = 8000)) {
    data.data.result.forEach((element) => {
      let sql =
        "update t_fb_match set goalline=" +
        parseInt(element.fixedodds.replace("+", "")) +
        ",match_status='" +
        element.match_status +
        "',result_status='" +
        element.result_status +
        "' where id =" +
        element.id +
        ";";

      // console.log(sql);
      fs.appendFile("update.sql", sql, (err) => {
        if (err) throw err;
      });
    });
  }
}

function get_fb_match_result(playdatestr) {
  //https://i.sporttery.cn/wap/fb_match_list/get_fb_match_result/?format=jsonp&callback=initData&date=2020-11-13&_=1605321475921
  // console.log(row.playdatestr);

  var curl =
    "curl 'https://i.sporttery.cn/wap/fb_match_list/get_fb_match_result/?format=jsonp&callback=initData&date=" +
    playdatestr +
    "&_=1605321475921' \
      -XGET \
      -H 'Cookie: Hm_lpvt_860f3361e3ed9c994816101d37900758=1605321460; tgw_l7_route=d439e0cdf326562f050a2892acfb98cd; Hm_lvt_860f3361e3ed9c994816101d37900758=1604900213,1604913781,1605191539,1605319995; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22175ab81d17e736-08182f2c353567-48183407-3686400-175ab81d17fb10%22%2C%22%24device_id%22%3A%22175ab81d17e736-08182f2c353567-48183407-3686400-175ab81d17fb10%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E9%90%A9%E5%AD%98%E5%B8%B4%E5%A8%B4%E4%BE%80%E5%99%BA%22%2C%22%24latest_referrer%22%3A%22%22%2C%22%24latest_referrer_host%22%3A%22%22%2C%22%24latest_search_keyword%22%3A%22%E9%8F%88%EE%81%84%E5%BD%87%E9%8D%92%E6%9D%BF%E2%82%AC%E7%B3%AD%E9%90%A9%E5%AD%98%E5%B8%B4%E9%8E%B5%E6%92%B3%E7%B4%91%22%2C%22platForm%22%3A%22information%22%2C%22%24ip%22%3A%22171.43.153.93%22%2C%22source%22%3A%22pc%E7%AB%AF%22%2C%22browser_name%22%3A%22safari%22%2C%22browser_version%22%3A%22605.1.15%22%2C%22user_gent%22%3A%22Mozilla%2F5.0%20(Macintosh%3B%20Intel%20Mac%20OS%20X%2010_13_6)%20AppleWebKit%2F605.1.15%20(KHTML%2C%20like%20Gecko)%20Version%2F13.0.3%20Safari%2F605.1.15%22%2C%22cname%22%3A%22%E6%B9%96%E5%8C%97%E7%9C%81%22%7D%2C%22data_from%22%3A%22infoWap%22%7D' \
      -H 'Accept: */*' \
      -H 'Accept-Encoding: gzip, deflate' \
      -H 'Host: i.sporttery.cn' \
      -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15' \
      -H 'Accept-Language: zh-cn' \
      -H 'Referer: http://m.sporttery.cn/wap/fb_result_list.html?date=2020-11-13' \
      -H 'Connection: keep-alive'";

  var child = child_process.exec(curl, function (err, stdout, stderr) {
    eval(stdout);
  });
}
function getPoolRs(data) {
  console.log(data);
}
function get_pool_rs(mid) {
  var curl =
    "curl 'https://i.sporttery.cn/wap/fb_match_info/get_pool_rs/?mid=" +
    mid +
    "&f_callback=getPoolRs&_=1605325862918' \
  -XGET \
  -H 'Cookie: Hm_lpvt_860f3361e3ed9c994816101d37900758=1605324920; Hm_lvt_860f3361e3ed9c994816101d37900758=1604900213,1604913781,1605191539,1605319995; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22175ab81d17e736-08182f2c353567-48183407-3686400-175ab81d17fb10%22%2C%22%24device_id%22%3A%22175ab81d17e736-08182f2c353567-48183407-3686400-175ab81d17fb10%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E9%90%A9%E5%AD%98%E5%B8%B4%E5%A8%B4%E4%BE%80%E5%99%BA%22%2C%22%24latest_referrer%22%3A%22%22%2C%22%24latest_referrer_host%22%3A%22%22%2C%22%24latest_search_keyword%22%3A%22%E9%8F%88%EE%81%84%E5%BD%87%E9%8D%92%E6%9D%BF%E2%82%AC%E7%B3%AD%E9%90%A9%E5%AD%98%E5%B8%B4%E9%8E%B5%E6%92%B3%E7%B4%91%22%2C%22platForm%22%3A%22information%22%2C%22%24ip%22%3A%22171.43.153.93%22%2C%22source%22%3A%22pc%E7%AB%AF%22%2C%22browser_name%22%3A%22safari%22%2C%22browser_version%22%3A%22605.1.15%22%2C%22user_gent%22%3A%22Mozilla%2F5.0%20(Macintosh%3B%20Intel%20Mac%20OS%20X%2010_13_6)%20AppleWebKit%2F605.1.15%20(KHTML%2C%20like%20Gecko)%20Version%2F13.0.3%20Safari%2F605.1.15%22%2C%22cname%22%3A%22%E6%B9%96%E5%8C%97%E7%9C%81%22%7D%2C%22data_from%22%3A%22information%22%7D' \
  -H 'Accept: */*' \
  -H 'Accept-Encoding: br, gzip, deflate' \
  -H 'Host: i.sporttery.cn' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15' \
  -H 'Accept-Language: zh-cn' \
  -H 'Referer: https://m.sporttery.cn/wap/fb/pool_result.html?m=117113&f=result_list' \
  -H 'Connection: keep-alive'";
  var child = child_process.exec(curl, function (err, stdout, stderr) {
    eval(stdout);
  });
}
connection.query(
  "select distinct playdatestr from t_fb_match where goalline = 0 and playtime > '2016-01-01' and final <> '-1:-1' ",

  function (error, results, fields) {
    if (error) throw error;
    results.forEach((row) => {
      get_fb_match_result(row.playdatestr);
    });
  }
);
connection.query(
  "select id from t_fb_match where final = '-1:-1' and result_status <> 'Abandon' ",

  function (error, results, fields) {
    if (error) throw error;
    results.forEach((row) => {
      get_pool_rs(row.id);
    });
  }
);

connection.end();
