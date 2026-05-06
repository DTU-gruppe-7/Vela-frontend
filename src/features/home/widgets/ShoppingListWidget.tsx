import { useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiShoppingCart, FiLoader, FiArrowRight, FiCheck } from 'react-icons/fi'
import { useShoppingList } from '../../shoppingList/hooks/useShoppingList'

export const ShoppingListWidget = () => {
    const { shoppingList, loading, error, refetch } = useShoppingList();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        refetch();
    }, [location.pathname, refetch]);

    const { uncheckedItems, checkedCount } = useMemo(() => ({
        uncheckedItems: shoppingList?.items?.filter((i) => !i.isBought) ?? [],
        checkedCount: shoppingList?.items?.filter((i) => i.isBought).length ?? 0,
    }), [shoppingList]);

    const subtitle = loading
        ? 'Henter din indkøbsliste...'
        : shoppingList && shoppingList.items.length > 0
        ? `${uncheckedItems.length} mangler · ${checkedCount} købt`
        : 'Din liste er tom';

    return (
        <section className="flex h-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                    Åbn liste
                </button>
            </div>

            {!error && <p className="mb-3 text-xs text-slate-500">{subtitle}</p>}

            {loading ? (
                <div className="flex flex-1 items-center justify-center text-slate-500">
                    <FiLoader className="animate-spin" />
                </div>
            ) : error ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <p className="mb-3 text-sm text-red-500">{error}</p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={refetch}
                            className="rounded-lg border border-orange-600 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
                        >
                            Prøv igen
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/shoppinglist')}
                            className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
                        >
                            Gå til indkøbsliste
                        </button>
                    </div>
                </div>
            ) : !shoppingList || shoppingList.items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
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
                <div className="hide-scrollbar flex-1 overflow-y-auto pr-1">
                    <div className="space-y-2">
                        {uncheckedItems.map((item) => {
                            const recipeName = item.recipeName?.trim();
                            const hasRecipeName =
                                Boolean(recipeName) &&
                                recipeName?.toLowerCase() !== 'null' &&
                                recipeName?.toLowerCase() !== 'undefined' &&
                                recipeName?.toLowerCase() !== '()';
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => navigate('/shoppinglist')}
                                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:bg-slate-100"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-800 capitalize">
                                            {item.ingredientName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {item.quantity > 0 ? item.quantity : ''} {item.unit ?? ''}
                                        </p>
                                        {hasRecipeName && (
                                            <p className="truncate text-xs text-slate-500">
                                                Fra opskrift: {recipeName}
                                            </p>
                                        )}
                                    </div>
                                    <div className="ml-2 flex items-center gap-2 text-slate-400">
                                        <FiCheck className="opacity-40" />
                                        <FiArrowRight />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};
