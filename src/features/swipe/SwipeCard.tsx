import {
    motion,
    useMotionValue,
    useTransform,
    type PanInfo,
} from "framer-motion";
import RecipeCard from "../../components/ui/RecipeCard";
import type { RecipeSummary } from "../../types/Recipe";

/* ─── Konstanter ─── */
const SWIPE_THRESHOLD = 120;
const EXIT_X = 600;
const MAX_ROTATION = 18;

export interface SwipeCardProps {
    recipeSummary: RecipeSummary;
    isTop: boolean;
    stackIndex: number;
    onSwipe: (id: string, dir: "like" | "dislike") => void;
}

function SwipeCard({ recipeSummary, isTop, stackIndex, onSwipe }: SwipeCardProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-300, 0, 300], [-MAX_ROTATION, 0, MAX_ROTATION]);
    const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
    const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

    function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        if (info.offset.x > SWIPE_THRESHOLD) {
            onSwipe(recipeSummary.id, "like");
        } else if (info.offset.x < -SWIPE_THRESHOLD) {
            onSwipe(recipeSummary.id, "dislike");
        }
    }

    return (
        <motion.div
            className="absolute inset-0 touch-none"
            style={{
                zIndex: 10 - stackIndex,
                x: isTop ? x : 0,
                rotate: isTop ? rotate : 0,
                cursor: isTop ? "grab" : "default",
            }}
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{
                scale: 1 - stackIndex * 0.05,
                opacity: 1,
                y: stackIndex * 12,
            }}
            /**
             * `custom` injiceres af AnimatePresence på exit-tidspunktet,
             * så retningen altid er korrekt — uanset om kortet blev draget eller knap-klikket.
             */
            variants={{
                exit: (dir: "like" | "dislike") => ({
                    x: dir === "like" ? EXIT_X : -EXIT_X,
                    opacity: 0,
                    transition: { duration: 0.35, ease: "easeIn" },
                }),
            }}
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={isTop ? handleDragEnd : undefined}
            whileDrag={{ cursor: "grabbing" }}
        >
            {/* LIKE / NOPE overlays over RecipeCard */}
            <div className="relative h-full select-none pointer-events-none">
                <RecipeCard recipe={recipeSummary} />

                {isTop && (
                    <>
                        <motion.div
                            className="absolute top-6 left-6 border-4 border-green-400 rounded-xl px-4 py-2 -rotate-12 z-10"
                            style={{ opacity: likeOpacity }}
                        >
                            <span className="text-green-400 font-extrabold text-3xl tracking-wide">
                                LIKE
                            </span>
                        </motion.div>
                        <motion.div
                            className="absolute top-6 right-6 border-4 border-red-400 rounded-xl px-4 py-2 rotate-12 z-10"
                            style={{ opacity: nopeOpacity }}
                        >
                            <span className="text-red-400 font-extrabold text-3xl tracking-wide">
                                NOPE
                            </span>
                        </motion.div>
                    </>
                )}
            </div>
        </motion.div>
    );
}

export default SwipeCard;
