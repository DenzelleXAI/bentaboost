import { AppShell } from "@/components/Shell";
import { SettingsClient } from "@/components/SettingsClient";
import { getFacebookSettings } from "@/lib/facebook";

export default async function SettingsPage() {
  const settings = await getFacebookSettings();
  return <AppShell><SettingsClient {...settings} /></AppShell>;
}
