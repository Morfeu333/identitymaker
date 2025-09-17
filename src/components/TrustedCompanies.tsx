const TrustedCompanies = () => {
  const companies = [
    "Banco do Brasil",
    "Petrobras", 
    "Vale",
    "Itaú",
    "Magazine Luiza",
    "Ambev",
    "JBS",
    "Embraer"
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            Empresas Brasileiras que Confiam no FormFácil BR
          </h2>
          <p className="text-muted-foreground">
            Junte-se a centenas de empresas que já transformaram seus processos
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
          {companies.map((company, index) => (
            <div
              key={index}
              className="text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {company}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
            Mais de 50.000 formulários criados no Brasil
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedCompanies;