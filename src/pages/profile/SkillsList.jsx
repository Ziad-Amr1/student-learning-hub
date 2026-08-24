import Badge from '../../components/ui/Badge'

export default function SkillsList({ skills }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-(--font-size-h4)">Skills</h3>
      {skills.length === 0 ? (
        <p className="text-body-small text-muted-foreground">No skills added yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li key={skill}>
              <Badge variant="secondary">{skill}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
