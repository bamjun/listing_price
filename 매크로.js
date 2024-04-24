/** @OnlyCurrentDoc */

function importCryptoData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var url = 'https://api.bithumb.com/public/ticker/ALL_KRW';

  // API 호출을 위한 옵션 설정
  var options = {
    'method': 'get',
    'headers': {'Accept': 'application/json'},
    'muteHttpExceptions': true
  };

  // 데이터 가져오기
  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());

  if (json.status === '0000') {
    var data = json.data;
    var row = 2; // 데이터 시작 행 (1행은 제목 행이라 가정)
    var colNames = ["opening_price", "closing_price", "min_price", "max_price", "units_traded", "acc_trade_value", "prev_closing_price", "units_traded_24H", "acc_trade_value_24H", "fluctate_24H", "fluctate_rate_24H"];
    
    // 컬럼 이름을 스프레드시트에 쓰기
    var headers = ["Currency"].concat(colNames).concat(["Market Cap", "Listed on Binance"]);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // 각 암호화폐에 대한 정보를 스프레드시트에 쓰기
    for (var key in data) {
      if (data.hasOwnProperty(key) && typeof data[key] === 'object') {
        var values = [key]; // 암호화폐 이름
        colNames.forEach(function(colName) {
          values.push(data[key][colName] || ''); // 해당 필드 값이 없을 경우 빈 문자열 삽입
        });
        
        // CoinMarketCap API를 호출하여 시가총액 데이터를 가져오기
        var marketCap = getCoinMarketCap(key);
        values.push(marketCap);  // 마지막 컬럼에 시가총액 추가
        
        // // 바이낸스 상장 여부 확인
        // var listedOnBinance = checkBinanceListing(key);
        // values.push(listedOnBinance);  // 마지막에 'O' 또는 'X' 추가
        
        sheet.getRange(row, 1, 1, values.length).setValues([values]);
        row++;
      }
    }
  } else {
    Logger.log('Failed to fetch data: ' + json.status);
  }
}

// CoinMarketCap API에서 특정 화폐의 시가총액을 가져오는 함수
function getCoinMarketCap(currency) {
  var apiKey = coinMarketCapApiKey; // CoinMarketCap API 키
  var url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
  var parameters = {
    'symbol': currency,
    'convert': 'KRW'
  };
  
  var options = {
    'method': 'GET',
    'headers': {
      'X-CMC_PRO_API_KEY': apiKey,
      'Accept': 'application/json'
    },
    'muteHttpExceptions': true
  };
  
  var queryString = Object.keys(parameters).map(function(key) {
    return key + '=' + encodeURIComponent(parameters[key]);
  }).join('&');
  
  var fullUrl = url + '?' + queryString;
  var response = UrlFetchApp.fetch(fullUrl, options);
  var json = JSON.parse(response.getContentText());
  
  if (json.status.error_code === 0 && json.data[currency]) {
    return json.data[currency].quote.KRW.market_cap || 'N/A';
  } else {
    return 'N/A';  // API 호출 실패 또는 데이터 없음
  }
}




// 바이낸스에서 특정 코인의 상장 여부를 확인
function checkBinanceListing(symbol) {
  var url = 'https://api.binance.com/api/v3/exchangeInfo';
  
  try {
    var response = UrlFetchApp.fetch(url);
    var json = JSON.parse(response.getContentText());
    var symbols = json.symbols;
    for (var i = 0; i < symbols.length; i++) {
      if (symbols[i].symbol === symbol + "BTC" || symbols[i].symbol === symbol + "USDT") {
        return 'O';  // 상장된 경우
      }
    }
    return 'X';  // 상장되지 않은 경우
  } catch (e) {
    Logger.log('Error checking Binance listing: ' + e.toString());
    return 'N/A';  // API 호출 실패 경우
  }
}
