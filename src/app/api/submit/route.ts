import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToDrive, appendRowToSheet, sendViaAppsScript } from '@/lib/google';
import { ApplicationFormData, GraduationStatus } from '@/lib/types';

// 접수 메모리 저장소 (서버 세션 동안 접수 조회용 데모 캐시)
export const globalSubmissionsCache: Map<string, any> = (globalThis as any).__submissionsCache || new Map();
(globalThis as any).__submissionsCache = globalSubmissionsCache;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 기본 인적사항 추출
    const name = formData.get('name') as string;
    const birthDate = formData.get('birthDate') as string;
    const university = formData.get('university') as string;
    const graduationStatus = formData.get('graduationStatus') as GraduationStatus;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const teamName = (formData.get('teamName') as string) || '개인 참가';

    // 팀원 JSON 파싱
    const teamMembersRaw = formData.get('teamMembers') as string;
    let teamMembers = [];
    if (teamMembersRaw) {
      try {
        teamMembers = JSON.parse(teamMembersRaw);
      } catch (e) {
        console.error('팀원 데이터 파싱 실패:', e);
      }
    }

    // 약관 동의 여부
    const agreePrivacy = formData.get('agreePrivacy') === 'true';
    const agreeThirdParty = formData.get('agreeThirdParty') === 'true';
    const agreeNotice = formData.get('agreeNotice') === 'true';

    // 필수 항목 유효성 검사
    if (!name || !birthDate || !university || !graduationStatus || !phone || !email) {
      return NextResponse.json(
        { success: false, message: '모든 필수 인적사항을 입력해 주세요.' },
        { status: 400 }
      );
    }

    // 팀 참가 필수 검증 (개인 참가 불가)
    if (!teamName || teamName.trim() === '' || teamName === '개인 참가') {
      return NextResponse.json(
        { success: false, message: '팀 명을 입력해 주세요 (본 대회는 개인 참가 불가, 팀 참가 필수입니다).' },
        { status: 400 }
      );
    }

    if (!teamMembers || teamMembers.length < 1) {
      return NextResponse.json(
        {
          success: false,
          message: '본 대회는 개인 참가가 불가하며, 대표자 외에 팀원을 최소 1명 이상 등록해야 합니다 (2~4인 팀).',
        },
        { status: 400 }
      );
    }

    if (!agreePrivacy || !agreeThirdParty) {
      return NextResponse.json(
        { success: false, message: '필수 개인정보 약관에 모두 동의해 주셔야 접수가 가능합니다.' },
        { status: 400 }
      );
    }

    // 고유 접수번호 생성 (예: BT26-K9X2-4812)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateCode = Date.now().toString(36).toUpperCase().slice(-4);
    const registrationNumber = `BT26-${dateCode}-${randomSuffix}`;

    // 첨부 파일 객체 가져오기 (단일 통합 업로드 및 다중 파일 지원: 최대 5개 PDF)
    const rawFiles = formData.getAll('files') as File[];
    const legacyAppFile = formData.get('applicationFile') as File | null;
    const legacyPropFile = formData.get('proposalFile') as File | null;
    const legacyConFile = formData.get('consentFile') as File | null;

    let allFiles: File[] = [];
    if (rawFiles && rawFiles.length > 0) {
      allFiles = rawFiles.filter((f) => f && f.size > 0);
    } else {
      if (legacyAppFile && legacyAppFile.size > 0) allFiles.push(legacyAppFile);
      if (legacyPropFile && legacyPropFile.size > 0) allFiles.push(legacyPropFile);
      if (legacyConFile && legacyConFile.size > 0) allFiles.push(legacyConFile);
    }

    // 파일 개수 제한 (최대 5개)
    if (allFiles.length > 5) {
      return NextResponse.json(
        { success: false, message: '서류 파일은 한 번에 최대 5개까지만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 파일 형식 검증 (PDF 파일 필수)
    for (const file of allFiles) {
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      if (!isPdf) {
        return NextResponse.json(
          {
            success: false,
            message: `제출 파일(${file.name})의 형식이 올바르지 않습니다. 모든 서류 파일은 PDF(.pdf) 형식으로만 업로드 가능합니다.`,
          },
          { status: 400 }
        );
      }
    }

    let uploadedFileUrls: string[] = [];
    let applicationFileUrl = '';
    let proposalFileUrl = '';
    let consentFileUrl = '';

    const appData: ApplicationFormData = {
      name,
      birthDate,
      university,
      graduationStatus,
      phone,
      email,
      teamName,
      teamMembers,
      agreePrivacy,
      agreeThirdParty,
      agreeNotice,
    };

    // 1. Google Service Account 인증 환경변수 존재 시 실제 구글 드라이브 및 구글 시트에 저장
    const hasServiceAccount =
      Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) &&
      Boolean(process.env.GOOGLE_PRIVATE_KEY);

    // 2. Google Apps Script Webhook 설정 여부
    const hasAppsScript = Boolean(process.env.GOOGLE_APPS_SCRIPT_URL);

    let storageMode = 'demo';

    if (hasServiceAccount) {
      try {
        // 구글 드라이브 파일 업로드 (다중 파일 순회)
        for (let i = 0; i < allFiles.length; i++) {
          const file = allFiles[i];
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploadRes = await uploadFileToDrive(
            buffer,
            `[트래블톤서류${i + 1}]_${teamName}_${name}_${file.name}`,
            file.type || 'application/pdf'
          );
          uploadedFileUrls.push(uploadRes.webViewLink);
        }

        applicationFileUrl = uploadedFileUrls[0] || '';
        proposalFileUrl = uploadedFileUrls[1] || '';
        consentFileUrl = uploadedFileUrls[2] || '';

        // 구글 시트에 행 추가
        await appendRowToSheet(registrationNumber, appData, {
          applicationFileUrl,
          proposalFileUrl,
          consentFileUrl,
          allFilesUrls: uploadedFileUrls,
        });

        storageMode = 'google-cloud';
      } catch (googleError: any) {
        console.error('Google API 연동 에러:', googleError);
        // 에러가 나더라도 사용자 경험을 위해 백업 캐시에 저장
        storageMode = 'fallback';
      }
    } else if (hasAppsScript) {
      try {
        // Apps Script로 전달할 파일 base64 변환
        const filesPayload: any = {};
        for (let i = 0; i < allFiles.length; i++) {
          const file = allFiles[i];
          const buffer = Buffer.from(await file.arrayBuffer());
          filesPayload[`file_${i + 1}`] = {
            name: file.name,
            type: file.type || 'application/pdf',
            base64: buffer.toString('base64'),
          };
        }

        const scriptRes = await sendViaAppsScript({
          registrationNumber,
          data: appData,
          files: filesPayload,
        });
        if (scriptRes && Array.isArray(scriptRes.uploadedFileUrls) && scriptRes.uploadedFileUrls.length > 0) {
          uploadedFileUrls = scriptRes.uploadedFileUrls;
          applicationFileUrl = uploadedFileUrls[0] || '';
          proposalFileUrl = uploadedFileUrls[1] || '';
          consentFileUrl = uploadedFileUrls[2] || '';
        }
        storageMode = 'apps-script';
      } catch (scriptError) {
        console.error('Apps Script 연동 실패:', scriptError);
        storageMode = 'fallback';
      }
    } else {
      console.warn(
        '[구글 연동 안내] GOOGLE_APPS_SCRIPT_URL 또는 GOOGLE_SERVICE_ACCOUNT 환경변수가 등록되지 않아 구글 시트/드라이브에 즉시 저장되지 않았습니다. Apps Script Web App URL을 설정해 주세요.'
      );
    }

    // 업로드된 파일 상세 정보 생성
    const uploadedFilesSummary = allFiles.map((file, idx) => ({
      name: file.name,
      size: file.size,
      url:
        uploadedFileUrls[idx] ||
        'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId',
    }));

    // 메모리 캐시에 저장 (즉시 접수 확인 가능하도록)
    const submissionRecord = {
      registrationNumber,
      createdAt: new Date().toISOString(),
      data: {
        ...appData,
        applicationFileName: allFiles[0]?.name || '신청서_제출됨.pdf',
        proposalFileName: allFiles[1]?.name || '아이디어기획서_제출됨.pdf',
        consentFileName: allFiles[2]?.name || '개인정보동의서_제출됨.pdf',
        applicationFileUrl: applicationFileUrl || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId',
        proposalFileUrl: proposalFileUrl || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId',
        consentFileUrl: consentFileUrl || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId',
        uploadedFiles: uploadedFilesSummary,
      },
      status: '접수 완료',
      storageMode,
    };

    globalSubmissionsCache.set(registrationNumber, submissionRecord);
    // 조회 편의를 위해 이메일과 전화번호로도 인덱싱
    globalSubmissionsCache.set(`${name}_${phone.replace(/[^0-9]/g, '')}`, submissionRecord);
    globalSubmissionsCache.set(email.toLowerCase(), submissionRecord);

    return NextResponse.json({
      success: true,
      registrationNumber,
      message: '공모전 참가 신청 및 파일 제출이 성공적으로 완료되었습니다!',
      timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      storageMode,
      details: {
        teamName,
        leaderName: name,
        memberCount: teamMembers.length + 1,
        email,
      },
    });
  } catch (error: any) {
    console.error('접수 처리 중 서버 에러 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: '서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        error: error?.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}
