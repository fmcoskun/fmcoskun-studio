import { useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { FIELD_ORDER, PROJECT_TYPES, validate, type ContactData, type ContactField, type FieldErrors } from './contactSchema';
import { buildMailto, submitContact, SubmitError } from './submitContact';
import styles from './ContactForm.module.css';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'sent' }
  | { kind: 'not-configured'; mailto?: string }
  | { kind: 'error'; message: string };

type Values = Record<ContactField, string>;

const EMPTY: Values = { name: '', email: '', projectType: '', message: '' };
const MESSAGE_MAX = 4000;

export function ContactForm() {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [honeypot, setHoneypot] = useState('');

  const id = (field: string) => `${uid}-${field}`;
  const submitting = status.kind === 'submitting';

  const revalidate = (next: Values, field: ContactField) => {
    const { errors: all } = validate(next);
    setErrors((prev) => ({ ...prev, [field]: all[field] }));
  };

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const field = event.target.name as ContactField;
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    // Live-correct only after the first blur, so users are not scolded mid-typing.
    if (touched[field]) revalidate(next, field);
    if (status.kind === 'error' || status.kind === 'not-configured') setStatus({ kind: 'idle' });
  };

  const onBlur = (field: ContactField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    revalidate(values, field);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const { data, errors: found } = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, projectType: true, message: true });

    if (!data) {
      const first = FIELD_ORDER.find((field) => found[field]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    // Bots fill hidden fields. Do nothing and do not claim success.
    if (honeypot) {
      setStatus({ kind: 'error', message: 'Your message could not be sent.' });
      return;
    }

    setStatus({ kind: 'submitting' });
    try {
      const result = await submitContact(data);
      if (result.kind === 'sent') {
        setStatus({ kind: 'sent' });
        setValues(EMPTY);
        setTouched({});
      } else {
        setStatus({ kind: 'not-configured', mailto: buildMailto(data as ContactData) });
      }
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof SubmitError ? error.message : 'Something went wrong. Please try again.',
      });
    }
  };

  const describedBy = (field: ContactField, extra?: string) =>
    [errors[field] ? id(`${field}-error`) : undefined, extra].filter(Boolean).join(' ') || undefined;

  const fieldError = (field: ContactField) =>
    errors[field] ? (
      <p id={id(`${field}-error`)} className={styles.error}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate aria-describedby={id('required-note')}>
      <p id={id('required-note')} className={styles.note}>
        All fields are required.
      </p>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={id('name')}>Name</label>
          <input
            id={id('name')}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={onChange}
            onBlur={() => onBlur('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
            maxLength={100}
            required
          />
          {fieldError('name')}
        </div>

        <div className={styles.field}>
          <label htmlFor={id('email')}>Email</label>
          <input
            id={id('email')}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            value={values.email}
            onChange={onChange}
            onBlur={() => onBlur('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email')}
            maxLength={254}
            required
          />
          {fieldError('email')}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={id('projectType')}>Project type</label>
        <select
          id={id('projectType')}
          name="projectType"
          value={values.projectType}
          onChange={onChange}
          onBlur={() => onBlur('projectType')}
          aria-invalid={Boolean(errors.projectType)}
          aria-describedby={describedBy('projectType')}
          required
        >
          <option value="" disabled>
            Select one…
          </option>
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {fieldError('projectType')}
      </div>

      <div className={styles.field}>
        <label htmlFor={id('message')}>Message</label>
        <textarea
          id={id('message')}
          name="message"
          rows={6}
          value={values.message}
          onChange={onChange}
          onBlur={() => onBlur('message')}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy('message', id('message-count'))}
          maxLength={MESSAGE_MAX}
          required
        />
        <div className={styles.messageMeta}>
          {fieldError('message') ?? <span />}
          <span id={id('message-count')} className={styles.count}>
            {values.message.length}/{MESSAGE_MAX}
          </span>
        </div>
      </div>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor={id('website')}>Website</label>
        <input
          id={id('website')}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className={styles.footer}>
        <Button type="submit" withArrow disabled={submitting} aria-busy={submitting || undefined}>
          {submitting ? 'Sending…' : 'Send message'}
        </Button>

        <div className={styles.status} role="status" aria-live="polite">
          {status.kind === 'sent' && (
            <p className={styles.success}>Thanks — your message was delivered. We'll reply by email.</p>
          )}
          {status.kind === 'not-configured' && (
            <p className={styles.warning}>
              Online submission isn't connected yet, so <strong>this message was not sent</strong>.{' '}
              {status.mailto ? (
                <a href={status.mailto}>Send it by email instead</a>
              ) : (
                'Please try again later.'
              )}
            </p>
          )}
        </div>
        {status.kind === 'error' && (
          <p className={styles.failure} role="alert">
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}
