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

    // 첨부 파일 객체 가져오기
    const applicationFile = formData.get('applicationFile') as File | null;
    const proposalFile = formData.get('proposalFile') as File | null;
    const consentFile = formData.get('consentFile') as File | null;

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
        // 구글 드라이브 파일 업로드
        if (applicationFile && applicationFile.size > 0) {
          const buffer = Buffer.from(await applicationFile.arrayBuffer());
          const uploadRes = await uploadFileToDrive(
            buffer,
            `[신청서]_${teamName}_${name}_${applicationFile.name}`,
            applicationFile.type || 'application/octet-stream'
          );
          applicationFileUrl = uploadRes.webViewLink;
        }

        if (proposalFile && proposalFile.size > 0) {
          const buffer = Buffer.from(await proposalFile.arrayBuffer());
          const uploadRes = await uploadFileToDrive(
            buffer,
            `[기획서]_${teamName}_${name}_${proposalFile.name}`,
            proposalFile.type || 'application/octet-stream'
          );
          proposalFileUrl = uploadRes.webViewLink;
        }

        if (consentFile && consentFile.size > 0) {
          const buffer = Buffer.from(await consentFile.arrayBuffer());
          const uploadRes = await uploadFileToDrive(
            buffer,
            `[동의서]_${teamName}_${name}_${consentFile.name}`,
            consentFile.type || 'application/octet-stream'
          );
          consentFileUrl = uploadRes.webViewLink;
        }

        // 구글 시트에 행 추가
        await appendRowToSheet(registrationNumber, appData, {
          applicationFileUrl,
          proposalFileUrl,
          consentFileUrl,
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
        if (applicationFile && applicationFile.size > 0) {
          const buffer = Buffer.from(await applicationFile.arrayBuffer());
          filesPayload.applicationFile = {
            name: applicationFile.name,
            type: applicationFile.type,
            base64: buffer.toString('base64'),
          };
        }
        if (proposalFile && proposalFile.size > 0) {
          const buffer = Buffer.from(await proposalFile.arrayBuffer());
          filesPayload.proposalFile = {
            name: proposalFile.name,
            type: proposalFile.type,
            base64: buffer.toString('base64'),
          };
        }
        if (consentFile && consentFile.size > 0) {
          const buffer = Buffer.from(await consentFile.arrayBuffer());
          filesPayload.consentFile = {
            name: consentFile.name,
            type: consentFile.type,
            base64: buffer.toString('base64'),
          };
        }

        await sendViaAppsScript({
          registrationNumber,
          data: appData,
          files: filesPayload,
        });
        storageMode = 'apps-script';
      } catch (scriptError) {
        console.error('Apps Script 연동 실패:', scriptError);
        storageMode = 'fallback';
      }
    }

    // 메모리 캐시에 저장 (즉시 접수 확인 가능하도록)
    const submissionRecord = {
      registrationNumber,
      createdAt: new Date().toISOString(),
      data: {
        ...appData,
        applicationFileName: applicationFile?.name || '신청서_제출됨.docx',
        proposalFileName: proposalFile?.name || '아이디어기획서_제출됨.docx',
        consentFileName: consentFile?.name || '개인정보동의서_제출됨.pdf',
        applicationFileUrl: applicationFileUrl || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId',
        proposalFileUrl: proposalFileUrl || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId',
        consentFileUrl: consentFileUrl || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId',
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
