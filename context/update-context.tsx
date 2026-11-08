import { updateDismissedKey } from "@/constants";
import { StoreUpdate, checkForUpdate } from "@/lib/app-update";
import { getItemFromStorage, setItemToStorage } from "@/lib/work-with-storage";
import Constants from "expo-constants";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Linking, Platform } from "react-native";

type Status = "idle" | "checking" | "current" | "available" | "error";

interface UpdateContext {
  status: Status;
  installedVersion: string;
  update: StoreUpdate | null;
  /** Whether the "update available" dialog is open. */
  promptVisible: boolean;
  /** A manual check ignores an earlier "Later" and always shows the dialog. */
  checkNow: () => Promise<void>;
  postpone: () => void;
  openStore: () => void;
}

const UpdateCtx = createContext<UpdateContext | undefined>(undefined);

const installedVersion = Constants.expoConfig?.version ?? "0.0.0";
const bundleId = Constants.expoConfig?.ios?.bundleIdentifier;

export const UpdateProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<Status>("idle");
  const [update, setUpdate] = useState<StoreUpdate | null>(null);
  const [promptVisible, setPromptVisible] = useState(false);

  const check = useCallback(async (manual: boolean) => {
    setStatus("checking");
    try {
      const found = await checkForUpdate({
        platform: Platform.OS,
        installedVersion,
        bundleId,
      });
      setUpdate(found);
      setStatus(found ? "available" : "current");
      if (!found) return;
      if (manual) return setPromptVisible(true);
      // On launch, don't nag about a version the user already put off.
      let dismissed: string | undefined;
      await getItemFromStorage<string>(updateDismissedKey, (version) => {
        dismissed = version;
      });
      if (dismissed !== found.version) setPromptVisible(true);
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Dev builds aren't in the store, so the lookup would only add noise.
    if (!__DEV__) void check(false);
  }, [check]);

  const value = useMemo<UpdateContext>(
    () => ({
      status,
      installedVersion,
      update,
      promptVisible,
      checkNow: () => check(true),
      postpone: () => {
        setPromptVisible(false);
        if (update) void setItemToStorage(update.version, updateDismissedKey);
      },
      openStore: () => {
        setPromptVisible(false);
        if (update) void Linking.openURL(update.storeUrl);
      },
    }),
    [status, update, promptVisible, check],
  );

  return <UpdateCtx.Provider value={value}>{children}</UpdateCtx.Provider>;
};

export const useUpdate = () => {
  const ctx = useContext(UpdateCtx);
  if (!ctx) throw new Error("useUpdate must be used within UpdateProvider");
  return ctx;
};
