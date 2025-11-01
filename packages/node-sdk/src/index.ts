/**
 * Wusul SDK - Official Node.js SDK for Wusul Digital Access Control Platform
 *
 * @packageDocumentation
 */

export { Wusul as default } from './client';
export { Wusul } from './client';

// Export types
export type {
  WusulConfig,
  WusulResponse,
  AccessPass,
  AccessPassState,
  IssueAccessPassParams,
  UpdateAccessPassParams,
  ListAccessPassesParams,
  CardTemplate,
  CreateCardTemplateParams,
  UpdateCardTemplateParams,
  CardTemplateDesign,
  SupportInfo,
  EventLogEntry,
  EventLogFilters,
  ReadEventLogParams,
  Platform,
  Protocol,
  Classification,
  AccountTier,
} from './types';

// Export resources (for advanced usage)
export { AccessPasses } from './resources/access-passes';
export { Console } from './resources/console';

// Export utilities (for advanced usage)
export { encodePayload, createSignature, verifySignature } from './auth';
