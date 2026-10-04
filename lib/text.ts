// Reply normalisation applied at the API boundary: the UI renders plain text
// and the reply is spoken aloud, so markdown decoration and emoji spam must
// never reach the chat bubble — even if the model disobeys the prompt rules.

const DECORATIVE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;

export function plainText(raw: string): string {
  let text = raw
    .replace(/```+/g, '')                                  // code fences (keep content)
    .replace(/^#{1,6}\s*/gm, '')                           // headings
    .replace(/\*\*([^*\n]*)\*\*/g, '$1')                  // bold
    .replace(/\*([^*\n]+)\*/g, '$1')                       // italic
    .replace(/__([^_\n]*)__/g, '$1')
    .replace(/`([^`\n]*)`/g, '$1')                         // inline code
    .replace(/^\s*[-*+]\s+/gm, '• ')                       // bullets
    .replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, '')       // horizontal rules
    .replace(/^\s*>\s?/gm, '')                             // block quotes
    .replace(DECORATIVE, '');                               // decorative emoji
  // Models sometimes open with their own name as a title — drop that line.
  text = text.replace(/^[ \t]*(?:knock|Knock|KNOCK)[ \t]*\n+/, '');
  return text.replace(/\n{3,}/g, '\n\n').trim();
}