
import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const EmailSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        // Using Formspree for email collection (free tier)
        const response = await fetch('https://formspree.io/f/xkgnpzqd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, source: 'problem-spark-engine' }),
        });
        
        if (response.ok) {
          setIsSubmitted(true);
          setTimeout(() => {
            setIsSubmitted(false);
            setEmail('');
          }, 3000);
        } else {
          console.error('Email signup failed');
        }
      } catch (error) {
        console.error('Email signup error:', error);
      }
    }
  };

  return (
    <section className="max-w-4xl mx-auto py-16 px-4 sm:px-6">
      <div className="text-center space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            Get notified of new ideas
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Join our community and be the first to discover fresh startup opportunities.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitted} className="flex items-center gap-2">
            {isSubmitted ? (
              <>
                <Mail className="h-4 w-4" />
                Subscribed!
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Subscribe
              </>
            )}
          </Button>
        </form>
        
        {isSubmitted && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Thanks for subscribing! You'll hear from us soon.
          </p>
        )}
      </div>
    </section>
  );
};
