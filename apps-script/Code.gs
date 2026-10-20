/**
 * 2026 글로컬 부산관광 트래블톤 공모전
 * Google Apps Script Web App 연동 스크립트 (최대 5개 PDF 및 구글 시트 자동 저장 + 이메일 알림)
 * 
 * [설치 및 이메일 권한 승인 / 배포 방법]
 * 1. 구글 시트 (https://docs.google.com/spreadsheets/d/1n3zQcOOFtX8Bfr0XXZH9X4DDe_Be3JdzgGCWlCbfH4I/edit) 열기
 * 2. 상단 메뉴 [확장 프로그램] > [Apps Script] 클릭
 * 3. 기존 코드를 모두 지우고 이 파일(Code.gs)의 전체 내용을 붙여넣기 후 [저장(Ctrl+S)]
 * 
 * 4. ★ 이메일 전송 권한 승인 (필수!):
 *    - 상단 함수 선택 드롭다운에서 [testSendEmail] 선택 후 ▶ [실행] 클릭!
 *    - "권한 검토" 팝업이 뜨면 [내 구글 계정 선택] > [고급] > [안전하지 않은 페이지로 이동] > [허용] 클릭!
 *    - 허용 즉시 jijeongin53@gmail.com 으로 테스트 메일이 도착합니다.
 * 
 * 5. ★ 웹앱 새 버전으로 배포 (필수!):
 *    - 상단 우측 파란색 [배포] 버튼 > [배포 관리] 클릭
 *    - 현재 배포 항목 우측의 연필(수정) 아이콘 클릭
 *    - 버전 드롭다운에서 반드시 [새 버전] 선택!
 *    - 하단 [배포] 버튼 클릭!
 */

var DRIVE_FOLDER_ID = "1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId"; // 구글 드라이브 폴더 ID
var DEFAULT_ADMIN_EMAIL = "jijeongin53@gmail.com"; // 참가 신청 완료 시 알림을 받을 관리자 이메일

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
    "제출 서류 1 (PDF)",
    "제출 서류 2 (PDF)",
    "제출 서류 3 이상 (PDF)",
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

// 📧 이메일 발송 권한 승인 및 단독 테스트 함수 (상단에서 'testSendEmail' 선택 후 [▶ 실행] 클릭!)
function testSendEmail() {
  var testEmail = DEFAULT_ADMIN_EMAIL;
  var subject = "[테스트] 2026 트래블톤 이메일 알림 연동 테스트";
  var body = "안녕하세요!\n이 메일이 도착했다면 2026 글로컬 부산관광 트래블톤 접수 알림 연동이 성공적으로 완료된 것입니다.\n\n수신자: " + testEmail;
  
  try {
    GmailApp.sendEmail(testEmail, subject, body);
    Logger.log("✅ GmailApp으로 테스트 메일 발송 성공: " + testEmail);
  } catch (e1) {
    Logger.log("GmailApp 실패, MailApp 시도: " + e1.toString());
    MailApp.sendEmail(testEmail, subject, body);
    Logger.log("✅ MailApp으로 테스트 메일 발송 성공: " + testEmail);
  }
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    
    var regNo = payload.registrationNumber;
    var data = payload.data;
    var filesPayload = payload.files || {};
    
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // 파일 업로드 처리 (단일/복수 최대 5개 PDF 지원)
    var uploadedFileUrls = [];
    
    // 1) 배열 형태로 전달된 경우
    if (Array.isArray(filesPayload)) {
      for (var i = 0; i < filesPayload.length; i++) {
        var f = filesPayload[i];
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
    } else {
      // 2) 객체 키 형태로 전달된 경우 (file_1, file_2... 또는 applicationFile 등)
      var keys = Object.keys(filesPayload);
      for (var j = 0; j < keys.length; j++) {
        var k = keys[j];
        var fObj = filesPayload[k];
        if (fObj && fObj.base64) {
          var blob2 = Utilities.newBlob(
            Utilities.base64Decode(fObj.base64),
            fObj.type || 'application/pdf',
            '[' + k + ']_' + (data.teamName || '팀') + '_' + data.name + '_' + fObj.name
          );
          var newFile2 = folder.createFile(blob2);
          uploadedFileUrls.push(newFile2.getUrl());
        }
      }
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
      for (var mIdx = 0; mIdx < data.teamMembers.length; mIdx++) {
        var m = data.teamMembers[mIdx];
        membersList.push((mIdx + 1) + ". " + m.name + " (" + m.birthDate + ", " + m.university + ", " + (gradLabels[m.graduationStatus] || m.graduationStatus) + ")");
      }
    }
    var teamMembersString = membersList.length > 0 ? membersList.join("\n") : "단독 참가(팀원 없음)";
    
    var kstNow = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    
    var file1 = uploadedFileUrls[0] || "미첨부";
    var file2 = uploadedFileUrls[1] || "미첨부";
    var file3 = uploadedFileUrls.slice(2).join("\n") || "미첨부";
    
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
      file1,
      file2,
      file3,
      "접수 완료"
    ];
    
    sheet.appendRow(row);
    
    // 참가 신청 완료 시 관리자(jijeongin53@gmail.com)에게 즉시 이메일 알림 발송
    try {
      var recipient = payload.notificationEmail || DEFAULT_ADMIN_EMAIL;
      var teamTitle = data.teamName || "개인";
      var emailSubject = "[2026 트래블톤 참가 접수 알림] " + teamTitle + " (" + data.name + " 대표)";
      
      var textBody = 
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
        teamMembersString + "\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "3. 제출 서류 파일\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        (uploadedFileUrls.length > 0 ? uploadedFileUrls.join("\n") : "업로드된 파일 없음") + "\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "📊 구글 스프레드시트 바로가기:\n" +
        "https://docs.google.com/spreadsheets/d/1n3zQcOOFtX8Bfr0XXZH9X4DDe_Be3JdzgGCWlCbfH4I/edit\n\n" +
        "📁 구글 드라이브 폴더 바로가기:\n" +
        "https://drive.google.com/drive/folders/" + DRIVE_FOLDER_ID;

      var htmlFilesList = "";
      if (uploadedFileUrls.length > 0) {
        for (var u = 0; u < uploadedFileUrls.length; u++) {
          htmlFilesList += '<li><a href="' + uploadedFileUrls[u] + '" target="_blank" style="color: #0284c7; text-decoration: underline;">제출 서류 ' + (u + 1) + ' 열기 (구글 드라이브)</a></li>';
        }
      } else {
        htmlFilesList = "<li>업로드된 파일 없음</li>";
      }

      var htmlBody = 
        '<div style="font-family: \'Apple SD Gothic Neo\', \'Malgun Gothic\', sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">' +
        '  <div style="background: linear-gradient(135deg, #0f172a, #0369a1); padding: 20px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 24px;">' +
        '    <h2 style="margin: 0 0 6px 0; font-size: 20px; font-weight: bold; color: #38bdf8;">2026 글로컬 부산관광 트래블톤</h2>' +
        '    <p style="margin: 0; font-size: 14px; color: #e2e8f0;">새로운 참가 신청서가 접수되었습니다.</p>' +
        '  </div>' +
        '  <h3 style="font-size: 16px; color: #0f172a; border-left: 4px solid #0284c7; padding-left: 8px; margin: 18px 0 10px 0;">1. 접수 정보</h3>' +
        '  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">' +
        '    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px; width: 28%; font-weight: bold; color: #475569; background: #f8fafc;">접수번호</td><td style="padding: 8px; font-weight: bold; color: #0284c7;">' + regNo + '</td></tr>' +
        '    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px; font-weight: bold; color: #475569; background: #f8fafc;">접수일시</td><td style="padding: 8px; color: #1e293b;">' + kstNow + '</td></tr>' +
        '    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px; font-weight: bold; color: #475569; background: #f8fafc;">팀명</td><td style="padding: 8px; font-weight: bold; color: #1e293b;">' + teamTitle + '</td></tr>' +
        '    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px; font-weight: bold; color: #475569; background: #f8fafc;">대표자명</td><td style="padding: 8px; color: #1e293b;">' + data.name + ' (' + data.birthDate + ')</td></tr>' +
        '    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px; font-weight: bold; color: #475569; background: #f8fafc;">소속 / 대학</td><td style="padding: 8px; color: #1e293b;">' + data.university + ' (' + (gradLabels[data.graduationStatus] || data.graduationStatus) + ')</td></tr>' +
        '    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px; font-weight: bold; color: #475569; background: #f8fafc;">연락처</td><td style="padding: 8px; color: #1e293b;"><a href="tel:' + data.phone + '" style="color: #0284c7;">' + data.phone + '</a></td></tr>' +
        '    <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px; font-weight: bold; color: #475569; background: #f8fafc;">이메일</td><td style="padding: 8px; color: #1e293b;"><a href="mailto:' + data.email + '" style="color: #0284c7;">' + data.email + '</a></td></tr>' +
        '  </table>' +
        '  <h3 style="font-size: 16px; color: #0f172a; border-left: 4px solid #0284c7; padding-left: 8px; margin: 18px 0 10px 0;">2. 팀원 명단</h3>' +
        '  <div style="background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap; margin-bottom: 20px;">' + teamMembersString + '</div>' +
        '  <h3 style="font-size: 16px; color: #0f172a; border-left: 4px solid #0284c7; padding-left: 8px; margin: 18px 0 10px 0;">3. 제출 서류 파일</h3>' +
        '  <ul style="font-size: 13px; line-height: 1.8; color: #334155; margin-bottom: 24px; padding-left: 20px;">' + htmlFilesList + '</ul>' +
        '  <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">' +
        '    <a href="https://docs.google.com/spreadsheets/d/1n3zQcOOFtX8Bfr0XXZH9X4DDe_Be3JdzgGCWlCbfH4I/edit" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #0284c7; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; margin: 0 4px;">구글 시트 확인하기</a>' +
        '    <a href="https://drive.google.com/drive/folders/' + DRIVE_FOLDER_ID + '" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; margin: 0 4px;">구글 드라이브 확인하기</a>' +
        '  </div>' +
        '</div>';

      var mailSent = false;
      var mailErrorDetail = "";
      
      try {
        GmailApp.sendEmail(recipient, emailSubject, textBody, {
          htmlBody: htmlBody
        });
        mailSent = true;
        Logger.log("✅ GmailApp 관리자 이메일 알림 발송 성공: " + recipient);
      } catch (err1) {
        Logger.log("GmailApp 실패, MailApp 시도: " + err1.toString());
        try {
          MailApp.sendEmail({
            to: recipient,
            subject: emailSubject,
            body: textBody,
            htmlBody: htmlBody
          });
          mailSent = true;
          Logger.log("✅ MailApp 관리자 이메일 알림 발송 성공: " + recipient);
        } catch (err2) {
          mailErrorDetail = "GmailApp: " + err1.toString() + " | MailApp: " + err2.toString();
          Logger.log("⚠️ 이메일 알림 발송 실패: " + mailErrorDetail);
        }
      }
    } catch (mailError) {
      Logger.log("⚠️ 이메일 처리 중 예외 발생: " + mailError.toString());
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      registrationNumber: regNo,
      uploadedFileUrls: uploadedFileUrls,
      mailSent: mailSent,
      mailErrorDetail: mailErrorDetail || undefined
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
