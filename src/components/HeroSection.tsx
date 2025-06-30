
export const HeroSection = () => {
  return <section className="max-w-4xl mx-auto py-20 bg-background transition-colors px-[24px]">
      <div className="space-y-6">
        <h1 className="text-5xl font-medium mb-4 text-foreground tracking-tight">
          Ideas
        </h1>
        <p className="text-xl text-muted-foreground mb-3 font-normal leading-relaxed max-w-2xl">
          Turn community noise into build-ready ideas
        </p>
        <p className="text-muted-foreground max-w-xl leading-relaxed">
          We scan Reddit, Hacker News, and other communities to surface real problems 
          people are discussing.
        </p>
      </div>
    </section>;
};
