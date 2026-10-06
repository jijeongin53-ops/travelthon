# 2026 글로컬 부산관광 트래블톤 공모전 공식 웹 플랫폼

부산광역시와 부산관광공사가 주최하는 **2026 글로컬 부산관광 트래블톤 공모전** 공식 웹 애플리케이션입니다.  
신청 접수 데이터는 **Google Sheets**에 기록되며, 참가 신청서 및 기획서 서류는 **Google Drive** 공식 폴더에 자동으로 업로드됩니다.

---

## 🌊 주요 기능

1. **대회 안내 & D-Day 카운트다운**
   - 2026 글로컬 부산관광 트래블톤 핵심 안내 및 실시간 마감 D-Day 타이머
   - 4대 공모 분야 (스마트&AI 관광, 로컬 체류형/워케이션, 해양/문화 콘텐츠, 친환경 ESG 관광)
   - 시상 내역 (총 상금 300만원, 대상 150만원) 및 진행 타임라인
2. **공식 서식 다운로드 센터**
   - 공모요강 (PDF), 참가신청서 양식 (DOCX), 아이디어 기획서 서식 (DOCX), 개인정보 동의서 (DOCX), 통합 압축파일 (ZIP) 즉시 다운로드
   - 주최측 공식 구글 드라이브 폴더 바로가기
3. **참가 신청 & 서류 업로드 폼**
   - 대표자(팀장) 필수 인적사항 (이름 / 생년월일 / 출신 대학 / 졸업 유무 / 연락처 / 이메일)
   - 팀원 동적 추가 및 삭제 (이름 / 생년월일 / 출신 대학 / 졸업 유무)
   - 파일 첨부 (참가신청서 / 아이디어 기획서 / 개인정보 동의서 - 드래그앤드롭 지원)
   - 필수 개인정보 수집·이용 및 제3자 제공 동의 약관 전문 모달
4. **Google Cloud 자동 연동 (시트 DB & 드라이브)**
   - 구글 시트: `https://docs.google.com/spreadsheets/d/1n3zQcOOFtX8Bfr0XXZH9X4DDe_Be3JdzgGCWlCbfH4I`
   - 구글 드라이브: `https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId`
5. **접수 확인 조회 모달**
   - 발급된 접수번호 또는 대표자 성명+연락처로 실시간 접수 상태 및 제출 파일 링크 조회

---

## 🚀 GitHub & Vercel 배포 가이드

### 1. GitHub 저장소로 푸시하기
```bash
git add .
git commit -m "feat: 2026 글로컬 부산관광 트래블톤 웹 플랫폼 구축"
git branch -M main
git remote add origin https://github.com/당신의계정/저장소이름.git
git push -u origin main
```

### 2. Vercel 배포하기
1. [Vercel](https://vercel.com) 로그인 후 **"Add New Project"** 클릭
2. 방금 푸시한 GitHub 저장소를 선택(Import)
3. Framework Preset은 **Next.js** 자동 감지
4. 아래 [Google 연동 환경변수]를 입력하거나, 우선 비워둔 상태로 **"Deploy"** 버튼 클릭! (환경변수 없이도 데모 시연 모드로 완벽 작동합니다)

---

## ⚙️ Google 시트 & 드라이브 연동 설정 (택 1)

### [가장 간편한 방법: Google Apps Script Web App 연동 (추천 ⭐️)]
1. 대상 구글 시트([링크](https://docs.google.com/spreadsheets/d/1n3zQcOOFtX8Bfr0XXZH9X4DDe_Be3JdzgGCWlCbfH4I/edit))를 열고 상단 메뉴 **[확장 프로그램] > [Apps Script]**를 클릭합니다.
2. 프로젝트의 `apps-script/Code.gs` 파일 내용을 그대로 복사하여 붙여넣고 저장합니다.
3. 우측 상단 **[배포] > [새 배포]**를 누릅니다.
   - 유형: **웹 앱** 선택
   - 다음 사용자 권한으로 실행: **'나(내 계정)'**
   - 액세스 권한이 있는 사용자: **'모든 사용자(Anyone)'** (필수!)
4. **[배포]**를 완료하고 생성된 **웹 앱 URL**을 복사합니다.
5. Vercel 프로젝트 설정의 **Environment Variables** 또는 로컬 `.env.local`에 등록합니다:
   ```env
   GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/발급받은_배포ID/exec
   ```

### [Google Cloud Service Account 연동 방식]
Google Cloud Console에서 서비스 계정 생성 후 해당 서비스 계정 이메일을 구글 시트와 구글 드라이브 폴더에 "편집자"로 공유한 뒤, 아래 환경변수를 등록합니다:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1n3zQcOOFtX8Bfr0XXZH9X4DDe_Be3JdzgGCWlCbfH4I
GOOGLE_DRIVE_FOLDER_ID=1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId
```

---

## 🛠 로컬 개발 서버 실행

```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속하여 확인하실 수 있습니다.
