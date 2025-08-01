import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner = ({ className = '', size = 'md' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

export const LoadingCard = () => (
  <div className="py-6 sm:py-8 border-b border-border last:border-b-0 animate-pulse">
    <div className="flex gap-3 sm:gap-6 items-start">
      <div className="hidden sm:block w-16 flex-shrink-0">
        <div className="h-4 bg-muted rounded w-12"></div>
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        <div className="h-6 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="h-8 w-8 bg-muted rounded"></div>
        <div className="h-8 w-8 bg-muted rounded"></div>
      </div>
    </div>
  </div>
);

export const LoadingPage = () => (
  <div className="min-h-screen bg-background">
    <div className="w-full px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-none animate-pulse">
        <div className="h-12 bg-muted rounded w-48 mb-4"></div>
        <div className="h-6 bg-muted rounded w-96 mb-4"></div>
        <div className="h-5 bg-muted rounded w-72"></div>
      </div>
    </div>
    
    <section className="w-full px-4 sm:px-6 py-6 sm:py-8 bg-background border-t border-border">
      <div className="w-full space-y-4 sm:space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="h-10 bg-muted rounded w-80"></div>
          <div className="h-10 bg-muted rounded w-24"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-muted rounded w-32"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </div>
      </div>
    </section>
    
    <div className="w-full px-4 sm:px-6 space-y-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  </div>
);