import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Navigation } from "./Navigation";
import Footer from "@/components/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/a06650c0-2ee1-42dd-9217-cef8bdd67039.png" 
                alt="FenomenPet Logo" 
                className="h-8 w-auto"
              />
            </Link>
            <Navigation />
          </div>
        </div>
      </nav>
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};