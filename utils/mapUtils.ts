import { ENEMY_POOLS, GAME_EVENTS, MAP_NODE_LAYOUTS } from '../constants';
import { EnemyTier, MapNode, NodeType } from '../types';

const NODE_META: Record<NodeType, { name: string; description: string; icon: string }> = {
  [NodeType.COMBAT]: {
    name: '전투',
    description: '일반 적과 전투합니다.',
    icon: 'swords'
  },
  [NodeType.ELITE]: {
    name: '정예',
    description: '강력한 적과 싸우고 더 많은 보상을 얻습니다.',
    icon: 'skull'
  },
  [NodeType.REST]: {
    name: '휴식',
    description: '수리하거나 카드를 제련합니다.',
    icon: 'campfire'
  },
  [NodeType.SHOP]: {
    name: '상점',
    description: '골드로 정비와 설계도를 구매합니다.',
    icon: 'store'
  },
  [NodeType.EVENT]: {
    name: '이벤트',
    description: '대장간 깊은 곳의 사건을 마주합니다.',
    icon: 'sparkles'
  },
  [NodeType.BOSS]: {
    name: '보스',
    description: '막의 최종 보스와 전투합니다.',
    icon: 'crown'
  }
};

const randomEntry = <T,>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

const getEnemyIdForNode = (act: 1 | 2 | 3, type: NodeType): string | undefined => {
  if (type === NodeType.COMBAT) {
    return randomEntry(ENEMY_POOLS[act][EnemyTier.COMMON]).id;
  }

  if (type === NodeType.ELITE) {
    return randomEntry(ENEMY_POOLS[act][EnemyTier.ELITE]).id;
  }

  if (type === NodeType.BOSS) {
    return ENEMY_POOLS[act][EnemyTier.BOSS].id;
  }

  return undefined;
};

const getEventIdForNode = (type: NodeType): string | undefined => {
  if (type !== NodeType.EVENT) return undefined;
  return randomEntry(GAME_EVENTS).id;
};

export const createActMap = (act: 1 | 2 | 3): MapNode[] => {
  const nodes = MAP_NODE_LAYOUTS[act].flatMap((floorLayout, floorIndex) => {
    const floor = floorIndex + 1;

    return floorLayout.map((type, row) => {
      const meta = NODE_META[type];

      return {
        id: `a${act}-f${floor}-r${row}-${type.toLowerCase()}`,
        act,
        floor,
        row,
        type,
        name: meta.name,
        description: meta.description,
        icon: meta.icon,
        enemyId: getEnemyIdForNode(act, type),
        eventId: getEventIdForNode(type),
        nextNodeIds: []
      };
    });
  });

  return nodes.map(node => {
    const nextFloorNodes = nodes.filter(candidate => candidate.floor === node.floor + 1);
    const nextNodeIds = nextFloorNodes
      .filter(candidate => Math.abs(candidate.row - node.row) <= 1)
      .map(candidate => candidate.id);

    return { ...node, nextNodeIds };
  });
};

export const getAvailableMapNodeIds = (nodes: MapNode[], currentNodeId: string | null): string[] => {
  if (!currentNodeId) {
    return nodes.filter(node => node.floor === 1).map(node => node.id);
  }

  const currentNode = nodes.find(node => node.id === currentNodeId);
  return currentNode?.nextNodeIds || [];
};
