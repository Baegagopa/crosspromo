const COPY = {
  ko: {
    "aria.skip": "본문으로 바로가기",
    "aria.home": "BCS Craft 홈",
    "aria.navigation": "주요 메뉴",
    "aria.language": "언어 선택",
    "aria.tags": "태그",
    "aria.stores": "스토어 링크",
    "nav.games": "게임",
    "nav.about": "소개",
    "hero.eyebrow": "작은 게임 스튜디오",
    "hero.title": "작고 포근한 게임을 만듭니다.",
    "hero.lead": "잠깐 쉬어 가는 시간을 기분 좋게 채워 주는 캐주얼 게임. 누구나 바로 시작하고, 끝나면 마음이 조금 말랑해지는 게임을 꿈꿉니다.",
    "hero.action": "게임 보러 가기",
    "games.eyebrow": "우리 게임",
    "games.title": "정원에서 만나요",
    "about.eyebrow": "이렇게 만들어요",
    "about.title": "작은 즐거움을 정성껏",
    "about.short.title": "짧게, 기분 좋게",
    "about.short.body": "몇 분이면 한 판. 바쁜 하루 사이에 잠깐 들러 쉬어 갈 수 있게 만듭니다.",
    "about.easy.title": "누구나 쉽게",
    "about.easy.body": "긴 설명 없이도 손이 먼저 알아채는 규칙, 실패해도 다시 하고 싶어지는 흐름을 고민합니다.",
    "about.care.title": "한 번만 더",
    "about.care.body": "한 판이 끝나면 「한 번만 더」 하고 싶어지는 게임을 목표로 합니다.",
    "footer.tagline": "작고 포근한 게임을 만듭니다.",
    "footer.contact": "문의",
    "footer.privacy": "Bloom Rows 개인정보처리방침",
    "footer.bizName": "상호",
    "footer.bizOwner": "대표",
    "footer.bizNo": "사업자등록번호",
    "footer.bizCheck": "사업자정보 확인",
    "footer.bizMail": "통신판매업 신고",
    "footer.bizTel": "전화",
    "footer.bizEmail": "이메일",
    "footer.bizAddr": "주소",
    "footer.bizHost": "호스팅",
    "card.comingSoon": "출시 준비 중",
    "card.privacy": "개인정보처리방침",
    "store.googlePlay": "Google Play에서 보기",
    "store.appStore": "App Store에서 보기",
    "store.open": "{name} — {store}에서 보기",
    "feed.error": "게임 목록을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.",
    "feed.retry": "다시 시도",
    "feed.loaded": "게임 {count}개를 불러왔습니다."
  },
  en: {
    "aria.skip": "Skip to main content",
    "aria.home": "BCS Craft home",
    "aria.navigation": "Primary navigation",
    "aria.language": "Choose language",
    "aria.tags": "Tags",
    "aria.stores": "Store links",
    "nav.games": "Games",
    "nav.about": "About",
    "hero.eyebrow": "A small game studio",
    "hero.title": "We make small, cozy games.",
    "hero.lead": "Casual games that fill a short break with something gentle. Easy to start, and a little heart-warming by the time you put them down.",
    "hero.action": "See our games",
    "games.eyebrow": "Our games",
    "games.title": "Meet us in the garden",
    "about.eyebrow": "How we make them",
    "about.title": "Small joys, made with care",
    "about.short.title": "Short and sweet",
    "about.short.body": "A round takes a few minutes, so you can drop in for a breather on a busy day.",
    "about.easy.title": "Easy for everyone",
    "about.easy.body": "Rules your hands pick up before you read them, and a flow that makes you want one more try.",
    "about.care.title": "One more round",
    "about.care.body": "We aim for games that make you want just one more round when a round ends.",
    "footer.tagline": "We make small, cozy games.",
    "footer.contact": "Contact",
    "footer.privacy": "Bloom Rows Privacy Policy",
    "footer.bizName": "Business name",
    "footer.bizOwner": "Representative",
    "footer.bizNo": "Business registration no.",
    "footer.bizCheck": "Verify (KFTC)",
    "footer.bizMail": "Mail-order business report no.",
    "footer.bizTel": "Phone",
    "footer.bizEmail": "Email",
    "footer.bizAddr": "Address",
    "footer.bizHost": "Hosting",
    "card.comingSoon": "Coming soon",
    "card.privacy": "Privacy policy",
    "store.googlePlay": "Get it on Google Play",
    "store.appStore": "Download on the App Store",
    "store.open": "View {name} on {store}",
    "feed.error": "We couldn't load the game list. Please try again in a moment.",
    "feed.retry": "Try again",
    "feed.loaded": "Loaded {count} games."
  }
};

// Per-game links that live on this site rather than in the shared feed.
const PRIVACY_PAGES = {
  bloomrows: "./bloomrows/privacy.html"
};

const state = {
  apps: [],
  loaded: false,
  loadFailed: false,
  language: getInitialLanguage()
};

const elements = {
  gameList: document.querySelector("#game-list"),
  pageStatus: document.querySelector("#page-status")
};

function getInitialLanguage() {
  const queryLanguage = new URLSearchParams(window.location.search).get("lang");
  if (queryLanguage === "ko" || queryLanguage === "en") {
    return queryLanguage;
  }

  try {
    const savedLanguage = window.localStorage.getItem("bcs-language");
    if (savedLanguage === "ko" || savedLanguage === "en") {
      return savedLanguage;
    }
  } catch {
    // Language persistence is optional.
  }

  return navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en";
}

function copy(key, replacements) {
  const dictionary = COPY[state.language] || COPY.en;
  let value = dictionary[key] || COPY.en[key] || key;

  Object.entries(replacements || {}).forEach(function replaceToken(entry) {
    value = value.replace("{" + entry[0] + "}", String(entry[1]));
  });

  return value;
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.title = state.language === "ko"
    ? "BCS Craft — 포근한 게임"
    : "BCS Craft — Cozy Games";

  document.querySelectorAll("[data-copy]").forEach(function translate(element) {
    element.textContent = copy(element.dataset.copy);
  });

  document.querySelectorAll("[data-aria-copy]").forEach(function translateLabel(element) {
    element.setAttribute("aria-label", copy(element.dataset.ariaCopy));
  });

  document.querySelectorAll("[data-language]").forEach(function setPressed(button) {
    button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
  });

  if (state.loaded) {
    renderGames();
  } else if (state.loadFailed) {
    renderError();
  }
}

function localizedApp(app) {
  const items = app.localized_content && app.localized_content._items;
  const list = Array.isArray(items) ? items : [];
  const find = function findLanguage(language) {
    const item = list.find(function match(entry) {
      return entry && entry.key === language;
    });
    return (item && item.value) || {};
  };
  const preferred = find(state.language);
  const english = find("en");

  return {
    name: preferred.name || english.name || app.name || app.id,
    tagline: preferred.tagline || english.tagline || app.tagline || ""
  };
}

// Images always come from this site's own assets folder so a local preview
// and the published page show the same files.
function assetUrl(path) {
  return path ? "./assets/" + String(path).replace(/^\/+/, "") : "";
}

function safeHttpsUrl(value) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value, document.baseURI);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function storeDestinations(app) {
  // A package ID names an intended listing but does not prove the store page
  // exists, so only explicit published URLs become links.
  const android = app.platforms && app.platforms.android;
  const ios = app.platforms && app.platforms.ios;
  const destinations = [];
  const androidUrl = safeHttpsUrl(android && android.storeUrl);
  const iosUrl = safeHttpsUrl(ios && ios.storeUrl);

  if (androidUrl) {
    destinations.push({ label: copy("store.googlePlay"), name: "Google Play", url: androidUrl });
  }
  if (iosUrl) {
    destinations.push({ label: copy("store.appStore"), name: "App Store", url: iosUrl });
  }
  return destinations;
}

function createImage(src, className, width, height, eager) {
  const image = document.createElement("img");
  image.alt = "";
  image.className = className;
  image.width = width;
  image.height = height;
  image.decoding = "async";
  image.loading = eager ? "eager" : "lazy";
  if (src) {
    image.src = src;
  }
  image.addEventListener("error", function hideBroken() {
    image.classList.add("is-missing");
  });
  return image;
}

function renderGameCard(app, index) {
  const localized = localizedApp(app);
  const article = document.createElement("article");
  article.className = "game-card" + (index % 2 === 1 ? " game-card--flip" : "");
  article.style.animationDelay = Math.min(index * 90, 270) + "ms";

  const media = document.createElement("div");
  media.className = "game-card__media";
  media.append(createImage(assetUrl(app.banner_path), "game-card__banner", 1200, 480, index === 0));

  const body = document.createElement("div");
  body.className = "game-card__body";

  const heading = document.createElement("div");
  heading.className = "game-card__heading";
  heading.append(createImage(assetUrl(app.icon_path), "game-card__icon", 512, 512, index === 0));
  const title = document.createElement("h3");
  title.textContent = localized.name;
  heading.append(title);

  const tagline = document.createElement("p");
  tagline.className = "game-card__tagline";
  tagline.textContent = localized.tagline;

  const tags = document.createElement("ul");
  tags.className = "tag-list";
  tags.setAttribute("aria-label", copy("aria.tags"));
  (Array.isArray(app.tags) ? app.tags.slice(0, 3) : []).forEach(function appendTag(tag) {
    const item = document.createElement("li");
    item.textContent = "#" + tag;
    tags.append(item);
  });

  const actions = document.createElement("div");
  actions.className = "game-card__actions";
  const destinations = storeDestinations(app);
  if (destinations.length > 0) {
    destinations.forEach(function appendStore(destination) {
      const link = document.createElement("a");
      link.className = "button button--small";
      link.href = destination.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = destination.label;
      link.setAttribute("aria-label", copy("store.open", { name: localized.name, store: destination.name }));
      actions.append(link);
    });
  } else {
    const badge = document.createElement("span");
    badge.className = "status-pill";
    badge.textContent = copy("card.comingSoon");
    actions.append(badge);
  }

  const privacyPage = PRIVACY_PAGES[app.id];
  if (privacyPage) {
    const privacy = document.createElement("a");
    privacy.className = "text-link";
    privacy.href = privacyPage;
    privacy.textContent = copy("card.privacy");
    actions.append(privacy);
  }

  body.append(heading, tagline, tags, actions);
  article.append(media, body);
  return article;
}

function visibleGames() {
  return state.apps
    .filter(function isGame(app) {
      return app && app.app_type === "game";
    })
    .sort(function compare(first, second) {
      const enabledDifference = Number(Boolean(second.enabled)) - Number(Boolean(first.enabled));
      if (enabledDifference !== 0) {
        return enabledDifference;
      }
      return (Number(second.priority) || 0) - (Number(first.priority) || 0);
    });
}

function renderGames() {
  const games = visibleGames();
  elements.gameList.replaceChildren();
  elements.gameList.setAttribute("aria-busy", "false");
  games.forEach(function appendGame(app, index) {
    elements.gameList.append(renderGameCard(app, index));
  });
}

function renderError() {
  const panel = document.createElement("div");
  panel.className = "feed-error";
  const message = document.createElement("p");
  message.textContent = copy("feed.error");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button--small";
  button.textContent = copy("feed.retry");
  button.addEventListener("click", loadFeed, { once: true });
  panel.append(message, button);

  elements.gameList.replaceChildren(panel);
  elements.gameList.setAttribute("aria-busy", "false");
  elements.pageStatus.textContent = copy("feed.error");
}

async function loadFeed() {
  state.loadFailed = false;
  elements.gameList.setAttribute("aria-busy", "true");

  try {
    const response = await fetch(new URL("./config/crosspromo.json", document.baseURI), {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      throw new Error("CrossPromo feed returned " + response.status);
    }

    const config = await response.json();
    if (!config || !Array.isArray(config.apps)) {
      throw new Error("CrossPromo feed is missing the apps array");
    }

    state.apps = config.apps;
    state.loaded = true;
    renderGames();
    elements.pageStatus.textContent = copy("feed.loaded", { count: visibleGames().length });
  } catch (error) {
    console.error(error);
    state.loadFailed = true;
    renderError();
  }
}

document.querySelectorAll("[data-language]").forEach(function bindLanguage(button) {
  button.addEventListener("click", function changeLanguage() {
    state.language = button.dataset.language;
    try {
      window.localStorage.setItem("bcs-language", state.language);
    } catch {
      // Language persistence is optional.
    }
    applyLanguage();
  });
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
applyLanguage();
loadFeed();
