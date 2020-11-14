/**
 *

牛牛红包玩法模拟计算 
1 取数范围 
    每次随机从0.01 -9.99中任意取10个小数； 
    其中随机1个数为庄家的数，其他9个数随机给9个玩家； 
2．比较大小： 
    1)计算牛数： 
        每个数的三个位置上的数相加之和的尾数为牛数， 比如1.23，和为6，则为牛6，比如7.98，和为24，则为牛4; 
    2)比较牛数： 
        每个玩家的牛数分别与庄家的牛数比较大小（比较9次），谁的牛数大谁就赢； 
    3)计算奖金： 
        如果玩家比庄家小，则输，输的金额＝投注金额＊庄家牛数； 
        如果玩家比庄家大，则赢，赢的金额＝投注金额＊玩家牛数； 
    举例 
        庄家为牛8，玩家分别为牛1，牛2，牛3，牛5，牛6，牛7，牛8，牛9，牛牛； 
        且每个玩家均投注100，则玩家分别一800, -800, -800, -800, -800, -800,800, 900,1000; 
        特别说明：如果庄家与玩家牛数相同时，则数字大的赢。比如庄家3.16，玩家2.17，都是牛牛，但是庄家3.16> 2.17，所以庄赢； 
3．统计每期报表 
    1)计算每期收入， 每期收入＝玩家输钱总额＋玩家赢钱总额*10%; 
    2)计算每期支出， 每期支出＝玩家赢钱总额*90%＋玩家投注总额＊30%;
    3)计算每期盈利， 盈利＝每期收入一每期支出;
    4)计算累积盈利， 累积盈利＝每期盈利累加之和，比如第1期盈利100，第2期盈利一80，则总盈利＝100+ (-80) =20 

 *
 */

const fs = require("fs");
const path = require("path");
//总局数
const try_times = 0.01 * 10000;
//开始局数
let start_num = 1;
//结束局数
let end_num = try_times;
//参数
let args = process.argv.splice(2);
//总玩家数（算上庄家）
let playerCount = 10;
//均注投注金额
let betMoney = 100;
//保存结果到文件
let jsonFile = "data.json";
//是否输出发牌信息
let verbose = false;

let argsStr = args.join(";");

function printHelp() {
  console.log("使用方法：");
  console.log("-s  --start_num   :", " 指定开始期数，默认是1期");
  console.log("-e  --end_num     :", " 指定结束期数，默认是100期");
  console.log("-h  --help        :", " 输出此菜单");
  console.log("-p  --playerCount :", " 指定玩家数量，包括了庄家，默认是10");
  console.log("-b  --betMoney    :", " 指定玩家的均注金额，默认是100");
  console.log("-f  --jsonFile    :", " 指定保存的文件，默认是data.json");
  console.log(
    "-v  --verbose     :",
    " 指定是否输出详细信息，默认只输出结果,不输出具体发牌信息"
  );
  process.exit();
}

if (argsStr.indexOf("-") != -1) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] == "--start_num" || args[i] == "-s") {
      start_num = parseInt(args[++i]);
    } else if (args[i] == "--end_num" || args[i] == "-e") {
      end_num = parseInt(args[++i]);
    } else if (args[i] == "--playerCount" || args[i] == "-p") {
      playerCount = parseInt(args[++i]);
    } else if (args[i] == "--betMoney" || args[i] == "-m") {
      betMoney = parseInt(args[++i]);
    } else if (args[i] == "--jsonFile" || args[i] == "-f") {
      jsonFile = args[++i];
    } else if (args[i] == "--verbose" || args[i] == "-v") {
      verbose = true;
    } else if (
      args[i] == "--help" ||
      args[i] == "-h" ||
      args[i] == "-?" ||
      args[i] == "/?"
    ) {
      printHelp();
    }
  }
} else {
  if (args.length >= 2) {
    start_num = parseInt(args[0]);
    end_num = parseInt(args[1]);
  }
  if (args.length >= 3) {
    playerCount = parseInt(args[2]);
  }
  if (args.length >= 4) {
    betMoney = parseInt(args[3]);
  }
  if (args.length >= 5) {
    jsonFile = args[4];
    verbose = true;
  }

  if (start_num < 1) {
    start_num = 1;
  }
}

if (
  start_num == NaN ||
  end_num == NaN ||
  betMoney == NaN ||
  playerCount == NaN ||
  jsonFile == null
) {
  printHelp();
  process.exit();
}
let dirname = path.dirname(jsonFile);
if (!fs.existsSync(dirname)) {
  fs.mkdirSync(dirname);
}
//求和
function sum(num) {
  return parseInt(num[0]) + parseInt(num[1]) + parseInt(num[2]);
}
//求最后一个数,求牛
function getNiu(num) {
  if (num < 10) {
    return num;
  } else {
    return num % 10;
  }
}
//求这一轮生成的发牌的点数
// playerCount 是发牌个数
function getPlayCards() {
  var playerCards = [];
  for (let i = 0; i < playerCount; i++) {
    let num = Math.random().toFixed(3).substring(2);
    let sumNum = sum(num);
    let niu = getNiu(sumNum);
    if (niu == 0) {
      niu = 10;
    }
    // console.log(i, num, sumNum, niu);

    playerCards.push({ num, sumNum, niu });
  }
  return playerCards;
}
//计算结果，wdl 如果庄家输，则1，如果玩家输，则-1，庄家自己是0
function calc(masterIndex, playerCards) {
  let masterCard = playerCards[masterIndex];
  masterCard.wMoney = 0;
  masterCard.lMoney = 0;
  for (let index = 0; index < playerCards.length; index++) {
    const element = playerCards[index];
    let wdl = 0,
      money = 0;
    if (index == masterIndex) {
      // element.wdl = 0;
    } else {
      if (masterCard.niu > element.niu) {
        wdl = -1;
      } else if (masterCard.niu < element.niu) {
        wdl = 1;
      } else {
        if (masterCard.num > element.num) {
          wdl = -1;
        } else if (masterCard.num < element.num) {
          wdl = 1;
        } else {
          wdl = 1;
        }
      }
      if (wdl == 1) {
        //赢的金额＝投注金额＊玩家牛数；
        money = element.niu * betMoney;
        //玩家赢钱总额
        masterCard.wMoney += money;
      } else {
        //输的金额＝投注金额＊庄家牛数；
        money = masterCard.niu * betMoney;
        //玩家输钱总额
        masterCard.lMoney += money;
      }
      element.money = money;
      element.wdl = wdl;
    }
  }
  //收入 每期收入＝玩家输钱总额＋玩家赢钱总额*10%;
  masterCard.getMoney = masterCard.lMoney + masterCard.wMoney * 0.1;
  //支出 玩家赢钱总额*90%＋玩家投注总额＊30%;
  masterCard.payMoney =
    masterCard.wMoney   + (playerCount - 1) * betMoney * 0.3;
  //盈利 每期收入-每期支出;
  masterCard.winMoney = masterCard.getMoney - masterCard.payMoney;

  return masterCard;
}
//计算累积盈利， 累积盈利＝每期盈利累加之和，比如第1期盈利100，第2期盈利一80，则总盈利＝100+ (-80) =20
let totalWin = 0;
let issueArr = [];
for (let index = start_num; index < end_num; index++) {
  let masterIndex = parseInt(Math.random() * 10);
  let playerCards = getPlayCards();
  let masterCard = calc(masterIndex, playerCards);
  // console.log(playerCards);
  if (verbose) {
    let result = {};
    result["当前期"] = index + 1;
    result["收入"] = masterCard.getMoney;
    result["支出"] = masterCard.payMoney;
    result["盈利"] = masterCard.winMoney;
    result["玩家总赢"] = masterCard.wMoney;
    result["玩家总输"] = masterCard.lMoney;
    result["庄家发牌"] = {
      num: masterCard.num,
      sumNum: masterCard.sumNum,
      niu: masterCard.niu,
    };
    playerCards.splice(masterIndex, 1);
    result["玩家发牌"] = playerCards;
    console.log(result);
    issueArr.push(result);
  }
  totalWin += masterCard.winMoney;
}
let result = {};
result["开始期:"] = start_num;
result["结束期:"] = end_num;
result["共有期数:"] = end_num + 1 - start_num;
result["玩家个数:"] = playerCount - 1;
result["玩家均注:"] = betMoney;
result["计算累积盈利:"] = totalWin;

if (verbose) {
  fs.writeFileSync(jsonFile, JSON.stringify({ issueArr, result }));
} else {
  fs.writeFileSync(jsonFile, JSON.stringify({ result }));
}
console.log(result);
