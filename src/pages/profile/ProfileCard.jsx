import { GraduationCap, Pencil } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Card, { CardContent, CardFooter } from '../../components/ui/Card'
import Separator from '../../components/ui/Separator'
import SkillsList from './SkillsList'

export default function ProfileCard({ profile, onEdit }) {
  const { name, avatarUrl, university, major, bio, skills } = profile
  const affiliation = [university, major].filter(Boolean).join(' · ')

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar name={name} src={avatarUrl || undefined} size="lg" />
          <div className="flex min-w-0 flex-col gap-2">
            <h2>{name}</h2>
            {affiliation && (
              <p className="flex items-center justify-center gap-2 text-body-small text-muted-foreground sm:justify-start">
                <GraduationCap
                  className="h-(--icon-sm) w-(--icon-sm) shrink-0"
                  aria-hidden="true"
                />
                <span>{affiliation}</span>
              </p>
            )}
            {bio && <p className="max-w-prose">{bio}</p>}
          </div>
        </div>

        <Separator />

        <SkillsList skills={skills} />
      </CardContent>
      <CardFooter className="justify-center sm:justify-start">
        <Button onClick={onEdit}>
          <Pencil className="h-(--icon-sm) w-(--icon-sm)" aria-hidden="true" />
          Edit profile
        </Button>
      </CardFooter>
    </Card>
  )
}
