/**
 * Exercise Knowledge Base & Form Guide Dictionary
 * Provides automatic descriptions, step-by-step instructions, target muscles, cues, and illustrations.
 */

export const EXERCISE_DATABASE = {
  '버피': {
    title: '버피 테스트 (Burpee)',
    category: '전신 유산소 & 근지구력',
    image: './images/burpee.jpg',
    bgColor: '#091223',
    targetMuscles: ['대퇴사두근', '가슴/삼두', '코어 복근', '둔근'],
    steps: [
      '양발을 골반 너비로 서서 곧게 자세를 취합니다.',
      '스쿼트 자세로 쪼그려 앉으며 양손을 발 앞 바닥에 짚습니다.',
      '양발을 동시에 뒤로 뻗어 푸시업 플랭크 자세를 만듭니다.',
      '다시 양발을 손 쪽으로 당겨 착지한 뒤 폭발적으로 점프하며 머리 위로 박수를 칩니다.'
    ],
    proTip: '착지 시 발뒤꿈치부터 부드럽게 닿아야 무릎 관절에 무리가 가지 않습니다. 허리가 아래로 꺾이지 않도록 코어에 단단히 힘을 주세요.'
  },
  '점핑': {
    title: '점핑 잭 (Jumping Jack)',
    category: '웜업 & 전신 유산소',
    image: './images/jumping_jack.jpg',
    bgColor: '#051121',
    targetMuscles: ['종아리', '전신 심폐', '어깨 삼각근', '내전근'],
    steps: [
      '차렷 자세로 바르게 선 후 호흡을 가다듬습니다.',
      '가볍게 점프하며 양발을 어깨너비보다 넓게 벌리고, 양손은 머리 위로 큰 호를 그리며 올립니다.',
      '다시 제자리로 점프하며 팔과 다리를 원위치로 모읍니다.',
      '일정한 리듬을 유지하며 발 앞꿈치로 가볍고 탄력 있게 반복합니다.'
    ],
    proTip: '무릎을 살짝 구부려 쿠션 작용을 하도록 하고, 어깨에 힘이 들어가지 않도록 가슴을 펴고 시선은 정면을 유지하세요.'
  },
  '플랭크': {
    title: '스탠다드 플랭크 (Standard Plank)',
    category: '코어 강화 & 등척성 운동',
    image: './images/plank.jpg',
    bgColor: '#0b0f18',
    targetMuscles: ['복직근', '복횡근', '척추기립근', '둔근'],
    steps: [
      '팔꿈치를 어깨 바로 아래에 두고 엎드려 전완으로 체중을 지탱합니다.',
      '발끝으로 바닥을 지지하며 몸을 들어 올려 머리부터 발끝까지 일직선을 만듭니다.',
      '배꼽을 척추 쪽으로 강하게 당기고 엉덩이를 꽉 조여 자세를 고정합니다.',
      '숨을 참지 말고 일정한 리듬으로 복식호흡을 유지하며 버팁니다.'
    ],
    proTip: '엉덩이가 하늘로 솟거나 허리가 바닥 쪽으로 꺾이면 허리 통증을 유발합니다. 시선은 손 사이 바닥을 바라보세요.'
  },
  '마운틴': {
    title: '마운틴 클라이머 (Mountain Climber)',
    category: '고강도 코어 & 심폐 유산소',
    image: './images/mountain_climber.jpg',
    bgColor: '#070f1a',
    targetMuscles: ['장요근/복근', '어깨 삼각근', '햄스트링', '심폐지구력'],
    steps: [
      '손목이 어깨 바로 아래 오도록 하여 단단한 하이 플랭크 자세를 잡습니다.',
      '한쪽 무릎을 가슴 쪽으로 힘차게 당겨 올립니다.',
      '발이 바닥에 닿자마자 빠르게 교차하여 반대쪽 무릎을 당겨옵니다.',
      '마치 산을 전력질주하여 기어오르듯 빠른 템포로 좌우 다리를 교차합니다.'
    ],
    proTip: '상체가 앞뒤로 흔들리지 않도록 손바닥으로 바닥을 강하게 밀어내고, 골반의 높이가 높아지지 않게 평평하게 유지하세요.'
  },
  '스쿼트': {
    title: '에어 스쿼트 (Air Squat)',
    category: '하체 근력 & 둔근 강화',
    image: './images/squat.jpg',
    bgColor: '#050e1f',
    targetMuscles: ['대퇴사두근', '대둔근', '햄스트링', '척추기립근'],
    steps: [
      '발을 어깨너비로 벌리고 발끝을 바깥쪽으로 약 15도 벌려 섭니다.',
      '가슴을 펴고 엉덩이를 뒤로 빼면서 의자에 앉듯이 깊숙이 내려갑니다.',
      '허벅지가 바닥과 최소 평행이 될 때까지 내려간 후 잠시 멈춥니다.',
      '발바닥 전체로 지면을 강하게 밀어내며 둔근을 수축하면서 일어납니다.'
    ],
    proTip: '무릎이 안쪽으로 모이지 않도록 바깥쪽으로 밀어주고, 상체가 과도하게 앞으로 숙여지지 않도록 시선을 정면에 두세요.'
  },
  '푸시업': {
    title: '스탠다드 푸시업 (Standard Push-up)',
    category: '상체 프레스 & 흉근 강화',
    image: './images/burpee.jpg',
    bgColor: '#091223',
    targetMuscles: ['대흉근', '삼두근', '전면 삼각근', '코어'],
    steps: [
      '손을 어깨너비보다 약간 넓게 벌려 바닥에 짚고 하이 플랭크를 만듭니다.',
      '팔꿈치를 약 45도 각도로 접으며 가슴이 바닥에 닿기 직전까지 천천히 내려갑니다.',
      '가슴 근육의 신장을 느끼며 바닥을 힘차게 밀어 올려 원래 자세로 돌아옵니다.',
      '동작 중 복부와 둔근에 계속 힘을 주어 몸이 활처럼 휘지 않게 유지합니다.'
    ],
    proTip: '어깨가 귀 쪽으로 으쓱 올라가지 않도록 견갑골을 아래로 끌어내리고, 내려갈 때 호흡을 들이마시고 밀어낼 때 뱉으세요.'
  },
  '런지': {
    title: '워킹/포워드 런지 (Lunge)',
    category: '단측 하체 & 밸런스 트레이닝',
    image: './images/squat.jpg',
    bgColor: '#050e1f',
    targetMuscles: ['둔근', '대퇴사두근', '내전근', '코어 밸런스'],
    steps: [
      '양손을 골반에 얹고 상체를 곧게 세워 바르게 섭니다.',
      '한쪽 발을 크게 앞으로 내딛고 양 무릎이 각각 90도가 되도록 수직으로 내려갑니다.',
      '앞발의 무릎이 발끝을 과도하게 넘지 않도록 주의하며 둔근의 자극을 느낍니다.',
      '앞발 뒤꿈치로 바닥을 차며 시작 자세로 돌아와 반대쪽도 교대로 진행합니다.'
    ],
    proTip: '골반이 좌우로 틀어지지 않도록 중심을 정면에 두고, 뒷무릎이 바닥에 쾅 닿지 않도록 살짝 띄워 유지하세요.'
  },
  '복싱': {
    title: '복싱 섀도우 & 콤비네이션',
    category: '민첩성 & 전신 풋워크 인터벌',
    image: './images/boxing.jpg',
    bgColor: '#030d19',
    targetMuscles: ['어깨/등', '회전 코어', '종아리/풋워크', '심폐 지구력'],
    steps: [
      '가드를 턱 옆으로 바짝 올리고 무릎을 가볍게 구부린 복싱 스탠스를 취합니다.',
      '앞발을 튕기며 가볍게 리듬 스텝을 유지합니다.',
      '골반의 회전력을 이용해 앞손 잽과 뒷손 스트레이트를 날카롭게 뻗어냅니다.',
      '펀치 직후에는 즉시 가드를 턱으로 회수하고 사이드 스텝으로 앵글을 바꿉니다.'
    ],
    proTip: '팔만 뻗지 말고 발끝에서 골반, 어깨로 이어지는 전신 회전력을 실어주세요. 펀치를 낼 때마다 짧고 강하게 호흡을 내뱉습니다.'
  },
  '크런치': {
    title: '복부 크런치 (Ab Crunch)',
    category: '상복부 타깃 고립 운동',
    image: './images/plank.jpg',
    bgColor: '#0b0f18',
    targetMuscles: ['상복직근', '외복사근'],
    steps: [
      '바닥에 등을 대고 누워 무릎을 세우고 양발을 바닥에 고정합니다.',
      '양손은 귀 뒤에 살짝 대거나 가슴 위에 교차해 얹습니다.',
      '허리 아랫부분은 바닥에 붙여둔 채 날개뼈만 바닥에서 띄운다는 느낌으로 상복부를 쥐어짭니다.',
      '최고 수축 지점에서 1초간 멈춘 뒤 천천히 긴장을 유지하며 내려옵니다.'
    ],
    proTip: '손으로 목을 꺾어 당기지 마세요. 턱과 쇄골 사이에 주먹 하나 들어갈 공간을 유지하고 시선은 대각선 천장을 바라봅니다.'
  },
  '스트레칭': {
    title: '전신 이완 & 모빌리티 스트레칭',
    category: '유연성 회복 & 관절 가동성',
    image: './images/stretch.jpg',
    bgColor: '#1e2430',
    targetMuscles: ['척추기립근', '햄스트링', '광배근', '고관절 굴곡근'],
    steps: [
      '긴장을 풀고 편안한 호흡으로 시작 자세를 취합니다.',
      '근육이 기분 좋게 늘어나는 가동 범위까지 천천히 신장시킵니다.',
      '반동을 주지 않고 심호흡과 함께 자세를 10~20초간 지그시 유지합니다.',
      '호흡을 내쉴 때마다 몸의 힘을 5%씩 더 빼며 이완 깊이를 더합니다.'
    ],
    proTip: '통증이 느껴지는 강도로 무리하게 당기지 말고, 시원함이 느껴지는 지점에서 호흡에 집중하세요.'
  }
};

/**
 * Finds matching exercise guide data from title/name
 */
export function getExerciseGuide(name, customDescription = '') {
  if (customDescription && customDescription.trim()) {
    return {
      title: name,
      category: '맞춤 설정 가이드',
      image: './images/jumping_jack.jpg',
      bgColor: '#051121',
      targetMuscles: ['사용자 지정 부위'],
      steps: customDescription.split('\n').filter(s => s.trim().length > 0),
      proTip: '루틴에 저장된 맞춤 가이드에 따라 바른 자세와 호흡을 유지하세요.'
    };
  }

  const cleanName = (name || '').toLowerCase();
  for (const [key, data] of Object.entries(EXERCISE_DATABASE)) {
    if (cleanName.includes(key.toLowerCase())) {
      return data;
    }
  }

  // Default fallback guide
  return {
    title: name || '인터벌 트레이닝',
    category: '전신 활력 운동',
    image: './images/jumping_jack.jpg',
    bgColor: '#051121',
    targetMuscles: ['전신 근육', '코어 밸런스', '심폐 지구력'],
    steps: [
      '바른 정렬로 선 채 척추를 세우고 코어에 긴장감을 유지합니다.',
      '자신의 페이스에 맞춰 일정한 속도와 정확한 자세로 동작을 수행합니다.',
      '관절에 무리가 가지 않도록 통증이 느껴지면 가동 범위를 조절합니다.',
      '라운드가 끝날 때까지 멈추지 않고 호흡을 고르게 유지합니다.'
    ],
    proTip: '자세가 흐트러지지 않는 정밀한 동작이 속도보다 훨씬 효과적입니다. 매 라운드 동일한 집중력을 유지하세요.'
  };
}
