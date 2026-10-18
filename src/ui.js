/**
 * UI Renderer and DOM Bindings
 * Handles real-time hero display updates, dynamic stage list rendering, and modals.
 */
import { getExerciseGuide, resolveImagePath } from './exerciseDb.js';

export class UIRenderer {
  constructor() {
    this.CIRCUMFERENCE = 2 * Math.PI * 102; // ~640.884px

    // DOM Elements Cache
    this.body = document.body;
    this.phasePill = document.getElementById('phasePill');
    this.stagePill = document.getElementById('stagePill');
    this.roundPill = document.getElementById('roundPill');
    this.currentStageTitle = document.getElementById('currentStageTitle');
    this.timerDigits = document.getElementById('timerDigits');
    this.timerSublabel = document.getElementById('timerSublabel');
    this.dialProgressRing = document.getElementById('dialProgressRing');
    this.overallProgressBar = document.getElementById('overallProgressBar');

    this.nextStageName = document.getElementById('nextStageName');
    this.nextStageSub = document.getElementById('nextStageSub');

    this.btnPlayPause = document.getElementById('btnPlayPause');
    this.playPauseIcon = document.getElementById('playPauseIcon');
    this.playPauseText = document.getElementById('playPauseText');

    this.stagesContainer = document.getElementById('stagesContainer');
    this.totalRoutineMeta = document.getElementById('totalRoutineMeta');

    // Right Column: Exercise Guide Elements Cache
    this.guideCategory = document.getElementById('guideCategory');
    this.guidePhaseTag = document.getElementById('guidePhaseTag');
    this.guideTitle = document.getElementById('guideTitle');
    this.guideIllustrationWrap = document.getElementById('guideIllustrationWrap');
    this.guideIllustrationImg = document.getElementById('guideIllustrationImg');
    this.guideMuscleTags = document.getElementById('guideMuscleTags');
    this.guidePhaseNotice = document.getElementById('guidePhaseNotice');
    this.guidePhaseNoticeIcon = document.getElementById('guidePhaseNoticeIcon');
    this.guidePhaseNoticeText = document.getElementById('guidePhaseNoticeText');
    this.guideStepsList = document.getElementById('guideStepsList');
    this.guideTipBox = document.getElementById('guideTipBox');
    this.guideProTip = document.getElementById('guideProTip');

    // Modals
    this.routineModal = document.getElementById('routineModal');
    this.savedRoutinesList = document.getElementById('savedRoutinesList');
    this.celebrateModal = document.getElementById('celebrateModal');
    this.statTotalTime = document.getElementById('statTotalTime');
    this.statTotalStages = document.getElementById('statTotalStages');

    // Badges & Buttons
    this.wakeLockBadge = document.getElementById('wakeLockBadge');
    this.wakeLockText = document.getElementById('wakeLockText');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.soundIcon = document.getElementById('soundIcon');
    this.soundText = document.getElementById('soundText');
    this.focusModeBtn = document.getElementById('focusModeBtn');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.themeIcon = document.getElementById('themeIcon');
    this.themeText = document.getElementById('themeText');
    this.metaThemeColor = document.querySelector('meta[name="theme-color"]');

    // Handlers
    this.onStageChange = null;
    this.onStageDelete = null;
    this.onStageReorder = null;
    this.onStageDuplicate = null;
  }

  formatTime(totalSeconds) {
    const sec = Math.max(0, Math.ceil(totalSeconds));
    const mins = Math.floor(sec / 60);
    const remainderSecs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainderSecs).padStart(2, '0')}`;
  }

  formatHumanDuration(totalSeconds) {
    const sec = Math.round(totalSeconds);
    const mins = Math.floor(sec / 60);
    const remainderSecs = sec % 60;
    if (mins === 0) return `${remainderSecs}초`;
    if (remainderSecs === 0) return `${mins}분`;
    return `${mins}분 ${remainderSecs}초`;
  }

  updateWakeLockStatus(active, isSupported) {
    if (!isSupported) {
      this.wakeLockBadge.style.display = 'none';
      return;
    }
    if (active) {
      this.wakeLockBadge.classList.add('badge-active');
      this.wakeLockText.textContent = '화면유지 ON';
    } else {
      this.wakeLockBadge.classList.remove('badge-active');
      this.wakeLockText.textContent = '화면유지 대기';
    }
  }

  updateSoundButton(isMuted) {
    if (isMuted) {
      this.soundIcon.textContent = '🔇';
      this.soundText.textContent = '음소거';
      this.soundToggleBtn.classList.remove('active-glow');
    } else {
      this.soundIcon.textContent = '🔊';
      this.soundText.textContent = '사운드 ON';
      this.soundToggleBtn.classList.add('active-glow');
    }
  }

  updateThemeUI(theme) {
    const isLight = theme === 'light';
    this.body.setAttribute('data-theme', theme);
    if (this.themeIcon) {
      this.themeIcon.textContent = isLight ? '🌙' : '☀️';
    }
    if (this.themeText) {
      this.themeText.textContent = isLight ? '다크' : '라이트';
    }
    if (this.themeToggleBtn) {
      this.themeToggleBtn.setAttribute('title', isLight ? '다크 모드로 전환 (단축키: T)' : '라이트 모드로 전환 (단축키: T)');
      this.themeToggleBtn.setAttribute('aria-label', isLight ? '다크 모드로 전환' : '라이트 모드로 전환');
      this.themeToggleBtn.classList.toggle('active-glow', isLight);
    }
    if (this.metaThemeColor) {
      this.metaThemeColor.setAttribute('content', isLight ? '#F1F4F9' : '#080a0f');
    }
  }

  updatePhaseTheme(phase, status) {
    if (status === 'completed') {
      this.body.setAttribute('data-phase', 'completed');
      this.phasePill.textContent = '🏁 COMPLETED';
      return;
    }
    if (status === 'awaiting_next') {
      this.body.setAttribute('data-phase', 'awaiting_next');
      this.phasePill.textContent = '✅ 다음 단계 대기';
      return;
    }
    if (phase === 'prep') {
      this.body.setAttribute('data-phase', 'prep');
      this.phasePill.textContent = '🟡 PREP (준비)';
      return;
    }
    if (status === 'paused') {
      this.body.setAttribute('data-phase', 'paused');
      this.phasePill.textContent = '⏸ PAUSED';
      return;
    }
    if (status === 'idle') {
      this.body.setAttribute('data-phase', 'idle');
      this.phasePill.textContent = '⚪ READY';
      return;
    }

    if (phase === 'work') {
      this.body.setAttribute('data-phase', 'work');
      this.phasePill.textContent = '🟢 WORK';
    } else if (phase === 'rest') {
      this.body.setAttribute('data-phase', 'rest');
      this.phasePill.textContent = '🔴 REST';
    } else {
      this.body.setAttribute('data-phase', 'idle');
      this.phasePill.textContent = '⚪ READY';
    }
  }

  updateTickDisplay(data) {
    const { status, phase, stage, stageIndex, totalStages, round, totalRounds, timeRemaining, targetDuration, progress, nextPreview, totalElapsed } = data;

    this.updatePhaseTheme(phase, status);

    // Play/Pause button label & color
    if (status === 'awaiting_next') {
      this.playPauseIcon.textContent = '➔';
      this.playPauseText.textContent = '다음 단계 시작';
      this.btnPlayPause.style.background = 'var(--amber-gold)';
    } else if (status === 'running') {
      this.playPauseIcon.textContent = '⏸';
      this.playPauseText.textContent = '일시정지';
      this.btnPlayPause.style.background = 'var(--current-accent)';
    } else if (status === 'paused') {
      this.playPauseIcon.textContent = '▶';
      this.playPauseText.textContent = '계속하기';
      this.btnPlayPause.style.background = 'var(--current-accent)';
    } else {
      this.playPauseIcon.textContent = '▶';
      this.playPauseText.textContent = '루틴 시작';
      this.btnPlayPause.style.background = 'var(--current-accent)';
    }

    // Hero Stage Title & Pills
    if (status === 'awaiting_next') {
      this.currentStageTitle.textContent = `${stageIndex + 1}단계 완료! 다음 준비: ${nextPreview ? nextPreview.title : '다음 단계'}`;
      this.stagePill.textContent = `STAGE ${stageIndex + 1} / ${Math.max(1, totalStages)} 완료`;
      this.roundPill.textContent = `휴식 & 준비 완료 시 시작`;
    } else if (phase === 'prep') {
      this.currentStageTitle.textContent = `준비! 다음: ${stage ? stage.name : ''}`;
      this.stagePill.textContent = `STAGE ${stageIndex + 1} / ${Math.max(1, totalStages)}`;
      this.roundPill.textContent = `ROUND ${round} / ${totalRounds}`;
    } else if (stage) {
      const stagePrefix = `${stageIndex + 1}. `;
      const subInfo = phase === 'rest' ? ' [휴식 중]' : '';
      this.currentStageTitle.textContent = `${stagePrefix}${stage.name}${subInfo}`;
      this.stagePill.textContent = `STAGE ${stageIndex + 1} / ${Math.max(1, totalStages)}`;
      this.roundPill.textContent = `ROUND ${round} / ${totalRounds}`;
    } else {
      this.currentStageTitle.textContent = '운동 단계를 추가해 주세요';
      this.stagePill.textContent = 'STAGE 0 / 0';
      this.roundPill.textContent = 'ROUND 0 / 0';
    }

    // Timer Digits & Sublabel
    this.timerDigits.textContent = this.formatTime(timeRemaining);
    if (status === 'awaiting_next') {
      this.timerSublabel.textContent = '버튼을 눌러 다음 운동 시작';
    } else if (phase === 'prep') {
      this.timerSublabel.textContent = '자세를 잡고 대기하세요';
    } else if (phase === 'rest') {
      this.timerSublabel.textContent = '휴식 시간';
    } else if (stage && stage.type === 'countup') {
      this.timerSublabel.textContent = `경과 시간 (목표: ${stage.duration}s)`;
    } else {
      this.timerSublabel.textContent = '남은 시간';
    }

    // Circular Gauge
    const strokeOffset = this.CIRCUMFERENCE * (1 - progress);
    this.dialProgressRing.style.strokeDashoffset = String(strokeOffset);

    // Next Stage Preview
    if (nextPreview) {
      this.nextStageName.textContent = nextPreview.title;
      this.nextStageSub.textContent = nextPreview.sub;
    }

    // Update Right Column: Exercise Guide & Form instructions
    this.updateExerciseGuide(stage, phase, status, nextPreview);

    // Highlight current active stage card in the list
    const stageCards = this.stagesContainer.querySelectorAll('.stage-item');
    stageCards.forEach((card, idx) => {
      if (status !== 'idle' && idx === stageIndex) {
        card.classList.add('stage-active-now');
      } else {
        card.classList.remove('stage-active-now');
      }
    });
  }

  updateExerciseGuide(stage, phase, status, nextPreview) {
    if (!this.guideTitle) return;

    const stageName = stage ? stage.name : '운동 가이드';
    const customDesc = stage ? stage.customDescription : '';
    const guide = getExerciseGuide(stageName, customDesc);

    this.guideTitle.textContent = guide.title;
    this.guideCategory.textContent = guide.category;

    // Motion illustration image & background matching
    const imgBgColor = guide.bgColor || '#06080d';
    if (this.guideIllustrationWrap) {
      this.guideIllustrationWrap.style.backgroundColor = imgBgColor;
    }
    const fallbackSrc = resolveImagePath('jumping_jack.jpg');
    if (this.guideIllustrationImg) {
      this.guideIllustrationImg.src = guide.image || fallbackSrc;
      this.guideIllustrationImg.alt = `${guide.title} 동작 자세 가이드 일러스트`;
      this.guideIllustrationImg.style.backgroundColor = imgBgColor;
      this.guideIllustrationImg.onerror = () => {
        if (this.guideIllustrationImg.src !== fallbackSrc) {
          this.guideIllustrationImg.src = fallbackSrc;
        }
      };
    }

    // Target muscle badges
    if (this.guideMuscleTags) {
      this.guideMuscleTags.innerHTML = (guide.targetMuscles || [])
        .map(m => `<span class="muscle-tag">${m}</span>`)
        .join('');
    }

    // Step-by-step instructions
    if (this.guideStepsList) {
      this.guideStepsList.innerHTML = (guide.steps || [])
        .map(s => `<li>${s}</li>`)
        .join('');
    }

    // Pro Tip
    if (this.guideProTip) {
      this.guideProTip.textContent = guide.proTip || '일정한 호흡과 정확한 자세를 유지하세요.';
    }

    // Dynamic phase notice banner
    if (this.guidePhaseNotice) {
      if (status === 'awaiting_next') {
        this.guidePhaseNotice.style.display = 'flex';
        this.guidePhaseNoticeIcon.textContent = '✅';
        this.guidePhaseNoticeText.textContent = `현재 단계 완료! 충분히 호흡을 고른 후 '다음 단계 시작'을 누르세요. (다음 운동: ${nextPreview ? nextPreview.title : '완료'})`;
        if (this.guidePhaseTag) this.guidePhaseTag.textContent = 'STAGE FINISHED';
      } else if (phase === 'prep') {
        this.guidePhaseNotice.style.display = 'flex';
        this.guidePhaseNoticeIcon.textContent = '⏱';
        this.guidePhaseNoticeText.textContent = `준비 중: 올바른 시작 자세와 스텝을 미리 확인하고 자리를 잡으세요!`;
        if (this.guidePhaseTag) this.guidePhaseTag.textContent = 'PREP PHASE';
      } else if (phase === 'rest') {
        this.guidePhaseNotice.style.display = 'flex';
        this.guidePhaseNoticeIcon.textContent = '💤';
        this.guidePhaseNoticeText.textContent = `휴식 중: 깊은 복식호흡으로 근육을 이완하며 다음 세트를 준비하세요.`;
        if (this.guidePhaseTag) this.guidePhaseTag.textContent = 'REST INTERVAL';
      } else if (phase === 'work') {
        this.guidePhaseNotice.style.display = 'none';
        if (this.guidePhaseTag) this.guidePhaseTag.textContent = 'ACTIVE WORK';
      } else {
        this.guidePhaseNotice.style.display = 'none';
        if (this.guidePhaseTag) this.guidePhaseTag.textContent = 'READY';
      }
    }
  }

  updateTotalSummary(stages) {
    const count = stages.length;
    let totalSec = 0;
    stages.forEach(st => {
      const r = Number(st.rounds || 1);
      const rest = Number(st.restTime !== undefined ? st.restTime : (st.type === 'tabata' ? 10 : 0));
      if (st.type === 'tabata') {
        totalSec += (Number(st.workTime || 20) + rest) * r;
      } else {
        totalSec += Number(st.duration || 30) * r + (r > 1 ? rest * (r - 1) : 0);
      }
    });

    this.totalRoutineMeta.textContent = `총 ${count}개 단계 · 약 ${this.formatHumanDuration(totalSec)} 소요 예정`;
  }

  renderStagesList(stages, activeStageIndex = -1) {
    this.stagesContainer.innerHTML = '';
    this.updateTotalSummary(stages);

    if (stages.length === 0) {
      this.stagesContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #64748B;">
          등록된 운동 단계가 없습니다.<br>상단의 <strong>+ 시간 제한</strong>, <strong>+ 타바타</strong>, <strong>+ 랩 타임</strong> 버튼을 눌러 추가하세요.
        </div>
      `;
      return;
    }

    stages.forEach((st, idx) => {
      const item = document.createElement('div');
      item.className = 'stage-item' + (idx === activeStageIndex ? ' stage-active-now' : '');
      item.dataset.id = st.id;

      // Type Badge
      const typeBadgeClass = st.type === 'tabata' ? 'type-tabata' : (st.type === 'countup' ? 'type-countup' : 'type-countdown');
      const typeLabel = st.type === 'tabata' ? '타바타' : (st.type === 'countup' ? '랩타임' : '카운트다운');

      // Parameters UI based on type: ALL stage types support explicit 휴식시간 (Rest Time)!
      let paramsHtml = '';
      if (st.type === 'tabata') {
        paramsHtml = `
          <div class="stage-param-box" title="운동 시간(초)">
            <span>운동:</span>
            <input type="number" class="stage-param-input input-work" value="${st.workTime || 20}" min="1" max="999">
            <span>s</span>
          </div>
          <div class="stage-param-box" title="세트 간 휴식 시간(초)">
            <span>휴식:</span>
            <input type="number" class="stage-param-input input-rest" value="${st.restTime !== undefined ? st.restTime : 10}" min="0" max="999">
            <span>s</span>
          </div>
          <div class="stage-param-box" title="세트(라운드) 수">
            <span>세트:</span>
            <input type="number" class="stage-param-input input-rounds" value="${st.rounds || 4}" min="1" max="99">
            <span>R</span>
          </div>
        `;
      } else if (st.type === 'countup') {
        paramsHtml = `
          <div class="stage-param-box" title="목표 시간(초)">
            <span>목표:</span>
            <input type="number" class="stage-param-input input-duration" value="${st.duration || 60}" min="1" max="9999">
            <span>s</span>
          </div>
          <div class="stage-param-box" title="라운드 간 휴식 시간(초)">
            <span>휴식:</span>
            <input type="number" class="stage-param-input input-rest" value="${st.restTime !== undefined ? st.restTime : 15}" min="0" max="999">
            <span>s</span>
          </div>
          <div class="stage-param-box" title="반복 라운드 수">
            <span>라운드:</span>
            <input type="number" class="stage-param-input input-rounds" value="${st.rounds || 1}" min="1" max="99">
            <span>R</span>
          </div>
        `;
      } else {
        // Countdown
        paramsHtml = `
          <div class="stage-param-box" title="운동 시간(초)">
            <span>시간:</span>
            <input type="number" class="stage-param-input input-duration" value="${st.duration || 30}" min="1" max="9999">
            <span>s</span>
          </div>
          <div class="stage-param-box" title="라운드 간 휴식 시간(초)">
            <span>휴식:</span>
            <input type="number" class="stage-param-input input-rest" value="${st.restTime !== undefined ? st.restTime : 15}" min="0" max="999">
            <span>s</span>
          </div>
          <div class="stage-param-box" title="반복 라운드 수">
            <span>라운드:</span>
            <input type="number" class="stage-param-input input-rounds" value="${st.rounds || 1}" min="1" max="99">
            <span>R</span>
          </div>
        `;
      }

      const guide = getExerciseGuide(st.name, st.customDescription);
      const thumbBg = guide.bgColor || '#06080d';

      const fallbackThumb = resolveImagePath('jumping_jack.jpg');
      item.innerHTML = `
        <span class="stage-badge-type ${typeBadgeClass}">${typeLabel}</span>
        <div class="stage-thumb-box" title="${guide.title} 동작 일러스트" style="background-color: ${thumbBg};">
          <img class="stage-thumb-img" src="${guide.image || fallbackThumb}" alt="${st.name}" loading="lazy" style="background-color: ${thumbBg};">
        </div>
        
        <div class="stage-inputs-group">
          <input type="text" class="stage-input-name" value="${st.name}" placeholder="운동 이름 입력" maxlength="50">
          ${paramsHtml}
        </div>

        <div class="stage-actions">
          <button type="button" class="btn-stage-action btn-move-up" title="위로 이동" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''}>▲</button>
          <button type="button" class="btn-stage-action btn-move-down" title="아래로 이동" ${idx === stages.length - 1 ? 'disabled style="opacity:0.3"' : ''}>▼</button>
          <button type="button" class="btn-stage-action btn-duplicate" title="복제">⎘</button>
          <button type="button" class="btn-stage-action btn-stage-delete" title="삭제">🗑️</button>
        </div>
      `;

      // Wire Event Listeners for inputs
      const nameInput = item.querySelector('.stage-input-name');
      nameInput.addEventListener('change', () => {
        st.name = nameInput.value.trim() || `운동 ${idx + 1}`;
        const updatedGuide = getExerciseGuide(st.name, st.customDescription);
        const thumbImg = item.querySelector('.stage-thumb-img');
        const thumbBox = item.querySelector('.stage-thumb-box');
        const newBg = updatedGuide.bgColor || '#06080d';
        if (thumbImg) {
          thumbImg.src = updatedGuide.image || resolveImagePath('jumping_jack.jpg');
          thumbImg.style.backgroundColor = newBg;
        }
        if (thumbBox) {
          thumbBox.style.backgroundColor = newBg;
        }
        if (this.onStageChange) this.onStageChange(stages);
      });

      const roundsInput = item.querySelector('.input-rounds');
      if (roundsInput) {
        roundsInput.addEventListener('change', () => {
          st.rounds = Math.max(1, parseInt(roundsInput.value) || 1);
          roundsInput.value = st.rounds;
          if (this.onStageChange) this.onStageChange(stages);
          this.updateTotalSummary(stages);
        });
      }

      const durInput = item.querySelector('.input-duration');
      if (durInput) {
        durInput.addEventListener('change', () => {
          st.duration = Math.max(1, parseInt(durInput.value) || 30);
          durInput.value = st.duration;
          if (this.onStageChange) this.onStageChange(stages);
          this.updateTotalSummary(stages);
        });
      }

      const workInput = item.querySelector('.input-work');
      if (workInput) {
        workInput.addEventListener('change', () => {
          st.workTime = Math.max(1, parseInt(workInput.value) || 20);
          workInput.value = st.workTime;
          if (this.onStageChange) this.onStageChange(stages);
          this.updateTotalSummary(stages);
        });
      }

      const restInput = item.querySelector('.input-rest');
      if (restInput) {
        restInput.addEventListener('change', () => {
          st.restTime = Math.max(1, parseInt(restInput.value) || 10);
          restInput.value = st.restTime;
          if (this.onStageChange) this.onStageChange(stages);
          this.updateTotalSummary(stages);
        });
      }

      // Actions
      const btnUp = item.querySelector('.btn-move-up');
      btnUp.addEventListener('click', () => {
        if (this.onStageReorder) this.onStageReorder(idx, idx - 1);
      });

      const btnDown = item.querySelector('.btn-move-down');
      btnDown.addEventListener('click', () => {
        if (this.onStageReorder) this.onStageReorder(idx, idx + 1);
      });

      const btnDup = item.querySelector('.btn-duplicate');
      btnDup.addEventListener('click', () => {
        if (this.onStageDuplicate) this.onStageDuplicate(idx);
      });

      const btnDel = item.querySelector('.btn-stage-delete');
      btnDel.addEventListener('click', () => {
        if (this.onStageDelete) this.onStageDelete(idx);
      });

      this.stagesContainer.appendChild(item);
    });
  }

  renderSavedRoutines(routines, onLoad, onDelete) {
    this.savedRoutinesList.innerHTML = '';
    if (!routines || routines.length === 0) {
      this.savedRoutinesList.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: #64748B; font-size: 0.85rem;">
          아직 저장된 루틴이 없습니다. 위에서 루틴명을 입력하여 저장해 보세요.
        </div>
      `;
      return;
    }

    routines.forEach(r => {
      const el = document.createElement('div');
      el.className = 'saved-routine-item';

      const stageCount = r.stages ? r.stages.length : 0;
      const formattedDate = r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '';

      el.innerHTML = `
        <div class="routine-info-meta">
          <div class="routine-item-title">${r.title}</div>
          <div class="routine-item-stats">${stageCount}개 단계 · ${formattedDate}</div>
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button type="button" class="btn-ctrl btn-ctrl-primary btn-load-routine" style="height: auto; padding: 0.45rem 0.85rem; font-size: 0.8rem;">
            불러오기
          </button>
          <button type="button" class="btn-stage-action btn-del-routine" title="루틴 삭제" style="font-size: 1.1rem;">
            🗑️
          </button>
        </div>
      `;

      el.querySelector('.btn-load-routine').addEventListener('click', () => onLoad(r));
      el.querySelector('.btn-del-routine').addEventListener('click', () => onDelete(r.id));

      this.savedRoutinesList.appendChild(el);
    });
  }

  showCelebration(stats) {
    this.statTotalTime.textContent = this.formatTime(stats.totalElapsed);
    this.statTotalStages.textContent = `${stats.totalStages} 단계`;
    this.celebrateModal.classList.add('active');
  }

  hideCelebration() {
    this.celebrateModal.classList.remove('active');
  }

  openRoutineModal() {
    this.routineModal.classList.add('active');
  }

  closeRoutineModal() {
    this.routineModal.classList.remove('active');
  }
}
