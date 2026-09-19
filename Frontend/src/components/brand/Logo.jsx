import { cn } from '@/utils/utils';
export function Logo({ variant = 'full', onDark = false, className }) {
    if (variant === 'icon') {
        return (<img src="/brand/health-id-icon.png" alt="HealthID Card" className={cn('h-10 w-10 object-contain', className)}/>);
    }
    const logo = (<img src="/brand/health-id-logo.png" alt="HealthID Card — Care Beyond Borders" className={cn(variant === 'compact' ? 'h-10 w-auto max-w-[190px] object-contain' : 'h-14 w-auto max-w-[320px] object-contain', className)}/>);
    if (onDark) {
        return (<div className={cn('inline-flex rounded-2xl bg-white px-3 py-2 shadow-sm', className)}>
        {logo}
      </div>);
    }
    return logo;
}
export function LogoImage({ className }) {
    return <img src="/brand/health-id-logo.png" alt="HealthID Card" className={className}/>;
}
