/**
 * 2026 글로컬 부산관광 트래블톤 공모전
 * Google Apps Script Web App 연동 스크립트
 * 
 * [설치 및 헤더 자동 생성 방법]
 * 1. 구글 시트 (https://docs.google.com/spreadsheets/d/1n3zQcOOFtX8Bfr0XXZH9X4DDe_Be3JdzgGCWlCbfH4I/edit) 열기
 * 2. 상단 메뉴 [확장 프로그램] > [Apps Script] 클릭
 * 3. 기존 코드를 모두 지우고 이 파일의 내용을 붙여넣기
 * 4. 상단 함수 선택 드롭다운에서 [setupSheetHeader] 선택 후 ▶ [실행] 클릭!
 *    -> 구글 시트에 1행 헤더 항목이 자동으로 예쁘게 생성됩니다!
 * 5. 상단 [배포] > [새 배포] 클릭
 *    - 유형 선택: [웹 앱]
 *    - 설명: 트래블톤 접수 웹앱
 *    - 다음 사용자 권한으로 실행: '나(내 계정)'
 *    - 액세스 권한이 있는 사용자: '모든 사용자(Anyone)' 선택 (매우 중요!)
 * 6. [배포] 버튼 클릭 후 표시되는 웹 앱 URL을 복사하여 Vercel 또는 .env.local의 GOOGLE_APPS_SCRIPT_URL 값으로 설정
 */

var DRIVE_FOLDER_ID = "1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId"; // 구글 드라이브 폴더 ID

// 시트 헤더 자동 세팅 함수 (Apps Script에서 'setupSheetHeader' 선택 후 실행 클릭)
function setupSheetHeader() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  var headers = [
    "접수일시",
    "접수번호",
    "팀명",
    "대표자 성명",
    "생년월일",
    "출신 대학",
    "졸업 유무",
    "연락처",
    "이메일 주소",
    "팀원 명단",
    "개인정보 동의",
    "제3자 제공 동의",
    "신청서 파일 링크",
    "아이디어 계획서 링크",
    "개인정보 동의서 링크",
    "접수 상태"
  ];
  
  // 1행에 헤더 추가
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 헤더 스타일링 (오션 딥블루 테마, 볼드, 중앙 정렬)
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0f172a");
  headerRange.setFontColor("#38bdf8");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 40);
  
  // 열 너비 자동 조정
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }
  
  Logger.log("✅ 시트 헤더가 성공적으로 생성되었습니다!");
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    
    var regNo = payload.registrationNumber;
    var data = payload.data;
    var files = payload.files || {};
    
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // 파일 업로드 처리
    var applicationFileUrl = "미첨부";
    var proposalFileUrl = "미첨부";
    var consentFileUrl = "미첨부";
    
    if (files.applicationFile && files.applicationFile.base64) {
      var appBlob = Utilities.newBlob(Utilities.base64Decode(files.applicationFile.base64), files.applicationFile.type, "[신청서]_" + data.teamName + "_" + data.name + "_" + files.applicationFile.name);
      var appFile = folder.createFile(appBlob);
      applicationFileUrl = appFile.getUrl();
    }
    
    if (files.proposalFile && files.proposalFile.base64) {
      var propBlob = Utilities.newBlob(Utilities.base64Decode(files.proposalFile.base64), files.proposalFile.type, "[기획서]_" + data.teamName + "_" + data.name + "_" + files.proposalFile.name);
      var propFile = folder.createFile(propBlob);
      proposalFileUrl = propFile.getUrl();
    }
    
    if (files.consentFile && files.consentFile.base64) {
      var conBlob = Utilities.newBlob(Utilities.base64Decode(files.consentFile.base64), files.consentFile.type, "[동의서]_" + data.teamName + "_" + data.name + "_" + files.consentFile.name);
      var conFile = folder.createFile(conBlob);
      consentFileUrl = conFile.getUrl();
    }
    
    // 구글 시트 행 추가
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // 시트가 완전히 비어있다면 먼저 헤더를 자동 생성
    if (sheet.getLastRow() === 0) {
      setupSheetHeader();
    }
    
    // 학적 상태 라벨
    var gradLabels = {
      enrolled: "재학",
      leave_of_absence: "휴학",
      expected_graduation: "졸업예정",
      graduated: "졸업"
    };
    
    // 팀원 포맷팅
    var membersList = [];
    if (data.teamMembers && data.teamMembers.length > 0) {
      for (var i = 0; i < data.teamMembers.length; i++) {
        var m = data.teamMembers[i];
        membersList.push((i+1) + ". " + m.name + " (" + m.birthDate + ", " + m.university + ", " + (gradLabels[m.graduationStatus] || m.graduationStatus) + ")");
      }
    }
    var teamMembersString = membersList.length > 0 ? membersList.join("\n") : "단독 참가(팀원 없음)";
    
    var kstNow = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    
    var row = [
      kstNow,
      regNo,
      data.teamName || "개인",
      data.name,
      data.birthDate,
      data.university,
      gradLabels[data.graduationStatus] || data.graduationStatus,
      data.phone,
      data.email,
      teamMembersString,
      data.agreePrivacy ? "동의 (Y)" : "미동의 (N)",
      data.agreeThirdParty ? "동의 (Y)" : "미동의 (N)",
      applicationFileUrl,
      proposalFileUrl,
      consentFileUrl,
      "접수 완료"
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      registrationNumber: regNo,
      applicationFileUrl: applicationFileUrl,
      proposalFileUrl: proposalFileUrl,
      consentFileUrl: consentFileUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
