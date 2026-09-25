import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import ErrorBanner from '../components/ui/ErrorBanner'
import { useProfile } from '../hooks/useProfile'
import LearningProgressList from './profile/LearningProgressList'
import ProfileCard from './profile/ProfileCard'
import ProfileEditForm from './profile/ProfileEditForm'

export default function Profile() {
  const { profile, loading, error, save, refresh } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleSave = async (nextProfile) => {
    try {
      await save(nextProfile)
      setIsEditing(false)
    } catch (err) {
      setSaveError(err.message || 'Could not save your profile.')
    }
  }

  return (
    <article>
      <div className="flex flex-col gap-(--layout-section-gap)">
        <div className="flex flex-col gap-(--space-6)">
          <PageHeader
            title="Profile"
            description="Your personal learning profile."
          />
          {error ? (
            <ErrorBanner
              message={`We couldn't load your profile. ${error} — make sure the Huby backend is running.`}
              onRetry={refresh}
            />
          ) : !profile || loading ? (
            <p className="text-body-small text-muted-foreground">Loading profile…</p>
          ) : (
            <div className="flex flex-col gap-(--space-6)">
              {saveError && (
                <p role="alert" className="text-body-small text-destructive-strong">
                  {saveError}
                </p>
              )}
              {isEditing ? (
                <ProfileEditForm
                  profile={profile}
                  onSave={handleSave}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <ProfileCard
                  profile={profile}
                  onEdit={() => setIsEditing(true)}
                />
              )}
            </div>
          )}
        </div>
        <LearningProgressList />
      </div>
    </article>
  )
}
