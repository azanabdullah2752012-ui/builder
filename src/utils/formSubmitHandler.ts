import type { CanvasElement, Page, ProjectState } from '../types/editor';
import { databaseService } from '../services/databaseService';
import { playSound, triggerConfetti } from './interactiveEffects';

export interface FormSubmissionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: Record<string, any>;
}

/**
 * Handles executing a form submission by discovering input fields, validating required values,
 * and storing the lead in Supabase/database backend.
 */
export async function executeFormSubmission(
  triggerElement: CanvasElement,
  activePage: Page,
  project?: ProjectState | { id: string; name: string },
  clientX?: number,
  clientY?: number
): Promise<FormSubmissionResult> {
  const elements = activePage.elements;

  // 1. Discover relevant input elements
  // If button is inside a container/form, prioritize inputs within that container
  let candidateInputs: CanvasElement[] = [];

  if (triggerElement.parentId) {
    candidateInputs = elements.filter(
      (el) =>
        el.parentId === triggerElement.parentId &&
        isInputElement(el)
    );
  }

  // If none found in same container, check whole page
  if (candidateInputs.length === 0) {
    candidateInputs = elements.filter(isInputElement);
  }

  const formData: Record<string, any> = {};
  let leadEmail = '';
  let leadName = '';

  // 2. Extract values from DOM (both Studio Canvas and Live View)
  for (const inputEl of candidateInputs) {
    const domNode =
      typeof document !== 'undefined'
        ? document.getElementById(`input-${inputEl.id}`) ||
          document.getElementById(inputEl.id) ||
          document.querySelector(`[data-field-id="${inputEl.id}"]`)
        : null;

    let value = '';
    let isChecked = false;

    if (domNode) {
      const tagName = domNode.tagName ? domNode.tagName.toLowerCase() : '';
      if (tagName === 'input') {
        const input = domNode as HTMLInputElement;
        if (input.type === 'checkbox') {
          isChecked = input.checked;
          value = isChecked ? 'true' : 'false';
        } else {
          value = input.value ? input.value.trim() : '';
        }
      } else if (tagName === 'textarea' || tagName === 'select') {
        const input = domNode as HTMLTextAreaElement | HTMLSelectElement;
        value = input.value ? input.value.trim() : '';
      } else {
        // Fallback for custom div inputs: read text content or placeholder
        const innerInput = domNode.querySelector ? domNode.querySelector('input, textarea, select') : null;
        if (innerInput && (innerInput as any).value !== undefined) {
          value = String((innerInput as any).value).trim();
        } else {
          value = domNode.textContent ? domNode.textContent.trim() : '';
        }
      }
    } else {
      // Demo / simulated fallback value from element
      value = inputEl.content ? inputEl.content.trim() : '';
    }

    const fieldKey =
      inputEl.formConfig?.fieldName ||
      inputEl.name.toLowerCase().replace(/[^a-z0-9_]/g, '_') ||
      `field_${inputEl.id.slice(-4)}`;

    formData[fieldKey] = value;

    // Detect email field
    if (
      !leadEmail &&
      (inputEl.formConfig?.inputType === 'email' ||
        fieldKey.includes('email') ||
        inputEl.name.toLowerCase().includes('email'))
    ) {
      leadEmail = value;
    }

    // Detect name field
    if (
      !leadName &&
      (fieldKey.includes('name') || inputEl.name.toLowerCase().includes('name')) &&
      !fieldKey.includes('email')
    ) {
      leadName = value;
    }

    // Validation: Required check
    if (inputEl.formConfig?.required && !value) {
      return {
        success: false,
        error: `Please fill in the required "${inputEl.name || 'Input'}" field.`,
      };
    }
  }

  // 3. Fallback identification
  if (!leadEmail) {
    // Check if any field value looks like an email
    for (const val of Object.values(formData)) {
      if (typeof val === 'string' && val.includes('@') && val.includes('.')) {
        leadEmail = val;
        break;
      }
    }
  }

  // If form explicitly expects email and none was provided
  if (!leadEmail && candidateInputs.some((i) => i.formConfig?.inputType === 'email' || i.name.toLowerCase().includes('email'))) {
    return {
      success: false,
      error: 'Please enter a valid email address.',
    };
  }

  // Fallback demo values if visitor submitted an empty placeholder form in studio
  if (!leadEmail) leadEmail = 'visitor@example.com';
  if (!leadName) leadName = 'Anonymous Visitor';

  // 4. Determine Form Type / Name
  const formType =
    triggerElement.formConfig?.formName ||
    triggerElement.name.replace(/button/i, '').trim() ||
    'Contact & Waitlist Form';

  const successMessage =
    triggerElement.formConfig?.successMessage ||
    triggerElement.behavior?.actionPayload ||
    '🎉 Thank you! Your submission has been saved successfully.';

  // 5. Submit to Database (Supabase + SQLite backend)
  try {
    await databaseService.submitLead({
      page_slug: activePage.slug || 'home',
      form_type: formType,
      name: leadName,
      email: leadEmail,
      data: {
        ...formData,
        projectId: project?.id,
        submittedAt: new Date().toISOString(),
      },
    });

    // 6. Interactive Celebrations
    try {
      playSound('success');
      triggerConfetti(clientX, clientY);
    } catch {}

    // Dispatch global event so Leads Dashboard updates immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('studio:lead-submitted', {
          detail: { formType, leadName, leadEmail, data: formData },
        })
      );
    }

    return {
      success: true,
      message: successMessage,
      data: formData,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to submit form. Please try again.',
    };
  }
}

/**
 * Checks if a CanvasElement is an interactive input or form element
 */
export function isInputElement(el: CanvasElement): boolean {
  if (
    el.type === 'input' ||
    el.type === 'textarea' ||
    el.type === 'select' ||
    el.type === 'checkbox'
  ) {
    return true;
  }
  if (el.role === 'input' || el.role === 'form') {
    return true;
  }
  const lower = el.name.toLowerCase();
  if (
    lower.includes('input') ||
    lower.includes('textarea') ||
    lower.includes('field') ||
    lower.includes('email') ||
    lower.includes('checkbox')
  ) {
    return true;
  }
  return false;
}
