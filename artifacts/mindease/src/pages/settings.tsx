import { AppLayout } from "@/components/layout";
import { useLanguage } from "@/components/language-provider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Globe, User as UserIcon } from "lucide-react";

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t("Settings")}</h1>
          <p className="text-muted-foreground text-lg">Manage your preferences and account.</p>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-muted">
                  <img src={user?.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-medium text-lg">{user?.fullName}</p>
                  <p className="text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {t("Language")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="language-select" className="text-base flex flex-col gap-1">
                  <span>Display Language</span>
                  <span className="text-sm font-normal text-muted-foreground">Choose your preferred language</span>
                </Label>
                <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "hi")}>
                  <SelectTrigger id="language-select" className="w-[180px]">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="text-base flex flex-col gap-1">
                  <span>{t("Dark Mode")}</span>
                  <span className="text-sm font-normal text-muted-foreground">Toggle dark theme on or off</span>
                </Label>
                <Switch 
                  id="dark-mode" 
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
