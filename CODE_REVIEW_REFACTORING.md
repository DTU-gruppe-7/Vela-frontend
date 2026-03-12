# Code Review: Refactoring & Optimization Opportunities

**Date:** 2026-03-12  
**Repository:** Vela-frontend  
**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS 4 + Zustand

---

## Summary

Overall code quality is good with consistent patterns and proper TypeScript usage. However, several refactoring opportunities exist to improve maintainability, performance, and user experience. This report categorizes findings by priority and impact.

---

## 🔴 High Priority

### 1. Missing TypeScript Configuration Validates (Types/Re-exports)
**Impact:** Incomplete type system, potential import errors  
**Files:** `src/types/index.ts` is empty

**Issue:** The `index.ts` file in the types directory is completely empty, preventing clean re-exports of all types. This forces consumers to import from individual type files.

**Recommendation:** Populate the index file:
```typescript
export * from './Auth';
export * from './Recipe';
export * from './MealPlan';
export * from './ShoppingList';
export * from './Group';
export * from './User';
```

**Effort:** ~5 minutes

---

### 2. Empty/Unused Components
**Impact:** Confusing codebase, wasted maintenance

**File:** `src/features/groups/GroupPage.tsx:2-9`

**Issue:** GroupPage is a stub with placeholder content "This is the group page." This should either be implemented or removed.

**Recommendation:** Either implement proper group management UI or delete the file and its route.

**Effort:** Unknown (implementation) / 2 minutes (deletion)

---

### 3. Non-Compliant React Component Pattern
**Impact:** Inconsistent code style, outdated patterns

**File:** `src/components/layout/Header.tsx:14`

**Issue:** Uses `React.FC` type annotation, which is discouraged in modern React (especially React 19). The project convention shows function components without explicit FC typing.

**Current:**
```tsx
const Header: React.FC = () => { ... }
```

**Recommended:**
```tsx
function Header() { ... }
// or
const Header = () => { ... }
```

**Effort:** 1 minute

---

### 4. Critical TypeScript Type Mismatch Bugs
**Impact:** Runtime errors, broken functionality

**File:** `src/features/mealplan/hooks/useMealPlan.ts:16`

**Issue:** The `getDateStringForDay()` function expects a `dayName` parameter that is one of the specific day strings from the `DAYS` array (`"Mandag" | "Tirsdag" | ...`). However, on line 16, a plain `string` type is being passed, causing a TypeScript compilation error.

**Current code:**
```typescript
function getDateStringForDay(dayName: string, weekInfo: WeekInfo): string {
  const dayIndex = DAYS.indexOf(dayName);
  // ...
}

// Usage on line 124 (in removeRecipe):
const targetDate = getDateStringForDay(day, weekInfo);
```

The `day` parameter in `removeRecipe` comes from the `day` argument, which should be typed as the union type of day names.

**Recommendation:** Add proper typing:
```typescript
// At top of file, import DAYS type or define:
const DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'] as const;
export type DayName = typeof DAYS[number];

// Then update function signature:
function getDateStringForDay(dayName: DayName, weekInfo: WeekInfo): string { ... }

// Update useMealPlan return and parameters to use DayName type
```

**Effort:** 10 minutes

---

### 5. AddRecipeModal Prop Mismatch
**Impact:** Component will not render with TypeScript error; likely missing prop in modal component

**File:** `src/features/mealplan/MealPlanPage.tsx:138-149`

**Issue:** The `AddRecipeModal` is being passed a `favoriteIds` prop (a Set<string>), but the modal's props interface likely doesn't include this prop. This causes a TypeScript error and could break functionality.

**Current code:**
```tsx
<AddRecipeModal
  isOpen={selectedDay !== null}
  onClose={() => setSelectedDay(null)}
  day={selectedDay ?? ''}
  availableRecipes={availableRecipes}
  addedRecipes={selectedDay ? (mealPlan[selectedDay] || []) : []}
  favoriteIds={likedIds}  // ← This prop likely doesn't exist
  onSelect={(recipe) => { ... }}
/>
```

**Recommendation:** Check `AddRecipeModal` props interface. Either:
1. Add `favoriteIds?: Set<string>` to the interface if the modal needs it
2. Remove the prop if it's not actually used in the modal
3. Or if the modal expects a different type (e.g., `string[]`), convert: `favoriteIds={Array.from(likedIds)}`

**Effort:** 5-10 minutes

---

## 🟡 Medium Priority

### 4. Utility Function in Component
**Impact:** Violates separation of concerns, prevents reuse

**File:** `src/components/ui/RecipeCard.tsx:8-17`

**Issue:** `formatDuration()` is defined inside the RecipeCard component. This ISO duration parser is a general utility that could be reused elsewhere.

**Recommendation:** Move to `src/utils/dateUtils.ts` or `src/utils/formatUtils.ts`:
```typescript
export function formatDuration(iso: string): string { ... }
```

Then import into RecipeCard:
```tsx
import { formatDuration } from '../../../utils/formatUtils';
```

**Effort:** 5 minutes

---

### 5. Large Complex Hook with High Cyclomatic Complexity
**Impact:** Hard to test, maintain, and reason about

**File:** `src/features/mealplan/hooks/useMealPlan.ts` (144 lines)

**Issue:** The hook mixes:
- Recipe fetching
- Liked recipes fetching
- Meal plan CRUD operations
- Date conversion logic
- Entry mapping logic

**Recommendation:** Split into smaller hooks:
- `useAvailableRecipes()` - fetches and manages available recipes
- `useLikedRecipes()` - fetches and manages liked recipes with Set memoization
- `useMealPlanData()` - manages meal plan state and conversion
- Keep the main `useMealPlan()` as a composition of these smaller hooks

Also extract helper functions:
- `getEmptyMealPlan()`
- `getDateStringForDay()`
- `convertEntriesToMealPlanData()`

Move these to `src/utils/mealPlanUtils.ts`.

**Effort:** 30-45 minutes

---

### 6. Inline SVG Icons
**Impact:** Hard to maintain, inconsistent styling, no accessibility

**Files:** 
- `src/features/mealplan/MealPlanPage.tsx:49-53` (shopping cart icon)
- `src/features/shoppingList/ShoppingListPage.tsx` (multiple inline SVGs)
- `src/features/mealplan/MealPlanPage.tsx:115-118, 126-131` (chevron icons)

**Issue:** Multiple inline SVG elements are duplicated. The project already uses `react-icons` (see Header.tsx imports), so there's inconsistency.

**Recommendation:** Replace inline SVGs with `react-icons` components for consistency:
- Shopping cart: `<FiShoppingCart />`
- Chevrons: `<FiChevronRight />`, `<FiChevronLeft />`
- Other standard icons from the library

**Effort:** 15-20 minutes

---

### 7. Missing Memoization on Expensive Derived Values
**Impact:** Unnecessary re-calculations on renders

**File:** `src/features/mealplan/hooks/useMealPlan.ts:78-80`

**Issue:** The `likedIds` Set is created with `useMemo`, but the dependency array is `[likedRecipes]`. However, `likedRecipes` is an array that gets replaced entirely on fetch, which is correct. But the Set conversion happens on every render if `likedRecipes` changes frequently. This is acceptable but consider if `likedRecipes` only grows. Also verify that `likedRecipes` includes duplicate IDs.

**Recommendation:** Current implementation is acceptable. However, ensure `likedRecipes` doesn't contain duplicates from the API. Consider using `useMemo` with a more specific dependency if performance becomes an issue:
```typescript
const likedIds = useMemo(() => {
  return new Set(likedRecipes.map(r => r.id.toLowerCase()));
}, [likedRecipes]); // OK as-is
```

**Effort:** Review only (already memoized)

---

### 8. State Management Could Be More Granular
**Impact:** Unnecessary re-renders in MealPlanPage

**File:** `src/features/mealplan/MealPlanPage.tsx`

**Issue:** Multiple state variables that change independently could cause the entire component to re-render. For example, `weekOffset`, `selectedWeek`, `selectedDay`, `showShoppingListModal` all trigger re-renders when updated.

**Recommendation:** Consider grouping related state:
- Navigation state: `weekOffset` and `selectedWeek` could be a single object or use `useReducer`
- Modal states: combine into one object if more modals are added

**Current pattern is acceptable** given the component's size. Only refactor if re-render performance becomes noticable.

**Effort:** Optional, only if profiling shows issues

---

## 🟢 Low Priority / Nice-to-Have

### 9. Component Prop Groups Could Be Better Typed
**Impact:** Type safety could be improved

**File:** `src/components/ui/AddRecipeButton.tsx:3-6`

**Issue:** The `className` prop is optional with default `''`, but the interface doesn't indicate it's optional with a default. Currently:
```tsx
interface AddRecipeButtonProps {
  onClick?: () => void;
  className?: string;
}
```

**Recommendation:** Use default parameters to simplify:
```tsx
interface AddRecipeButtonProps {
  onClick?: () => void;
  className?: string;
}

export function AddRecipeButton({ onClick, className = '' }: AddRecipeButtonProps)
```

This is already done correctly. No change needed. The typing is fine because `className` is optional and defaults to empty string.

**Status:** OK as-is

---

### 10. Empty or Unused Imports
**Impact:** Bundle size, lint warnings

**Files to check:**
- `src/components/layout/Header.tsx:1` imports `React` but React 19+ with new JSX transform doesn't need explicit React import (Vite plugin handles it)
- Verify if `useEffect` is used; if not, it should be removed

**Recommendation:** Run ESLint (`npm run lint`) to identify and remove unused imports automatically with `--fix`.

**Effort:** 1 minute (auto-fix)

---

### 11. Error Handling Consistency
**Impact:** User experience, debugging

**Pattern observed across multiple hooks and components:**

In `useShoppingLists.ts:17`, `useMealPlan.ts:61`, and `useMealPlan.ts:72`:
```ts
catch (err) {
  console.error('Error message:', err);
  setError('User-friendly message');
}
```

**Issue:** The logging is good for dev but should be conditionally enabled. Also, some error messages are in Danish (good for UX) but could be more specific.

**Recommendation:** Consider creating a consistent error handling utility:
```typescript
// src/utils/errorHandler.ts
export const handleApiError = (err: unknown, context: string): string => {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, err);
  }
  // Optionally inspect err.response?.status for different messages
  return 'Der opstod en fejl. Prøv igen senere.';
};
```

Then use in hooks:
```ts
import { handleApiError } from '../../utils/errorHandler';
catch (err) {
  setError(handleApiError(err, 'fetching shopping lists'));
}
```

**Effort:** 15 minutes

---

### 12. Accessible Form Labels
**Impact:** Accessibility (a11y)

**File:** `src/components/ui/FormField.tsx:14-21`

**Issue:** The `label` uses `htmlFor={id}` which is correct. However, when `error` is present, it's not announced to screen readers by default.

**Recommendation:** Add `aria-describedby` to the input:
```tsx
<input
  id={id}
  aria-describedby={error ? `${id}-error` : undefined}
  ...
/>
{error && (
  <p id={`${id}-error`} className="text-xs text-red-500" role="alert">
    {error}
  </p>
)}
```

**Effort:** 5 minutes

---

### 13. Loading States Could Be More Granular
**Impact:** User experience

**Files:** `src/features/shoppingList/ShoppingListPage.tsx:106-112`, `MealPlanPage.tsx`

**Issue:** Uses simple skeleton pulse animations. Consider more sophisticated loading states that match the actual content structure better.

**Recommendation:** This is a minor UX improvement. Current implementation is acceptable.

**Effort:** Optional, design-dependent

---

### 14. CSS Variables Could Be More Comprehensive
**Impact:** Maintainability, theming

**File:** `src/index.css`

**Issue:** Tailwind theme tokens exist but could be expanded for consistent spacing, border radius, and shadows across the app.

**Recommendation:** Add more semantic tokens:
```css
@theme {
  --color-primary: #667eea;
  --color-primary-strong: #764ba2;
  
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}
```

Then use in Tailwind config or via arbitrary values: `rounded-[var(--radius-lg)]`

**Effort:** 20 minutes

---

### 15. Duplicate Modal Code Patterns
**Impact:** Maintenance overhead

**Files:** `ShoppingListPage.tsx:177-213`, `ShoppingListPage.tsx:216-243`, and `MealPlanPage.tsx` use similar modal structures.

**Issue:** Two modals in ShoppingListPage have similar button patterns (Cancel/Confirm). Also, the modal structure is repeated across the app.

**Recommendation:** The `Modal` component already abstracts the backdrop and panel. For action modals, consider creating a `ConfirmModal` or `ActionModal` sub-component with built-in cancel/confirm buttons that accept custom text/actions.

**Current pattern is acceptable** given the low number of modals. Only extract if modal count grows significantly.

**Effort:** Optional (only if >5 modals exist)

---

## ✅ No Action Needed

These patterns appear correct:

- Zustand store pattern in `authStore.ts` follows best practices
- Axios client with token refresh is well-implemented
- Component composition (Card, Button, FormField) is clean
- Tailwind utility-first approach is consistent
- TypeScript strict mode is enabled
- Proper use of `import type` for type-only imports
- Error boundaries not implemented (deliberate choice per AGENTS.md)
- ESLint flat config is modern and comprehensive

---

## 📊 Refactoring Priority Matrix

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| High | Populate `types/index.ts` | 5 min | High |
| High | Implement or delete `GroupPage.tsx` | Unknown / 2 min | High |
| High | Fix `getDateStringForDay` type mismatch | 10 min | High |
| High | Add missing `favoriteIds` prop to AddRecipeModal | 5-10 min | High |
| Medium | Extract `formatDuration` to utils | 5 min | Medium |
| Medium | Split `useMealPlan` hook | 30-45 min | High |
| Medium | Replace inline SVGs with `react-icons` | 15-20 min | Low |
| Low | Create error handling utility | 15 min | Medium |
| Low | Improve form field a11y | 5 min | Low |
| Low | Expand Tailwind theme tokens | 20 min | Low |

**Total estimated effort:** ~2.5 hours for all medium+ items (including bug fixes)

---

## 🔍 Other Observations

### Positive Patterns
- Consistent naming conventions (PascalCase components, camelCase hooks/utils)
- Feature-based directory structure is well-organized
- Proper use of `useCallback` and `useMemo` where appropriate
- Tailwind classes follow semantic patterns
- API layer is cleanly separated with typed responses
- Token refresh logic in axios interceptor is robust

### Performance Notes
- `SwipeCard` uses `framer-motion` properly with motion values
- No obvious N+1 queries detected
- Zustand selectors are granular (no unnecessary subscriptions)

### TypeScript Quality
- Strict mode enabled with good options (`verbatimModuleSyntax`, `noUnusedLocals`, etc.)
- Interfaces used appropriately for objects
- Generics are used correctly in API responses
- No `any` types detected in recent file audit

### Testing Gap
- No test framework configured (Vitest recommended in AGENTS.md)
- Manual testing only currently
- Consider adding tests for hooks and utilities first (highest ROI)

---

## Recommendations Summary

1. **Immediate (Today):**
   - Fix `types/index.ts`
   - Address `GroupPage.tsx` stub
   - Fix `getDateStringForDay` type mismatch (critical bug)
   - Add missing `favoriteIds` prop to `AddRecipeModal` (critical bug)

2. **This Week:**
   - Extract `formatDuration()` utility
   - Improve form accessibility
   - Replace inline SVGs with `react-icons`

3. **Next Sprint:**
   - Refactor `useMealPlan` hook
   - Implement error handling utilities
   - Add Vitest tests for critical hooks (`useMealPlan`, `useShoppingLists`, `useAuth`)
   - Expand Tailwind theme tokens

4. **Continuous:**
   - Run `npm run lint` before commits
   - Use `npx tsc --noEmit` for quick type checks
   - Consider bundle analysis with `vite-bundle-analyzer`

---

**Next Steps:** Create issues/tickets for each refactoring task with this file as reference.
