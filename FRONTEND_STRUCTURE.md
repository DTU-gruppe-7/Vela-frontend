# FoodApp – Frontend Mappestruktur Guide (Tailwind Edition)

> Anbefalet best-practice struktur for React + Vite + TypeScript + Tailwind CSS

---

## Komplet anbefalet struktur

Denne struktur benytter Tailwind CSS til styling, hvilket fjerner behovet for de fleste seperate CSS-filer.

```
frontend/src/
│
├── api/                              # Centraliseret API-lag
│   ├── axiosClient.ts                #   Konfigureret axios med baseURL, interceptors
│   ├── recipeApi.ts                  #   getAllRecipes(), getRecipeById() osv.
│   ├── groupApi.ts                   #   createGroup(), joinGroup() osv.
│   └── authApi.ts                    #   login(), register() osv.
│
├── components/                       # Delte/genanvendelige UI-komponenter
│   ├── layout/                       #   App-skelet (header, footer, layout)
│   │   ├── MainLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── layout.css                #   ⚠️ Slettet (nu Tailwind)
│   └── ui/                           #   Genanvendelige "dumb" komponenter
│       ├── Button.tsx                #   Styles med Tailwind-klasser
│       ├── Card.tsx                  #   Styles med Tailwind-klasser
│       └── Modal.tsx                 #   Styles med Tailwind-klasser
│
├── features/                         # Feature-baseret organisering
│   ├── auth/                         #   Login & registrering
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── swipe/                        #   Swipe-funktionalitet
│   │   ├── SwipePage.tsx             #   Flyttes fra pages/
│   │   ├── SwipeCard.tsx             #   Swipe-kort komponent
│   │   └── useSwipe.ts               #   Custom hook til swipe-logik
│   ├── groups/                       #   Gruppe-administration
│   │   ├── GroupPage.tsx
│   │   ├── GroupCard.tsx
│   │   └── GroupInvite.tsx
│   ├── mealplan/                     #   Madplan
│   │   ├── MealPlanPage.tsx
│   │   └── MealPlanDay.tsx
│   ├── shopping/                     #   Indkøbsliste
│   │   ├── ShoppingListPage.tsx
│   │   └── ShoppingItem.tsx
│   └── profile/                      #   Brugerprofil
│       └── ProfilePage.tsx
│
├── hooks/                            # Delte custom hooks
│   └── useAuth.ts
│
├── stores/                           # Zustand stores
│   ├── authStore.ts
│   ├── groupStore.ts
│   └── swipeStore.ts
│
├── types/                            # TypeScript interfaces/types
│   ├── User.ts
│   ├── Recipe.ts
│   ├── Group.ts
│   └── index.ts                      #   Re-exports alle types
│
├── navigation/                       # Routing
│   └── AppRouter.tsx
│
├── assets/                           # Statiske filer
├── App.tsx
├── main.tsx
└── index.css                         # Global CSS + Tailwind Directives
```

---

## Tailwind CSS Strategi

Vi har fjernet de tidligere CSS-filer (`swipe.css`, `groups.css`, `ui.css` osv.) og bruger i stedet Tailwind utility classes direkte i komponenterne.

### Global CSS (`index.css`)
Her importerer vi Tailwind og definerer vores overordnede tema-tokens (farver, fonts).

```css
@import "tailwindcss";

@theme {
  --color-primary: #667eea;
  --color-primary-strong: #764ba2;
  
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}

@layer base {
  body {
    @apply font-sans antialiased bg-slate-50 text-slate-900;
  }
}
```

### Eksempel på Komponent (uden CSS-fil)

```tsx
// features/swipe/SwipeCard.tsx
export default function SwipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden w-full max-w-sm mx-auto">
      <img 
        className="w-full h-48 object-cover" 
        src={recipe.image_url} 
        alt={recipe.title} 
      />
      <div className="p-4">
        <h2 className="text-xl font-bold text-slate-800">{recipe.title}</h2>
      </div>
    </div>
  );
}
```
