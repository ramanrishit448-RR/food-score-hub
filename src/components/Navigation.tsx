import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ScanBarcode } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const Navigation = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <ScanBarcode className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FoodSight AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`transition-colors ${
                isActive("/") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/scan"
              className={`transition-colors ${
                isActive("/scan") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Scan Product
            </Link>
            <Link
              to="/dashboard"
              className={`transition-colors ${
                isActive("/dashboard") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/about"
              className={`transition-colors ${
                isActive("/about") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              About
            </Link>
            <ThemeToggle />
            <Link to="/auth">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <Link
              to="/"
              className={`block ${
                isActive("/") ? "text-primary font-medium" : "text-muted-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/scan"
              className={`block ${
                isActive("/scan") ? "text-primary font-medium" : "text-muted-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Scan Product
            </Link>
            <Link
              to="/dashboard"
              className={`block ${
                isActive("/dashboard") ? "text-primary font-medium" : "text-muted-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/about"
              className={`block ${
                isActive("/about") ? "text-primary font-medium" : "text-muted-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" className="w-full">Sign In</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
