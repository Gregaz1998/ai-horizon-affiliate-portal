
import { NavLink } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 bg-background border-t">
      <div className="responsive-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Horizon</h3>
            <p className="text-sm text-muted-foreground">
              Transformez votre réseau en source de revenus grâce à notre programme d'affiliation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-brand-blue transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-brand-blue transition-colors" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-brand-blue transition-colors" aria-label="GitHub">
                <Github size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Liens Rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink to="/" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Accueil
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Inscription
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Tableau de bord
                </NavLink>
              </li>
              <li>
                <NavLink to="/resources" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Ressources
                </NavLink>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Assistance</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Termes et Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">
                  Politique de Confidentialité
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Restez informé des dernières mises à jour et opportunités.
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-primary/30 outline-none"
                required
              />
              <button
                type="submit"
                className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                S'abonner
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {year} AI Horizon Affiliate Portal. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
