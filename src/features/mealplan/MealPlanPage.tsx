import { useState } from 'react';
import type { RecipeSummary } from '../../types/Recipe';
import RecipeCard from '../../components/ui/RecipeCard';
import { AddRecipeButton } from '../../components/ui/AddRecipeButton';
import { getWeekInfo } from '../../utils/weekUtils';

const DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

const DUMMY_RECIPES: RecipeSummary[] = [
  {
    id: '1',
    name: 'Klassisk Carbonara',
    category: 'Italiensk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1612874742237-6526221fcf4f?w=400&h=300&fit=crop',
    workTime: 'PT15M',
    totalTime: 'PT20M',
    keywordsJson: '["pasta", "hurtig", "klassisk"]',
  },
  {
    id: '2',
    name: 'Buddha Bowl',
    category: 'Vegetar',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    workTime: 'PT10M',
    totalTime: 'PT15M',
    keywordsJson: '["vegetar", "sundt", "frisk"]',
  },
  {
    id: '3',
    name: 'Laks med Asparges',
    category: 'Fisk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    workTime: 'PT20M',
    totalTime: 'PT30M',
    keywordsJson: '["fisk", "sundt", "festligt"]',
  },
  {
    id: '4',
    name: 'Burger',
    category: 'Amerikaner',
    thumbnailUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    workTime: 'PT20M',
    totalTime: 'PT25M',
    keywordsJson: '["burger", "fyldig", "casual"]',
  },
  {
    id: '5',
    name: 'Soups af Grøntsager',
    category: 'Suppe',
    thumbnailUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    workTime: 'PT15M',
    totalTime: 'PT40M',
    keywordsJson: '["vegetar", "varm", "hjemmelavet"]',
  },
];

type MealPlanData = {
  [key: string]: RecipeSummary[];
};

const INITIAL_MEAL_PLAN: MealPlanData = {
  'Mandag': [DUMMY_RECIPES[0]],
  'Tirsdag': [DUMMY_RECIPES[1]],
  'Onsdag': [DUMMY_RECIPES[2], DUMMY_RECIPES[3]],
  'Torsdag': [],
  'Fredag': [DUMMY_RECIPES[4]],
  'Lørdag': [],
  'Søndag': [],
};


export default function MealPlanPage() {
  const [mealPlan, setMealPlan] = useState<MealPlanData>(INITIAL_MEAL_PLAN);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = denne uge, -1 = forrige, +1 = næste

  const removeRecipe = (day: string, recipeId: string) => {
    setMealPlan((prev) => ({
      ...prev,
      [day]: prev[day].filter((r) => r.id !== recipeId),
    }));
  };

  // Beregn ugenummer og datointerval baseret på selectedWeek
  const { weekNumber, dateRange } = getWeekInfo(selectedWeek);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Madplan</h1>
        <div className="flex items-center gap-1 bg-slate-100 rounded-full px-1 py-1">
          <button
            onClick={() => setSelectedWeek((w) => w - 1)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all text-sm"
          >
            ‹
          </button>
          <span className="text-sm font-medium text-slate-600 px-2 whitespace-nowrap">
            Uge {weekNumber} &nbsp;·&nbsp; {dateRange}
            {selectedWeek === 0 && <span className="ml-2 text-xs text-indigo-500 font-semibold">Denne uge</span>}
          </span>
          <button
            onClick={() => setSelectedWeek((w) => w + 1)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all text-sm"
          >
            ›
          </button>
        </div>
      </div>

      {/* Outer: overflow hidden, shows exactly 4 columns */}
      <div className="relative overflow-hidden border-2 border-slate-200 rounded-2xl shadow-xl bg-white">
        {/* Track: all 7 days at exactly 1/4 container width each */}
        <div
          className="flex divide-x-2 divide-slate-200 transition-transform duration-500 ease-out"
          style={{
            width: `${(7 / 4) * 100}%`,
            transform: weekOffset === 0 ? 'translateX(0)' : `translateX(-${(3 / 7) * 100}%)`,
          }}
        >
          {DAYS.map((day) => (
            <div key={day} style={{ width: `${100 / 7}%` }} className="flex-shrink-0">
              <DayColumn
                day={day}
                recipes={mealPlan[day] || []}
                onRemoveRecipe={removeRecipe}
              />
            </div>
          ))}
        </div>

        {/* Højre gradient + pil (kun på side 1) */}
        {weekOffset === 0 && (
          <div className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-l from-white/70 to-transparent rounded-r-2xl" />
            <button
              onClick={() => setWeekOffset(1)}
              className="relative z-10 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transition-all text-lg font-bold opacity-40 hover:opacity-100 hover:bg-indigo-700 pointer-events-auto"
            >
              →
            </button>
          </div>
        )}

        {/* Venstre gradient + pil (kun på side 2) */}
        {weekOffset === 1 && (
          <div className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-white/70 to-transparent rounded-l-2xl" />
            <button
              onClick={() => setWeekOffset(0)}
              className="relative z-10 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transition-all text-lg font-bold opacity-40 hover:opacity-100 hover:bg-indigo-700 pointer-events-auto"
            >
              ←
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DayColumn({
  day,
  recipes,
  onRemoveRecipe,
}: {
  day: string;
  recipes: RecipeSummary[];
  onRemoveRecipe: (day: string, recipeId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0">
      <div className="px-4 py-3 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <span className="text-sm font-semibold text-slate-700 tracking-wide uppercase text-xs">{day}</span>
      </div>
      <div className="p-4 flex flex-col min-h-96 bg-white">
        {recipes.length > 0 ? (
          <>
            {/* Opskrifter */}
            <div className="flex flex-col gap-4">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  compact
                  onRemove={() => onRemoveRecipe(day, recipe.id)}
                />
              ))}
            </div>
            {/* + Knap direkte under opskrifterne */}
            <AddRecipeButton className="mt-4" />
          </>
        ) : (
          <>
            {/* + Knap øverst når ingen opskrifter */}
            <AddRecipeButton />
            <p className="mt-3 text-xs text-slate-400 text-center">Ingen opskrift valgt</p>
          </>
        )}
      </div>
    </div>
  );
}
