import { useState, useEffect } from 'react';

const slides = [
  {
    title: 'Swipe Recipes',
    description: 'Browse through delicious recipes and swipe right on the ones you love',
    icon: '👆',
    color: 'from-blue-100 to-blue-50',
  },
  {
    title: 'Match with Group',
    description: 'Your matches sync with group members who also liked the same recipes',
    icon: '👥',
    color: 'from-purple-100 to-purple-50',
  },
  {
    title: 'Create Mealplan',
    description: 'Build your weekly mealplan from recipes everyone in the group enjoys',
    icon: '📅',
    color: 'from-green-100 to-green-50',
  },
  {
    title: 'Enjoy Together',
    description: 'Share the cooking experience with your group and create memories',
    icon: '🍽️',
    color: 'from-rose-100 to-rose-50',
  },
];

export const HowItWorks = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-72 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${slide.color} p-8 text-center transition-opacity duration-500 ease-in-out sm:p-10 ${
              index === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="mb-4 text-6xl">{slide.icon}</div>
            <h3 className="mb-2 text-2xl font-bold text-slate-900">{slide.title}</h3>
            <p className="max-w-md text-slate-700">{slide.description}</p>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-3 w-3 rounded-full transition-all ${
              index === current ? 'scale-110 bg-slate-900' : 'bg-slate-500/70 hover:bg-slate-700'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
