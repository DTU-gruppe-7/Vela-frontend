import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiLoader, FiArrowRight, FiCheck } from 'react-icons/fi'
import { shoppingListApi } from '../../api/shoppingListApi'
import type { ShoppingList } from '../../types/ShoppingList'

export const ShoppingListWidget = () => {
    const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPersonalList=async () => {
            try {
                const data = await shoppingListApi.getPersonalShoppingList();
                setShoppingList(data);
            } catch(err) {
                setError('Kunne ikke hente din indkøbsliste');
            } finally {
                setLoading(false)
            }
        }
        fetchPersonalList();
    }, [])
    const uncheckedItems = useMemo(
    () => shoppingList?.items?.filter((i) => !i.isBought) ?? [],
    [shoppingList]
  );

  const checkedCount = shoppingList?.items?.filter((i) => i.isBought).length ?? 0;

  return (
    <section className="h-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800">
          <FiShoppingCart />
          <h2 className="text-sm font-semibold">Din indkøbsliste</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/shoppinglist')}
          className="text-xs font-medium text-orange-600 hover:text-orange-700"
        >
          Åben
        </button>
      </div>

      {loading ? (
        <div className="flex h-[220px] items-center justify-center text-slate-500">
          <FiLoader className="animate-spin" />
        </div>
      ) : error ? (
        <div className="flex h-[220px] flex-col items-center justify-center text-center">
          <p className="mb-3 text-sm text-red-500">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/shoppinglist')}
            className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Gå til indkøbsliste
          </button>
        </div>
      ) : !shoppingList || shoppingList.items.length === 0 ? (
        <div className="flex h-[220px] flex-col items-center justify-center text-center">
          <p className="mb-3 text-sm text-slate-600">Din liste er tom lige nu.</p>
          <button
            type="button"
            onClick={() => navigate('/shoppinglist')}
            className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Tilføj varer
          </button>
        </div>
      ) : (
        <div className="h-[220px] overflow-y-auto pr-1">
          <div className="mb-2 text-xs text-slate-500">
            {uncheckedItems.length} mangler · {checkedCount} købt
          </div>

          <div className="space-y-2">
            {uncheckedItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate('/shoppinglist')}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:bg-slate-100"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {item.ingredientName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.quantity > 0 ? item.quantity : ''} {item.unit ?? ''}
                  </p>
                </div>
                <div className="ml-2 flex items-center gap-2 text-slate-400">
                  <FiCheck className="opacity-40" />
                  <FiArrowRight />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}