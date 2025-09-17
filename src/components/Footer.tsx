const Footer = () => {
  return (
    <footer className="relative z-10 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-6 py-8">
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 Unshakable Foundation - Identity Shift Blueprint. All rights reserved. 🏗️
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;