import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Car } from 'lucide-react';

/* Bandeau CTA final — version claire (fond teal clair, plus de noir). */
export default function HowCta() {
  const navigate = useNavigate();
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="px-8 py-12 lg:px-14 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h2 className="text-md md:text-lg font-black text-teal-700  max-w-3xl">
              Prêt à réserver votre prochain véhicule à Douala ou Yaoundé ?
            </h2>
            <p className="text-slate-500 text-sm mt-3 max-w-xl">
              Rejoignez les milliers de clients qui louent en toute sérénité avec AutoLink Pro.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3.5 shrink-0">
            <button onClick={() => navigate('/catalogue')}
              className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3.5 rounded-xl transition-colors">
              Réserver un véhicule <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 bg-white hover:bg-teal-50 text-teal-700 font-bold px-6 py-3.5 rounded-xl transition-colors border border-teal-200">
              <Car size={16} /> Créer un compte
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
