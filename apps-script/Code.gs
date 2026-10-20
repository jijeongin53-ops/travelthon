/**
 * 2026 글로컬 부산관광 트래블톤 공모전
 * Google Apps Script Web App 연동 스크립트 (구글 드라이브 + 구글 시트 + 이메일 알림 통합본)
 * 
 * [설치 및 배포 순서]
 * 1. 구글 시트 상단 메뉴 [확장 프로그램] > [Apps Script] 열기
 * 2. 기존 코드를 Ctrl+A로 전체 선택 후 지우고, 이 코드 전체를 붙여넣기 (Ctrl+V) -> 저장 (Ctrl+S)
 * 3. 상단 함수에서 'testSendEmail' 선택 후 [▶ 실행] 클릭 -> [권한 검토] 승인! (테스트 메일 도착)
 * 4. 우측 상단 [배포] > [배포 관리] > 연필 아이콘 > 버전: [새 버전] 선택 후 [배포] 클릭!
 */

var DRIVE_FOLDER_ID = "1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId"; // 구글 드라이브 폴더 ID
var ADMIN_EMAIL = "jijeongin53@gmail.com"; // 참가 신청 완료 시 알림을 받을 관리자 이메일

// 1. 시트 헤더 자동 세팅 함수
function setupSheetHeader() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = [
    "접수일시", "접수번호", "팀명", "대표자 성명", "생년월일", "출신 대학", "졸업 유무",
    "연락처", "이메일 주소", "팀원 명단", "개인정보 동의", "제3자 제공 동의",
    "제출 서류 1 (PDF)", "제출 서류 2 (PDF)", "제출 서류 3 이상 (PDF)", "접수 상태"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0f172a").setFontColor("#38bdf8").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(1, 40);
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }
  Logger.log("✅ 시트 헤더 생성 완료");
}

// 2. 이메일 권한 승인 및 단독 테스트 함수 (상단에서 'testSendEmail' 선택 후 [▶ 실행] 클릭!)
function testSendEmail() {
  var subject = "[테스트] 2026 트래블톤 이메일 알림 연동 테스트";
  var body = "안녕하세요!\n이 메일이 도착했다면 2026 글로컬 부산관광 트래블톤 접수 알림 연동이 성공적으로 완료된 것입니다.\n\n수신자: " + ADMIN_EMAIL;
  try {
    GmailApp.sendEmail(ADMIN_EMAIL, subject, body);
    Logger.log("✅ GmailApp 발송 성공: " + ADMIN_EMAIL);
  } catch (e) {
    MailApp.sendEmail(ADMIN_EMAIL, subject, body);
    Logger.log("✅ MailApp 발송 성공: " + ADMIN_EMAIL);
  }
}

// 3. 웹 참가 신청 수신 처리 함수 (파일 업로드 + 시트 기록 + 이메일 즉시 전송)
function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var regNo = payload.registrationNumber;
    var data = payload.data;
    var filesPayload = payload.files || {};
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // 파일 업로드 처리 (최대 5개 PDF 지원)
    var uploadedFileUrls = [];
    var fileList = Array.isArray(filesPayload) ? filesPayload : Object.keys(filesPayload).map(function(k) { return filesPayload[k]; });
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if (f && f.base64) {
        var blob = Utilities.newBlob(
          Utilities.base64Decode(f.base64),
          f.type || 'application/pdf',
          '[서류' + (i + 1) + ']_' + (data.teamName || '팀') + '_' + data.name + '_' + f.name
        );
        var newFile = folder.createFile(blob);
        uploadedFileUrls.push(newFile.getUrl());
      }
    }
    
    // 구글 시트 행 추가
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      setupSheetHeader();
    }
    
    var gradLabels = {
      enrolled: "재학",
      leave_of_absence: "휴학",
      expected_graduation: "졸업예정",
      graduated: "졸업"
    };
    
    var membersList = [];
    if (data.teamMembers && data.teamMembers.length > 0) {
      for (var m = 0; m < data.teamMembers.length; m++) {
        var tm = data.teamMembers[m];
        membersList.push((m + 1) + ". " + tm.name + " (" + tm.birthDate + ", " + tm.university + ", " + (gradLabels[tm.graduationStatus] || tm.graduationStatus) + ")");
      }
    }
    var teamMembersStr = membersList.length > 0 ? membersList.join("\n") : "단독 참가(팀원 없음)";
    var kstNow = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    
    sheet.appendRow([
      kstNow,
      regNo,
      data.teamName || "개인",
      data.name,
      data.birthDate,
      data.university,
      gradLabels[data.graduationStatus] || data.graduationStatus,
      data.phone,
      data.email,
      teamMembersStr,
      data.agreePrivacy ? "동의 (Y)" : "미동의 (N)",
      data.agreeThirdParty ? "동의 (Y)" : "미동의 (N)",
      uploadedFileUrls[0] || "미첨부",
      uploadedFileUrls[1] || "미첨부",
      uploadedFileUrls.slice(2).join("\n") || "미첨부",
      "접수 완료"
    ]);
    
    // 참가 신청 완료 시 관리자(jijeongin53@gmail.com)에게 즉시 이메일 알림 발송
    try {
      var recipient = payload.notificationEmail || ADMIN_EMAIL;
      var teamTitle = data.teamName || "개인";
      var mailSubj = "[2026 트래블톤 참가 접수 알림] " + teamTitle + " (" + data.name + " 대표)";
      var mailBody = 
        "📢 [2026 글로컬 부산관광 트래블톤 공모전] 신규 참가 신청이 접수되었습니다!\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "1. 접수 기본 정보\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "• 접수 번호 : " + regNo + "\n" +
        "• 접수 일시 : " + kstNow + "\n" +
        "• 팀    명 : " + teamTitle + "\n" +
        "• 대 표 자 : " + data.name + " (" + data.birthDate + ")\n" +
        "• 소속/대학: " + data.university + " (" + (gradLabels[data.graduationStatus] || data.graduationStatus) + ")\n" +
        "• 연 락 처 : " + data.phone + "\n" +
        "• 이 메 일 : " + data.email + "\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "2. 팀원 명단\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        teamMembersStr + "\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "3. 제출 서류 파일 (구글 드라이브)\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        (uploadedFileUrls.length > 0 ? uploadedFileUrls.join("\n") : "업로드된 파일 없음") + "\n\n" +
        "📊 구글 시트 바로가기:\n" +
        "https://docs.google.com/spreadsheets/d/1n3zQcOOFtX8Bfr0XXZH9X4DDe_Be3JdzgGCWlCbfH4I/edit\n\n" +
        "📁 구글 드라이브 바로가기:\n" +
        "https://drive.google.com/drive/folders/" + DRIVE_FOLDER_ID;

      try {
        GmailApp.sendEmail(recipient, mailSubj, mailBody);
      } catch (gErr) {
        MailApp.sendEmail(recipient, mailSubj, mailBody);
      }
    } catch (mailError) {
      Logger.log("⚠️ 이메일 발송 오류 (접수는 정상 완료): " + mailError.toString());
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      registrationNumber: regNo,
      uploadedFileUrls: uploadedFileUrls
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
