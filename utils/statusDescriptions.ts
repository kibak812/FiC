/**
 * Status effect descriptions for UI display
 */
export interface StatusDescription {
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const STATUS_DESCRIPTIONS: Record<string, StatusDescription> = {
  poison: {
    name: '독',
    description: '턴 종료 시 독 수치만큼 피해를 입고, 독이 1 감소합니다.',
    color: 'text-green-300',
    bgColor: 'bg-green-900',
    borderColor: 'border-green-500'
  },
  bleed: {
    name: '출혈',
    description: '공격받을 때 출혈 수치만큼 추가 피해를 입고, 출혈이 1 감소합니다.',
    color: 'text-red-300',
    bgColor: 'bg-red-900',
    borderColor: 'border-red-500'
  },
  burn: {
    name: '화상',
    description: '턴 종료 시 화상 수치만큼 피해를 입습니다. 화상은 감소하지 않습니다.',
    color: 'text-orange-300',
    bgColor: 'bg-orange-900',
    borderColor: 'border-orange-500'
  },
  stunned: {
    name: '기절',
    description: '기절한 동안 행동할 수 없습니다. 턴 종료 시 1 감소합니다.',
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-900',
    borderColor: 'border-yellow-500'
  },
  strength: {
    name: '힘',
    description: '모든 공격에 힘 수치만큼 추가 피해를 줍니다.',
    color: 'text-red-300',
    bgColor: 'bg-red-900',
    borderColor: 'border-red-500'
  },
  vulnerable: {
    name: '취약',
    description: '받는 피해가 50% 증가합니다. 턴 종료 시 1 감소합니다.',
    color: 'text-purple-300',
    bgColor: 'bg-purple-900',
    borderColor: 'border-purple-500'
  },
  weak: {
    name: '약화',
    description: '주는 피해가 25% 감소합니다. 턴 종료 시 1 감소합니다.',
    color: 'text-stone-300',
    bgColor: 'bg-stone-700',
    borderColor: 'border-stone-500'
  }
};
