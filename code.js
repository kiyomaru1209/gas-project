function convertSheetToBoy() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('boys');
  let jsonSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('json');
  
  if (!jsonSheet) {
    jsonSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('json');
  }

  const data = sheet.getRange(4, 1, 54, 17).getValues(); // 4行目から57行目までのデータを取得

  const boys = data.map(row => {
    return {
      id: row[0].toString().length === 1 ? "0" + row[0].toString() : row[0].toString(),
      name: row[1],
      cv: row[2],
      unit: row[3],
      catchPhrase: row[4],
      bestComment: row[5],
      betterComment: row[6],
      tags: [row[7], row[8], row[9]],
      stils: [
        { title: row[11], imageUrl: row[10] },
        { title: row[13], imageUrl: row[12] }
      ],
      detailUrl: row[14],
      mv: [
        { title: row[15], url: row[16]?.replace('https://youtu.be/', 'https://www.youtube.com/embed/') ?? "test" }
      ]
    };
  });

  const jsonString = JSON.stringify(boys, null, 2);
  jsonSheet.getRange('B2').setValue(jsonString);
}

function convertSheetToResultPattern() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('logic');
  let jsonSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('json');
  
  if (!jsonSheet) {
    jsonSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('json');
  }
  const boysSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('boys');
  const boysData = boysSheet.getRange(2, 1, boysSheet.getLastRow() - 1, 2).getValues(); // boysのデータを取得

  const boysMap = {};
  boysData.forEach(row => {
    boysMap[row[1]] = row[0].toString().length === 1 ? "0" + row[0].toString() : row[0].toString(); // 名前をキーにしてidをマップに保存
  });

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 15).getValues(); // 2行目から最終行までのデータを取得

  const resultPatterns = [];

  data.forEach((row, index) => {
    for (let i = 9; i <= 14; i++) {
      let economic_benefit = row[i] ;
      let score_rank = 'c';
      if ( i === 10 ) {
        economic_benefit = economic_benefit * 10000 // 資料として提供されたセルのフォーマットが統一されていないので、無理やりフォローする。
        score_rank = 'b'
      } else if ( i === 11 ) {
        score_rank = 'a'
      } else if ( i === 12 ) {
        economic_benefit = economic_benefit * 100000000 // 資料として提供されたセルのフォーマットが統一されていないので、無理やりフォローする。
        score_rank = 's'
      } else if ( i === 13 ) {
        economic_benefit = economic_benefit * 100000000 // 資料として提供されたセルのフォーマットが統一されていないので、無理やりフォローする。
        score_rank = 'ss'
      } else if ( i === 14 ) {
        economic_benefit = economic_benefit * 100000000 // 資料として提供されたセルのフォーマットが統一されていないので、無理やりフォローする。
        score_rank = 'sss'
      }
      Logger.log(economic_benefit)
      economic_benefit = validateEconomicBenefit(economic_benefit);
      resultPatterns.push({
        result_code: generateResultCode(row, economic_benefit), // 修正したgenerateResultCodeを使用
        q1: convertAnswer(row[1]),
        q2: convertAnswer(row[2]),
        q3: convertAnswer(row[3]),
        q4: convertAnswer(row[4]),
        q5: convertFinalAnswer(row[5]),
        best_boy: boysMap[row[6]] || row[6], // boysMapからidを取得
        better_boy1: boysMap[row[7]] || row[7], // boysMapからidを取得
        better_boy2: boysMap[row[8]] || row[8], // boysMapからidを取得
        economic_benefits: economic_benefit,   // 金額を数値に変換
        rank: score_rank,
      });
    }
  });

  const jsonString = JSON.stringify(resultPatterns, null, 2);
  Logger.log(jsonString);

  // JSONファイルとしてGoogleドライブに保存
  const fileName = 'resultPatterns.json';
  const blob = Utilities.newBlob(jsonString, MimeType.PLAIN_TEXT, fileName);
  const file = DriveApp.createFile(blob);
  
  // ダウンロードリンクを取得
  const fileUrl = file.getDownloadUrl();
  Logger.log('Download URL: ' + fileUrl);
}

function convertAnswer(answer) {
  switch (answer) {
    case 'A.そうだ':
      return 'yes';
    case 'B.どちらでもない':
      return 'neutral';
    case 'C.そうではない':
      return 'no';
    default:
      return 'neutral'; // デフォルト値
  }
}

function convertFinalAnswer(answer) {
  switch (answer) {
    case 'A.時間':
      return 'time';
    case 'B.センス':
      return 'sense';
    case 'C.権力':
      return 'power';
    default:
      return 'time'; // デフォルト値
  }
}

function getRandomNumber() {
   const upperFourDigits = Math.floor(Math.random() * 9999); // 1000から9999までのランダムな数
  let remainingDigits = Math.pow(10, Math.floor(Math.random() * 7)); // 残りの桁数をランダムに生成
  if (remainingDigits * upperFourDigits < 1000000 && Math.random() < 0.5 ) {
    remainingDigits = -remainingDigits
  } // 100万以下なら符号判定もつける
  return remainingDigits * upperFourDigits;
}

function generateResultCode(row, economic_benefit) {
  const dataString = row.slice(1, 6).join('') + economic_benefit;
  const resultCode = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, dataString)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2))
    .join('');
  return resultCode.slice(0, 10); // 最初の10文字を取得
}

function validateEconomicBenefit(economic_benefit) {
  if (typeof economic_benefit === 'number') {
    return formatNumberToKanji(economic_benefit);
  }
  return economic_benefit;
}

function formatNumberToKanji(number) {
  const units = ['', '万', '億', '兆'];
  let sign = '';
  let result = '';
  let unitIndex = 0;
  if ( number < 0 ) {
    number = -number
    sign = '-'
  }

  while (number > 0) {
    const part = number % 10000;
    if (part > 0) {
      result = part + units[unitIndex] + result;
    }
    number = Math.floor(number / 10000);
    unitIndex++;
  }

  return sign + result + '円';
}

function getRandomNumber() {
  const upperFourDigits = Math.floor(Math.random() * 9999); // 1000から9999までのランダムな数
  let remainingDigits = Math.pow(10, Math.floor(Math.random() * 7)); // 残りの桁数をランダムに生成
  if (remainingDigits * upperFourDigits < 1000000 && Math.random() < 0.5 ) {
    remainingDigits = -remainingDigits
  } // 100万以下なら符号判定もつける
  return remainingDigits * upperFourDigits;
}

function getRandomNumber() {
  const upperFourDigits = Math.floor(Math.random() * 9999); // 1000から9999までのランダムな数
  let remainingDigits = Math.pow(10, Math.floor(Math.random() * 7)); // 残りの桁数をランダムに生成
  if (remainingDigits * upperFourDigits < 1000000 && Math.random() < 0.5 ) {
    remainingDigits = -remainingDigits
  } // 100万以下なら符号判定もつける
  return remainingDigits * upperFourDigits; 
}

function getRandomNumber() {
  const upperFourDigits = Math.floor(Math.random() * 9999); // 1000から9999までのランダムな数
  let remainingDigits = Math.pow(10, Math.floor(Math.random() * 7)); // 残りの桁数をランダムに生成
  if (remainingDigits * upperFourDigits < 1000000 && Math.random() < 0.5 ) {
    remainingDigits = -remainingDigits
  } // 100万以下なら符号判定もつける
  return remainingDigits * upperFourDigits;
}

function getRandomNumber() {
  const upperFourDigits = Math.floor(Math.random() * 9999); // 1000から9999までのランダムな数
  let remainingDigits = Math.pow(10, Math.floor(Math.random() * 7)); // 残りの桁数をランダムに生成
  if (remainingDigits * upperFourDigits < 1000000 && Math.random() < 0.5 ) {
    remainingDigits = -remainingDigits
  } // 100万以下なら符号判定もつける
  return remainingDigits * upperFourDigits;
}

function getRandomNumber() {
  const upperFourDigits = Math.floor(Math.random() * 9999); // 1000から9999までのランダムな数
  let remainingDigits = Math.pow(10, Math.floor(Math.random() * 7)); // 残りの桁数をランダムに生成
  if (remainingDigits * upperFourDigits < 1000000 && Math.random() < 0.5 ) {
    remainingDigits = -remainingDigits
  } // 100万以下なら符号判定もつける
  return remainingDigits * upperFourDigits;
} 