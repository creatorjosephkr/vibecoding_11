/**
 * Routine Storage & Preset Manager
 * Handles local persistence, preset loading, custom saving, and draft auto-save.
 */

export const PRESET_ROUTINES = [
  {
    id: 'preset-hybrid-burn',
    title: '⚡ 전신 버닝 하이브리드 루틴',
    description: '시간제한, 타바타, 랩타임 3가지 모드를 모두 경험하는 시그니처 루틴',
    stages: [
      {
        id: 's-h1',
        name: '점핑 잭 & 웜업',
        type: 'countdown',
        duration: 30,
        restTime: 15,
        rounds: 2
      },
      {
        id: 's-h2',
        name: '타바타 마운틴 클라이머',
        type: 'tabata',
        duration: 20,
        workTime: 20,
        restTime: 10,
        rounds: 4
      },
      {
        id: 's-h3',
        name: '플랭크 지구력 버티기',
        type: 'countup',
        duration: 45,
        restTime: 15,
        rounds: 1
      }
    ]
  },
  {
    id: 'preset-classic-tabata',
    title: '🔥 정통 타바타 코어 (20/10 x 8R)',
    description: '4분 고강도 인터벌의 정석! 20초 전력 운동과 10초 휴식 8라운드',
    stages: [
      {
        id: 's-t1',
        name: '타바타 버피 & 크런치',
        type: 'tabata',
        duration: 20,
        workTime: 20,
        restTime: 10,
        rounds: 8
      }
    ]
  },
  {
    id: 'preset-boxing-shadow',
    title: '🥊 3분 복싱 섀도우 라운드',
    description: '실전 복싱 경기 3분 3라운드 훈련 시퀀스',
    stages: [
      {
        id: 's-b1',
        name: '라운드 1 (잽 & 스트레이트)',
        type: 'countdown',
        duration: 180,
        restTime: 60,
        rounds: 1
      },
      {
        id: 's-b2',
        name: '라운드 2 (콤비네이션 & 풋워크)',
        type: 'countdown',
        duration: 180,
        restTime: 60,
        rounds: 1
      },
      {
        id: 's-b3',
        name: '라운드 3 (올아웃 피니시)',
        type: 'countdown',
        duration: 180,
        restTime: 60,
        rounds: 1
      }
    ]
  },
  {
    id: 'preset-mobility-stretch',
    title: '🧘 5분 아침 모빌리티 스트레칭',
    description: '지친 몸의 근육을 이완하는 저강도 회복 루틴',
    stages: [
      {
        id: 's-m1',
        name: '캣-카우 & 척추 롤링',
        type: 'countdown',
        duration: 45,
        restTime: 10,
        rounds: 2
      },
      {
        id: 's-m2',
        name: '다운독 & 종아리 스트레칭',
        type: 'countdown',
        duration: 50,
        restTime: 10,
        rounds: 2
      },
      {
        id: 's-m3',
        name: '차일드 포즈 (이완 호흡)',
        type: 'countup',
        duration: 60,
        restTime: 10,
        rounds: 1
      }
    ]
  }
];

const STORAGE_KEYS = {
  SAVED_ROUTINES: 'pulse_saved_routines_v1',
  ACTIVE_DRAFT: 'pulse_active_draft_v1',
  CURRENT_ROUTINE_NAME: 'pulse_active_name_v1',
  PREP_TIME: 'pulse_prep_time_v1',
  THEME: 'pulse_theme_v1'
};

export class RoutineStorage {
  static getSavedRoutines() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_ROUTINES);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse saved routines:', e);
      return [];
    }
  }

  static saveRoutine(title, stages) {
    if (!title || !title.trim()) {
      throw new Error('루틴 이름을 입력해 주세요.');
    }
    if (!stages || stages.length === 0) {
      throw new Error('최소 1개 이상의 운동 단계가 필요합니다.');
    }

    const routines = this.getSavedRoutines();
    const existingIndex = routines.findIndex(r => r.title.trim().toLowerCase() === title.trim().toLowerCase());
    
    const newRoutine = {
      id: existingIndex >= 0 ? routines[existingIndex].id : 'custom-' + Date.now(),
      title: title.trim(),
      updatedAt: new Date().toISOString(),
      stages: JSON.parse(JSON.stringify(stages))
    };

    if (existingIndex >= 0) {
      routines[existingIndex] = newRoutine;
    } else {
      routines.unshift(newRoutine);
    }

    localStorage.setItem(STORAGE_KEYS.SAVED_ROUTINES, JSON.stringify(routines));
    return newRoutine;
  }

  static deleteRoutine(id) {
    const routines = this.getSavedRoutines().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_ROUTINES, JSON.stringify(routines));
    return routines;
  }

  static getPrepTime() {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.PREP_TIME);
      if (val !== null) {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load prep time:', e);
    }
    return 5; // default 5 seconds
  }

  static savePrepTime(seconds) {
    try {
      const safeVal = Math.max(0, parseInt(seconds, 10) || 0);
      localStorage.setItem(STORAGE_KEYS.PREP_TIME, String(safeVal));
    } catch (e) {
      console.warn('Failed to save prep time:', e);
    }
  }

  static getTheme() {
    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (theme === 'light' || theme === 'dark') return theme;
    } catch (e) {
      console.warn('Failed to get theme:', e);
    }
    return 'dark'; // default theme is athletic dark
  }

  static saveTheme(theme) {
    try {
      const safeTheme = theme === 'light' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEYS.THEME, safeTheme);
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  }

  static saveDraft(title, stages) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROUTINE_NAME, title || '나만의 운동 루틴');
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DRAFT, JSON.stringify(stages));
    } catch (e) {
      console.warn('Failed to save draft:', e);
    }
  }

  static loadDraft() {
    try {
      const name = localStorage.getItem(STORAGE_KEYS.CURRENT_ROUTINE_NAME) || '⚡ 전신 버닝 하이브리드 루틴';
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_DRAFT);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure restTime exists on all stages
          const sanitized = parsed.map(st => ({
            ...st,
            restTime: st.restTime !== undefined ? Number(st.restTime) : (st.type === 'tabata' ? 10 : 15)
          }));
          return { title: name, stages: sanitized };
        }
      }
    } catch (e) {
      console.warn('Failed to load draft:', e);
    }
    // Return default preset if no draft found
    return {
      title: PRESET_ROUTINES[0].title,
      stages: JSON.parse(JSON.stringify(PRESET_ROUTINES[0].stages))
    };
  }
}
