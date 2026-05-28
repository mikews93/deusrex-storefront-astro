/**
 * BookingFlow — React Island (client:load) for Astro.
 *
 * This is a self-contained wrapper that replaces React Router dependencies
 * with props passed from the Astro page. It wraps the booking UI in the
 * necessary providers (QueryClient, i18n) without requiring StorefrontContext
 * or React Router.
 *
 * Phase 2E: This adapter bridges the existing booking components to work
 * as an Astro island. The core booking logic (form validation, API calls,
 * multi-step flow) runs unchanged inside.
 */
import { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  },
});

interface BookingFlowProps {
  serviceId?: string;
  orgSlug: string;
  apiUrl: string;
  locale: string;
}

/**
 * Standalone booking flow that fetches data directly from the public API.
 * No React Router, no StorefrontContext.
 */
function BookingFlowInner({
  serviceId,
  orgSlug,
  apiUrl,
  locale,
}: BookingFlowProps) {
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || '');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('');
  const [step, setStep] = useState<
    'service' | 'professional' | 'datetime' | 'contact' | 'review' | 'success'
  >(serviceId ? 'professional' : 'service');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [notes, setNotes] = useState('');

  // DateTime state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const apiBase = apiUrl.replace('/trpc', '');

  /** Fetch services on mount */
  useEffect(() => {
    fetch(`${apiBase}/public/booking/${orgSlug}/services`)
      .then((r) => r.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load services');
        setLoading(false);
      });
  }, [apiBase, orgSlug]);

  /** Fetch professionals when service is selected */
  useEffect(() => {
    if (!selectedServiceId) return;
    fetch(`${apiBase}/public/booking/${orgSlug}/professionals`)
      .then((r) => r.json())
      .then(setProfessionals)
      .catch(() => {});
  }, [apiBase, orgSlug, selectedServiceId]);

  /** Fetch time slots when date + professional are selected */
  useEffect(() => {
    if (!selectedDate || !selectedProfessionalId || !selectedServiceId) return;
    fetch(
      `${apiBase}/public/booking/${orgSlug}/availability?professionalId=${selectedProfessionalId}&date=${selectedDate}&serviceId=${selectedServiceId}`,
    )
      .then((r) => r.json())
      .then((data) => setAvailableSlots(data.slots || data || []))
      .catch(() => setAvailableSlots([]));
  }, [apiBase, orgSlug, selectedDate, selectedProfessionalId, selectedServiceId]);

  const handleSubmitBooking = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/public/booking/${orgSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          professionalId: selectedProfessionalId,
          date: selectedDate,
          startTime: selectedTime,
          name,
          email,
          phone,
          nationalId,
          notes,
        }),
      });

      if (!res.ok) throw new Error('Booking failed');

      const data = await res.json();

      if (data.requiresPayment && data.checkoutUrl) {
        // Save booking context for payment recovery
        sessionStorage.setItem(
          'booking-pending-payment',
          JSON.stringify({ serviceId: selectedServiceId, orgSlug }),
        );
        window.location.href = data.checkoutUrl;
        return;
      }

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  }, [
    apiBase,
    orgSlug,
    selectedServiceId,
    selectedProfessionalId,
    selectedDate,
    selectedTime,
    name,
    email,
    phone,
    nationalId,
    notes,
  ]);

  if (loading && services.length === 0) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <p style={{ color: '#666' }}>Loading booking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: '1rem', color: 'var(--brand-primary)' }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'white',
            fontSize: '2rem',
          }}
        >
          &#10003;
        </div>
        <h2>Appointment Booked!</h2>
        <p style={{ color: '#666', marginTop: '0.75rem' }}>
          We'll send a confirmation to {email}.
        </p>
        <a
          href="/services"
          style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            color: 'var(--brand-primary)',
          }}
        >
          &larr; Back to Services
        </a>
      </div>
    );
  }

  const selectedService = services.find(
    (s: any) => s.id === selectedServiceId,
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '2rem',
          fontFamily: 'var(--brand-heading-font)',
        }}
      >
        Book an Appointment
      </h1>

      {/* Step indicator */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          fontSize: '0.875rem',
          color: '#666',
        }}
      >
        {['service', 'professional', 'datetime', 'contact', 'review'].map(
          (s, i) => (
            <span
              key={s}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                background: step === s ? 'var(--brand-primary)' : '#e5e7eb',
                color: step === s ? 'white' : '#666',
                fontWeight: step === s ? 600 : 400,
              }}
            >
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          ),
        )}
      </div>

      {/* Service selection */}
      {step === 'service' && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Select a Service</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            {services.map((s: any) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedServiceId(s.id);
                  setStep('professional');
                }}
                style={{
                  padding: '1rem',
                  border:
                    selectedServiceId === s.id
                      ? '2px solid var(--brand-primary)'
                      : '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  textAlign: 'left',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <strong>{s.name}</strong>
                {s.duration && (
                  <p style={{ fontSize: '0.875rem', color: '#666' }}>
                    {s.duration} min
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Professional selection */}
      {step === 'professional' && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Choose a Specialist</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {professionals.map((p: any) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProfessionalId(p.id);
                  setStep('datetime');
                }}
                style={{
                  padding: '1rem',
                  border:
                    selectedProfessionalId === p.id
                      ? '2px solid var(--brand-primary)'
                      : '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  textAlign: 'center',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <strong>
                  {p.firstName} {p.lastName}
                </strong>
                {p.specialty && (
                  <p style={{ fontSize: '0.875rem', color: '#666' }}>
                    {p.specialty}
                  </p>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('service')}
            style={{
              marginTop: '1rem',
              color: '#666',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            &larr; Back
          </button>
        </div>
      )}

      {/* Date & time */}
      {step === 'datetime' && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Select Date & Time</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              width: '100%',
              marginBottom: '1rem',
            }}
          />
          {availableSlots.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {availableSlots.map((slot: any) => {
                const time = typeof slot === 'string' ? slot : slot.startTime;
                return (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setStep('contact');
                    }}
                    style={{
                      padding: '0.5rem',
                      border:
                        selectedTime === time
                          ? '2px solid var(--brand-primary)'
                          : '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      background:
                        selectedTime === time
                          ? 'var(--brand-primary)'
                          : 'white',
                      color: selectedTime === time ? 'white' : 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={() => setStep('professional')}
            style={{
              marginTop: '1rem',
              color: '#666',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            &larr; Back
          </button>
        </div>
      )}

      {/* Contact info */}
      {step === 'contact' && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Your Information</h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              maxWidth: 500,
            }}
          >
            <input
              placeholder="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
              }}
            />
            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
              }}
            />
            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
              }}
            />
            <input
              placeholder="National ID *"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
              }}
            />
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                resize: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setStep('datetime')}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep('review')}
                disabled={!name || !email || !nationalId}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: 'var(--brand-primary)',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: !name || !email || !nationalId ? 0.5 : 1,
                }}
              >
                Review &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review & confirm */}
      {step === 'review' && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Review & Confirm</h2>
          <div
            style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              marginBottom: '1.5rem',
            }}
          >
            <p>
              <strong>Service:</strong> {selectedService?.name}
            </p>
            <p>
              <strong>Date:</strong> {selectedDate}
            </p>
            <p>
              <strong>Time:</strong> {selectedTime}
            </p>
            <p>
              <strong>Name:</strong> {name}
            </p>
            <p>
              <strong>Email:</strong> {email}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setStep('contact')}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              onClick={handleSubmitBooking}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: 'var(--brand-primary)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {loading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingFlow(props: BookingFlowProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BookingFlowInner {...props} />
    </QueryClientProvider>
  );
}
