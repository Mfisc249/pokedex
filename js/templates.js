function pokemonCardTemplate(vm) {
  return `
    <article class="card ${vm.bgClass}" data-id="${vm.id}">
      ${cardImageBlockTemplate(vm.img, vm.name)}
      <span class="number">#${vm.idPadded}</span>
      <h2 class="name">${vm.nameFormatted}</h2>
      <div class="types">${vm.typesHtml}</div>
    </article>
  `;
}

function cardImageBlockTemplate(img, altText) {
  return `
    <div class="img-container">
      <img class="image" src="${img}" alt="${altText}" loading="lazy" />
      <img class="background" src="assets/Icons/default/pokeball.svg" alt="" aria-hidden="true" />
    </div>
  `;
}
function typeBadgeTemplate(type) {
  return `
    <div class="poke__type__bg ${type}">
      <img src="assets/Icons/${type}.svg" alt="${type}" />
    </div>
  `;
}

function typePillTemplate(type) {
  return `<span class="type-pill">${type}</span>`;
}

function aboutRowTemplate(label, valueHtml) {
  return `
    <div class="about-row">
      <span>${label}</span>
      <b>${valueHtml}</b>
    </div>
  `;
}

function aboutGridTemplate(rowsHtml) {
  return `<div class="about-grid">${rowsHtml}</div>`;
}

function statsRowTemplate(label, valueHtml) {
  return `
    <div class="stat-row">
      <span>${label}</span>
      <b>${valueHtml}</b>
    </div>
  `;
}

function statsListTemplate(rowsHtml) {
  return `<div class="stats-list">${rowsHtml}</div>`;
}
function overlayTemplate(vm) {
  return `
    <div class="poke-modal ${vm.bgClass}">
      ${vm.navHtml}
      ${overlayTopTemplate(vm)}
      ${overlayBottomTemplate(vm)}
    </div>
  `;
}

function overlayNavButtonsTemplate(canPrev, canNext) {
  return `
    <button class="nav-btn nav-left" data-nav="-1" aria-label="Previous" ${canPrev ? "" : "disabled"}>
      <span>←</span>
    </button>
    <button class="nav-btn nav-right" data-nav="1" aria-label="Next" ${canNext ? "" : "disabled"}>
      <span>→</span>
    </button>
  `;
}

function overlayTopTemplate(vm) {
  return `
    <div class="poke-modal-top">
      <button class="modal-close" data-close="1" aria-label="Close">✕</button>

      <div class="poke-modal-head">
        ${overlayHeadLeftTemplate(vm)}
        <img class="modal-sprite" src="${vm.img}" alt="${vm.name}" />
      </div>

      <img class="modal-pokeball" src="assets/Icons/default/pokeball.svg" alt="" aria-hidden="true" />
    </div>
  `;
}

function overlayHeadLeftTemplate(vm) {
  return `
    <div>
      <div class="modal-id">#${vm.idPadded}</div>
      <h2 class="modal-title">${vm.nameFormatted}</h2>
      <div class="modal-types">${vm.typePillsHtml}</div>
    </div>
  `;
}

function overlayBottomTemplate(vm) {
  return `
    <div class="poke-modal-bottom">
      <div class="tabs">${vm.tabsHtml}</div>
      <div class="tab-content">
        ${tabPanelTemplate("about", vm.activeTab, vm.aboutHtml)}
        ${tabPanelTemplate("stats", vm.activeTab, vm.statsHtml)}
        ${tabPanelTemplate("gender", vm.activeTab, vm.genderHtml)}
        ${tabPanelTemplate("evolution", vm.activeTab, vm.evolutionHtml)}
      </div>
    </div>
  `;
}

function tabPanelTemplate(key, activeTab, contentHtml) {
  const active = activeTab === key ? "active" : "";
  return `<div class="tab-panel ${active}" id="tab-${key}">${contentHtml}</div>`;
}

function tabsTemplate(activeTab) {
  return `
    <button class="tab ${activeTab === "about" ? "active" : ""}" data-tab="about">About</button>
    <button class="tab ${activeTab === "stats" ? "active" : ""}" data-tab="stats">Base Stats</button>
    <button class="tab ${activeTab === "gender" ? "active" : ""}" data-tab="gender">Gender</button>
    <button class="tab ${activeTab === "evolution" ? "active" : ""}" data-tab="evolution">Evolution</button>
  `;
}
function evolutionPlaceholderTemplate() {
  return `
    <p class="tab-hint">Open this tab to load the evolution timeline.</p>
    <div class="evo-loading hidden" id="evoLoading">
      <div class="mini-spinner"></div>
      <span>Loading evolution…</span>
    </div>
    <div id="evoTimeline"></div>
  `;
}

function evoBranchesTemplate(rootHtml, rowsHtml, maxLen) {
  return `<div class="evo-branches" data-cols="${maxLen}">${rootHtml}${rowsHtml}</div>`;
}

function evoRootWrapTemplate(rootItemHtml) {
  return `<div class="evo-root">${rootItemHtml}</div>`;
}

function evoRowTemplate(cellsHtml) {
  return `<div class="evo-row">${cellsHtml}</div>`;
}

function evoBranchArrowTemplate() {
  return `<div class="evo-branch-arrow" aria-hidden="true">↳</div>`;
}

function evoArrowTemplate() {
  return `<div class="evo-arrow" aria-hidden="true">→</div>`;
}

function evoSpacerTemplate() {
  return `<div class="evo-spacer"></div>`;
}

function evoItemTemplate(vm) {
  return `
    <div class="evo-item ${vm.extraClass || ""}" data-evo-id="${vm.id}" title="${vm.title}">
      <img src="${vm.img}" alt="${vm.name}" loading="lazy" />
      <div class="evo-name">${vm.nameFormatted}</div>
      <div class="evo-id">#${vm.idPadded}</div>
    </div>
  `;
}