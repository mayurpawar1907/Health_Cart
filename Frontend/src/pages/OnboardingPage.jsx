import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/brand/Logo';
const slides = [
    { title: 'Book lab tests at home', body: 'Choose a test, pick a time, and a phlebotomist visits your doorstep.' },
    { title: 'Get your free HealthID Card', body: '1-year family membership with flat 30% off every test and package.' },
    { title: 'Reports on WhatsApp', body: 'Digital reports in your account, plus reminders and updates on WhatsApp.' },
];
export function OnboardingPage() {
    const [i, setI] = useState(0);
    const navigate = useNavigate();
    const last = i === slides.length - 1;
    function finish() {
        localStorage.setItem('hc_onboarded', '1');
        navigate('/');
    }
    return (<div className="flex h-screen w-screen flex-col justify-between bg-cream px-8 py-10 lg:px-24">
      <div className="flex items-center justify-between">
        <Logo variant="compact" className="max-w-[200px]"/>
        <button className="text-sm text-ink-soft" onClick={finish}>Skip</button>
      </div>
      <div>
        <div className="mb-8 h-64 w-full rounded-[32px] bg-gradient-to-br from-teal to-brand-red"/>
        <h1 className="font-display text-4xl">{slides[i].title}</h1>
        <p className="mt-4 text-ink-soft">{slides[i].body}</p>
      </div>
      <div>
        <div className="mb-6 flex gap-2">
          {slides.map((_, idx) => (<span key={idx} className={`h-1.5 flex-1 rounded-full ${idx <= i ? 'bg-brand-red' : 'bg-line'}`}/>))}
        </div>
        <Button className="w-full" size="lg" onClick={() => (last ? finish() : setI(i + 1))}>
          {last ? 'Get Started' : 'Next'}
        </Button>
      </div>
    </div>);
}
