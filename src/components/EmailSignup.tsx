
import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const EmailSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Email signup:', email);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section id="digest" className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <div className="mb-8">
            <h2 className="text-3xl font-normal text-gray-900 mb-4">
              Weekly Problem Digest
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Get the top 10 build-ready ideas delivered to your inbox every Monday. 
              Curated, processed, and ready for execution.
            </p>
          </div>

          {isSubmitted ? (
            <div className="py-8">
              <div className="flex items-center gap-3 text-green-700 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Send className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium">You're all set!</h3>
              </div>
              <p className="text-gray-600">
                We'll send you the best startup ideas every Monday morning.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md">
              <Input
                type="email"
                placeholder="your.email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900"
                required
              />
              <Button 
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white border-0"
              >
                Subscribe
              </Button>
            </form>
          )}

          <div className="flex items-center gap-6 mt-6 text-xs text-gray-500">
            <span>📧 Weekly delivery</span>
            <span>🚫 No spam ever</span>
            <span>⚡ Unsubscribe anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};
