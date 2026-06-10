import { ProfileForm } from "@/components/settings/profile-form"
import { PreferencesForm } from "@/components/settings/preferences-form"
import { BYOKSection } from "@/components/settings/byok-section"
import { ApiKeysSection } from "@/components/settings/api-keys-section"

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-2xl">
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage your profile and preferences
        </p>
      </div>
      <ProfileForm />
      <PreferencesForm />
      <BYOKSection />
      <ApiKeysSection />
    </div>
  )
}
