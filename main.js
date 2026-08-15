/* ============================================================
   hosseinmohebbi.com — hand-built, no dependencies
   1. hero: particle flow field
   2. playground: live tabular Q-learning gridworld
   3. scroll reveals + nav state
   ============================================================ */

(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------------- nav + reveals ---------------- */

  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { revealObs.observe(el); });

  /* ============================================================
     1. HERO FLOW FIELD
     Particles advected through a slowly-evolving vector field;
     the cursor acts as a repeller.
     ============================================================ */

  (function heroField() {
    var canvas = document.getElementById("field");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentElement;
    var W = 0, H = 0;
    var particles = [];
    var mouse = { x: -9999, y: -9999 };
    var t = 0;
    var running = true, visible = true, rafId = null;

    function angleAt(x, y, t) {
      return (Math.sin(x * 0.0016 + t * 0.35) +
              Math.cos(y * 0.0014 - t * 0.28) +
              Math.sin((x + y) * 0.0008 + t * 0.12)) * 1.7;
    }

    function makeParticle(anywhere) {
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : Math.random() * H,
        vx: 0, vy: 0,
        px: 0, py: 0,
        amber: Math.random() < 0.16,
        life: 120 + Math.random() * 380
      };
    }

    function resize() {
      W = hero.clientWidth;
      H = hero.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.fillStyle = "#0a0f16";
      ctx.fillRect(0, 0, W, H);
      var target = Math.max(140, Math.min(Math.round(W * H / 5200), 460));
      particles = [];
      for (var i = 0; i < target; i++) particles.push(makeParticle(true));
      if (REDUCED) drawStatic();
    }

    /* reduced motion: one static pass of faint streamlines */
    function drawStatic() {
      ctx.fillStyle = "#0a0f16";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(140,160,190,0.10)";
      ctx.lineWidth = 1;
      for (var i = 0; i < 220; i++) {
        var x = Math.random() * W, y = Math.random() * H;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (var s = 0; s < 26; s++) {
          var a = angleAt(x, y, 0);
          x += Math.cos(a) * 4;
          y += Math.sin(a) * 4;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    function step() {
      t += 0.006;
      ctx.fillStyle = "rgba(10, 15, 22, 0.085)";
      ctx.fillRect(0, 0, W, H);
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.px = p.x; p.py = p.y;

        var a = angleAt(p.x, p.y, t);
        var tvx = Math.cos(a) * 1.15;
        var tvy = Math.sin(a) * 1.15;

        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 19600) { /* 140px radius */
          var d = Math.sqrt(d2) || 1;
          var f = (140 - d) / 140 * 2.4;
          tvx += (dx / d) * f;
          tvy += (dy / d) * f;
        }

        p.vx += (tvx - p.vx) * 0.08;
        p.vy += (tvy - p.vy) * 0.08;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.x < -8) p.x = W + 8; else if (p.x > W + 8) p.x = -8;
        if (p.y < -8) p.y = H + 8; else if (p.y > H + 8) p.y = -8;
        if (p.life <= 0) { particles[i] = makeParticle(true); continue; }

        var jump = Math.abs(p.x - p.px) + Math.abs(p.y - p.py);
        if (jump > 30) continue; /* skip wrap streaks */

        ctx.strokeStyle = p.amber
          ? "rgba(232, 163, 61, 0.55)"
          : "rgba(140, 162, 194, 0.30)";
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }

    function loop() {
      if (running && visible && !document.hidden) step();
      rafId = requestAnimationFrame(loop);
    }

    hero.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", function () {
      mouse.x = -9999; mouse.y = -9999;
    });

    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(hero);

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    if (!REDUCED) loop();
  })();

  /* ============================================================
     2. LIVE Q-LEARNING GRIDWORLD
     Tabular Q-learning, ε-greedy. Click cells to toggle walls.
     ============================================================ */

  (function gridworld() {
    var canvas = document.getElementById("rl");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");

    var COLS = 13, ROWS = 8;
    var EMPTY = 0, WALL = 1, PIT = 2;
    var START = { c: 0, r: ROWS - 1 };
    var GOAL = { c: COLS - 1, r: 0 };

    var ALPHA = 0.2, GAMMA = 0.96;
    var EPS_MIN = 0.05, EPS_DECAY = 0.994;
    var R_STEP = -1, R_GOAL = 40, R_PIT = -25, MAX_STEPS = 300;
    /* actions: 0 up, 1 right, 2 down, 3 left */
    var DC = [0, 1, 0, -1], DR = [-1, 0, 1, 0];

    var grid, Q, visits;
    var eps, episodes, epReturn, epSteps, lastReturn, bestReturn;
    var agent = { c: START.c, r: START.r };
    var trail = [];
    var cell = 40, visible = true;

    var elEpisodes = document.getElementById("rl-episodes");
    var elReturn = document.getElementById("rl-return");
    var elBest = document.getElementById("rl-best");
    var elEps = document.getElementById("rl-eps");
    var elSpeed = document.getElementById("rl-speed");

    function defaultGrid() {
      var g = new Uint8Array(COLS * ROWS);
      /* a loose maze: two staggered walls + two pits */
      var walls = [
        [3, 1], [3, 2], [3, 3], [3, 4], [3, 5],
        [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7],
        [10, 0], [10, 1], [10, 2], [10, 3]
      ];
      walls.forEach(function (w) { g[w[1] * COLS + w[0]] = WALL; });
      g[4 * COLS + 5] = PIT;
      g[1 * COLS + 8] = PIT;
      return g;
    }

    function resetAgentState() {
      Q = new Float32Array(COLS * ROWS * 4);
      visits = new Uint32Array(COLS * ROWS);
      eps = 1.0;
      episodes = 0;
      lastReturn = null;
      bestReturn = null;
      startEpisode();
      updatePanel();
    }

    function startEpisode() {
      agent.c = START.c;
      agent.r = START.r;
      epReturn = 0;
      epSteps = 0;
      trail.length = 0;
    }

    function idx(c, r) { return r * COLS + c; }
    function qi(c, r, a) { return (r * COLS + c) * 4 + a; }

    function bestAction(c, r) {
      var b = 0, bv = Q[qi(c, r, 0)];
      for (var a = 1; a < 4; a++) {
        var v = Q[qi(c, r, a)];
        if (v > bv) { bv = v; b = a; }
      }
      return b;
    }

    function maxQ(c, r) { return Q[qi(c, r, bestAction(c, r))]; }

    function stepAgent() {
      var c = agent.c, r = agent.r;
      var a = Math.random() < eps ? (Math.random() * 4) | 0 : bestAction(c, r);
      var nc = c + DC[a], nr = r + DR[a];
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS || grid[idx(nc, nr)] === WALL) {
        nc = c; nr = r; /* bump */
      }

      var reward = R_STEP, done = false;
      if (nc === GOAL.c && nr === GOAL.r) { reward = R_GOAL; done = true; }
      else if (grid[idx(nc, nr)] === PIT) { reward = R_PIT; done = true; }

      var target = done ? reward : reward + GAMMA * maxQ(nc, nr);
      Q[qi(c, r, a)] += ALPHA * (target - Q[qi(c, r, a)]);

      agent.c = nc; agent.r = nr;
      visits[idx(nc, nr)]++;
      epReturn += reward;
      epSteps++;
      trail.push(nr * COLS + nc);
      if (trail.length > 40) trail.shift();

      if (done || epSteps >= MAX_STEPS) {
        lastReturn = Math.round(epReturn);
        if (bestReturn === null || lastReturn > bestReturn) bestReturn = lastReturn;
        episodes++;
        eps = Math.max(EPS_MIN, eps * EPS_DECAY);
        startEpisode();
      }
    }

    /* ---------- rendering ---------- */

    function resize() {
      var frame = canvas.parentElement;
      var w = frame.clientWidth - 20; /* frame padding */
      cell = w / COLS;
      var h = cell * ROWS;
      canvas.style.height = h + "px";
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function cellColor(c, r) {
      var v = maxQ(c, r);
      if (visits[idx(c, r)] < 2 || v === 0) return null;
      /* normalize against the goal-ish range; negative values stay dark */
      var n = Math.max(0, Math.min(1, (v + 10) / 50));
      if (n <= 0.02) return null;
      return "rgba(232, 163, 61, " + (0.04 + n * 0.42).toFixed(3) + ")";
    }

    function draw() {
      var w = canvas.width / DPR, h = canvas.height / DPR;
      ctx.fillStyle = "#0a0f16";
      ctx.fillRect(0, 0, w, h);

      var c, r, x, y;

      /* value heatmap */
      for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
          x = c * cell; y = r * cell;
          var t = grid[idx(c, r)];
          if (t === WALL) {
            ctx.fillStyle = "#1d2838";
            ctx.fillRect(x + 1.5, y + 1.5, cell - 3, cell - 3);
            continue;
          }
          if (t === PIT) {
            ctx.fillStyle = "rgba(214, 84, 84, 0.16)";
            ctx.fillRect(x + 1.5, y + 1.5, cell - 3, cell - 3);
            ctx.strokeStyle = "rgba(214, 84, 84, 0.55)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + cell * 0.3, y + cell * 0.3, cell * 0.4, cell * 0.4);
            continue;
          }
          var col = cellColor(c, r);
          if (col) {
            ctx.fillStyle = col;
            ctx.fillRect(x + 1.5, y + 1.5, cell - 3, cell - 3);
          }
        }
      }

      /* grid lines */
      ctx.strokeStyle = "rgba(148, 170, 205, 0.09)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (c = 1; c < COLS; c++) { ctx.moveTo(c * cell, 0); ctx.lineTo(c * cell, h); }
      for (r = 1; r < ROWS; r++) { ctx.moveTo(0, r * cell); ctx.lineTo(w, r * cell); }
      ctx.stroke();

      /* greedy-policy chevrons */
      ctx.strokeStyle = "rgba(238, 243, 250, 0.34)";
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      var s = cell * 0.16;
      for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
          if (grid[idx(c, r)] !== EMPTY || visits[idx(c, r)] < 6) continue;
          if (c === GOAL.c && r === GOAL.r) continue;
          var a = bestAction(c, r);
          var cx = c * cell + cell / 2, cy = r * cell + cell / 2;
          var dx = DC[a], dy = DR[a];
          ctx.beginPath();
          ctx.moveTo(cx - dx * s + dy * s, cy - dy * s + dx * s);
          ctx.lineTo(cx + dx * s, cy + dy * s);
          ctx.lineTo(cx - dx * s - dy * s, cy - dy * s - dx * s);
          ctx.stroke();
        }
      }

      /* trail */
      for (var i = 0; i < trail.length; i++) {
        var tc = trail[i] % COLS, tr = (trail[i] / COLS) | 0;
        ctx.fillStyle = "rgba(79, 214, 195, " + (0.02 + (i / trail.length) * 0.10).toFixed(3) + ")";
        ctx.fillRect(tc * cell + 1.5, tr * cell + 1.5, cell - 3, cell - 3);
      }

      /* start + goal */
      ctx.font = "500 " + Math.round(cell * 0.30) + "px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(238, 243, 250, 0.6)";
      ctx.fillText("S", START.c * cell + cell / 2, START.r * cell + cell / 2);

      var gx = GOAL.c * cell + cell / 2, gy = GOAL.r * cell + cell / 2;
      ctx.strokeStyle = "#e8a33d";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(gx, gy, cell * 0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#e8a33d";
      ctx.beginPath();
      ctx.arc(gx, gy, cell * 0.10, 0, Math.PI * 2);
      ctx.fill();

      /* agent */
      var ax = agent.c * cell + cell / 2, ay = agent.r * cell + cell / 2;
      var grad = ctx.createRadialGradient(ax, ay, 0, ax, ay, cell * 0.55);
      grad.addColorStop(0, "rgba(79, 214, 195, 0.5)");
      grad.addColorStop(1, "rgba(79, 214, 195, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(ax - cell * 0.55, ay - cell * 0.55, cell * 1.1, cell * 1.1);
      ctx.fillStyle = "#4fd6c3";
      ctx.beginPath();
      ctx.arc(ax, ay, cell * 0.17, 0, Math.PI * 2);
      ctx.fill();
    }

    function updatePanel() {
      elEpisodes.textContent = episodes;
      elReturn.textContent = lastReturn === null ? "—" : lastReturn;
      elBest.textContent = bestReturn === null ? "—" : bestReturn;
      elEps.textContent = eps.toFixed(2);
    }

    /* ---------- interaction ---------- */

    canvas.addEventListener("pointerdown", function (e) {
      var rect = canvas.getBoundingClientRect();
      var c = Math.floor((e.clientX - rect.left) / cell);
      var r = Math.floor((e.clientY - rect.top) / cell);
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
      if ((c === START.c && r === START.r) || (c === GOAL.c && r === GOAL.r)) return;
      if (grid[idx(c, r)] === PIT) return;
      if (agent.c === c && agent.r === r) return;
      grid[idx(c, r)] = grid[idx(c, r)] === WALL ? EMPTY : WALL;
    });

    document.getElementById("rl-reset").addEventListener("click", function () {
      grid = defaultGrid();
      resetAgentState();
    });

    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(canvas);

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); draw(); }, 150);
    });

    /* ---------- main loop ---------- */

    var frame = 0;
    function loop() {
      if (visible && !document.hidden) {
        var stepsPerFrame = REDUCED ? 1 : parseInt(elSpeed.value, 10);
        for (var i = 0; i < stepsPerFrame; i++) stepAgent();
        draw();
        if (++frame % 10 === 0) updatePanel();
      }
      requestAnimationFrame(loop);
    }

    grid = defaultGrid();
    resetAgentState();
    resize();
    draw();
    loop();
  })();

})();
