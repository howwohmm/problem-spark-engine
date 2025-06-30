
export const HeroSection = () => {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20 bg-background transition-colors">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-medium mb-4 text-foreground tracking-tight">
          Ideas
        </h1>
        <p className="text-xl text-muted-foreground mb-3 font-normal leading-relaxed max-w-2xl mx-auto">
          Turn community noise into build-ready ideas
        </p>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          We scan Reddit, Hacker News, and other communities to surface real problems 
          people are discussing.
        </p>
      </div>
    </section>
  );
};
