
import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const EmailSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // For MVP, just simulate success
      console.log('Email signup:', email);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section id="digest" className="px-6 py-16 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-gray-900" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-100">
              Weekly Problem Digest
            </CardTitle>
            <p className="text-gray-400 mt-2">
              Get the top 10 build-ready ideas delivered to your inbox every Monday. 
              Curated, processed, and ready for execution.
            </p>
          </CardHeader>

          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">You're all set!</h3>
                <p className="text-gray-400">
                  We'll send you the best startup ideas every Monday morning.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="your.email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400"
                  required
                />
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </form>
            )}

            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-500">
              <span>📧 Weekly delivery</span>
              <span>🚫 No spam ever</span>
              <span>⚡ Unsubscribe anytime</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
