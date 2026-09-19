import { FileSearch } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({ title, body, action }: { title: string; body: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <FileSearch className="mb-4 h-10 w-10 text-teal" />
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-ink-soft">{body}</p>
      {action ? (
        <Button className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}
