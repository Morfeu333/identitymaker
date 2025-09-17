import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MousePointer, 
  Brain, 
  BarChart3, 
  GitBranch, 
  Palette, 
  Share2,
  Shield,
  Zap,
  Globe
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: MousePointer,
      title: "Drag & Drop Assessment Builder",
      description: "Create identity assessments effortlessly with our intuitive interface. No technical knowledge required.",
      color: "text-primary"
    },
    {
      icon: Brain,
      title: "AI-Powered Pattern Recognition",
      description: "Generate personalized insights and pattern analysis in seconds with specialized identity transformation algorithms.",
      color: "text-primary"
    },
    {
      icon: BarChart3,
      title: "Foundation Analytics",
      description: "Get detailed insights into foundation strength, identity patterns, and transformation progress with comprehensive metrics.",
      color: "text-primary"
    },
    {
      icon: GitBranch,
      title: "Adaptive Assessment Logic",
      description: "Build dynamic assessments that adapt to individual identity patterns and transformation stages.",
      color: "text-primary"
    },
    {
      icon: Palette,
      title: "Professional Themes",
      description: "Customize with Identity Shift Blueprint branding using exclusive themes for a professional assessment experience.",
      color: "text-primary"
    },
    {
      icon: Share2,
      title: "Easy Distribution",
      description: "Share assessments via QR code, direct link, or embed in coaching platforms and transformation programs.",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Fully compliant with privacy standards and enterprise requirements. Confidential identity data protected.",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Platform Integrations",
      description: "Connect with coaching tools, CRM systems, and transformation platforms for seamless workflow integration.",
      color: "text-primary"
    },
    {
      icon: Globe,
      title: "Identity Transformation Focus",
      description: "Specialized methodology for identity pattern recognition and foundation building with proven transformation metrics.",
      color: "text-primary"
    }
  ];

  return (
    <section id="recursos" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="assessment-title text-3xl lg:text-4xl mb-4">
            Powerful Tools For
            <span className="text-primary"> Foundation Building</span>
          </h2>
          <p className="assessment-subtitle text-xl max-w-3xl mx-auto">
            Everything you need to create, manage and analyze specialized assessments
            for identity transformation and building an unshakable foundation for success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-form transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-form-field-border">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground mb-4">
            Built specifically for the Identity Shift Blueprint - Unshakable Foundation Platform
          </p>
          <div className="flex justify-center">
            <div className="bg-primary w-24 h-1 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;