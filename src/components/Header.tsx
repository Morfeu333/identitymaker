import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Unshakable Foundation */}
          <div className="flex items-center gap-3">
            <img src="https://i.postimg.cc/bvZBJnWq/0143d2e4-4cb5-43f7-b3c0-b623cc1e3447.png" alt="Unshakable Foundation" className="h-8 w-8" />
            <div>
              <h1 className="assessment-title text-xl">Unshakable Foundation</h1>
              <p className="text-xs text-muted-foreground">Identity Shift Blueprint Assessment Platform</p>
            </div>
          </div>

          {/* CTA Buttons - Assessment System Style */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="hidden md:inline-flex"
              onClick={() => window.location.href = '/login'}
            >
              Sign In
            </Button>
            <Button
              variant="assessment"
              className="shadow-button-custom"
              onClick={() => window.location.href = '/cadastro'}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;