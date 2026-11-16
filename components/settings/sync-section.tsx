import { SyncStatus, useSync } from "@/context/sync-context";
import { useOnOffSwitch } from "@/hooks/use-on-off-switch";
import dayjs from "dayjs";
import { Alert, Text } from "react-native";
import { ActionRow } from "../ui/action-row";
import { Card } from "../ui/card";
import { ConfirmDialog } from "../ui/confirm-dialog";

const statusText = (
  status: SyncStatus,
  lastSyncedAt: string | null,
  error: string | null,
) => {
  if (status === "syncing") return "Syncing…";
  if (status === "error") return error ?? "Sync failed.";
  if (!lastSyncedAt) return "Not synced yet";
  return `Synced ${dayjs(lastSyncedAt).format("D MMM, HH:mm")}`;
};

/** Connect a cloud service to keep decks the same across devices. Hidden when no service is set up. */
export const SyncSection = () => {
  const {
    providers,
    connectedId,
    status,
    lastSyncedAt,
    error,
    connect,
    disconnect,
    syncNow,
  } = useSync();
  const confirm = useOnOffSwitch();
  const available = providers.filter((p) => p.isConfigured());
  const connected = providers.find((p) => p.id === connectedId);
  if (available.length === 0 && !connected) return null;

  const connectTo = async (id: string) => {
    try {
      await connect(id);
    } catch (e: any) {
      Alert.alert("Couldn't connect", e.message);
    }
  };

  return (
    <>
      <Text className="px-1 pt-2 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Sync
      </Text>
      <Card className="gap-1 p-2">
        {connected ? (
          <>
            <ActionRow
              icon="refresh-cw"
              label={`Syncing with ${connected.label}`}
              description={statusText(status, lastSyncedAt, error)}
              onPress={() => void syncNow()}
            />
            <ActionRow
              icon="log-out"
              label={`Disconnect ${connected.label}`}
              description="Stop syncing. Decks on this device stay"
              onPress={confirm.setOn}
            />
          </>
        ) : (
          available.map((p) => (
            <ActionRow
              key={p.id}
              icon="cloud"
              label={`Sync with ${p.label}`}
              description="Keep your decks the same on every device"
              onPress={() => void connectTo(p.id)}
            />
          ))
        )}
      </Card>
      <ConfirmDialog
        visible={confirm.isOn}
        title={`Disconnect ${connected?.label}?`}
        message="Syncing stops. Your decks stay on this device and the copies in your cloud storage are left as they are."
        confirmTitle="Disconnect"
        onCancel={confirm.setOff}
        onConfirm={() => {
          confirm.setOff();
          void disconnect();
        }}
      />
    </>
  );
};
