import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);

        if (event.results[current].isFinal) {
          handleVoiceQuery(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: 'Error',
          description: 'Failed to recognize speech. Please try again.',
          variant: 'destructive',
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      toast({
        title: 'Not Supported',
        description: 'Speech recognition is not supported in this browser.',
        variant: 'destructive',
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: 'Listening...',
        description: 'Speak now to ask about nutrition or food health.',
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleVoiceQuery = async (query: string) => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setMessages(prev => [...prev, { role: 'user', content: query }]);

    try {
      const { data, error } = await supabase.functions.invoke('voice-assistant', {
        body: { query },
      });

      if (error) throw error;

      const answer = data.answer;
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      speakText(answer);
    } catch (error) {
      console.error('Error processing voice query:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your question. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Voice Nutrition Assistant</h2>
        
        <div className="flex justify-center gap-4 mb-6">
          <Button
            size="lg"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || isSpeaking}
            className={isListening ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-5 w-5" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" />
                Start Listening
              </>
            )}
          </Button>

          {isSpeaking && (
            <Button
              size="lg"
              variant="outline"
              onClick={stopSpeaking}
            >
              <Volume2 className="mr-2 h-5 w-5" />
              Stop Speaking
            </Button>
          )}
        </div>

        {isListening && transcript && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Listening...</p>
            <p className="text-foreground">{transcript}</p>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-muted-foreground">Processing your question...</span>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-8'
                  : 'bg-muted mr-8'
              }`}
            >
              <p className="text-sm font-semibold mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </p>
              <p className="text-sm">{message.content}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-muted">
        <p className="text-sm text-muted-foreground text-center">
          Click "Start Listening" and ask questions like:
          <br />
          "Is this food healthy?" • "What are the benefits of avocados?" • "Tell me about protein intake"
        </p>
      </Card>
    </div>
  );
};
