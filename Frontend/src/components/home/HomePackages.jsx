import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useHealthPackages } from '@/hooks/useHealthPackages';
import { PackageCard } from './PackageCard';
import { Loading } from '@/components/ui/Loading';
import { usePlatformPricing } from '@/hooks/usePlatformPricing';
import { PaymentDiscountBadge } from '@/components/brand/PaymentDiscountOffer';
export function HomePackages() {
    const packages = useHealthPackages();
    const { activePercent, isPromoActive } = usePlatformPricing();
    if (packages.isLoading)
        return <Loading label="Loading health packages"/>;
    const list = packages.data ?? [];
    if (!list.length)
        return null;
    return (<section aria-labelledby="home-packages-heading">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="home-packages-heading" className="font-display text-xl text-ink md:text-2xl">
            Diagnostic packages
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {list.length} packages
            {isPromoActive ? ` · Extra ${activePercent}% off at payment` : ''}
            {' '}· Free home collection
          </p>
          <div className="mt-2">
            <PaymentDiscountBadge size="sm"/>
          </div>
        </div>
        <Link to="/tests?packages=true" className="flex items-center gap-0.5 text-sm font-semibold text-teal hover:underline">
          All {list.length} packages <ChevronRight className="h-4 w-4"/>
        </Link>
      </div>
      <div className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 scroll-smooth [scrollbar-width:thin]">
        {list.map((pkg, i) => (<div key={pkg.id} className="snap-start">
            <PackageCard pkg={pkg} compact showIncluded/>
          </div>))}
      </div>
    </section>);
}
