import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ThemeToggle from '@/components/ThemeToggle';
import { Sparkles, Zap, Palette, Heart } from 'lucide-react';

const ThemeDemo = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300">
      {/* Grid Background for Futuristic Theme */}
      <div className="grid-background fixed inset-0 pointer-events-none opacity-0 futuristic-dark:opacity-100 transition-opacity duration-500" />
      
      <div className="container mx-auto p-6 relative z-10">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Theme Demonstration</h1>
            <p className="text-muted-foreground">
              Experience the transformation between themes
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Theme Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Light Theme
              </CardTitle>
              <CardDescription>
                Warm brown assessment system design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Professional, warm, and approachable design perfect for psychological assessments.
              </p>
            </CardContent>
          </Card>

          <Card className="card-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Dark Theme
              </CardTitle>
              <CardDescription>
                Standard dark mode for reduced eye strain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Classic dark theme with improved readability for extended use.
              </p>
            </CardContent>
          </Card>

          <Card className="card-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Futuristic Dark
              </CardTitle>
              <CardDescription>
                Cybernetic blueprint with glowing effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Modern, tech-centric design with cyan accents and glass effects.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Components Demo */}
        <Card className="glass-effect futuristic-dark:glass-effect card-glow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Interactive Components
            </CardTitle>
            <CardDescription>
              Test how components look and feel in different themes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buttons Demo */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Button Variants</Label>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="futuristic" className="futuristic-dark:inline-flex hidden">
                  Futuristic
                </Button>
              </div>
            </div>

            {/* Form Demo */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Form Elements</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Assessment Question Demo */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Assessment Question Example</Label>
              <Card className="p-4 border-primary/20">
                <h3 className="assessment-question mb-4">
                  When you're completely alone with no one to impress, who shows up? *
                </h3>
                <textarea 
                  className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none"
                  rows={3}
                  placeholder="Describe your authentic self when no one is watching..."
                />
                <div className="flex justify-between mt-4">
                  <Button variant="outline">← Previous</Button>
                  <Button variant="default">Continue →</Button>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Theme Features */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Theme Features</CardTitle>
            <CardDescription>
              What makes each theme special
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Accessibility</h4>
                <p className="text-sm text-muted-foreground">
                  All themes maintain WCAG 2.1 AA compliance with proper contrast ratios.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Smooth transitions and optimized rendering for all devices.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Consistency</h4>
                <p className="text-sm text-muted-foreground">
                  Unified design language across all components and pages.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThemeDemo;
