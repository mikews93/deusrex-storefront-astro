import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  FormInput,
  FileUp,
  Video,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Download,
} from 'lucide-react';
import { Checkbox } from '@/components/checkbox';
import { Textarea } from '@/components/textarea';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import type { ServiceRequirementPublic } from '../../hooks/useBooking';

interface RequirementsStepProps {
  requirements: ServiceRequirementPublic[];
  onCompletionChange: (completed: boolean) => void;
}

const TYPE_ICONS: Record<string, typeof ShieldCheck> = {
  INFORMED_CONSENT: ShieldCheck,
  FORM: FormInput,
  DOCUMENT: FileUp,
  MEDIA: Video,
};

export function RequirementsStep({
  requirements,
  onCompletionChange,
}: RequirementsStepProps) {
  const { t } = useTranslation();

  /** State */
  const preRequirements = requirements.filter(
    (r) => r.phase === 'PRE' && r.isMandatory,
  );

  const [completionState, setCompletionState] = useState<
    Record<string, Record<string, unknown>>
  >({});

  /** Handlers */
  const updateCompletion = (reqId: string, data: Record<string, unknown>) => {
    const next = { ...completionState, [reqId]: data };
    setCompletionState(next);

    const allDone = preRequirements.every((req) => {
      const d = next[req.id];
      if (!d) return false;
      return isRequirementComplete(req, d);
    });
    onCompletionChange(allDone);
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {t(
          'storefront.booking.requirementsHint',
          'Please complete the following requirements before confirming your appointment.',
        )}
      </p>

      <div className="mt-6 space-y-4">
        {preRequirements.map((req, index) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <RequirementItem
              requirement={req}
              data={completionState[req.id] || {}}
              isComplete={isRequirementComplete(
                req,
                completionState[req.id] || {},
              )}
              onUpdate={(data) => updateCompletion(req.id, data)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function isRequirementComplete(
  req: ServiceRequirementPublic,
  data: Record<string, unknown>,
): boolean {
  if (!data) return false;
  switch (req.requirementType) {
    case 'INFORMED_CONSENT':
      return data.granted === true;
    case 'MEDIA':
      return reqConfig(req).acknowledgeRequired
        ? data.acknowledged === true
        : data.viewed === true;
    case 'DOCUMENT':
      return (
        typeof data.documentUrl === 'string' && data.documentUrl.trim() !== ''
      );
    case 'FORM':
      return data.completed === true;
    default:
      return data.completed === true;
  }
}

/** Helpers */
function reqConfig(req: ServiceRequirementPublic): Record<string, unknown> {
  return (req.config || {}) as Record<string, unknown>;
}

/** Individual Requirement Item */
function RequirementItem({
  requirement,
  data,
  isComplete,
  onUpdate,
}: {
  requirement: ServiceRequirementPublic;
  data: Record<string, unknown>;
  isComplete: boolean;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const { t } = useTranslation();
  const TypeIcon = TYPE_ICONS[requirement.requirementType] || ClipboardList;
  const cfg = reqConfig(requirement);
  const docUrl = (cfg.documentUrl || cfg.referenceDocumentUrl || cfg.url) as
    | string
    | undefined;

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        isComplete
          ? 'border-emerald-200 bg-emerald-50/50'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isComplete
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <TypeIcon className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground">
            {requirement.name}
          </h4>
          {requirement.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {requirement.description}
            </p>
          )}
          {docUrl && (
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--brand-primary)' }}
              onClick={() => {
                if (requirement.requirementType === 'MEDIA' && !data.viewed) {
                  onUpdate({
                    ...data,
                    viewed: true,
                    viewedAt: new Date().toISOString(),
                  });
                }
              }}
            >
              {docUrl.match(/\.(pdf|doc|docx|xlsx|xls)$/i) ? (
                <Download className="h-4 w-4" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {t('storefront.booking.viewDocument', 'View document')}
            </a>
          )}
        </div>
      </div>

      <div className="mt-4">
        {requirement.requirementType === 'INFORMED_CONSENT' && (
          <InformedConsentInput data={data} onUpdate={onUpdate} />
        )}
        {requirement.requirementType === 'MEDIA' && (
          <MediaInput config={cfg} data={data} onUpdate={onUpdate} />
        )}
        {requirement.requirementType === 'DOCUMENT' && (
          <DocumentInput data={data} onUpdate={onUpdate} />
        )}
        {requirement.requirementType === 'FORM' && (
          <FormInput_ data={data} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
}

/** Informed Consent Input */
function InformedConsentInput({
  data,
  onUpdate,
}: {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
        <Checkbox
          id="consent-granted"
          checked={data.granted === true}
          onCheckedChange={(checked) =>
            onUpdate({
              ...data,
              granted: checked === true,
              grantedAt: checked ? new Date().toISOString() : null,
              method: 'checkbox',
            })
          }
        />
        <label
          htmlFor="consent-granted"
          className="text-sm leading-relaxed cursor-pointer"
        >
          {t(
            'storefront.booking.consentAcknowledge',
            'I have read and understand the information provided. I give my informed consent.',
          )}
        </label>
      </div>
    </div>
  );
}

/** Media Input */
function MediaInput({
  config,
  data,
  onUpdate,
}: {
  config: Record<string, unknown>;
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const { t } = useTranslation();
  const mediaType = (config.mediaType as string) || 'material';
  const needsAck = Boolean(config.acknowledgeRequired);

  return (
    <div className="space-y-3">
      {needsAck && (
        <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
          <Checkbox
            id="media-ack"
            checked={data.acknowledged === true}
            onCheckedChange={(checked) =>
              onUpdate({
                ...data,
                viewed: true,
                acknowledged: checked === true,
                acknowledgedAt: checked ? new Date().toISOString() : null,
              })
            }
          />
          <label
            htmlFor="media-ack"
            className="text-sm leading-relaxed cursor-pointer"
          >
            {t(
              'storefront.booking.mediaAcknowledge',
              'I have reviewed the {{type}}.',
              { type: mediaType },
            )}
          </label>
        </div>
      )}
      {!needsAck && !data.viewed && (
        <p className="text-xs text-muted-foreground">
          {t(
            'storefront.booking.clickToView',
            'Click the link above to view the material.',
          )}
        </p>
      )}
    </div>
  );
}

/** Document Input */
function DocumentInput({
  data,
  onUpdate,
}: {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label htmlFor="doc-ref">
        {t('storefront.booking.documentReference', 'Document URL or Reference')}
      </Label>
      <Input
        id="doc-ref"
        placeholder={t(
          'storefront.booking.documentPlaceholder',
          'URL or file reference...',
        )}
        value={(data.documentUrl as string) || ''}
        onChange={(e) =>
          onUpdate({
            ...data,
            documentUrl: e.target.value,
            uploadedAt: new Date().toISOString(),
          })
        }
      />
    </div>
  );
}

/** Form Input (generic) */
function FormInput_({
  data,
  onUpdate,
}: {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="form-notes">
          {t('storefront.booking.additionalNotes', 'Notes')}
        </Label>
        <Textarea
          id="form-notes"
          placeholder={t(
            'storefront.booking.notesPlaceholder',
            'Any additional information...',
          )}
          className="min-h-[80px] resize-none"
          value={(data.notes as string) || ''}
          onChange={(e) =>
            onUpdate({
              ...data,
              notes: e.target.value,
              completed: true,
              completedAt: new Date().toISOString(),
            })
          }
        />
      </div>
      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
        <Checkbox
          id="form-complete"
          checked={data.completed === true}
          onCheckedChange={(checked) =>
            onUpdate({
              ...data,
              completed: checked === true,
              completedAt: checked ? new Date().toISOString() : null,
            })
          }
        />
        <label
          htmlFor="form-complete"
          className="text-sm leading-relaxed cursor-pointer"
        >
          {t(
            'storefront.booking.formComplete',
            'I have provided all required information.',
          )}
        </label>
      </div>
    </div>
  );
}
