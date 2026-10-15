import { Check, Plus } from 'lucide-react'
import { useState, type FormEvent, type KeyboardEvent } from 'react'

import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Tag } from '@/shared/ui/tag'

const initialSkills = ['Python', 'FastAPI', 'PostgreSQL', 'Docker']

export function ProfileForm() {
  const [skills, setSkills] = useState(initialSkills)
  const [skillInput, setSkillInput] = useState('')
  const [saved, setSaved] = useState(false)

  function addSkill(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    const value = skillInput.trim()
    if (!value || skills.includes(value)) return
    setSkills((current) => [...current, value])
    setSkillInput('')
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form className="grid gap-4" onSubmit={saveProfile}>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Основные данные</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Эти данные можно использовать при создании новой визитки.
            </p>
          </div>
          <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
            Черновик
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field defaultValue="Марк" id="first-name" label="Имя" required />
          <Field defaultValue="Соколов" id="last-name" label="Фамилия" required />
          <Field
            defaultValue="mark.sokolov@example.ru"
            id="email"
            label="Электронная почта"
            required
            type="email"
          />
          <Field
            defaultValue="+7 900 123-45-67"
            id="phone"
            label="Телефон"
            type="tel"
          />
          <Field
            defaultValue="Бэкенд-разработчик"
            id="profile-specialty"
            label="Специальность"
          />
          <Field
            defaultValue="Junior Python Developer"
            id="profile-role"
            label="Желаемая должность"
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-base font-semibold">Навыки</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Добавьте технологии, которые хотите показывать работодателям.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Tag
              key={skill}
              onRemove={() =>
                setSkills((current) => current.filter((item) => item !== skill))
              }
            >
              {skill}
            </Tag>
          ))}
        </div>
        <div className="mt-3 flex max-w-sm gap-2">
          <label className="sr-only" htmlFor="profile-skill">
            Новый навык
          </label>
          <input
            className="h-10 min-w-0 flex-1 rounded-md border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            id="profile-skill"
            onChange={(event) => setSkillInput(event.target.value)}
            onKeyDown={addSkill}
            placeholder="Например, Redis"
            value={skillInput}
          />
          <Button
            aria-label="Добавить навык"
            disabled={!skillInput.trim()}
            onClick={() => {
              const value = skillInput.trim()
              if (!value || skills.includes(value)) return
              setSkills((current) => [...current, value])
              setSkillInput('')
            }}
            size="icon"
            type="button"
          >
            <Plus aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <p className="min-h-5 text-xs text-muted-foreground" aria-live="polite">
          {saved ? (
            <span className="inline-flex items-center gap-1">
              <Check aria-hidden="true" className="size-4 text-primary" />
              Изменения сохранены
            </span>
          ) : null}
        </p>
        <Button type="submit">Сохранить изменения</Button>
      </div>
    </form>
  )
}
