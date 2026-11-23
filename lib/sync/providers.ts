import { dropboxService, oneDriveService } from "./auth/definitions";
import { ProviderDefinition } from "./provider";

/**
 * The services this build can sync with. A service whose client ID isn't set is left out of the UI
 * (`isConfigured`), so builds without the keys behave as before.
 */
export const providers: ProviderDefinition[] = [
  dropboxService(process.env.EXPO_PUBLIC_DROPBOX_APP_KEY),
  oneDriveService(process.env.EXPO_PUBLIC_ONEDRIVE_CLIENT_ID),
];
