
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import LoginDialog from "@/components/LoginDialog";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Filter navLinks based on auth status
  const navLinks = [
    { name: "Accueil", path: "/", public: true },
    { name: "Inscription", path: "/register", public: true, hideWhenLoggedIn: true },
    { name: "Tableau de bord", path: "/dashboard", public: false },
    { name: "Ressources", path: "/resources", public: false },
    { name: "Classement", path: "/leaderboard", public: false },
  ].filter(link => link.public || user)
    .filter(link => !(link.hideWhenLoggedIn && user));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled 
      ? "py-3 glass shadow-sm" 
      : "py-5 bg-transparent"
  }`;

  return (
    <header className={headerClasses}>
      <div className="responsive-container flex items-center justify-between">
        <NavLink to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gradient">AI Horizon</span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path}
              className={({ isActive }) => 
                `relative font-medium text-sm transition-colors ${
                  isActive 
                    ? "text-brand-purple" 
                    : "text-gray-700 hover:text-brand-purple"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="navigation-underline"
                      className="absolute left-0 right-0 h-0.5 bg-brand-purple bottom-[-5px]"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          
          {user ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={signOut}
              className="text-gray-700 hover:text-brand-purple"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          ) : (
            <LoginDialog
              trigger={
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white"
                >
                  Se connecter
                </Button>
              }
            />
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass shadow-lg"
          >
            <nav className="flex flex-col px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `py-2 px-4 rounded-md ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              
              {user ? (
                <Button 
                  variant="ghost" 
                  onClick={signOut}
                  className="justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              ) : (
                <LoginDialog
                  trigger={
                    <Button 
                      variant="outline" 
                      className="border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white"
                    >
                      Se connecter
                    </Button>
                  }
                />
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
