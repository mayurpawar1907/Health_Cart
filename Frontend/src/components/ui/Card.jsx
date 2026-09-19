import { cn } from '@/utils/utils';
export function Card({ children, className, glass }) {
    return (<div className={cn(glass ? 'glass-panel rounded-3xl' : 'card-premium rounded-3xl', className)}>
      {children}
    </div>);
}
