import PageHeader from '../components/layout/PageHeader'
import { LEARNING_PROGRESS } from '../data/progress'
import { profileSeed } from '../data/profile'
import LearningProgressList from './profile/LearningProgressList'
import ProfileCard from './profile/ProfileCard'

export default function Profile() {
  return (
    <article>
      <PageHeader
        title="Profile"
        description="Your personal learning profile."
      />
      <div className="flex flex-col gap-(--layout-section-gap)">
        <ProfileCard profile={profileSeed} />
        <LearningProgressList items={LEARNING_PROGRESS} />
      </div>
    </article>
  )
}
