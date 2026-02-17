import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { professions, getSubcategories, getSpecializations } from './onboardingData';

interface OnboardingPopupProps {
  open: boolean;
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

export interface OnboardingData {
  profession?: string;
  subcategory?: string;
  specialization?: string;
}

const TOTAL_STEPS = 3;

export function OnboardingPopup({ open, onComplete, onSkip }: OnboardingPopupProps) {
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState<string | undefined>();
  const [subcategory, setSubcategory] = useState<string | undefined>();
  const [specialization, setSpecialization] = useState<string | undefined>();

  const handleNext = () => {
    if (step === 1 && profession) setStep(2);
    else if (step === 2 && subcategory) setStep(3);
    else if (step === 3) onComplete({ profession, subcategory, specialization });
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSkip = () => {
    onSkip();
  };

  const stepTitles = [
    'What do you do?',
    'Narrow it down',
    'Your focus area',
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleSkip(); }}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Let&apos;s personalize your experience</DialogTitle>
          {/* Step progress indicator */}
          <div className="flex items-center gap-2 pt-3">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`h-1.5 w-full rounded-full transition-colors ${i + 1 <= step
                        ? 'bg-primary'
                        : 'bg-muted'
                      }`}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Step {step} of {TOTAL_STEPS} — {stepTitles[step - 1]}
          </p>
        </DialogHeader>

        {step === 1 && (
          <div>
            <p className="mb-2 font-medium">Choose your profession:</p>
            <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
              {professions.map((p: string) => (
                <Button
                  key={p}
                  variant={profession === p ? 'default' : 'outline'}
                  onClick={() => setProfession(p)}
                  className="justify-start"
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && profession && (
          <div>
            <p className="mb-2 font-medium">Choose your subcategory:</p>
            <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
              {getSubcategories(profession as string).map((s: string) => (
                <Button
                  key={s}
                  variant={subcategory === s ? 'default' : 'outline'}
                  onClick={() => setSubcategory(s)}
                  className="justify-start"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && subcategory && (
          <div>
            <p className="mb-2 font-medium">Choose your specialization:</p>
            <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
              {getSpecializations(subcategory as string).map((s: string) => (
                <Button
                  key={s}
                  variant={specialization === s ? 'default' : 'outline'}
                  onClick={() => setSpecialization(s)}
                  className="justify-start"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between mt-4">
          <Button variant="ghost" onClick={handleSkip} type="button" className="text-muted-foreground">
            Skip for now
          </Button>
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} type="button">
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              type="button"
              disabled={
                (step === 1 && !profession) ||
                (step === 2 && !subcategory) ||
                (step === 3 && !specialization)
              }
            >
              {step === 3 ? '🎉 Finish' : 'Next →'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
