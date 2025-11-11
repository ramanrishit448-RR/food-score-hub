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
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        >
          <Mic className="h-6 w-6" />
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
