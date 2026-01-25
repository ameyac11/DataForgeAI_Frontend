import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeLogo } from '@/components/ThemeLogo';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Learn More', href: '#about' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { loginAsGuest } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTryAsGuest = () => {
    loginAsGuest();
    window.location.href = '/app';
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5"
          : "bg-transparent"
      )}
    >
      <nav className="container px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <ThemeLogo size="sm" />
          <span className="font-bold text-base sm:text-lg">DataForgeAI</span>
        </Link>

        {/* Desktop Nav - Centered */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden md:flex h-9 w-9 hover:bg-accent/50 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex h-9 hover:bg-accent/50 transition-all duration-300 hover:scale-105"
            onClick={handleTryAsGuest}
          >
            Try as Guest
          </Button>

          <Button
            asChild
            size="sm"
            className="hidden md:inline-flex h-9 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
          >
            <Link to="/auth">Sign In</Link>
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 hover:bg-accent/50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
          <div className="container px-4 sm:px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <hr className="border-border/50" />
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground font-medium">Theme</span>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
            <Button className="h-11 w-full shadow-md hover:shadow-lg transition-all" onClick={handleTryAsGuest}>
              Try as Guest
            </Button>
            <Button asChild variant="outline" className="h-11 w-full border-2">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
