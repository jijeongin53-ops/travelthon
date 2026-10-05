import { NextRequest, NextResponse } from 'next/server';
import { globalSubmissionsCache } from '../submit/route';

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
