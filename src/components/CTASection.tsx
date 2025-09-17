import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, Users, Zap } from "lucide-react";

const CTASection = () => {
  const benefits = [
    "Setup em menos de 5 minutos",
    "Suporte em português 24/7",
    "Integração com ferramentas brasileiras",
    "Conformidade total com LGPD",
    "Templates otimizados para Brasil",
    "Sem limite de formulários no plano gratuito"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-6">
        <Card className="max-w-4xl mx-auto bg-gradient-card border-form-field-border shadow-form overflow-hidden">
          <div className="p-12 text-center">
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Pronto para Revolucionar seus 
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Formulários?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Junte-se a milhares de empresas brasileiras que já transformaram 
                seus processos de coleta de dados
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">50.000+</span>
                </div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-success" />
                  <span className="text-2xl font-bold text-success">99.9%</span>
                </div>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-accent" />
                  <span className="text-2xl font-bold text-accent">24h</span>
                </div>
                <p className="text-sm text-muted-foreground">Suporte</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6 group">
                Começar Gratuitamente Agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Falar com Especialista
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              🇧🇷 Criado no Brasil, para o Brasil • Sem cartão de crédito • Cancele quando quiser
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CTASection;