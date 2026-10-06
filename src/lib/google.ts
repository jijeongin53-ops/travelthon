// Google Sheets 및 Google Drive 연동 헬퍼 모듈
import { google } from 'googleapis';
import { Readable } from 'stream';
import { ApplicationFormData, GRADUATION_STATUS_LABELS } from './types';

// 환경변수에서 설정 읽기 (기본값 포함)
export const GOOGLE_SHEET_ID =
  process.env.GOOGLE_SHEET_ID || '1n3zQcOOFtX8Bfr0XXZH9X4DDe_Be3JdzgGCWlCbfH4I';
export const GOOGLE_DRIVE_FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID || '1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId';
export const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || '';

// Google Auth 클라이언트 초기화 함수
function getGoogleAuthClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    return null;
  }

  // 줄바꿈 이스케이프 문자 복원
  privateKey = privateKey.replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

// 구글 드라이브에 단일 파일 업로드 함수
export async function uploadFileToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId: string = GOOGLE_DRIVE_FOLDER_ID
): Promise<{ fileId: string; webViewLink: string }> {
  const auth = getGoogleAuthClient();
  if (!auth) {
    throw new Error('Google 서비스 계정 자격 증명이 설정되지 않았습니다.');
  }

  const drive = google.drive({ version: 'v3', auth });

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, name, webViewLink, webContentLink',
  });

  const fileId = response.data.id || '';
  const webViewLink =
    response.data.webViewLink ||
    `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

  // 누구나 링크로 열람 가능하도록 공개 권한 부여 (필요시)
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
  } catch (permError) {
    console.warn('파일 공개 권한 설정 경고(무시 가능):', permError);
  }

  return { fileId, webViewLink };
}

// 구글 시트에 신청 데이터 행 추가 함수
export async function appendRowToSheet(
  registrationNumber: string,
  data: ApplicationFormData,
  fileLinks: {
    applicationFileUrl?: string;
    proposalFileUrl?: string;
    consentFileUrl?: string;
    allFilesUrls?: string[];
  }
) {
  const auth = getGoogleAuthClient();
  if (!auth) {
    throw new Error('Google 서비스 계정 자격 증명이 설정되지 않았습니다.');
  }

  const sheets = google.sheets({ version: 'v4', auth });

  // 현재 한국 시간 문자열
  const now = new Date();
  const kstTime = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Seoul',
  }).format(now);

  // 팀원 목록 문자열 포맷팅
  const teamMembersString =
    data.teamMembers.length > 0
      ? data.teamMembers
          .map(
            (m, idx) =>
              `${idx + 1}. ${m.name} (${m.birthDate}, ${m.university}, ${GRADUATION_STATUS_LABELS[m.graduationStatus]})`
          )
          .join('\n')
      : '단독 참가(팀원 없음)';

  // 파일 링크 포맷팅 (다중 파일 지원)
  const file1 = fileLinks.applicationFileUrl || (fileLinks.allFilesUrls && fileLinks.allFilesUrls[0]) || '미첨부';
  const file2 = fileLinks.proposalFileUrl || (fileLinks.allFilesUrls && fileLinks.allFilesUrls[1]) || '미첨부';
  const file3 = fileLinks.consentFileUrl || (fileLinks.allFilesUrls && fileLinks.allFilesUrls.slice(2).join('\n')) || '미첨부';

  // 구글 시트에 추가할 행 데이터
  const rowValues = [
    kstTime, // A: 접수일시
    registrationNumber, // B: 접수번호
    data.teamName || '개인', // C: 팀명
    data.name, // D: 대표자명
    data.birthDate, // E: 생년월일
    data.university, // F: 출신대학
    GRADUATION_STATUS_LABELS[data.graduationStatus], // G: 졸업유무
    data.phone, // H: 연락처
    data.email, // I: 이메일
    teamMembersString, // J: 팀원 정보
    data.agreePrivacy ? '동의 (Y)' : '미동의 (N)', // K: 개인정보 수집/이용 동의
    data.agreeThirdParty ? '동의 (Y)' : '미동의 (N)', // L: 개인정보 제3자 제공 동의
    file1, // M: 제출 파일 1 (신청서 등)
    file2, // N: 제출 파일 2 (계획서 등)
    file3, // O: 제출 파일 3 이상 (동의서 등)
    '접수 완료 (심사 대기)', // P: 접수 상태
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: '시트1!A:P', // 기본 첫 번째 시트 (Sheet1 또는 시트1)
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [rowValues],
    },
  });

  return { success: true };
}

// Google Apps Script Web App을 통한 전송 (서비스 계정이 없을 때 초간단 연동 지원)
export async function sendViaAppsScript(payload: {
  registrationNumber: string;
  data: ApplicationFormData;
  files: {
    applicationFile?: { name: string; type: string; base64: string };
    proposalFile?: { name: string; type: string; base64: string };
    consentFile?: { name: string; type: string; base64: string };
  };
}) {
  if (!GOOGLE_APPS_SCRIPT_URL) {
    throw new Error('Google Apps Script URL이 설정되지 않았습니다.');
  }

  const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Apps Script 전송 실패: ${response.statusText}`);
  }

  return await response.json();
}
