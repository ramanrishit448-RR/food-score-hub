import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface VoiceScannerProps {
  onBarcodeDetected: (barcode: string) => void;
}

const VoiceScanner = ({ onBarcodeDetected }: VoiceScannerProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Voice scanner active - say a barcode number");
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      // Extract numbers from speech (handling spoken digits)
      if (finalTranscript) {
        const spokenDigits = finalTranscript.toLowerCase()
          .replace(/zero/g, '0')
          .replace(/one/g, '1')
          .replace(/two/g, '2')
          .replace(/three/g, '3')
          .replace(/four/g, '4')
          .replace(/five/g, '5')
          .replace(/six/g, '6')
          .replace(/seven/g, '7')
          .replace(/eight/g, '8')
          .replace(/nine/g, '9');

        // Extract any sequence of digits (8-14 digits for valid barcodes)
        const barcodeMatch = spokenDigits.match(/\d{8,14}/);
        
        if (barcodeMatch) {
          const barcode = barcodeMatch[0];
          toast.success(`Barcode detected: ${barcode}`);
          onBarcodeDetected(barcode);
          stopListening();
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'no-speech') {
        toast.error("No speech detected. Please try again.");
      } else if (event.error === 'not-allowed') {
        toast.error("Microphone access denied");
      } else {
        toast.error("Voice recognition error");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onBarcodeDetected]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast.error("Failed to start voice scanner");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Check if speech recognition is supported
  const isSupported = !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;

  if (!isSupported) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        className="w-full gap-2"
      >
        {isListening ? (
          <>
            <MicOff className="h-5 w-5" />
            Stop Voice Scanner
          </>
        ) : (
          <>
            <Mic className="h-5 w-5" />
            Start Voice Scanner
          </>
        )}
      </Button>

      {isListening && (
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-medium mb-2">Listening... Say the barcode number:</p>
          <p className="text-lg text-muted-foreground italic">
            {transcript || "Waiting for speech..."}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Example: "three zero one seven six two zero four two two zero zero three"
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceScanner;
