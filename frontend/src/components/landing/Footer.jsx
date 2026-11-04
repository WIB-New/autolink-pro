import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, MessageCircle, Clock, Facebook, Instagram } from 'lucide-react';
import AutoLinkLogo from '../AutoLinkLogo';
import { NAV_LINKS } from './data';

/* Footer partagé — landing & pages publiques */
export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <AutoLinkLogo size="sm" />
            </div>
            <p className="text-sm leading-relaxed mb-5">
              La première plateforme numérique de location de véhicules vérifiés
              au Cameroun.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-9 h-9 bg-slate-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors">
                <Facebook size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-9 h-9 bg-slate-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </a>
              <a href="https://wa.me/237656789000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="w-9 h-9 bg-slate-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Liens rapides</h4>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map(l => (
                <li key={l.href}>
                  <Link to={l.href.startsWith('#') ? `/${l.href}` : l.href} className="hover:text-teal-400 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Informations</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Phone size={15} className="text-teal-500 mt-0.5 shrink-0" />
                <span>+237 656 789 000</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-teal-500 mt-0.5 shrink-0" />
                <span>Akwa, Douala — Cameroun</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MessageCircle size={15} className="text-teal-500 mt-0.5 shrink-0" />
                <span>contact@autolink.cm</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock size={15} className="text-teal-500 mt-0.5 shrink-0" />
                <span>Lun–Sam : 6h–22h · Dim : sur réservation</span>
              </div>
            </div>
          </div>

          {/* Aide */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Aide</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/aide" className="hover:text-teal-400 transition-colors">Centre d'aide / FAQ</Link></li>
              <li><Link to="/" className="hover:text-teal-400 transition-colors">Conditions générales</Link></li>
              <li><Link to="/" className="hover:text-teal-400 transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/" className="hover:text-teal-400 transition-colors">Politique d'annulation</Link></li>
              {/* <li><Link to="/login" className="hover:text-teal-400 transition-colors">Espace client</Link></li> */}
            </ul>
          </div>
        </div>

        {/* Moyens de paiement */}
        {/* <div className="border-t border-slate-800 pt-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Moyens de paiement acceptés
          </span>
          <div className="flex items-center gap-3">
            <span className="bg-yellow-400 text-slate-900 text-xs font-black px-3 py-1.5 rounded-lg">
              MTN MoMo
            </span>
            <span className="bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-lg">
              Orange Money
            </span>
            <span className="bg-slate-800 text-slate-300 text-xs font-black px-3 py-1.5 rounded-lg border border-slate-700">
              Carte bancaire
            </span>
          </div>
        </div> */}

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>© 2026 AutoLink Pro. Tous droits réservés — Douala &amp; Yaoundé, Cameroun.</p>
          {/* <div className="flex gap-6">
            {['Politique de confidentialité', 'CGU', 'Cookies'].map(l => (
              <Link key={l} to="/" className="hover:text-teal-400 transition-colors">{l}</Link>
            ))}
          </div> */}
        </div>
      </div>
    </footer>
  );
}
