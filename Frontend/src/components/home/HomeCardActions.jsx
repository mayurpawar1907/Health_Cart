import { Link } from 'react-router-dom';
import { MapPin, Pencil, Printer, RotateCcw, Share2, Users } from 'lucide-react';
import { formatDate } from '@/utils/utils';
function ToolbarBtn({ label, icon: Icon, onClick, highlight, }) {
    return (<button type="button" onClick={onClick} className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold transition ${highlight
            ? 'bg-teal text-white shadow-sm hover:brightness-110'
            : 'border border-line/70 bg-white text-ink hover:border-teal/30 hover:bg-teal-light/20'}`}>
      <Icon className="h-4 w-4 shrink-0"/>
      <span className="hidden sm:inline">{label}</span>
    </button>);
}
export function HomeCardActions({ cardData, flipped, onFlip, onEdit, hasAddress }) {
    return (<div className="mx-auto w-full max-w-[400px] space-y-4">
      {/* Quick actions toolbar */}
      <div className="flex gap-2">
        <ToolbarBtn label={flipped ? 'Front' : 'Flip card'} icon={RotateCcw} onClick={onFlip}/>
        <ToolbarBtn label="Edit" icon={Pencil} onClick={onEdit} highlight/>
        <ToolbarBtn label="Share" icon={Share2} onClick={() => navigator.share?.({ title: 'HealthID Card', text: `${cardData.memberName} · ${cardData.membershipId}` }).catch(() => navigator.clipboard.writeText(cardData.membershipId))}/>
        <ToolbarBtn label="Print" icon={Printer} onClick={() => window.print()}/>
      </div>

      {/* Compact membership facts */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line/70 bg-white px-3 py-1.5 text-xs font-medium text-ink">
          Valid till {formatDate(cardData.validUntil)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line/70 bg-white px-3 py-1.5 text-xs font-medium text-ink">
          <Users className="h-3.5 w-3.5 text-teal"/>
          {cardData.familyMembers.length || 1} family
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line/70 bg-white px-3 py-1.5 font-mono text-[11px] text-ink-soft">
          {cardData.membershipId}
        </span>
      </div>

      {!hasAddress ? (<Link to="/profile" className="flex items-center gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 transition hover:bg-amber-100/70">
          <MapPin className="h-4 w-4 shrink-0 text-amber-700"/>
          <span>
            <span className="block font-semibold">Add home address</span>
            <span className="text-xs font-normal text-amber-800/80">Required for sample collection booking</span>
          </span>
        </Link>) : null}
    </div>);
}
