/**
 * Sanitization for free-text user input (check-in notes, health event
 * descriptions, display names, ...). Defense-in-depth: React already
 * escapes every JSX text interpolation (`{value}`) by default, so this
 * isn't what stops XSS in the rendered app - it protects whatever *isn't*
 * React (stored rows, a future PDF/email export, an admin tool) from
 * ever seeing markup at all.
 *
 * Never use `dangerouslySetInnerHTML` with user-supplied content, with or
 * without this sanitizer - see CLAUDE.md / docs/SECURITY.md.
 */

const SCRIPT_OR_STYLE_BLOCK = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
const ANY_TAG = /<[^>]*>/g;
// Control characters, excluding tab/newline/carriage-return (\u0009,
// \u000A, \u000D) which are kept so multi-line notes still work.
// eslint-disable-next-line no-control-regex -- deliberately matching control chars to strip them
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Removes all HTML markup, including script/style blocks and their content. */
export function stripHtmlTags(input: string): string {
  return input.replace(SCRIPT_OR_STYLE_BLOCK, '').replace(ANY_TAG, '');
}

/**
 * Strips HTML markup and control characters, tidies up whitespace
 * (collapsing runs of spaces/tabs and excessive blank lines while keeping
 * intentional line breaks), and enforces a max length.
 */
export function sanitizeFreeText(input: string, maxLength = 2000): string {
  const withoutMarkup = stripHtmlTags(input);
  const withoutControlChars = withoutMarkup.replace(CONTROL_CHARS, '');
  const normalized = withoutControlChars
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return normalized.slice(0, maxLength);
}
