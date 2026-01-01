# FiC 프로젝트 에러 해결 기록

## 2026-01-01

### Import 누락으로 인한 빈 화면 오류

**증상**: 대장간 입장 시 아무것도 표시되지 않음

**원인**:
- `App.tsx`에서 `getMonsterSprite` import 추가 시 기존 `Skull` import를 실수로 제거
- `Skull` 아이콘은 여전히 코드 내에서 사용 중 (공격 의도 표시, 게임오버 화면)
- TypeScript 컴파일 에러로 인해 앱이 렌더링되지 않음

**해결방법**:
```tsx
// Before (잘못된 코드)
import { Heart, Shield, Zap, RefreshCw, Trophy, ... } from 'lucide-react';

// After (수정된 코드)
import { Heart, Shield, Zap, RefreshCw, Skull, Trophy, ... } from 'lucide-react';
```

**교훈**:
- import 수정 시 기존 사용 중인 항목을 제거하지 않도록 주의
- 빌드 전에 `npx tsc --noEmit`으로 타입 체크 수행 권장
- lucide-react 아이콘 추가/제거 시 실제 사용처 확인 필요
