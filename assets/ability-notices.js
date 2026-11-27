(() => {
  const records = new WeakMap();
  const lanes = new Map();
  const assetBase = new URL('./ui/', document.currentScript.src);
  const style = document.createElement('style');
  style.textContent = `
  #abilityNoticeLayer{position:absolute;inset:0;pointer-events:none;z-index:11;overflow:hidden;clip-path:inset(2.8% 23.7% 55.1% 23.7% round .48cqw)}
  .ability-notice{position:absolute;left:23.7%;top:31%;width:16.4cqw;height:6.25cqw;background:var(--ability-bar-left) center/100% 100% no-repeat;display:flex;flex-direction:column;justify-content:center;padding:0 1.4cqw 0 .8cqw;box-sizing:border-box;color:#fff;text-shadow:.1cqw .1cqw #171719;font-family:inherit;pointer-events:none}
  .ability-notice.enemy{left:auto;right:23.7%;top:19.9%;background-image:var(--ability-bar-right);padding:0 .8cqw 0 1.4cqw}
  .ability-notice span,.ability-notice strong{position:relative;top:.15cqw;display:block;line-height:1;white-space:nowrap;flex:none}
  .ability-notice span{font-size:1.14cqw}.ability-notice strong{font-size:1.5cqw;font-weight:bold}
  .ability-notice[data-language=en] strong{font-size:1.22cqw;line-height:1.15}
  .ability-notice.enemy span,.ability-notice.enemy strong{text-align:right}
  `;
  document.head.append(style);
  function record(run) {
    let value = records.get(run);
    if (!value) { value = { depth: 0, seen: new WeakMap(), key: '' }; records.set(run, value); }
    return value;
  }
  function enter(run) {
    if (!run) return;
    const value = record(run);
    if (!value.depth) value.seen = new WeakMap();
    value.depth++;
  }
  function leave(run) { const value = records.get(run); if (value) value.depth = Math.max(0, value.depth - 1); }
  function clear() {
    for (const lane of lanes.values()) { lane.controller.abort(); lane.element?.remove(); }
    lanes.clear();
    document.getElementById('abilityNoticeLayer')?.replaceChildren();
  }
  function layer() {
    let element = document.getElementById('abilityNoticeLayer');
    if (!element) {
      element = document.createElement('div');element.id = 'abilityNoticeLayer';element.setAttribute('aria-live', 'polite');
      element.style.setProperty('--ability-bar-left', 'url("' + new URL('ability_bar_left.png', assetBase).href + '")');
      element.style.setProperty('--ability-bar-right', 'url("' + new URL('ability_bar_right.png', assetBase).href + '")');
      document.querySelector('.desktop')?.append(element);
    }
    return element;
  }
  function fitText(element) {
    const maximum = element.clientWidth - parseFloat(getComputedStyle(element).paddingLeft) - parseFloat(getComputedStyle(element).paddingRight);
    for (const text of element.children) {
      text.style.fontSize = '';
      let size = parseFloat(getComputedStyle(text).fontSize);
      // The approved bar stays short; only longer names shrink, independently.
      while (text.scrollWidth > maximum + 1 && size > Math.max(4, (document.querySelector('.desktop')?.clientWidth ?? innerWidth) * .0075)) { size -= .5; text.style.fontSize = size + 'px'; }
    }
  }
  const delay = (ms, signal) => new Promise(resolve => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(timer);resolve(); }, { once: true });
  });
  async function pump(side, lane) {
    lane.running = true;
    try {
      while (lane.queue.length && !lane.controller.signal.aborted) {
        const event = lane.queue.shift();
        if (event.run !== state || event.stage !== state.stage || $('battleScreen').hidden) continue;
        const element = document.createElement('div');lane.element = element;
        element.className = 'ability-notice ' + side;element.dataset.language = settings.language;
        element.dataset.abilityId = event.id;
        const owner = document.createElement('span'), title = document.createElement('strong');
        owner.textContent = event.owner;title.textContent = event.title;element.append(owner, title);
        element.setAttribute('aria-label', event.owner + ': ' + event.title);layer().append(element);fitText(element);
        const speed = Math.max(1, Math.min(3, battleSpeed));
        const direction = side === 'enemy' ? 110 : -110;
        const motion = reducedMotion.matches ? null : element.animate([{ translate: direction + '% 0' }, { translate: '0 0' }], { duration: 500 / speed, easing: 'ease-out', fill: 'both' });
        await delay(500 / speed + Math.max(650, 1000 / speed) + 1000, lane.controller.signal);
        motion?.cancel();
        if (!lane.controller.signal.aborted && !reducedMotion.matches) {
          const exit = element.animate([{ translate: '0 0' }, { translate: direction + '% 0' }], { duration: 200 / speed, easing: 'ease-in', fill: 'both' });
          await delay(200 / speed, lane.controller.signal);exit.cancel();
        }
        element.remove();lane.element = null;
      }
    } finally { lane.element?.remove();lane.element = null;lane.running = false; }
  }
  function trigger(run, mon, id = activeAbility(mon)) {
    if (!run || run !== state || !mon || !id || $('battleScreen').hidden) return false;
    const side = run.team?.includes(mon) ? 'player' : run.foes?.includes(mon) || run.enemy === mon ? 'enemy' : null;
    if (!side) return false;
    const value = record(run), key = run.stage + ':' + run.spins + ':' + run.enemyTurns;
    if (!value.depth && value.key !== key) { value.key = key;value.seen = new WeakMap(); }
    let seen = value.seen.get(mon);if (!seen) { seen = new Set();value.seen.set(mon, seen); }
    if (seen.has(id)) return false;seen.add(id);
    let lane = lanes.get(side);
    if (!lane || lane.controller.signal.aborted) { lane = { queue: [], controller: new AbortController(), running: false };lanes.set(side, lane); }
    const title = displayAbility(id), owner = displayPokemon(mon);
    lane.queue.push({ run, stage: run.stage, id, title, owner });
    if (!lane.running) void pump(side, lane);
    return true;
  }
  globalThis.pokemonAbilityFeedback = { enter, leave, trigger, clear };
  window.addEventListener('resize', () => document.querySelectorAll('.ability-notice').forEach(fitText));
})();
