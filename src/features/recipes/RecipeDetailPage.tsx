import React from 'react';
import { useRecipeDetails } from '../../hooks/useRecipeDetails';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Parse an ISO 8601 duration string (e.g. "PT1H20M", "PT45M", "PT2H") into a
 * human-readable Danish string like "1 t 20 min" or "45 min".
 */
function formatDuration(iso: string): string {
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return iso;
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} t`);
  if (minutes > 0) parts.push(`${minutes} min`);
  return parts.length > 0 ? parts.join(' ') : '0 min';
}

export const RecipeDetailPage: React.FC = () => {
  // 1. Hent ID fra URL'en i stedet for props (f.eks. /recipes/123)
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 2. Brug ID'et fra URL'en til at hente data
  const { recipe, loading, error, instructions } = useRecipeDetails(id || null);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
       <div className="text-xl text-emerald-600 font-medium">Henter de lækre detaljer...</div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-4xl mx-auto p-10 text-center text-red-500">{error}</div>
  );

  if (!recipe) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* 3. "Tilbage"-knap i stedet for "Luk"-kryds */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
      >
        <span className="text-2xl mr-2">←</span> Tilbage til overblik
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header sektion */}
        <div className="p-8 border-b bg-gray-50/50">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{recipe.name}</h1>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Venstre side: Billede og Ingredienser */}
            <div className="md:col-span-1">
              {recipe.thumbnailUrl && (
                <img 
                  src={recipe.thumbnailUrl} 
                  alt={recipe.name} 
                  className="w-full h-64 object-cover rounded-xl mb-8 shadow-md" 
                />
              )}
              
              <h3 className="text-xl font-bold mb-4 text-emerald-700 uppercase tracking-widest text-sm">Ingredienser</h3>
              <ul className="space-y-3 border-l-2 border-emerald-100 pl-6">
                {recipe.ingredients?.map((ing, idx) => (
                  <li key={idx} className="text-gray-700 text-lg">
                    <span className="font-bold text-emerald-600">{ing.quantity} {ing.unit}</span> {ing.ingredientName}
                  </li>
                ))}
              </ul>
            </div>

            {/* Højre side: Info og Fremgangsmåde */}
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-4 mb-8">
                {recipe.workTime && (
                  <div className="bg-emerald-50 px-4 py-2 rounded-lg text-emerald-700 font-medium border border-emerald-100">
                    ⏱ Arbejde: {formatDuration(recipe.workTime)}
                  </div>
                )}
                {recipe.totalTime && (
                  <div className="bg-emerald-50 px-4 py-2 rounded-lg text-emerald-700 font-medium border border-emerald-100">
                    ⏱ Total: {formatDuration(recipe.totalTime)}
                  </div>
                )}
                <div className="bg-emerald-50 px-4 py-2 rounded-lg text-emerald-700 font-medium border border-emerald-100">
                  👥 {recipe.servings} portioner
                </div>
              </div>

              <h3 className="text-xl font-bold mb-6 text-emerald-700 uppercase tracking-widest text-sm">Fremgangsmåde</h3>
              <ol className="space-y-8">
                {instructions?.map((step: string, idx: number) => (
                  <li key={idx} className="flex gap-6">
                    <span className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700 leading-relaxed text-lg pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;