import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { VoiceAssistant } from './VoiceAssistant';

export const FloatingVoiceAssistant = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full z-50 bg-gradient-to-br from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary/70 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.16)] transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-primary/20 hover:border-primary/30"
        >
          <Mic className="h-7 w-7 text-primary-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Voice Nutrition Assistant</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <VoiceAssistant />
        </div>
      </SheetContent>
    </Sheet>
  );
};
