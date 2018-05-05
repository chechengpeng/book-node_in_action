// 定义一个 Node 模块
var canadianDollar = 0.91;

function roundTwoDecimals(amout) {
  return Math.round(amout * 100) / 100;
}

exports.canadianToUS = function(canadian) {
  return roundTwoDecimals(canadian * canadianDollar);
};

exports.USToCanadian = function(us) {
  return roundTwoDecimals(us / canadianDollar);
};
