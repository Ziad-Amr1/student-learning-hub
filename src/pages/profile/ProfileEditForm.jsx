import { useState } from 'react'
import Button from '../../components/ui/Button'
import Card, {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'

export default function ProfileEditForm({ profile, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    name: profile.name ?? '',
    university: profile.university ?? '',
    major: profile.major ?? '',
    bio: profile.bio ?? '',
    skills: profile.skills.join(', '),
  }))
  const [nameError, setNameError] = useState('')

  const setField = (field) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'name' && nameError) setNameError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const name = form.name.trim()
    if (!name) {
      setNameError('Name is required.')
      return
    }

    onSave({
      ...profile,
      name,
      university: form.university.trim(),
      major: form.major.trim(),
      bio: form.bio.trim(),
      skills: [
        ...new Set(
          form.skills
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean),
        ),
      ],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit profile</CardTitle>
        <CardDescription>
          Make your changes, then save to update your profile.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-1 flex-col gap-4"
      >
        <CardContent className="flex flex-col gap-4">
          <Input
            label="Name"
            value={form.name}
            onChange={setField('name')}
            error={nameError}
            required
            autoFocus
            autoComplete="name"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="University"
              value={form.university}
              onChange={setField('university')}
              placeholder="e.g. Cairo University"
            />
            <Input
              label="Major"
              value={form.major}
              onChange={setField('major')}
              placeholder="e.g. Computer Science"
            />
          </div>
          <Textarea
            label="Bio"
            value={form.bio}
            onChange={setField('bio')}
            rows={4}
            placeholder="A line or two about you and what you're learning…"
          />
          <Input
            label="Skills (comma-separated)"
            value={form.skills}
            onChange={setField('skills')}
            placeholder="React, JavaScript, CSS"
          />
        </CardContent>
        <CardFooter className="gap-3">
          <Button type="submit">Save changes</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
