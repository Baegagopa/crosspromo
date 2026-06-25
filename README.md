# crosspromo

Public GitHub Pages repository for published CrossPromo output only.

## Public URLs

- Config: `https://baegagopa.github.io/crosspromo/config/crosspromo.json`
- Asset example: `https://baegagopa.github.io/crosspromo/assets/sample-utility-icon.png`
- Current schema version in this repository: `5`

## 앱 데이터와 에셋 추가

앱 프로젝트가 CrossPromo에 자기 앱을 추가하거나 갱신할 때 실제 공개 변경 대상은 아래 두 곳뿐이다.

- `config/crosspromo.json`
- `assets/`

작업자는 기존 `config/crosspromo.json`의 `apps` 배열 구조를 기준으로 새 앱 항목을 추가하거나 기존 항목을 갱신한다. 에셋 파일은 `assets/` 아래에 PNG로 넣고, JSON의 `icon_path`와 `banner_path`는 `url_bases.assets` 뒤에 붙는 상대 경로로 작성한다.

권장 에셋 규격은 다음과 같다.

- 아이콘: `512x512` PNG
- 배너: 와이드 PNG, 신규 제작은 `1200x480` 권장
- 파일명: lowercase kebab-case, 예: `date-calculator-icon.png`, `date-calculator-banner.png`

앱 프로젝트 LLM이나 자동화 에이전트에게 작업을 맡길 때는 P4 전용 내부 handoff 문서를 전달한다. 이 문서는 도구 사용법이 아니라 `config/crosspromo.json`과 `assets/`를 직접 수정하기 위한 내부 작업 지침이며 GitHub에 게시하지 않는다.

작업 후 로컬 검증기가 있으면 다음 명령으로 확인한다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\crosspromo_validate.ps1 -Path .\config\crosspromo.json
```

마지막으로 `git status --short`를 확인해서 공개해야 할 파일만 변경됐는지 검토한다.

## CrossPromo JSON 파싱 가이드

`config/crosspromo.json`은 외부 프로젝트가 런타임에 읽는 공개 CrossPromo 설정 파일이다.
클라이언트는 이 파일을 원격 데이터로 취급해야 하며, 타입을 검증하고 알 수 없는 필드는 무시하며 파싱할 수 없는 경우에는 노출을 중단해야 한다.

### 가져오기와 캐시

- 설정 파일 URL은 `https://baegagopa.github.io/crosspromo/config/crosspromo.json`이다.
- 응답은 UTF-8 JSON 객체로 파싱한다.
- `cache_ttl_hours`는 성공적으로 받은 설정을 재사용할 수 있는 최대 시간이다.
- 마지막으로 성공한 설정을 로컬에 보관할 수 있다. 최신 fetch나 parse가 실패하면 TTL 안에 있는 캐시만 사용하고, TTL이 지났다면 해당 세션에서는 CrossPromo를 비활성화한다.
- GitHub Pages의 응답 헤더를 클라이언트 동작 규칙으로 하드코딩하지 않는다. 클라이언트가 따라야 할 캐시 규칙은 JSON 안의 `cache_ttl_hours`다.

### 루트 필드

| 필드 | 타입 | 필수 | 규칙 |
| --- | --- | --- | --- |
| `version` | number | yes | 현재 공개 스키마 버전은 `5`이다. 지원하지 않는 버전이면 CrossPromo를 비활성화한다. |
| `global_switch` | boolean | yes | `false`이면 어떤 프로모션도 보여주지 않는다. |
| `cache_ttl_hours` | number | yes | 설정 캐시 TTL이다. 0 이상의 시간 단위 값이어야 한다. |
| `url_bases` | object | yes | 공용 URL prefix 모음이다. asset과 store URL을 앱별 suffix와 조합할 때 사용한다. |
| `display_rules` | object | yes | 세션, 일일 노출 수, 쿨다운 같은 클라이언트 측 노출 제한 규칙이다. |
| `apps` | array | yes | 프로모션 후보 앱 목록이다. 없거나 배열이 아니면 후보가 없는 것으로 처리한다. |

### 표시 제한 규칙

`display_rules`는 설정 파일이 아니라 소비하는 앱에서 직접 집행한다. 보통 디바이스나 사용자 단위의 로컬 저장소에 노출 기록을 저장한다.

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `max_daily_impressions` | number | 로컬 캘린더 날짜 기준 하루 최대 CrossPromo 노출 수 |
| `min_sessions_before_show` | number | CrossPromo를 처음 보여주기 전 필요한 최소 호스트 앱 세션 수 |
| `cooldown_between_promos_minutes` | number | 두 CrossPromo 노출 사이에 필요한 최소 분 단위 간격 |

권장 적용 순서는 다음과 같다.

1. `global_switch`가 `false`이면 중단한다.
2. 세션 수가 `min_sessions_before_show`보다 작으면 중단한다.
3. 오늘 노출 수가 `max_daily_impressions`에 도달했으면 중단한다.
4. 마지막 노출 시각이 `cooldown_between_promos_minutes` 안에 있으면 중단한다.
5. 앱 후보를 만들고 정렬한다.

### 앱 후보 필드

`apps`의 각 항목은 하나의 프로모션 대상 앱을 설명한다.

| 필드 | 타입 | 필수 | 규칙 |
| --- | --- | --- | --- |
| `id` | string | yes | 안정적인 고유 ID다. 현재 규칙은 lowercase kebab-case다. |
| `enabled` | boolean | yes | `false`이면 이 앱은 후보에서 제외한다. |
| `app_type` | string | yes | 큰 제품 분류다. 예: `utility`. |
| `tags` | string array | yes | 추천 매칭, 검색, 필터에 쓰는 기능/주제 키워드다. 최소 1개 이상이어야 한다. |
| `priority` | number | yes | 값이 클수록 먼저 노출한다. |
| `is_featured` | boolean | yes | UI에서 featured 처리를 할 수 있는 힌트다. 별도 정책이 없다면 `priority`를 변경하지 않는다. |
| `name` | string | yes | 기본 표시 이름이다. |
| `tagline` | string | yes | 기본 짧은 설명이다. |
| `icon_path` | string | yes | `url_bases.assets` 뒤에 붙일 정사각형 아이콘 경로다. `?v=5` 같은 query string을 포함할 수 있다. |
| `banner_path` | string | yes | `url_bases.assets` 뒤에 붙일 와이드 배너 경로다. `?v=5` 같은 query string을 포함할 수 있다. |
| `platforms` | object | yes | 플랫폼별 메타데이터다. 현재 공개 설정은 Android 정보가 채워져 있다. |
| `exclude_current_game` | boolean | yes | true이면 현재 실행 중인 호스트 앱과 같은 앱은 노출하지 않는다. |
| `target_platforms` | string array | yes | 이 프로모션을 보여줄 수 있는 런타임 플랫폼 목록이다. |
| `localized_content` | object | yes | `_items` 형식으로 인코딩된 현지화 텍스트다. |

### 플랫폼 규칙

Android 클라이언트는 다음 값을 읽는다.

- `url_bases.stores.android`
- `platforms.android.applicationId`

Android에서 실행 중인 클라이언트는 다음 조건을 모두 만족하는 후보만 유지한다.

- `target_platforms`에 `android`가 포함되어 있다.
- `platforms.android.applicationId`가 있다.
- `url_bases.stores.android`와 `platforms.android.applicationId`를 조합한 store URL이 유효한 HTTPS URL이다.

Android store URL은 `url_bases.stores.android + platforms.android.applicationId`로 만든다.
iOS store URL은 `url_bases.stores.ios + platforms.ios.appStoreId`로 만들며, `appStoreId`가 비어 있으면 iOS 후보에서 제외한다.
Asset URL은 `url_bases.assets + icon_path` 또는 `url_bases.assets + banner_path`로 만든다. `icon_path`나 `banner_path`에 `?v=5` 같은 query string이 포함되어도 그대로 붙여 사용한다.

`exclude_current_game`이 true이면 호스트 앱과 후보 앱을 먼저 `platforms.android.applicationId`로 비교하고, 호스트에 내부 CrossPromo ID가 있다면 `id`도 비교한다. 둘 중 하나라도 같으면 해당 후보를 제외한다.

### 현지화 규칙

`localized_content`는 `_items` 배열로 인코딩되어 있다.

```json
{
  "localized_content": {
    "_items": [
      {
        "key": "en",
        "value": {
          "name": "BCS Sample Utility",
          "tagline": "A productivity utility for everyday tasks."
        }
      }
    ]
  }
}
```

`localized_content.en` 또는 `localized_content.ko` 같은 직접 속성이 있다고 가정하면 안 된다.

`ko-KR` 같은 로케일의 권장 조회 순서는 다음과 같다.

1. 정확히 일치하는 로케일 키. 예: `ko-KR`.
2. 언어 키. 예: `ko`.
3. 영어 키 `en`.
4. 최상위 `name`, `tagline`.

현지화 값이 없거나 문자열이 아니면 필드별로 독립적으로 폴백한다. 예를 들어 현지화된 `name`만 있고 `tagline`이 없으면 `tagline`만 다음 단계 값으로 폴백한다.

### 후보 선택

루트 규칙과 표시 제한을 통과한 뒤 다음 순서로 후보를 만든다.

1. `apps`를 파일 순서대로 읽는다.
2. 필수 필드가 없거나 타입이 맞지 않는 항목은 제외한다.
3. `enabled`가 `false`인 항목은 제외한다.
4. 현재 런타임 플랫폼을 타깃하지 않는 항목은 제외한다.
5. `exclude_current_game` 조건에 걸리는 현재 호스트 앱은 제외한다.
6. 호스트 앱이나 런타임 컨텍스트가 가진 태그와 후보 앱의 `tags`가 겹치는 개수를 계산한다.
7. 겹치는 태그 수 내림차순으로 먼저 정렬하고, 같은 개수끼리는 `priority` 내림차순으로 정렬한다. 그래도 같으면 원래 파일 순서를 유지한다.

유효한 후보가 하나도 없으면 아무것도 보여주지 않고 노출 카운터도 증가시키지 않는다.

### 파싱 규칙

- 알 수 없는 루트 필드와 앱 필드는 무시한다.
- 알고 있는 필드의 타입이 틀리면 해당 범위를 invalid로 처리한다.
- 클라이언트가 미래의 `tags` 값을 모두 알고 있을 필요는 없다.
- 스키마 변경 여부는 `version` 변경을 기준으로 판단한다.

## What This Repo Should Contain

Keep only public publish artifacts here:

- `config/crosspromo.json`
- `assets/`
- `.nojekyll`
- lightweight public-facing documentation such as this `README.md`
- ignore files needed to keep the public repo clean

## What Must Stay Out Of GitHub

Do not commit private tooling or operator material into this public repository.

Examples that must stay outside GitHub:

- GUI or automation tool source
- PowerShell helper scripts used for internal publish work
- staging folders, temp exports, and drafts
- internal notes, runbooks, and operator-only screenshots
- anything under `CrossPromoTools/`

`CrossPromoTools/` should stay local or in P4 only, and should not be tracked by Git in this public repo.

## Public vs Private Rule Of Thumb

Publish to GitHub only if the file is safe for any anonymous visitor to read directly in the browser.

- `public`: final config, final assets, minimal public docs
- `private`: tooling, source materials, previews, exports, internal instructions, credentials, or anything that reveals internal workflow

If you would hesitate to paste the file into a public issue, it does not belong in this repository.

## Maintainer Safety

This repo includes sample local hooks under `.githooks/` and a GitHub Actions workflow under `.github/workflows/guard-private-tooling.yml` to block tracked private/local paths such as `CrossPromoTools/`, local staging/tooling folders, root automation scripts, temp/log/cache artifacts, and OS noise.

These guards are defense-in-depth, not a substitute for repository settings. A direct push to an unprotected publishing branch can briefly publish a forced-added private file before GitHub Actions reports failure, so the publishing branch must require pull requests and this workflow as a required check.

- local hooks help stop accidental staging or pushing before the change leaves your machine
- `.githooks/` is only a sample location; nothing runs automatically until you copy or symlink these hooks into `.git/hooks/` or configure `core.hooksPath`
- the GitHub Actions check is a required PR/merge gate only when branch protection requires it; it cannot prevent a direct push from briefly publishing a forced-added private file. Protect the publishing branch, require pull requests, and make this workflow a required check.
