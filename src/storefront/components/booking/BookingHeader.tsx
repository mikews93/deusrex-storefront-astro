import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, ChevronLeft } from 'lucide-react';
import { STEPS, stepMeta, type Step } from './booking-utils';

interface BookingHeaderProps {
  orgSlug: string;
  businessProfile:
    | {
        name: string;
        logoUrl: string | null;
      }
    | null
    | undefined;
  currentStep: Step;
  visibleSteps?: Exclude<Step, 'success'>[];
}

export function BookingHeader({
  orgSlug,
  businessProfile,
  currentStep,
  visibleSteps,
}: BookingHeaderProps) {
  const { t } = useTranslation();

  const steps = visibleSteps || STEPS;
  const currentStepIndex = steps.indexOf(
    currentStep as Exclude<Step, 'success'>,
  );

  return (
    <div
      className="relative overflow-hidden px-6 py-10 border-b border-border shadow-sm transition-colors duration-500"
      style={{
        backgroundColor:
          'color-mix(in srgb, var(--brand-primary) 8%, hsl(var(--background)))',
      }}
    >
      {/* Premium Gradient Mesh Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-100 transition-opacity duration-500 mix-blend-multiply dark:mix-blend-lighten"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse at 10% 40%, color-mix(in srgb, var(--brand-primary) 35%, transparent), transparent 70%),
            radial-gradient(ellipse at 90% -10%, color-mix(in srgb, var(--brand-secondary, var(--brand-primary)) 40%, transparent), transparent 70%)
          `,
        }}
      />

      {/* Glassy overlay for smooth diffusion */}
      <div
        className="pointer-events-none absolute inset-0 bg-background/20 backdrop-blur-[6px]"
        aria-hidden="true"
      />

      {/* Subtle decorative dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply dark:mix-blend-lighten"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--brand-primary, currentColor) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative mx-auto max-w-4xl pt-4">
        <div className="mb-8 flex items-center justify-between">
          <a
            href={`https://${orgSlug}.deusrex.io`}
            className="inline-flex items-center gap-3 text-2xl font-bold transition-opacity hover:opacity-80"
          >
            {businessProfile?.logoUrl && (
              <img
                src={businessProfile.logoUrl}
                alt=""
                className="h-10 w-10 bg-background object-contain rounded p-1 shadow-sm border border-border"
              />
            )}
            {businessProfile?.name || orgSlug}
          </a>

          <a
            href={`https://${orgSlug}.deusrex.io`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('storefront.booking.backToSite', 'Back to site')}
          </a>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('storefront.booking.title')}
          </h1>
          <div className="hidden sm:block">
            <span className="text-sm font-medium text-muted-foreground">
              {t(
                'storefront.booking.subtitle',
                'Select a service and schedule your visit',
              )}
            </span>
          </div>
        </div>

        <p className="mt-2 text-sm font-medium text-muted-foreground sm:hidden">
          {t(
            'storefront.booking.subtitle',
            'Select a service and schedule your visit',
          )}
        </p>

        {/* Step Indicator */}
        {currentStep !== 'success' && (
          <div className="mx-auto mt-10 flex max-w-2xl items-center">
            {steps.map((s, i) => {
              const meta = stepMeta[s];
              const Icon = meta.icon;
              const isCompleted = currentStepIndex > i;
              const isCurrent = currentStepIndex === i;

              return (
                <div key={s} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      animate={{
                        scale: isCurrent ? 1 : 0.85,
                        opacity: isCurrent || isCompleted ? 1 : 0.5,
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all shadow-sm ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : isCurrent
                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                            : 'bg-muted text-muted-foreground border border-border'
                      }`}
                      style={
                        isCompleted || isCurrent
                          ? ({
                              backgroundColor: 'var(--brand-primary)',
                              color: 'var(--primary-foreground, white)',
                              '--tw-ring-color':
                                'color-mix(in srgb, var(--brand-primary) 20%, transparent)',
                            } as React.CSSProperties)
                          : undefined
                      }
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </motion.div>
                    <span
                      className={`hidden text-[11px] font-bold uppercase tracking-wider md:block whitespace-nowrap ${
                        isCurrent || isCompleted
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {t(meta.label, s)}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="mx-2 h-px flex-1 sm:mx-4">
                      <div
                        className={`h-full rounded-full transition-colors ${
                          currentStepIndex > i ? 'bg-primary/50' : 'bg-border'
                        }`}
                        style={
                          currentStepIndex > i
                            ? {
                                backgroundColor:
                                  'color-mix(in srgb, var(--brand-primary) 50%, transparent)',
                              }
                            : undefined
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
