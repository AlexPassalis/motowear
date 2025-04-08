export function formatMessage(
  location: string,
  message: string,
  error?: unknown
) {
  return `Location: ${location}\nMessage: ${message}${
    error
      ? `\n${String(error).replace(/([_*[\]()~\`>#+\-=|{}.!])/g, '\\$1')}.`
      : '.'
  }`
}
