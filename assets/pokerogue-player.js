(() => {
  const assets = globalThis.pokerogueAssets;
  if (!assets) return;
  const base = new URL('./pokerogue/', document.currentScript.src);
  const url = path => path && new URL(path.split('/').map(encodeURIComponent).join('/'), base).href;
  const graphics = new Set(assets.graphics);
  const requests = new Map();
  const pictures = new Map();
  const animationData = globalThis.pokerogueAnimationData = {};

  function loadAnimation(id) {
    if (animationData[id]) return Promise.resolve(animationData[id]);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url(assets.moves[id]);
      script.onload = () => { script.remove(); resolve(animationData[id]); };
      script.onerror = () => { script.remove(); reject(new Error('Animation unavailable')); };
      document.head.append(script);
    });
  }

  function image(path) {
    if (!pictures.has(path)) {
      const img = new Image();
      img.src = url(path);
      pictures.set(path, img.decode().then(() => img, () => null));
    }
    return pictures.get(path);
  }

  function preload(id) {
    if (!assets.moves[id]) return Promise.resolve(null);
    if (!requests.has(id)) {
      const request = loadAnimation(id).then(async data => {
        const variants = Array.isArray(data) ? data : [data];
        return Promise.all(variants.map(async animation => {
          if (!animation?.frames?.length) return null;
          const path = name => 'images/battle_anims/' + name + '.png';
          const sheet = graphics.has(animation.graphic) ? await image(path(animation.graphic)) : null;
          const backgrounds = new Map();
          const events = Object.values(animation.frameTimedEvents ?? {}).flat();
          await Promise.all(events.filter(event => event.eventType === 'AnimTimedAddBgEvent' && graphics.has(event.resourceName))
            .map(async event => backgrounds.set(event.resourceName, await image(path(event.resourceName)))));
          return { animation, sheet, backgrounds };
        }));
      }).catch(() => {
        requests.delete(id);
        return null;
      });
      requests.set(id, request);
    }
    return requests.get(id);
  }

  function playSound(event, volume, cry) {
    const path = assets.sounds[event.resourceName];
    if (!event.resourceName) return cry?.();
    if (!volume || !path) return;
    const audio = new Audio(url(path));
    audio.volume = Math.min(1, volume * (event.volume ?? 100) / 100);
    audio.playbackRate = Math.min(4, Math.max(.25, (event.pitch ?? 100) / 100));
    audio.play().catch(() => {});
  }

  async function play(id, { arena, overlay, source, target, enemy, speed, volume, reduced, cry, fallbackSound }) {
    const pending = preload(id);
    let timeout;
    const variants = await Promise.race([pending, new Promise(resolve => { timeout = setTimeout(() => resolve(null), 220); })]);
    clearTimeout(timeout);
    const entry = variants?.[enemy ? 1 : 0] ?? variants?.[0];
    if (!entry || !arena?.offsetWidth || !source || !target) return false;
    const { animation, sheet, backgrounds } = entry;
    const events = animation.frameTimedEvents ?? {};
    if (!Object.values(events).flat().some(event => event.eventType === 'AnimTimedSoundEvent' && (assets.sounds[event.resourceName] || !event.resourceName && cry))) fallbackSound?.();
    const field = arena.getBoundingClientRect();
    const point = element => {
      const box = element.getBoundingClientRect();
      return [(box.left + box.width / 2 - field.left) * 320 / field.width,
        (box.top + box.height * .58 - field.top) * 144 / field.height];
    };
    const from = point(source);
    const to = point(target);
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 144;
    const parent = overlay.getBoundingClientRect();
    Object.assign(canvas.style, {
      position: 'absolute', left: (field.left - parent.left) + 'px', top: (field.top - parent.top) + 'px',
      width: field.width + 'px', height: field.height + 'px', imageRendering: 'pixelated',
    });
    overlay.append(canvas);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const sprites = [source.querySelector('img'), target.querySelector('img')];
    const saved = [...new Set(sprites.filter(Boolean))].map(sprite => [sprite, sprite.style.transform, sprite.style.opacity, sprite.style.filter]);
    let bg = null;
    let lastFrame = -1;
    const ms = (reduced ? 20 : 50) / speed;

    function coordinates(frame) {
      if (frame.focus === 1) return [to[0] + frame.x - 128, to[1] + frame.y + 64];
      if (frame.focus === 2) return [from[0] + frame.x, from[1] + frame.y];
      if (frame.focus === 3) {
        const progress = (frame.x * 128 - frame.y * 64) / 20480;
        const offset = (frame.x * 64 + frame.y * 128) / Math.hypot(128, 64);
        return [from[0] + (to[0] - from[0]) * progress,
          from[1] + (to[1] - from[1]) * progress + offset];
      }
      return [106 + frame.x, 116 + frame.y];
    }

    function renderFrame(index) {
      ctx.clearRect(0, 0, 320, 144);
      if (bg?.image) {
        ctx.globalAlpha = bg.opacity;
        ctx.drawImage(bg.image, 0, 0, 320, 144);
        ctx.globalAlpha = 1;
      }
      for (const [sprite, transform, opacity, filter] of saved) {
        sprite.style.transform = transform;
        sprite.style.opacity = opacity;
        sprite.style.filter = filter;
      }
      for (const frame of animation.frames[index] ?? []) {
        const [x, y] = coordinates(frame);
        const mirror = Boolean(frame.mirror) !== (frame.focus === 3 && to[0] < from[0]);
        const sx = (frame.zoomX ?? 100) / 100 * (mirror ? -1 : 1);
        const sy = (frame.zoomY ?? 100) / 100;
        const opacity = (frame.opacity ?? 255) / 255;
        if (frame.target !== 2) {
          const sprite = sprites[frame.target];
          if (!sprite || reduced || frame.locked) continue;
          const anchor = frame.target === 0 ? from : to;
          sprite.style.transform = 'translate(' + (x - anchor[0]) * field.width / 320 + 'px,' + (y - anchor[1]) * field.height / 144 + 'px) rotate(' + -(frame.angle ?? 0) + 'deg) scale(' + sx + ',' + sy + ')';
          sprite.style.opacity = frame.visible === false ? '0' : String(opacity);
          continue;
        }
        if (!sheet || frame.visible === false) continue;
        const columns = Math.floor(sheet.width / 96);
        if (!columns) continue;
        const cell = frame.graphicFrame ?? 0;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.globalCompositeOperation = frame.blendType === 1 ? 'lighter' : frame.blendType === 2 ? 'difference' : 'source-over';
        if (animation.hue) ctx.filter = 'hue-rotate(' + animation.hue + 'deg)';
        ctx.translate(x, y);
        ctx.rotate(-(frame.angle ?? 0) * Math.PI / 180);
        ctx.scale(sx, sy);
        ctx.drawImage(sheet, cell % columns * 96, Math.floor(cell / columns) * 96, 96, 96, -48, -48, 96, 96);
        ctx.restore();
      }
    }

    try {
      await new Promise((resolve, reject) => {
        const start = performance.now();
        function tick(now) {
          try { draw(now); } catch (error) { reject(error); }
        }
        function draw(now) {
          const frame = Math.max(0, Math.floor((now - start) / ms));
          const visible = Math.min(frame, animation.frames.length - 1);
          for (let index = lastFrame + 1; index <= visible; index++) {
            for (const event of events[index] ?? []) {
              if (event.eventType === 'AnimTimedSoundEvent') playSound(event, volume, cry);
              if (event.eventType === 'AnimTimedAddBgEvent') bg = { image: backgrounds.get(event.resourceName), opacity: (event.opacity ?? 255) / 255 };
              if (event.eventType === 'AnimTimedUpdateBgEvent' && bg && event.opacity != null) bg.opacity = event.opacity / 255;
            }
          }
          if (visible !== lastFrame) {
            renderFrame(visible);
            lastFrame = visible;
          }
          if (frame < animation.frames.length && canvas.isConnected) requestAnimationFrame(tick);
          else resolve();
        }
        requestAnimationFrame(tick);
      });
    } finally {
      canvas.remove();
      for (const [sprite, transform, opacity, filter] of saved) {
        sprite.style.transform = transform;
        sprite.style.opacity = opacity;
        sprite.style.filter = filter;
      }
    }
    return true;
  }

  globalThis.pokerogueArt = {
    url, preload, play,
    species: (key, shiny, back) => url(assets.species[(back ? 'back/' : '') + (shiny ? 'shiny/' : '') + key]),
    trainer: key => assets.trainers[key]?.map(url),
    ball: key => url(assets.balls[key]),
    stat: key => url(assets.effects?.battle_stats?.[{accuracy:0,attack:1,defense:2,evasion:3,multiple:4,sp_attack:5,speed:6,sp_defense:7}[key]]),
    particle: index => url(assets.effects?.pb_particles?.[index]),
  };
})();
