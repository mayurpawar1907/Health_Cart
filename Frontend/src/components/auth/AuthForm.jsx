import { cn } from '@/utils/utils'

/** Shared spacing for login, signup, and password forms */
export function AuthForm({ children, className, ...props }) {
  return (
    <form className={cn('space-y-4', className)} {...props}>
      {children}
    </form>
  )
}

export function AuthFormSection({ title, children, divided = false, className }) {
  return (
    <fieldset className={cn('space-y-3', divided && 'border-t border-line/50 pt-4', className)}>
      {title ? (
        <legend className="mb-0.5 block w-full text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
          {title}
        </legend>
      ) : null}
      {children}
    </fieldset>
  )
}

export function AuthFormRow({ children, className }) {
  return <div className={cn('grid gap-3 sm:grid-cols-2', className)}>{children}</div>
}

export function AuthFormFooter({ children, className }) {
  return <p className={cn('mt-4 text-center text-sm text-ink-soft', className)}>{children}</p>
}
