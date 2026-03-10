import React from 'react';
import { useRecipeDetails } from '../../hooks/useRecipeDetails';

interface Props {
  recipeId: string | null;
  onClose: () => void;
}

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

export const RecipeDetailModal: React.FC<Props> = ({ recipeId, onClose }) => {
  const { recipe, loading, error, instructions } = useRecipeDetails(recipeId);

  if (!recipeId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">{recipe?.name || 'Henter opskrift...'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl">&times;</button>
        </div>

        <div className="overflow-y-auto p-6">
          {loading && <div className="text-center py-10 text-xl text-emerald-600 font-medium">Henter de lækre detaljer...</div>}
          {error && <div className="text-red-500 text-center">{error}</div>}

          {recipe && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Venstre side: Billede og Ingredienser */}
              <div className="md:col-span-1">
                {recipe.thumbnailUrl && (
                  <img src={recipe.thumbnailUrl} alt={recipe.name} className="w-full h-48 object-cover rounded-lg mb-6 shadow-sm" />
                )}
                
                <h3 className="text-lg font-bold mb-3 text-emerald-700 uppercase tracking-wider">Ingredienser</h3>
                <ul className="space-y-2 border-l-2 border-emerald-100 pl-4">
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    recipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="text-gray-700">
                        <span className="font-semibold">{ing.quantity} {ing.unit}</span> {ing.ingredientName}
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Ingen ingredienser tilgængelige</p>
                  )}
                </ul>
              </div>

              {/* Højre side: Info og Fremgangsmåde */}
              <div className="md:col-span-2">
                <div className="flex gap-4 mb-6 text-sm text-gray-500 font-medium">
                  {recipe.workTime && (
                    <div className="bg-emerald-50 px-3 py-1 rounded-full text-emerald-700">⏱ Arbejdstid: {formatDuration(recipe.workTime)}</div>
                  )}
                  {recipe.totalTime && (
                    <div className="bg-emerald-50 px-3 py-1 rounded-full text-emerald-700">⏱ Total: {formatDuration(recipe.totalTime)}</div>
                  )}
                  <div className="bg-emerald-50 px-3 py-1 rounded-full text-emerald-700">👥 {recipe.servingSize} portioner</div>
                </div>

                <h3 className="text-lg font-bold mb-3 text-emerald-700 uppercase tracking-wider">Fremgangsmåde</h3>
                <ol className="space-y-4">
                  {instructions && instructions.length > 0 ? (
                    instructions.map((step, idx) => (
                      <li key={idx} className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Ingen fremgangsmåde tilgængelig</p>
                  )}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};