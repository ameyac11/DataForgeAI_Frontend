import { Link } from 'react-router-dom';
import { ThemeLogo } from '@/components/ThemeLogo';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background">
      <div className="container px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col items-center gap-8 sm:gap-10">
          {/* Logo and Brand */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <ThemeLogo size="sm" />
              <span className="font-medium text-lg text-foreground">DataForgeAI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Generate high-quality synthetic datasets with AI-powered natural language processing.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Terms of Service
            </Link>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Contact
            </a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              About
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </a>
            <a
              href="#"
              className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </a>
            <a
              href="#"
              className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </a>
          </div>

          {/* Copyright */}
          <div className="pt-6 sm:pt-8 border-t border-border w-full text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DataForgeAI by DataNesTX. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}