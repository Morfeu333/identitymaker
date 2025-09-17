import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Mail, 
  Phone, 
  Calendar, 
  CheckSquare, 
  Upload,
  Star,
  Hash,
  MousePointer,
  Sparkles
} from "lucide-react";
// Updated to use new Unshakable Foundation logo

const HeroSection = () => {
  const formFields = [
    { icon: CheckSquare, label: "Scale Question", color: "text-primary" },
    { icon: CheckSquare, label: "Multiple Choice", color: "text-primary" },
    { icon: FileText, label: "Text Response", color: "text-primary" },
    { icon: Star, label: "Rating Scale", color: "text-primary" },
    { icon: FileText, label: "Pattern Analysis", color: "text-primary" },
    { icon: CheckSquare, label: "Identity Marker", color: "text-primary" },
    { icon: Star, label: "Foundation Pillar", color: "text-primary" },
    { icon: FileText, label: "Reflection Field", color: "text-primary" },
    { icon: CheckSquare, label: "Behavior Pattern", color: "text-primary" },
    { icon: Star, label: "Progress Tracker", color: "text-primary" },
  ];

  return (
    <section className="relative overflow-hidden bg-transparent">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="text-primary font-medium px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Identity Shift Blueprint Platform 🚀
              </Badge>

              <div className="flex justify-center lg:justify-start mb-6">
                <img
                  src="https://i.postimg.cc/bvZBJnWq/0143d2e4-4cb5-43f7-b3c0-b623cc1e3447.png"
                  alt="Unshakable Foundation - Identity Shift Blueprint"
                  className="w-48 h-auto rounded-lg shadow-lg"
                />
              </div>

              <h1 className="assessment-title text-4xl lg:text-6xl leading-tight">
                Build Your
                <span className="text-primary"> Unshakable Foundation</span> Today
              </h1>

              <p className="assessment-subtitle text-xl leading-relaxed">
                The comprehensive assessment platform for identifying identity patterns,
                breaking through growth barriers, and building an unshakable foundation
                for sustainable success and personal transformation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="assessment"
                size="lg"
                className="text-lg px-8 py-6 shadow-button-custom"
                onClick={() => window.location.href = '/cadastro'}
              >
                Start Assessment
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>1,247+ foundations built this month!</span>
              </div>
              <span>•</span>
              <span>Identity Shift Blueprint - Transform Your Success</span>
            </div>
          </div>

          {/* Right Content - Form Builder Preview - Assessment System Style */}
          <div className="relative">
            <Card className="assessment-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="assessment-title text-lg">Identity Collision Assessment</h3>
                  <p className="text-sm text-muted-foreground">15 questions</p>
                </div>
                <Button variant="outline" size="sm">Preview</Button>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {formFields.map((field, index) => (
                  <div
                    key={index}
                    className="form-field-animate bg-background border border-border rounded-lg p-3 cursor-pointer hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <field.icon className={`w-4 h-4 text-primary`} />
                      <span className="text-sm font-medium">{field.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Drop Zone */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-assessment-hover/30">
                <MousePointer className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Drag and drop assessment fields here
                </p>
              </div>
            </Card>

            {/* Floating Stats */}
            <div className="absolute -bottom-4 -right-4 bg-success text-success-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce-subtle">
              🎯 1,247+ foundations built!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;