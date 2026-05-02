import { AppLayout } from "@/components/layout";
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Wind } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ExerciseType = 'box' | '478' | 'belly' | 'alternate';

interface Exercise {
  id: ExerciseType;
  name: string;
  description: string;
  phases: { name: string; duration: number }[];
}

const exercises: Exercise[] = [
  {
    id: 'box',
    name: "Box Breathing (4-4-4-4)",
    description: "Helps clear your mind, relax your body, and improve focus.",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Hold", duration: 4 },
      { name: "Exhale", duration: 4 },
      { name: "Hold", duration: 4 },
    ]
  },
  {
    id: '478',
    name: "4-7-8 Breathing",
    description: "A natural tranquilizer for the nervous system. Great for sleep.",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Hold", duration: 7 },
      { name: "Exhale", duration: 8 },
    ]
  },
  {
    id: 'belly',
    name: "Belly Breathing (5-5)",
    description: "Deep diaphragmatic breathing to reduce stress.",
    phases: [
      { name: "Inhale", duration: 5 },
      { name: "Exhale", duration: 5 },
    ]
  },
  {
    id: 'alternate',
    name: "Alternate Nostril (4-4-8)",
    description: "Balances both sides of the brain and calms the mind.",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Hold", duration: 4 },
      { name: "Exhale", duration: 8 },
    ]
  }
];

export default function Breathing() {
  const { t } = useLanguage();
  const [activeEx, setActiveEx] = useState<Exercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isActive && activeEx) {
      if (timeLeft <= 0) {
        const nextPhase = (phaseIndex + 1) % activeEx.phases.length;
        setPhaseIndex(nextPhase);
        setTimeLeft(activeEx.phases[nextPhase].duration);
      } else {
        timer = setTimeout(() => {
          setTimeLeft(prev => prev - 1);
        }, 1000);
      }
    }

    return () => clearTimeout(timer);
  }, [isActive, timeLeft, activeEx, phaseIndex]);

  const startExercise = (ex: Exercise) => {
    setActiveEx(ex);
    setPhaseIndex(0);
    setTimeLeft(ex.phases[0].duration);
    setIsActive(true);
  };

  const stopExercise = () => {
    setIsActive(false);
    setActiveEx(null);
  };

  const renderAnimation = () => {
    if (!activeEx) return null;

    const currentPhase = activeEx.phases[phaseIndex].name;
    
    // Different visual treatments based on exercise
    if (activeEx.id === 'box') {
      return (
        <div className="relative w-64 h-64 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 border-4 border-primary rounded-xl"
            animate={{
              scale: currentPhase === "Inhale" ? 1.2 : currentPhase === "Exhale" ? 0.8 : currentPhase === "Hold" ? (phaseIndex === 1 ? 1.2 : 0.8) : 1,
              opacity: currentPhase === "Hold" ? 0.5 : 1
            }}
            transition={{ duration: activeEx.phases[phaseIndex].duration, ease: "linear" }}
          />
          <div className="text-center z-10">
            <h3 className="text-2xl font-bold text-primary">{t(currentPhase)}</h3>
            <p className="text-4xl font-light text-primary/70">{timeLeft}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-64 h-64 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 bg-primary/20 rounded-full"
          animate={{
            scale: currentPhase === "Inhale" ? 1.5 : currentPhase === "Exhale" ? 0.8 : currentPhase === "Hold" ? 1.5 : 1,
          }}
          transition={{ duration: activeEx.phases[phaseIndex].duration, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-4 bg-primary/30 rounded-full"
          animate={{
            scale: currentPhase === "Inhale" ? 1.3 : currentPhase === "Exhale" ? 0.9 : currentPhase === "Hold" ? 1.3 : 1,
          }}
          transition={{ duration: activeEx.phases[phaseIndex].duration, ease: "easeInOut" }}
        />
        <div className="text-center z-10 bg-background/50 backdrop-blur-md h-32 w-32 rounded-full flex flex-col items-center justify-center shadow-lg border border-primary/20">
          <h3 className="text-xl font-bold text-foreground">{t(currentPhase)}</h3>
          <p className="text-3xl font-light text-primary">{timeLeft}</p>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t("Breathing")}</h1>
          <p className="text-muted-foreground">{t("Find your center with guided breathing exercises.")}</p>
        </div>

        <AnimatePresence mode="wait">
          {isActive && activeEx ? (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border/50 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[500px] shadow-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none" />
              
              <h2 className="text-2xl font-semibold mb-12 relative z-10">{t(activeEx.name)}</h2>
              
              <div className="flex-1 flex items-center justify-center mb-12">
                {renderAnimation()}
              </div>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={stopExercise}
                className="rounded-full px-8 relative z-10"
              >
                <Square className="h-4 w-4 mr-2" /> Stop Exercise
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {exercises.map(ex => (
                <Card key={ex.id} className="shadow-sm border-border/50 overflow-hidden group hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                          <Wind className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{t(ex.name)}</h3>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            {ex.description}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="icon" 
                        className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => startExercise(ex)}
                      >
                        <Play className="h-5 w-5 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
