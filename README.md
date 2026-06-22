# 🐰 HomeBuddy

> 당신의 퇴근을 함께 기다려 주는 작은 친구

macOS 메뉴바 근태 도우미입니다. 퇴근 타이머가 아니라, 퇴근 시간까지 옆에서 같이
기다려 주는 작은 친구예요.

## 주요 기능

- 메뉴바에 남은 시간을 짧게 표시합니다 (예: `🐰 2h13m`).
- 트레이 아이콘을 누르면 반투명(글래스) 팝오버가 열립니다: 출퇴근 시각, 오늘 진행률
  바, 실시간 카운트다운.
- RunCat 스타일 애니메이션 아이콘: 퇴근이 가까울수록 더 빨리 달리고, 초과근무 중엔
  전력 질주합니다.
- 퇴근 10 / 5 / 1 / 0분 전에 매번 다른 문구로 알려 줍니다.
- 퇴근 시각이 지나면 초과근무 모드로 전환됩니다 (`🔥 +42m`). 오래 남아 있을수록 표정이
  점점 심각해져요 (😵 → 🫠 → 💀).
- 원하는 도우미 이모지를 직접 고를 수 있습니다.

## 설치

macOS 전용입니다. MVP 단계에서는 소스를 직접 빌드하는 방식(Source First)으로
배포합니다. Apple Developer 서명·공증을 쓰지 않아 공식 DMG는 제공하지 않습니다. 대신
각자 자신의 Mac에서 빌드하면 Gatekeeper 경고 없이 실행됩니다. (직접 빌드한 앱은 격리
대상이 아니기 때문입니다.)

### 1. 사전 준비

다음 도구가 필요합니다. 이미 있으면 건너뛰세요.

- Node 20 이상
- pnpm 8 이상
- Rust 1.88 이상
- Xcode Command Line Tools

Homebrew 기준 설치 예시:

```bash
# Xcode Command Line Tools (Rust 컴파일에 필요)
xcode-select --install

# Node, pnpm
brew install node pnpm

# Rust (rustup)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"   # 설치 직후 실행, 또는 새 터미널을 엽니다
```

설치가 됐는지 확인:

```bash
node -v          # v20 이상
pnpm -v          # 8 이상
rustc --version  # 1.88 이상
```

### 2. 클론하고 실행하기

```bash
git clone https://github.com/jihye1211/home-buddy.git
cd home-buddy
pnpm install     # 첫 설치는 Rust 의존성까지 받아 몇 분 걸릴 수 있습니다
pnpm app:dev     # 메뉴바 앱을 개발 모드로 실행
```

실행되면 메뉴바 오른쪽 위에 🐰(달리는 친구)가 나타납니다. 누르면 팝오버가 열립니다.

### 3. 앱으로 설치하기

매번 `pnpm app:dev`를 켜지 않고 일반 앱처럼 쓰려면 `.app` 번들을 빌드해 옮깁니다.

```bash
pnpm app:build
mv src-tauri/target/release/bundle/macos/HomeBuddy.app /Applications/
```

빌드 결과물 위치: `src-tauri/target/release/bundle/macos/HomeBuddy.app`

이후 Launchpad나 응용 프로그램에서 HomeBuddy를 실행하면 됩니다.

### 처음 한 번 설정하기

첫 실행 화면에서 세 가지만 입력하면 끝납니다.

- 평소 출퇴근 시간
- 근태 확인 URL (선택)
- 도우미 이모지

이후에는 메뉴바에서 남은 시간을 확인하고, 매일 실제 출근 시각을 팝오버에서 수정하면
됩니다. 설정값은 본인 기기에만 저장됩니다.

### 문제 해결

- **`pnpm app:dev`가 Rust 컴파일 에러로 멈춰요**
  `rustc --version`과 `xcode-select -p`가 정상 동작하는지 확인하세요. rustup을 방금
  설치했다면 새 터미널을 열거나 `source "$HOME/.cargo/env"`를 실행한 뒤 다시 시도합니다.
- **빌드한 `HomeBuddy.app`이 "확인되지 않은 개발자"로 안 열려요**
  보통 직접 빌드한 앱은 괜찮습니다. 그래도 막히면 앱을 우클릭 → 열기 → 열기 하거나,
  `xattr -dr com.apple.quarantine /Applications/HomeBuddy.app`를 실행한 뒤 다시 엽니다.
- **알림이 안 와요**
  시스템 설정 → 알림 → HomeBuddy 에서 알림을 허용하세요.
- **메뉴바에 아이콘이 안 보여요**
  메뉴바가 가득 차서 가려졌을 수 있습니다. 다른 메뉴바 앱을 줄이거나 Command 키를 누른
  채 드래그해 정리해 보세요.

## 근태 기록 방식

평소 출근·퇴근 시각(또는 근무 시간)을 한 번 설정해 둡니다. 매일 팝오버에 그날의 출근
시각이 표시되고, 실제 기록을 확인한 뒤 수정할 수 있습니다.

- **근태 확인 URL**: 근태를 확인하는 페이지 주소를 저장해 둘 수 있습니다 (선택). 팝오버의
  "출근일시 확인하기" 링크로 한 번에 열 수 있어 간편합니다. URL은 본인 기기에만
  저장되며, 회사 관련 정보는 저장소에 포함하거나 커밋하지 않습니다.
- **하루 시작값**: 새 날이 시작될 때 평소 출근 시각으로 초기화할지, 마지막에 설정한 값을
  이어 쓸지 고를 수 있습니다.

## 프로젝트 구조

```
src/
├── components/      # UI: popover, onboarding, settings
├── hooks/           # useNow, useAttendance, useReminders, useRunner
├── services/        # settings, tray, notifications, opener, tauri guards
├── utils/           # 순수 로직: time, status, schedule, character, messages
└── types/           # 도메인 타입
src-tauri/           # Rust 셸: 트레이 아이콘 + 팝오버 윈도우 + 커맨드
```

UI와 비즈니스 로직은 분리돼 있고, 시간·상태 계산은 모두 순수 함수로 단위 테스트합니다.

## 개발

사전 준비와 첫 실행은 위의 [설치](#설치)를 참고하세요. 명령어 정리:

| 명령어 | 설명 |
| --- | --- |
| `pnpm app:dev` | 메뉴바 앱 실행 (Tauri 개발 모드, 핫 리로드) |
| `pnpm app:build` | macOS `.app` 번들 빌드 |
| `pnpm dev` | 프론트엔드만 브라우저에서 실행 (디자인·미리보기용, 기능은 제한됨) |
| `pnpm build` | 타입 체크 + 프로덕션 프론트엔드 빌드 |
| `pnpm test` | 단위 테스트 1회 실행 (Vitest) |
| `pnpm test:watch` | 단위 테스트 watch 모드 |

### 아이콘 다시 만들기

원본 로고는 `src-tauri/app-icon.png` (1024×1024)입니다. 로고를 바꾼 뒤 모든 플랫폼
크기를 다시 생성하려면:

```bash
pnpm tauri icon src-tauri/app-icon.png
```

메뉴바에서 달리는 애니메이션 프레임은 별도입니다. `node scripts/make-runner.mjs`로
다시 생성합니다.

## 배포 방식

HomeBuddy는 개발자 대상 오픈소스 유틸리티로 운영합니다. MVP 배포는 Source First 방식입니다: 공개 저장소를 클론해 각자
자신의 Mac에서 빌드합니다. (위의 [설치](#설치) 참고)

Apple Developer ID가 없으므로 다음은 의도적으로 제공하지 않습니다.

- 서명·공증된 DMG 또는 GitHub Release 다운로드
- DMG·Release 자동화 GitHub Actions 워크플로우
- Homebrew, App Store 배포

로컬에서 직접 빌드하면, 서명 없이 외부 배포된 DMG가 일으키는 Gatekeeper의 "확인되지
않은 개발자" / "손상된 파일" 경고를 피할 수 있습니다.

향후 계획: 사용자가 늘면 Apple Developer 서명, 공증, GitHub Release DMG,
Homebrew를 다시 검토합니다.

## 상태

현재는 매일 수동 입력으로 사용 가능합니다.


## Stack
- Tauri v2
- React
- TypeScript
- Tailwind 
- Framer Motion