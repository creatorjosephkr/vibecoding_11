/**
 * Application Entrypoint
 * Orchestrates Engine, Audio, Storage, WakeLock, and UI subsystems.
 */

import { soundEngine } from './audio.js';
import { wakeLockController } from './wakelock.js';
import { RoutineStorage, PRESET_ROUTINES } from './storage.js';
import { RoutineEngine } from './engine.js';
import { UIRenderer } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Storage & Draft
  const { title: initialTitle, stages: initialStages } = RoutineStorage.loadDraft();
  let currentRoutineTitle = initialTitle;
  let activeStages = initialStages;
  let currentPrepTime = RoutineStorage.getPrepTime();

  // 2. Instantiate Systems
  const ui = new UIRenderer();
  const engine = new RoutineEngine(activeStages, currentPrepTime);

  // 3. Theme, Audio & WakeLock state init
  let currentTheme = RoutineStorage.getTheme();
  ui.updateThemeUI(currentTheme);

  const toggleTheme = () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    RoutineStorage.saveTheme(currentTheme);
    ui.updateThemeUI(currentTheme);
  };

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  ui.updateSoundButton(soundEngine.isMuted);
  wakeLockController.onStatusChange = (active, isSupported) => {
    ui.updateWakeLockStatus(active, isSupported);
  };
  ui.updateWakeLockStatus(wakeLockController.isActive, wakeLockController.isSupported);

  // 3.1 Prep Time Selector Init
  const prepTimeSelect = document.getElementById('prepTimeSelect');
  if (prepTimeSelect) {
    prepTimeSelect.value = String(currentPrepTime);
    prepTimeSelect.addEventListener('change', () => {
      currentPrepTime = parseInt(prepTimeSelect.value, 10) || 0;
      RoutineStorage.savePrepTime(currentPrepTime);
      engine.setPrepTime(currentPrepTime);
      ui.updateTotalSummary(activeStages);
    });
  }

  // 4. Hook up Engine Callbacks
  engine.onTick = (data) => {
    ui.updateTickDisplay(data);

    // Update overall routine progress bar
    const totalRoutineSec = engine.getTotalRoutineSeconds();
    if (totalRoutineSec > 0) {
      const overallPercent = Math.min(100, (engine.totalElapsed / totalRoutineSec) * 100);
      ui.overallProgressBar.style.width = `${overallPercent}%`;
    }
  };

  engine.onStateChange = (status) => {
    ui.updateTickDisplay({
      status,
      phase: engine.phase,
      stage: engine.getCurrentStage(),
      stageIndex: engine.currentStageIndex,
      totalStages: engine.stages.length,
      round: engine.currentRound,
      totalRounds: engine.getCurrentStage() ? Number(engine.getCurrentStage().rounds || 1) : 1,
      timeRemaining: engine.timeRemaining,
      targetDuration: engine.targetDuration,
      progress: engine.getProgressFraction(),
      nextPreview: engine.getNextPreview(),
      totalElapsed: engine.totalElapsed
    });

    // Auto floor-view focus on mobile when starting
    if (status === 'running' && window.innerWidth < 768) {
      document.body.classList.add('focus-mode');
    }
  };

  engine.onPhaseChange = (phase) => {
    ui.updatePhaseTheme(phase, engine.status);
  };

  engine.onComplete = (stats) => {
    ui.showCelebration(stats);
  };

  // 5. Initial Render
  ui.renderStagesList(activeStages, engine.currentStageIndex);
  engine.reset();

  // 6. Stage Builder UI Interaction Callbacks
  const persistAndSync = () => {
    RoutineStorage.saveDraft(currentRoutineTitle, activeStages);
    engine.setStages(activeStages);
    ui.renderStagesList(activeStages, engine.currentStageIndex);
  };

  ui.onStageChange = (updatedStages) => {
    activeStages = updatedStages;
    RoutineStorage.saveDraft(currentRoutineTitle, activeStages);
    engine.setStages(activeStages);
  };

  ui.onStageDelete = (index) => {
    if (activeStages.length <= 1) {
      alert('최소 1개 이상의 운동 단계가 유지되어야 합니다.');
      return;
    }
    activeStages.splice(index, 1);
    persistAndSync();
  };

  ui.onStageReorder = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= activeStages.length) return;
    const item = activeStages.splice(fromIndex, 1)[0];
    activeStages.splice(toIndex, 0, item);
    persistAndSync();
  };

  ui.onStageDuplicate = (index) => {
    const original = activeStages[index];
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = 'stage-' + Date.now();
    copy.name = `${copy.name} (복제)`;
    activeStages.splice(index + 1, 0, copy);
    persistAndSync();
  };

  // 7. Add Stage Buttons (with user-defined restTime)
  document.getElementById('btnAddCountdown').addEventListener('click', () => {
    activeStages.push({
      id: 'cd-' + Date.now(),
      name: `운동 ${activeStages.length + 1}`,
      type: 'countdown',
      duration: 30,
      restTime: 15,
      rounds: 2
    });
    persistAndSync();
  });

  document.getElementById('btnAddTabata').addEventListener('click', () => {
    activeStages.push({
      id: 'tb-' + Date.now(),
      name: `타바타 인터벌 ${activeStages.length + 1}`,
      type: 'tabata',
      duration: 20,
      workTime: 20,
      restTime: 10,
      rounds: 4
    });
    persistAndSync();
  });

  document.getElementById('btnAddCountup').addEventListener('click', () => {
    activeStages.push({
      id: 'cu-' + Date.now(),
      name: `버티기 챌린지 ${activeStages.length + 1}`,
      type: 'countup',
      duration: 60,
      restTime: 15,
      rounds: 1
    });
    persistAndSync();
  });

  // 8. Preset Recommendation Chips
  document.getElementById('presetPillsRow').addEventListener('click', (e) => {
    const chip = e.target.closest('.preset-chip');
    if (!chip) return;

    const presetId = chip.dataset.presetId;
    const preset = PRESET_ROUTINES.find(p => p.id === presetId);
    if (!preset) return;

    if (engine.status === 'running') {
      const confirmLoad = confirm('현재 운동이 진행 중입니다. 프리셋을 불러오시겠습니까?');
      if (!confirmLoad) return;
    }

    currentRoutineTitle = preset.title;
    activeStages = JSON.parse(JSON.stringify(preset.stages));
    persistAndSync();
  });

  // 9. Hero Controls (Start/Pause, Reset, Next/Prev)
  document.getElementById('btnPlayPause').addEventListener('click', () => {
    engine.togglePlayPause();
  });

  document.getElementById('btnReset').addEventListener('click', () => {
    engine.reset();
  });

  document.getElementById('btnSkipStage').addEventListener('click', () => {
    engine.skipToNextStage();
  });

  document.getElementById('btnPrevStage').addEventListener('click', () => {
    engine.skipToPrevStage();
  });

  // 10. Sound Toggle Button
  document.getElementById('soundToggleBtn').addEventListener('click', () => {
    soundEngine.initContext();
    const isMuted = soundEngine.toggleMute();
    ui.updateSoundButton(isMuted);
    if (!isMuted) {
      soundEngine.playWarningBeep();
    }
  });

  // 11. Focus Mode Button
  document.getElementById('focusModeBtn').addEventListener('click', () => {
    document.body.classList.toggle('focus-mode');
    const isFocus = document.body.classList.contains('focus-mode');
    document.getElementById('focusModeBtn').classList.toggle('active-glow', isFocus);
  });

  // 12. Routine Modal & Storage Actions
  const inputRoutineTitle = document.getElementById('inputRoutineTitle');
  const openLibrary = () => {
    inputRoutineTitle.value = currentRoutineTitle;
    const saved = RoutineStorage.getSavedRoutines();
    ui.renderSavedRoutines(
      saved,
      (routineToLoad) => {
        // Load callback
        currentRoutineTitle = routineToLoad.title;
        activeStages = JSON.parse(JSON.stringify(routineToLoad.stages));
        persistAndSync();
        ui.closeRoutineModal();
      },
      (routineIdToDelete) => {
        // Delete callback
        const remaining = RoutineStorage.deleteRoutine(routineIdToDelete);
        ui.renderSavedRoutines(remaining, openLibrary, () => {});
      }
    );
    ui.openRoutineModal();
  };

  document.getElementById('routineLibraryBtn').addEventListener('click', openLibrary);
  document.getElementById('quickSaveBtn').addEventListener('click', openLibrary);
  document.getElementById('btnCloseModal').addEventListener('click', () => ui.closeRoutineModal());
  document.getElementById('routineModal').addEventListener('click', (e) => {
    if (e.target.id === 'routineModal') ui.closeRoutineModal();
  });

  document.getElementById('btnConfirmSaveRoutine').addEventListener('click', () => {
    const title = inputRoutineTitle.value.trim();
    if (!title) {
      alert('루틴 이름을 입력해 주세요.');
      inputRoutineTitle.focus();
      return;
    }
    try {
      RoutineStorage.saveRoutine(title, activeStages);
      currentRoutineTitle = title;
      alert(`"${title}" 루틴이 안전하게 저장되었습니다!`);
      openLibrary();
    } catch (err) {
      alert(err.message);
    }
  });

  // 13. Celebration Actions
  document.getElementById('btnRestartRoutine').addEventListener('click', () => {
    ui.hideCelebration();
    engine.reset();
    engine.start();
  });

  document.getElementById('btnCloseCelebration').addEventListener('click', () => {
    ui.hideCelebration();
    engine.reset();
  });

  // 14. Keyboard Shortcuts for Pro Experience
  window.addEventListener('keydown', (e) => {
    // Ignore keyboard shortcuts if user is typing in an input
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      engine.togglePlayPause();
    } else if (e.key === 'r' || e.key === 'R') {
      engine.reset();
    } else if (e.key === 'm' || e.key === 'M') {
      const isMuted = soundEngine.toggleMute();
      ui.updateSoundButton(isMuted);
    } else if (e.key === 'f' || e.key === 'F') {
      document.body.classList.toggle('focus-mode');
    } else if (e.key === 't' || e.key === 'T') {
      toggleTheme();
    } else if (e.key === 'Escape') {
      ui.closeRoutineModal();
      ui.hideCelebration();
    }
  });

  // Warm up audio context on first touch/click
  const initAudioOnce = () => {
    soundEngine.initContext();
    window.removeEventListener('click', initAudioOnce);
    window.removeEventListener('touchstart', initAudioOnce);
  };
  window.addEventListener('click', initAudioOnce);
  window.addEventListener('touchstart', initAudioOnce);
});
