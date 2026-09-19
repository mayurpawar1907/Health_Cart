import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft, MapPin, Truck } from 'lucide-react';
import api, { unwrap } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { formatMoney } from '@/utils/utils';
import { BookTestTable } from '@/components/booking/BookTestTable';
import { BookPaymentPanel } from '@/components/booking/BookPaymentPanel';
import { PaymentDiscountBanner } from '@/components/brand/PaymentDiscountOffer';
const STEP_LABELS = ['Choose test', 'Schedule visit', 'Confirm & pay'];
export function BookAppointmentPage() {
    const [params] = useSearchParams();
    const preset = params.get('testId') ?? '';
    const user = useSelector((s) => s.auth.user);
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [step, setStep] = useState(preset ? 2 : 1);
    const [testId, setTestId] = useState(preset);
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [patientName, setPatientName] = useState(user.fullName);
    const [patientAge, setPatientAge] = useState('');
    const [familyMemberId, setFamilyMemberId] = useState('');
    const [collectionType] = useState('HOME');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [useWallet, setUseWallet] = useState(true);
    const [useReferral, setUseReferral] = useState(true);
    const [locationStatus, setLocationStatus] = useState('');
    const [serviceable, setServiceable] = useState(null);
    const [done, setDone] = useState(null);
    const profile = useQuery({
        queryKey: ['profile'],
        queryFn: async () => unwrap((await api.get('/users/profile')).data),
    });
    const family = useQuery({
        queryKey: ['family'],
        queryFn: async () => unwrap((await api.get('/family')).data),
    });
    const tests = useQuery({
        queryKey: ['tests', 'all'],
        queryFn: async () => unwrap((await api.get('/tests')).data),
        staleTime: 0,
        refetchOnMount: 'always',
    });
    const slots = useQuery({
        queryKey: ['slots', date],
        enabled: !!date,
        queryFn: async () => unwrap((await api.get('/appointments/slots', { params: { date } })).data),
    });
    const quote = useQuery({
        queryKey: ['quote', testId, useWallet, useReferral],
        enabled: !!testId,
        queryFn: async () => unwrap((await api.get('/appointments/quote', {
            params: { testId, useWallet: useWallet ? 'true' : 'false', useReferral: useReferral ? 'true' : 'false' },
        })).data),
    });
    const selected = tests.data?.find((t) => t.id === testId);
    const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const addr = profile.data?.addresses[0];
    const showAllSteps = step === 1 || !preset;
    const visibleSteps = showAllSteps ? STEP_LABELS : STEP_LABELS.slice(1);
    const visualStep = showAllSteps ? step : step - 1;
    const canSchedule = date && timeSlot && addr?.line1 && serviceable !== false;
    function stepFromVisibleIndex(idx) {
        return showAllSteps ? idx + 1 : idx + 2;
    }
    function canGoToStep(target) {
        if (target === 1)
            return true;
        if (target === 2)
            return !!testId;
        if (target === 3)
            return !!testId && !!canSchedule;
        return false;
    }
    function goToStep(target) {
        if (target < step) {
            setStep(target);
            return;
        }
        if (canGoToStep(target))
            setStep(target);
    }
    function selectTest(id) {
        setTestId(id);
        setStep(2);
    }
    useEffect(() => {
        if (profile.data?.dateOfBirth && !patientAge) {
            const dob = new Date(profile.data.dateOfBirth);
            const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 86400000));
            if (age > 0)
                setPatientAge(String(age));
        }
    }, [profile.data, patientAge]);
    useEffect(() => {
        if (addr?.pincode) {
            api.get('/appointments/serviceability', { params: { pincode: addr.pincode } }).then((res) => {
                const data = unwrap(res.data);
                setServiceable(data.serviceable);
                setLocationStatus(data.message);
            });
        }
    }, [addr?.pincode]);
    function useCurrentLocation() {
        if (!navigator.geolocation) {
            setLocationStatus('Update your address in Profile to enable home collection.');
            return;
        }
        setLocationStatus('Fetching location…');
        navigator.geolocation.getCurrentPosition(async (pos) => {
            await api.patch('/users/profile', {
                locationLat: pos.coords.latitude,
                locationLng: pos.coords.longitude,
                line1: addr?.line1,
                city: addr?.city,
                state: addr?.state,
                pincode: addr?.pincode,
            });
            setLocationStatus('Live location saved ✓ Phlebotomist can navigate to you.');
            qc.invalidateQueries({ queryKey: ['profile'] });
        }, () => setLocationStatus('Could not access location. Allow GPS or add address in Profile.'));
    }
    const book = useMutation({
        mutationFn: async () => unwrap((await api.post('/appointments', {
            testId,
            date,
            timeSlot,
            patientName,
            patientAge: patientAge ? Number(patientAge) : undefined,
            collectionType,
            addressId: addr?.id,
            familyMemberId: familyMemberId || undefined,
            deliveryAddress: addr ? `${addr.line1}, ${addr.city}, ${addr.state} - ${addr.pincode}` : undefined,
            latitude: profile.data?.profile?.locationLat ?? undefined,
            longitude: profile.data?.profile?.locationLng ?? undefined,
            paymentMethod,
            useWallet,
            useReferral,
            reminderEnabled: true,
        })).data),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['dashboard'] });
            qc.invalidateQueries({ queryKey: ['appointments'] });
            qc.invalidateQueries({ queryKey: ['reminders'] });
            qc.invalidateQueries({ queryKey: ['wallet'] });
            qc.invalidateQueries({ queryKey: ['quote'] });
            setDone(data);
        },
    });
    if (tests.isLoading || profile.isLoading)
        return <Loading label="Preparing booking"/>;
    if (done && selected) {
        return (<div className="mx-auto grid max-w-lg place-items-center py-8">
        <Card glass className="w-full p-8 text-center md:p-10">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal text-2xl text-white shadow-lg">✓</div>
          <h1 className="font-display text-3xl">You&apos;re all set!</h1>
          <p className="mt-2 text-ink-soft">Booking ID <strong>{done.code}</strong></p>
          <div className="mt-5 rounded-2xl bg-teal-light/60 p-4 text-left text-sm">
            <p className="font-medium">{selected.name}</p>
            <p className="mt-1 text-ink-soft">{date} · {timeSlot}</p>
            <p className="text-ink-soft">{patientName}{patientAge ? ` · ${patientAge} yrs` : ''}</p>
            <p className="mt-2 text-teal">Home collection · WhatsApp confirmation sent</p>
          </div>
          <div className="mt-6 grid gap-3">
            <Link to={`/appointments/${done.id}`}><Button className="w-full">View booking</Button></Link>
            <Link to="/home"><Button variant="secondary" className="w-full">Back to home</Button></Link>
          </div>
        </Card>
      </div>);
    }
    return (<div className="w-full space-y-5">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => (step > (preset ? 2 : 1) ? setStep(step - 1) : navigate(-1))} className="glass-panel rounded-2xl p-2.5 transition hover:bg-white">
          <ChevronLeft className="h-5 w-5"/>
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-teal">Smart booking</p>
          <h1 className="font-display text-2xl md:text-3xl">Home collection</h1>
        </div>
      </div>

      <PaymentDiscountBanner />

      <div className="glass-panel rounded-2xl p-4">
        <div className="flex gap-2 sm:gap-3">
          {visibleSteps.map((label, idx) => {
            const n = idx + 1;
            const targetStep = stepFromVisibleIndex(idx);
            const active = n <= visualStep;
            const current = n === visualStep;
            const reachable = targetStep <= step || canGoToStep(targetStep);
            return (<button key={label} type="button" disabled={!reachable} onClick={() => goToStep(targetStep)} className={`flex flex-1 items-center gap-2 rounded-xl px-1 py-1 text-left transition ${reachable ? 'cursor-pointer hover:bg-white/60' : 'cursor-not-allowed opacity-60'} ${current ? 'bg-white/50' : ''}`}>
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold transition ${active ? 'bg-ink text-white' : 'bg-line/60 text-ink-soft'} ${current ? 'ring-2 ring-teal/30 ring-offset-2' : ''}`}>
                  {n}
                </div>
                <p className={`hidden text-xs sm:block ${current ? 'font-bold text-ink' : 'text-ink-soft'}`}>{label}</p>
              </button>);
        })}
        </div>
      </div>

      {/* Step 1 — Test table */}
      {step === 1 && tests.data ? (<BookTestTable tests={tests.data} onSelect={selectTest}/>) : null}

      {/* Step 2 — Schedule + location */}
      {step === 2 && (<Card glass className="mx-auto w-full max-w-3xl space-y-5 p-5 md:p-6">
          {selected ? (<div className="rounded-2xl bg-teal-light/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Selected test</p>
              <p className="mt-1 font-display text-lg">{selected.name}</p>
              <p className="mt-1 text-sm text-ink-soft">
                MRP {formatMoney(Number(selected.price))} · Card discount applied at payment
              </p>
            </div>) : null}

          <div className="flex items-start gap-3 rounded-2xl border border-teal/20 bg-teal-light/30 p-4">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-teal"/>
            <div>
              <p className="font-semibold">Free home collection</p>
              <p className="text-sm text-ink-soft">A phlebotomist will visit your address</p>
            </div>
          </div>

          {addr ? (<div className="rounded-2xl border border-line/80 bg-white/80 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Collection address</p>
                  <p className="mt-1 text-sm font-medium">{addr.line1}, {addr.city} — {addr.pincode}</p>
                  {locationStatus ? <p className="mt-2 text-xs font-medium text-teal">{locationStatus}</p> : null}
                  {profile.data?.profile?.locationLat ? (<p className="mt-1 text-[10px] text-ink-soft">
                      GPS: {Number(profile.data.profile.locationLat).toFixed(4)}, {Number(profile.data.profile.locationLng).toFixed(4)}
                    </p>) : null}
                </div>
                <Link to="/profile" className="text-xs font-semibold text-teal hover:underline">Edit</Link>
              </div>
              <Button variant="secondary" size="sm" className="mt-3 rounded-xl" onClick={useCurrentLocation}>
                <MapPin className="mr-1.5 h-4 w-4"/> Share live location
              </Button>
            </div>) : (<div className="rounded-2xl border border-brand-red/30 bg-brand-red-light/30 p-4">
              <p className="font-semibold text-brand-red">Add your home address first</p>
              <p className="mt-1 text-sm text-ink-soft">We need this for home sample collection.</p>
              <Link to="/profile"><Button className="mt-3" size="sm">Add address</Button></Link>
            </div>)}

          <Input label="Preferred date" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)}/>

          {date ? (<div>
              <p className="mb-2 text-sm font-semibold">Preferred time</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {(slots.data?.slots ?? []).map((s) => (<button key={s} type="button" onClick={() => setTimeSlot(s)} className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${timeSlot === s ? 'border-teal bg-teal-light text-teal shadow-sm' : 'border-line hover:border-teal/40'}`}>
                    {s}
                  </button>))}
              </div>
            </div>) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button variant="secondary" className="w-full sm:flex-1" size="lg" onClick={() => goToStep(1)}>
              Back to tests
            </Button>
            <Button disabled={!canSchedule} className="w-full sm:flex-[2]" size="lg" onClick={() => goToStep(3)}>
              Continue to payment
            </Button>
          </div>
        </Card>)}

      {/* Step 3 — Patient + payment */}
      {step === 3 && quote.data && selected ? (<Card glass className="mx-auto w-full max-w-3xl space-y-5 p-5 md:p-6">
          <div className="rounded-2xl bg-teal-light/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Selected test</p>
            <p className="mt-1 font-display text-lg">{selected.name}</p>
            <p className="mt-1 text-sm text-ink-soft">
              MRP {formatMoney(Number(selected.price))} · Member rate & wallet on next step
            </p>
          </div>

          <div className="rounded-2xl border border-line/80 bg-white/80 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Patient details</p>
            <div className="mt-3 space-y-3">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink/80">Who is this test for?</span>
                <select className="w-full rounded-2xl border border-line/80 bg-white/90 px-4 py-3.5 text-sm font-medium shadow-sm outline-none focus:border-teal focus:shadow-[0_0_0_4px_rgba(26,77,109,0.08)]" value={familyMemberId} onChange={(e) => {
                setFamilyMemberId(e.target.value);
                const fm = family.data?.find((f) => f.id === e.target.value);
                if (fm) {
                    setPatientName(fm.name);
                    setPatientAge(String(fm.age ?? ''));
                }
                else {
                    setPatientName(user.fullName);
                }
            }}>
                  <option value="">Self — {user.fullName}</option>
                  {(family.data ?? []).map((f) => (<option key={f.id} value={f.id}>{f.name} ({f.relation})</option>))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Patient name" value={patientName} onChange={(e) => setPatientName(e.target.value)}/>
                <Input label="Age" value={patientAge} onChange={(e) => setPatientAge(e.target.value)}/>
              </div>
            </div>
          </div>

          <BookPaymentPanel selected={selected} quote={quote.data} date={date} timeSlot={timeSlot} patientName={patientName} addressLine={addr ? `${addr.line1}, ${addr.city} — ${addr.pincode}` : undefined} paymentMethod={paymentMethod} useWallet={useWallet} useReferral={useReferral} onUseWallet={setUseWallet} onUseReferral={setUseReferral} onPaymentMethod={setPaymentMethod} onConfirm={() => book.mutate()} isPending={book.isPending} error={!!book.error}/>

          <Button variant="secondary" className="w-full" size="lg" onClick={() => goToStep(2)}>
            Back to schedule
          </Button>
        </Card>) : null}
    </div>);
}
