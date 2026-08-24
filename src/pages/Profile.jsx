import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import { LEARNING_PROGRESS } from '../data/progress'
import { profileSeed } from '../data/profile'
import LearningProgressList from './profile/LearningProgressList'
import ProfileCard from './profile/ProfileCard'
import ProfileEditForm from './profile/ProfileEditForm'

export default function Profile() {
  const [profile, setProfile] = useState(profileSeed)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = (nextProfile) => {
    setProfile(nextProfile)
    setIsEditing(false)
  }

  return (
    <article>
      <PageHeader
        title="Profile"
        description="Your personal learning profile."
      />
      <div className="flex flex-col gap-(--layout-section-gap)">
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
        <LearningProgressList items={LEARNING_PROGRESS} />
      </div>
    </article>
  )
}
