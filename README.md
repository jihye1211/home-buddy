# 🐰 HomeBuddy

> Your little buddy waiting for your clock-out.

A macOS menu bar attendance companion. Not a clock-out timer — a little friend
that waits for your clock-out with you. Built with Tauri v2, React, TypeScript,
Tailwind, and Framer Motion.

## What it does

- Lives in the menu bar showing a compact countdown (e.g. `🐰 2h13m`).
- Click the tray icon for a frosted-glass popover: clock-in/out times, a
  progress bar for the day, and a live countdown.
- Animated **RunCat-style** menu bar icon — a buddy that runs faster as
  clock-out nears and sprints during overtime.
- Notifies you at 10 / 5 / 1 / 0 minutes before clock-out with rotating copy.
- Switches into **overtime mode** once clock-out passes (`🔥 +42m`), with the
  buddy's expression escalating the longer you stay (😵 → 🫠 → 💀).
- Pick your own buddy emoji.

## 설치하기 · Install (build from source)

> macOS 전용입니다. MVP 단계에서는 **소스 직접 빌드(Source First)** 방식으로 배포합니다.
> Apple Developer 서명/공증을 쓰지 않으므로 공식 DMG는 제공하지 않습니다 — 각자 자신의
> Mac에서 빌드하면 Gatekeeper 경고 없이 실행됩니다(직접 빌드한 앱은 격리(quarantine)
> 대상이 아닙니다).

### 1. 사전 준비 (Prerequisites)

필요한 도구: **Node 20+, pnpm 8+, Rust 1.88+, Xcode Command Line Tools.** 이미 깔려
있으면 건너뛰세요. ([Homebrew](https://brew.sh) 기준 예시)

```bash
# Xcode Command Line Tools (Rust 컴파일에 필요)
xcode-select --install

# Node 20+ 와 pnpm
brew install node pnpm

# Rust (rustup) — 설치 후 새 터미널을 열거나 아래 줄 실행
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

설치 확인:

```bash
node -v   # v20 이상
pnpm -v   # 8 이상
rustc --version  # 1.88 이상
```

### 2. 클론 후 실행 (Run)

```bash
git clone https://github.com/jihye1211/home-buddy.git
cd home-buddy
pnpm install      # 첫 실행 시 Rust 의존성까지 받아 몇 분 걸릴 수 있습니다

pnpm app:dev      # 메뉴바 앱 실행 (개발 모드)
```

실행되면 메뉴바 오른쪽 위에 🐰(달리는 친구)가 나타납니다 — 클릭하면 팝오버가 열립니다.

### 3. 앱으로 만들어 두고 쓰기 (Install the .app)

매번 `pnpm app:dev` 를 켜지 않고 일반 앱처럼 쓰려면 `.app` 번들을 빌드해 옮깁니다:

```bash
pnpm app:build
# →  src-tauri/target/release/bundle/macos/HomeBuddy.app
mv src-tauri/target/release/bundle/macos/HomeBuddy.app /Applications/
```

이후 Launchpad / 응용 프로그램에서 **HomeBuddy** 를 실행하면 됩니다.

**처음 한 번 설정** — 첫 실행 화면에서 평소 출퇴근 시간, (선택) 근태 확인 URL, 도우미
이모지를 입력하면 끝입니다. 이후 메뉴바에서 남은 시간을 확인하고, 매일 실제 출근시각을
팝오버에서 보정하세요. 설정값은 **본인 기기에만 저장**됩니다.

### 문제 해결 (Troubleshooting)

- **`pnpm app:dev` 가 Rust 컴파일 에러로 멈춤** — `rustc --version` 이 동작하는지,
  `xcode-select -p` 가 경로를 출력하는지 확인하세요. rustup 설치 직후라면 새 터미널을
  열거나 `source "$HOME/.cargo/env"` 후 다시 시도합니다.
- **빌드한 `HomeBuddy.app` 이 "확인되지 않은 개발자"로 안 열림** — 보통 직접 빌드한
  앱은 괜찮지만, 만약 막히면 **우클릭 → 열기 → 열기**, 또는
  `xattr -dr com.apple.quarantine /Applications/HomeBuddy.app` 후 다시 엽니다.
- **알림이 안 옴** — 시스템 설정 → 알림 → HomeBuddy 에서 알림을 허용하세요.
- **메뉴바에 아이콘이 안 보임** — 메뉴바 공간이 가득 차 가려졌을 수 있습니다. 다른
  메뉴바 앱을 줄이거나 Command-드래그로 정리해 보세요.

## How attendance works

You set your usual clock-in / clock-out (or work duration) once. Each day the
popover shows today's clock-in, which **you can correct inline** after checking
your real record.

- **Reference URL** — optionally save the page where you check your attendance.
  The popover links to it ("출근일시 확인하기") so correcting is one click away.
  The URL is stored **locally on your device only** — nothing company-specific
  is bundled or committed.
- **Daily start** — choose whether each new day resets to your usual clock-in
  or carries over the last value you set.

## Project layout

```
src/
├── components/      # UI: popover, onboarding, settings
├── hooks/           # useNow, useAttendance, useReminders, useRunner
├── services/        # settings, tray, notifications, opener, tauri guards
├── utils/           # pure logic: time, status, schedule, character, messages
└── types/           # domain types
src-tauri/           # Rust shell: tray icon + popover window + commands
```

UI and business logic are kept separate; all time/status math is pure and unit
tested.

## Development

Prerequisites and first run are covered in [설치하기 · Install](#설치하기--install-build-from-source).
Command reference:

| Command | What it does |
| --- | --- |
| `pnpm app:dev` | Run the menu bar app (Tauri dev, hot reload) |
| `pnpm app:build` | Build the macOS `.app` bundle |
| `pnpm dev` | Frontend only, in a browser (design/preview — degrades gracefully) |
| `pnpm build` | Type-check + production frontend build |
| `pnpm test` | Run unit tests once (Vitest) |
| `pnpm test:watch` | Run unit tests in watch mode |

UI and business logic are kept separate; all time/status math is pure and unit
tested (`src/utils`).

### Regenerating the app icon

The source logo lives at `src-tauri/app-icon.png` (1024×1024). To regenerate all
platform sizes after changing it:

```bash
pnpm tauri icon src-tauri/app-icon.png
```

The animated menu bar runner frames are separate — regenerate with
`node scripts/make-runner.mjs`.

## Distribution

HomeBuddy is currently run as a **developer-facing open-source utility**, not a
packaged consumer app. MVP distribution is **Source First**: clone the public
repo and build on your own Mac (see [설치하기 · Install](#설치하기--install-build-from-source)).

Because there's no Apple Developer ID, the project intentionally does **not** ship:

- a signed/notarized DMG or GitHub Release download,
- automated release / DMG GitHub Actions workflows,
- Homebrew or App Store distribution.

Building locally avoids Gatekeeper's "unidentified developer" / "damaged file"
warnings that an unsigned, externally-distributed DMG would trigger.

> **Later:** if non-developer users grow, revisit Apple Developer signing,
> notarization, GitHub Release DMGs, and Homebrew. For now the priority is
> product experience and stability over distribution automation.

## Status

MVP. Manual entry with daily correction works end to end.
