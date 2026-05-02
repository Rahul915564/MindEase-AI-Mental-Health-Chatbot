import { Link, Redirect } from "wouter";
import { Show } from "@clerk/react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Wind, Heart, Shield, Sparkles } from "lucide-react";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-50 border-b border-border/50">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Wind className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-xl">{t("MindEase")}</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/sign-in">
            <Button variant="ghost">{t("Sign In")}</Button>
          </Link>
          <Link href="/sign-up">
            <Button>{t("Sign Up")}</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          <div className="max-w-3xl space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center space-x-2 bg-muted px-4 py-2 rounded-full text-sm font-medium text-muted-foreground mx-auto">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{t("Your mental health companion")}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
              {t("peace of mind")} <br/>
              <span className="text-primary italic font-serif font-medium">every day</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("A warm digital sanctuary where you feel heard, supported, and gently guided toward wellbeing.")}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-lg shadow-primary/25">
                  {t("Start your journey")}
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto bg-background/50 backdrop-blur">
                  {t("Sign In")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-card">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4 text-center md:text-left">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Compassionate AI</h3>
              <p className="text-muted-foreground leading-relaxed">
                Chat with a gentle, understanding companion anytime you need someone to listen.
              </p>
            </div>
            <div className="space-y-4 text-center md:text-left">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                <Wind className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Guided Breathing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Calm your nervous system with beautiful, mesmerizing breathing exercises.
              </p>
            </div>
            <div className="space-y-4 text-center md:text-left">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Private & Secure</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your thoughts and feelings are yours alone. We keep your data safe and private.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
