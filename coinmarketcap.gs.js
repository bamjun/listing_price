function maintemp() {
  var c = 'BTC';
  getBitcoinMarketCap(c);
}

function getBitcoinMarketCap(currency) {
  var apiKey = coinMarketCapApiKey;  // CoinMarketCap API 키를 입력하세요.
  var url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
  var parameters = {
    'symbol': currency,  // 매개변수로 받은 화폐 기호
    'convert': 'KRW'  // 한화(KRW)로 변환
  };
  
  // API 호출을 위한 옵션 설정
  var options = {
    'method': 'GET',
    'headers': {
      'X-CMC_PRO_API_KEY': apiKey,
      'Accept': 'application/json'
    },
    'muteHttpExceptions': true
  };
  
  // 쿼리 문자열을 URL에 추가
  var queryString = Object.keys(parameters).map(function(key) {
    return key + '=' + encodeURIComponent(parameters[key]);
  }).join('&');
  
  var fullUrl = url + '?' + queryString;
  
  // 데이터 가져오기
  var response = UrlFetchApp.fetch(fullUrl, options);
  var json = JSON.parse(response.getContentText());
  
  if (json.status.error_code === 0) {
    var data = json.data[currency];
    var marketCap = data.quote.KRW.market_cap;  // KRW로 변환된 시가총액 조회
    Logger.log(currency + ' Market Cap: ' + marketCap);
  } else {
    Logger.log('Failed to fetch data: ' + json.status.error_message);
  }
}

function testtemp(){
  Logger.log(checkListingOnBinance('BTC'))
}

function checkListingOnBinance(symbol) {
  var symbol = 'BTC'
  var url = 'https://api.cryptowat.ch/markets/binance/' + symbol.toLowerCase() + 'usdt';

  try {
    var response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    var data = JSON.parse(response.getContentText());
    if (data.result) {
      Logger.log(symbol + ' is listed on Binance.');
      return '상장됨';
    }
  } catch (e) {
    if (e.message.includes('404')) {
      Logger.log(symbol + ' is not listed on Binance.');
      return '상장되지 않음';
    }
    Logger.log('Error checking listing: ' + e.toString());
    return '조회 실패';
  }
}
