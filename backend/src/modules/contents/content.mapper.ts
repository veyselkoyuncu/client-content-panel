export function toContentResponse<T extends { clientId: string; clientName: string }>(row: T) {
  const { clientId, clientName, ...content } = row;
  return { ...content, client: { id: clientId, name: clientName } };
}
