import { NextRequest, NextResponse } from 'next/server';
import { globalSubmissionsCache } from '../submit/route';
import { GOOGLE_SHEET_ID } from '@/lib/google';

// RFC-4180 호환 CSV 파서 (셀 내부 줄바꿈 및 쉼표 처리)
function parseCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const nextCh = csvText[i + 1];

    if (inQuotes) {
      if (ch === '"' && nextCh === '"') {
        currentCell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentCell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (ch === '\r' && nextCh === '\n') {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += ch;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

// 연락처 비교를 위한 정규화 함수 (숫자만 남기고 구글 시트 앞자리 0 누락까지 보정)
function normalizePhone(phoneStr: string): string {
  return (phoneStr || '').replace(/[^0-9]/g, '').replace(/^0+/, '');
}

// 한글 졸업유무 텍스트를 GraduationStatus 코드로 역매핑
function mapGradLabelToCode(label: string): string {
  const trimmed = (label || '').trim();
  if (trimmed === '재학' || trimmed === 'enrolled') return 'enrolled';
  if (trimmed === '휴학' || trimmed === 'leave_of_absence') return 'leave_of_absence';
  if (trimmed === '졸업예정' || trimmed === 'expected_graduation') return 'expected_graduation';
  if (trimmed === '졸업' || trimmed === 'graduated') return 'graduated';
  return 'enrolled';
}

// 구글 시트에서 실시간 접수 내역 조회 (동일 접수번호 수정 이력 및 추가 파일 병합 지원)
async function findRecordFromGoogleSheet(
  regNo?: string,
  name?: string,
  phone?: string
) {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv`;
  const response = await fetch(csvUrl, { cache: 'no-store' });
  if (!response.ok) return null;

  const csvText = await response.text();
  const rows = parseCsv(csvText);
  if (rows.length <= 1) return null;

  const targetRegNo = regNo?.trim().toUpperCase();
  const targetName = name?.trim();
  const targetPhoneNorm = phone ? normalizePhone(phone) : '';

  let matchedRowIndex = -1;

  // 최신 접수 건부터 역순 탐색 (헤더 제외)
  for (let i = rows.length - 1; i >= 1; i--) {
    const row = rows[i];
    if (!row || row.length < 4) continue;

    const rowRegNo = (row[1] || '').trim();
    const rowName = (row[3] || '').trim();
    const rowPhoneRaw = row[7] || '';

    if (targetRegNo && rowRegNo.toUpperCase() === targetRegNo) {
      matchedRowIndex = i;
      break;
    } else if (
      targetName &&
      targetPhoneNorm &&
      rowName === targetName &&
      normalizePhone(rowPhoneRaw) === targetPhoneNorm
    ) {
      matchedRowIndex = i;
      break;
    }
  }

  if (matchedRowIndex === -1) return null;

  const latestRow = rows[matchedRowIndex];
  const rowCreatedAt = latestRow[0] || '';
  const rowRegNo = (latestRow[1] || '').trim();
  const rowTeamName = latestRow[2] || '개인';
  const rowName = (latestRow[3] || '').trim();
  const rowBirthDate = latestRow[4] || '';
  const rowUniversity = latestRow[5] || '';
  const rowGradStatus = mapGradLabelToCode(latestRow[6] || '재학');
  const rowPhoneRaw = latestRow[7] || '';
  const rowEmail = latestRow[8] || '';
  const rowTeamMembersRaw = latestRow[9] || '';
  const rowStatus = latestRow[15] || '접수 완료';

  // 팀원 문자열 파싱 (예: "1. 부산 (2000-02-02, 동아, 재학)")
  const parsedMembers = rowTeamMembersRaw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.includes('단독 참가'))
    .map((line, idx) => {
      const match = line.match(/^\d+\.\s*(.+?)\s*\(([^,]*),\s*([^,]*),\s*([^)]*)\)/);
      if (match) {
        return {
          id: `member-${idx + 1}`,
          name: match[1].trim(),
          birthDate: match[2].trim(),
          university: match[3].trim(),
          graduationStatus: mapGradLabelToCode(match[4].trim()),
        };
      }
      return {
        id: `member-${idx + 1}`,
        name: line,
        birthDate: '',
        university: '',
        graduationStatus: 'enrolled',
      };
    });

  // 동일 접수번호(rowRegNo)로 제출/추가된 모든 행의 제출 서류 URL을 순서대로 중복 없이 병합
  const rawUrls: string[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || (r[1] || '').trim().toUpperCase() !== rowRegNo.toUpperCase()) continue;
    const f1 = r[12] || '';
    const f2 = r[13] || '';
    const f3Plus = r[14] || '';
    const candidates = [f1, f2, ...f3Plus.split('\n').map((u) => u.trim())];
    for (const u of candidates) {
      if (u && u !== '미첨부' && u.startsWith('http') && !rawUrls.includes(u)) {
        rawUrls.push(u);
      }
    }
  }

  const uploadedFiles = rawUrls.map((url, idx) => ({
    name: `제출서류_${idx + 1}.pdf`,
    size: 0,
    url,
  }));

  // 앞자리 0이 생략된 전화번호(예: 1064509919) 표시 보정
  const displayPhone =
    /^[1-9][0-9]{8,9}$/.test(rowPhoneRaw.trim())
      ? `0${rowPhoneRaw.trim()}`
      : rowPhoneRaw;

  return {
    registrationNumber: rowRegNo,
    createdAt: rowCreatedAt,
    data: {
      name: rowName,
      birthDate: rowBirthDate,
      university: rowUniversity,
      graduationStatus: rowGradStatus,
      phone: displayPhone,
      email: rowEmail,
      teamName: rowTeamName,
      teamMembers: parsedMembers,
      applicationFileName: '제출서류_1.pdf',
      proposalFileName: '제출서류_2.pdf',
      consentFileName: '제출서류_3.pdf',
      applicationFileUrl:
        rawUrls[0] || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId',
      proposalFileUrl:
        rawUrls[1] || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId',
      consentFileUrl:
        rawUrls[2] || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId',
      uploadedFiles,
    },
    status: rowStatus,
    storageMode: 'google-sheet',
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regNo = searchParams.get('regNo')?.trim();
    const name = searchParams.get('name')?.trim();
    const phone = searchParams.get('phone')?.replace(/[^0-9]/g, '');

    if (!regNo && (!name || !phone)) {
      return NextResponse.json(
        { success: false, message: '접수번호 또는 (이름 + 연락처)를 입력해 주세요.' },
        { status: 400 }
      );
    }

    let record = null;

    if (regNo && globalSubmissionsCache.has(regNo)) {
      record = globalSubmissionsCache.get(regNo);
    } else if (name && phone) {
      const lookupKey = `${name}_${phone}`;
      if (globalSubmissionsCache.has(lookupKey)) {
        record = globalSubmissionsCache.get(lookupKey);
      }
    }

    // 메모리 캐시에 없으면 구글 시트에서 실시간 조회
    if (!record) {
      record = await findRecordFromGoogleSheet(regNo, name, phone);
    }

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          message: '일치하는 접수 내역을 찾을 수 없습니다. 접수번호와 인적사항을 다시 확인해 주세요.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: record,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: '조회 중 오류가 발생했습니다.', error: error?.message },
      { status: 500 }
    );
  }
}
