import React from 'react';
import { CAUTION_RISKS, CAUTION_GAINS, CAUTION_REFUND, CAUTION_SEQUESTER } from './data';

/* Section « Caution Sécurisée » — 4 blocs en grille 2 × 2 (verts en haut, rouge en bas). */
export default function CautionSection() {
  /* L'ordre du tableau = l'ordre dans la grille : ligne 1 = vert / vert, ligne 2 = vert / rouge */
  const groups = [
    {
      id: 'gains',
      title: 'Garantie tiers & dédommagement automatique',
      list: CAUTION_GAINS,
      cardCls: 'border-teal-200', titleCls: 'text-teal-700', dotCls: 'bg-teal-500', barCls: 'bg-teal-500',
    },
    {
      id: 'refund',
      title: 'Combien de temps pour récupérer ma caution ?',
      list: CAUTION_REFUND,
      cardCls: 'border-teal-200', titleCls: 'text-teal-700', dotCls: 'bg-teal-500', barCls: 'bg-teal-500',
    },
    {
      id: 'sequester',
      title: 'Où est conservée ma caution pendant la location ?',
      list: CAUTION_SEQUESTER,
      cardCls: 'border-teal-200', titleCls: 'text-teal-700', dotCls: 'bg-teal-500', barCls: 'bg-teal-500',
    },
    {
      id: 'risks',
      title: 'Location classique — les problèmes rencontrés',
      list: CAUTION_RISKS,
      cardCls: 'border-red-200', titleCls: 'text-red-600', dotCls: 'bg-red-400', barCls: 'bg-red-400',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-teal-600 mb-3">
            La garantie Caution Sécurisée : fini les cautions confisquées
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Nous avons remplacé l'argent en main propre par un séquestre digital transparent.
          </p>
        </div>

        {/* Grille 2 colonnes × 2 lignes — cartes de même hauteur par ligne */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5">
          {groups.map(g => (
            <div key={g.id}
              className={`relative border bg-white  rounded-2xl  overflow-hidden p-6 ${g.cardCls}`}>
              {/* Liseré de couleur en haut de la carte */}
              {/* <span className={`absolute inset-x-0 top-0 h-1 ${g.barCls}`} /> */}

              <h3 className={`font-bold text-base mb-4 ${g.titleCls}`}>{g.title}</h3>
              <ul className="space-y-2.5">
                {g.list.map(item => (
                  <li key={item} className="flex items-start gap-3 text-[13px] font-medium text-slate-600 leading-relaxed">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${g.dotCls}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}