export function formatMessage(
  id: string,
  location: string,
  message: string,
  error?: unknown
) {
  return `Id: ${id}\nLocation: ${location}\nMessage: ${message}${
    error
      ? `\n${String(error).replace(/([_*[\]()~\`>#+\-=|{}.!])/g, '\\$1')}.`
      : '.'
  }`
}
