
export const HeroSection = () => {
  return (
    <section className="max-w-4xl mx-auto px-8 py-32 bg-background transition-colors">
      <h1 className="text-6xl font-light mb-6 text-foreground tracking-tight leading-tight">
        Ideas
      </h1>
      <p className="text-xl text-muted-foreground mb-4 font-normal leading-relaxed max-w-2xl">
        Turn community noise into build-ready ideas
      </p>
      <p className="text-muted-foreground max-w-xl leading-relaxed font-light">
        We scan Reddit, Hacker News, and other communities to surface real problems 
        people are discussing.
      </p>
    </section>
  );
};
