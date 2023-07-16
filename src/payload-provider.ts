import payload from 'payload';

type PartialPayload = Partial<typeof payload>;

const defaultPayload = payload;
let overridePayload: PartialPayload | undefined; // TODO: Change this to require more specific partial interface

export function setPayloadProvider(payloadProvider: PartialPayload) {
  overridePayload = payloadProvider;
}

export function getPayloadProvider() {
  return overridePayload || defaultPayload;
}
