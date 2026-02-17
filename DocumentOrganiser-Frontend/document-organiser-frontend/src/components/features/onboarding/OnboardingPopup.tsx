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

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome! Let’s personalize your experience</DialogTitle>
        </DialogHeader>
        {step === 1 && (
          <div>
            <p className="mb-2">Choose your profession:</p>
            <div className="grid gap-2">
              {professions.map((p: string) => (
                <Button
                  key={p}
                  variant={profession === p ? 'default' : 'outline'}
                  onClick={() => setProfession(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && profession && (
          <div>
            <p className="mb-2">Choose your subcategory:</p>
            <div className="grid gap-2">
              {getSubcategories(profession as string).map((s: string) => (
                <Button
                  key={s}
                  variant={subcategory === s ? 'default' : 'outline'}
                  onClick={() => setSubcategory(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}
        {step === 3 && subcategory && (
          <div>
            <p className="mb-2">Choose your specialization/interest:</p>
            <div className="grid gap-2">
              {getSpecializations(subcategory as string).map((s: string) => (
                <Button
                  key={s}
                  variant={specialization === s ? 'default' : 'outline'}
                  onClick={() => setSpecialization(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}
        <DialogFooter className="flex justify-between mt-4">
          <Button variant="ghost" onClick={handleSkip} type="button">
            Skip
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
              {step === 3 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
