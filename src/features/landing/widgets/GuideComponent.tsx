const steps = [
    { number: '01', title: 'Swipe opskrifter', description: 'Udforsk et hav af lækre opskrifter og swipe på dem du kan lide' },
    { number: '02', title: 'Match med gruppen', description: 'Dine likes matcher automatisk med gruppemedlemmernes' },
    { number: '03', title: 'Lav en madplan', description: 'Byg en ugentlig madplan for hele husstanden' },
    { number: '04', title: 'Nyd maden sammen', description: 'Spis lækker mad efter alles smag' },
];

export const Guide = () => {
    return (
        <section>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-6">Sådan virker det</p>

            {/* Mobil: vertikal liste */}
            <div className="flex flex-col gap-4 sm:hidden">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-start gap-3">
                        <div className="flex flex-col items-center flex-shrink-0">
                            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center">
                                {index + 1}
                            </span>
                            {index < steps.length - 1 && (
                                <div className="w-px flex-1 bg-slate-200 mt-2" style={{ minHeight: '1.5rem' }} />
                            )}
                        </div>
                        <div className="pb-2">
                            <h3 className="text-sm font-bold text-slate-800">{step.title}</h3>
                            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop: horisontal række */}
            <div className="hidden sm:flex items-start">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-start flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">
                                    {index + 1}
                                </span>
                                <div className="h-px flex-1 bg-slate-200" />
                                {index < steps.length - 1 && (
                                    <svg className="flex-shrink-0 w-3 h-3 text-slate-300 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 pr-4">{step.title}</h3>
                            <p className="mt-1 text-xs text-slate-500 leading-relaxed pr-4">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
