import { cn } from '@/utils/utils';
/** Vector brand assets — full lockup and figure-only mark. */
const LOGO_SRC = '/brand/health-id-logo.svg';
const MARK_SRC = '/brand/health-id-mark.svg';
export function Logo({ variant = 'full', onDark = false, className }) {
    if (variant === 'icon') {
        return (<img src={MARK_SRC} alt="HealthID Card" width={40} height={40} className={cn('h-10 w-10 object-contain', className)}/>);
    }
    const logo = (<img src={LOGO_SRC} alt="HealthID Card — Care Beyond Borders" className={cn(variant === 'compact' ? 'h-10 w-auto max-w-[190px] object-contain' : 'h-14 w-auto max-w-[320px] object-contain', className)}/>);
    if (onDark) {
        return (<div className={cn('inline-flex rounded-2xl bg-white px-3 py-2 shadow-sm', className)}>
        {logo}
      </div>);
    }
    return logo;
}
export function LogoImage({ className }) {
    return <img src={LOGO_SRC} alt="HealthID Card" className={className}/>;
}
