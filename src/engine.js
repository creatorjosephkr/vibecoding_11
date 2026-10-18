/**
 * Routine Execution Engine
 * High-precision sequence runner supporting:
 * - Prep Time (대기시간) before exercises
 * - User-defined Rest Time (휴식시간) across all stage types
 * - Manual Stage Progression ('다음 단계' 버튼 대기)
 * - Count Down, Tabata (Work/Rest), and Count Up (Lap time)
 */
import { soundEngine } from './audio.js';
import { wakeLockController } from './wakelock.js';

export class RoutineEngine {
  constructor(stages = [], prepTime = 5) {
    this.stages = stages;
    this.prepTime = prepTime;
    this.status = 'idle'; // 'idle' | 'running' | 'paused' | 'awaiting_next' | 'completed'
    this.currentStageIndex = 0;
    this.currentRound = 1;
    this.phase = 'idle'; // 'idle' | 'prep' | 'work' | 'rest' | 'awaiting_next' | 'completed'
    
    this.timeRemaining = 0;
    this.targetDuration = 0;
    this.totalElapsed = 0;
    
    this.timerId = null;
    this.lastTimestamp = null;
    this.lastBeepedSecond = null;

    // Callbacks
    this.onTick = null;
    this.onStateChange = null;
    this.onPhaseChange = null;
    this.onComplete = null;
  }

  setPrepTime(seconds) {
    this.prepTime = Math.max(0, parseInt(seconds, 10) || 0);
  }

  setStages(stages) {
    if (this.status === 'running') {
      this.pause();
    }
    this.stages = stages || [];
    this.reset();
  }

  getCurrentStage() {
    return this.stages[this.currentStageIndex] || null;
  }

  reset() {
    this.stopLoop();
    this.status = 'idle';
    this.currentStageIndex = 0;
    this.currentRound = 1;
    this.phase = 'idle';
    this.totalElapsed = 0;
    this.lastBeepedSecond = null;

    const firstStage = this.getCurrentStage();
    if (firstStage) {
      this.initStageParameters(firstStage, 1, 'work');
    } else {
      this.timeRemaining = 0;
      this.targetDuration = 0;
    }

    wakeLockController.release();
    this.notifyStateChange();
    this.notifyTick();
  }

  initStageParameters(stage, round = 1, phase = 'work') {
    this.currentRound = round;
    this.phase = phase;
    this.lastBeepedSecond = null;

    if (!stage) return;

    if (phase === 'prep') {
      this.timeRemaining = this.prepTime;
      this.targetDuration = this.prepTime;
      return;
    }

    if (phase === 'rest') {
      this.timeRemaining = Number(stage.restTime !== undefined ? stage.restTime : (stage.type === 'tabata' ? 10 : 15));
      this.targetDuration = this.timeRemaining;
      return;
    }

    // Phase === 'work'
    if (stage.type === 'tabata') {
      this.timeRemaining = Number(stage.workTime || stage.duration || 20);
      this.targetDuration = this.timeRemaining;
    } else if (stage.type === 'countup') {
      this.timeRemaining = 0;
      this.targetDuration = Number(stage.duration || 60);
    } else {
      // Countdown
      this.timeRemaining = Number(stage.duration || 30);
      this.targetDuration = this.timeRemaining;
    }
  }

  start() {
    if (!this.stages || this.stages.length === 0) return;
    if (this.status === 'running') return;

    soundEngine.initContext();
    wakeLockController.request();

    if (this.status === 'awaiting_next') {
      this.proceedToNextStage();
      return;
    }

    if (this.status === 'idle' || this.status === 'completed') {
      this.currentStageIndex = 0;
      this.currentRound = 1;
      const stage = this.getCurrentStage();

      // If prepTime > 0, begin with prep countdown!
      if (this.prepTime > 0) {
        this.initStageParameters(stage, 1, 'prep');
      } else {
        this.initStageParameters(stage, 1, 'work');
        soundEngine.playWorkChirp();
      }
    }

    this.status = 'running';
    this.lastTimestamp = performance.now();
    this.startLoop();
    this.notifyStateChange();
  }

  pause() {
    if (this.status !== 'running') return;
    this.stopLoop();
    this.status = 'paused';
    wakeLockController.release();
    this.notifyStateChange();
  }

  togglePlayPause() {
    if (this.status === 'running') {
      this.pause();
    } else {
      this.start();
    }
  }

  proceedToNextStage() {
    if (this.currentStageIndex < this.stages.length - 1) {
      this.currentStageIndex++;
      this.currentRound = 1;
      const nextStage = this.getCurrentStage();

      soundEngine.initContext();
      wakeLockController.request();

      if (this.prepTime > 0) {
        this.initStageParameters(nextStage, 1, 'prep');
      } else {
        this.initStageParameters(nextStage, 1, 'work');
        soundEngine.playWorkChirp();
      }

      this.status = 'running';
      this.lastTimestamp = performance.now();
      this.startLoop();
      this.notifyPhaseChange();
      this.notifyStateChange();
      this.notifyTick();
    } else {
      this.completeRoutine();
    }
  }

  startLoop() {
    this.stopLoop();
    const tickFrame = (timestamp) => {
      if (this.status !== 'running') return;

      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.5); // cap delta
      this.lastTimestamp = timestamp;
      this.totalElapsed += dt;

      this.stepTimer(dt);

      this.notifyTick();
      this.timerId = requestAnimationFrame(tickFrame);
    };

    this.timerId = requestAnimationFrame(tickFrame);
  }

  stopLoop() {
    if (this.timerId) {
      cancelAnimationFrame(this.timerId);
      this.timerId = null;
    }
  }

  stepTimer(dt) {
    const stage = this.getCurrentStage();
    if (!stage) {
      this.completeRoutine();
      return;
    }

    // 1. Preparation Phase (대기시간)
    if (this.phase === 'prep') {
      this.timeRemaining = Math.max(0, this.timeRemaining - dt);
      const remainInt = Math.ceil(this.timeRemaining);

      if (remainInt <= 3 && remainInt >= 1 && this.lastBeepedSecond !== remainInt) {
        soundEngine.playWarningBeep();
        this.lastBeepedSecond = remainInt;
      }

      if (this.timeRemaining <= 0.02) {
        // Prep ended -> Start Work
        this.initStageParameters(stage, this.currentRound, 'work');
        soundEngine.playWorkChirp();
        this.notifyPhaseChange();
      }
      return;
    }

    // 2. Count Up (Lap time)
    if (stage.type === 'countup' && this.phase === 'work') {
      this.timeRemaining += dt;
      const target = this.targetDuration;
      const remainToTarget = Math.max(0, target - this.timeRemaining);
      const remainInt = Math.ceil(remainToTarget);

      if (remainInt <= 3 && remainInt >= 1 && this.lastBeepedSecond !== remainInt) {
        soundEngine.playWarningBeep();
        this.lastBeepedSecond = remainInt;
      }

      if (this.timeRemaining >= target) {
        soundEngine.playTransitionTone();
        this.advanceRoundOrStage();
      }
      return;
    }

    // 3. Countdown or Tabata (Work or Rest)
    this.timeRemaining = Math.max(0, this.timeRemaining - dt);
    const remainInt = Math.ceil(this.timeRemaining);

    if (remainInt <= 3 && remainInt >= 1 && this.lastBeepedSecond !== remainInt) {
      soundEngine.playWarningBeep();
      this.lastBeepedSecond = remainInt;
    }

    if (this.timeRemaining <= 0.02) {
      soundEngine.playTransitionTone();
      this.advanceRoundOrStage();
    }
  }

  advanceRoundOrStage() {
    const stage = this.getCurrentStage();
    if (!stage) {
      this.completeRoutine();
      return;
    }

    const restDuration = Number(stage.restTime !== undefined ? stage.restTime : (stage.type === 'tabata' ? 10 : 0));
    const totalRounds = Number(stage.rounds || 1);

    // If currently in WORK:
    if (this.phase === 'work') {
      // Check if there is another round and rest time > 0
      if (this.currentRound < totalRounds) {
        if (restDuration > 0) {
          // Transition to Rest
          this.initStageParameters(stage, this.currentRound, 'rest');
          soundEngine.playRestTone();
          this.notifyPhaseChange();
          return;
        } else {
          // No rest time: next round immediately
          this.initStageParameters(stage, this.currentRound + 1, 'work');
          soundEngine.playWorkChirp();
          this.notifyPhaseChange();
          return;
        }
      } else {
        // Last round of this stage finished!
        this.handleStageCompletion();
        return;
      }
    }

    // If currently in REST:
    if (this.phase === 'rest') {
      if (this.currentRound < totalRounds) {
        this.initStageParameters(stage, this.currentRound + 1, 'work');
        soundEngine.playWorkChirp();
        this.notifyPhaseChange();
        return;
      } else {
        this.handleStageCompletion();
        return;
      }
    }
  }

  handleStageCompletion() {
    // Current stage finished all rounds!
    // Check if there is a next stage:
    if (this.currentStageIndex < this.stages.length - 1) {
      // Rule 2: DO NOT auto-advance! Wait for user to click '다음 단계' button.
      this.stopLoop();
      this.status = 'awaiting_next';
      this.phase = 'awaiting_next';
      wakeLockController.release();
      soundEngine.playStageCompleteTone();

      this.notifyPhaseChange();
      this.notifyStateChange();
      this.notifyTick();
    } else {
      // All stages completely finished
      this.completeRoutine();
    }
  }

  skipToNextStage() {
    if (this.currentStageIndex < this.stages.length - 1) {
      this.proceedToNextStage();
    } else {
      this.completeRoutine();
    }
  }

  skipToPrevStage() {
    if (this.currentStageIndex > 0) {
      this.currentStageIndex--;
      const prevStage = this.getCurrentStage();
      this.initStageParameters(prevStage, 1, 'work');
      this.lastBeepedSecond = null;
      this.notifyPhaseChange();
      this.notifyTick();
    } else {
      this.reset();
    }
  }

  completeRoutine() {
    this.stopLoop();
    this.status = 'completed';
    this.phase = 'completed';
    wakeLockController.release();
    soundEngine.playFanfare();
    
    this.notifyStateChange();
    this.notifyPhaseChange();
    if (typeof this.onComplete === 'function') {
      this.onComplete({
        totalElapsed: Math.round(this.totalElapsed),
        totalStages: this.stages.length
      });
    }
  }

  getNextPreview() {
    const stage = this.getCurrentStage();
    if (!stage) return { title: '루틴 설정 필요', sub: '단계를 추가해 주세요' };

    // In Prep phase
    if (this.phase === 'prep') {
      return {
        title: `준비 후 시작: ${stage.name}`,
        sub: `자세를 잡고 대기하세요`
      };
    }

    // In Work, but more rounds remain with rest
    if (this.phase === 'work' && this.currentRound < Number(stage.rounds || 1)) {
      const rest = Number(stage.restTime || 0);
      return {
        title: rest > 0 ? `휴식 (Rest ${rest}s)` : `Round ${this.currentRound + 1}`,
        sub: `다음: Round ${this.currentRound + 1} / ${stage.rounds}`
      };
    }

    // In Rest, next is next round work
    if (this.phase === 'rest' && this.currentRound < Number(stage.rounds || 1)) {
      return {
        title: `${stage.name}`,
        sub: `Round ${this.currentRound + 1} / ${stage.rounds} 시작`
      };
    }

    // Current stage is completing or awaiting next stage
    if (this.currentStageIndex < this.stages.length - 1) {
      const nextStage = this.stages[this.currentStageIndex + 1];
      const typeLabel = nextStage.type === 'tabata' ? '타바타' : (nextStage.type === 'countup' ? '랩타임' : '카운트다운');
      const timeLabel = nextStage.type === 'tabata' ? `${nextStage.workTime}s/${nextStage.restTime}s` : `${nextStage.duration}s`;
      return {
        title: `${this.currentStageIndex + 2}. ${nextStage.name}`,
        sub: `[${typeLabel}] ${timeLabel} · ${nextStage.rounds}R`
      };
    }

    return {
      title: '🏁 마지막 구간',
      sub: '이 라운드가 끝나면 루틴이 완료됩니다!'
    };
  }

  getProgressFraction() {
    if (this.targetDuration <= 0) return 0;
    const stage = this.getCurrentStage();
    if (!stage) return 0;

    if (this.phase === 'prep') {
      return Math.max(0, Math.min(1, this.timeRemaining / this.targetDuration));
    }

    if (stage.type === 'countup' && this.phase === 'work') {
      return Math.min(1, this.timeRemaining / this.targetDuration);
    } else {
      return Math.max(0, Math.min(1, this.timeRemaining / this.targetDuration));
    }
  }

  getTotalRoutineSeconds() {
    return this.stages.reduce((acc, st) => {
      const r = Number(st.rounds || 1);
      const rest = Number(st.restTime !== undefined ? st.restTime : (st.type === 'tabata' ? 10 : 0));
      const prep = this.prepTime;

      let stageSec = 0;
      if (st.type === 'tabata') {
        const w = Number(st.workTime || 20);
        stageSec = (w + rest) * r;
      } else {
        const d = Number(st.duration || 30);
        stageSec = d * r + (r > 1 ? rest * (r - 1) : 0);
      }
      return acc + stageSec + prep;
    }, 0);
  }

  notifyTick() {
    if (typeof this.onTick === 'function') {
      this.onTick({
        status: this.status,
        phase: this.phase,
        stage: this.getCurrentStage(),
        stageIndex: this.currentStageIndex,
        totalStages: this.stages.length,
        round: this.currentRound,
        totalRounds: this.getCurrentStage() ? Number(this.getCurrentStage().rounds || 1) : 1,
        timeRemaining: this.timeRemaining,
        targetDuration: this.targetDuration,
        progress: this.getProgressFraction(),
        nextPreview: this.getNextPreview(),
        totalElapsed: this.totalElapsed
      });
    }
  }

  notifyStateChange() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.status);
    }
  }

  notifyPhaseChange() {
    if (typeof this.onPhaseChange === 'function') {
      this.onPhaseChange(this.phase);
    }
  }
}
