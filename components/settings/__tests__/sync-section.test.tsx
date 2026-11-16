import { Alert } from "react-native";
import { act, create } from "react-test-renderer";

import { ProviderDefinition } from "@/lib/sync/provider";
import { SyncSection } from "../sync-section";

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockSyncNow = jest.fn();
let mockSync: Record<string, unknown> = {};

jest.mock("@react-native-vector-icons/feather", () => () => null);
jest.mock("@/context/sync-context", () => ({
  useSync: () => ({
    connect: mockConnect,
    disconnect: mockDisconnect,
    syncNow: mockSyncNow,
    ...mockSync,
  }),
}));

const service = (id: string, configured = true): ProviderDefinition => ({
  id,
  label: id === "dropbox" ? "Dropbox" : "OneDrive",
  isConfigured: () => configured,
  connect: jest.fn(),
  restore: jest.fn(),
  disconnect: jest.fn(),
});

const render = () => {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<SyncSection />);
  });
  const byLabel = (label: string) =>
    tree.root.findAll(
      (n) => n.props.accessibilityLabel === label && typeof n.type !== "string",
    )[0];
  return { tree, byLabel };
};

beforeEach(() => {
  [mockConnect, mockDisconnect, mockSyncNow].forEach((m) => m.mockReset());
  mockSync = {
    providers: [service("dropbox"), service("onedrive")],
    connectedId: null,
    status: "off",
    lastSyncedAt: null,
    error: null,
  };
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe("SyncSection", () => {
  it("is hidden when no service is set up", () => {
    mockSync.providers = [service("dropbox", false)];
    expect(render().tree.toJSON()).toBeNull();
  });

  it("offers only the services that are set up", () => {
    mockSync.providers = [service("dropbox"), service("onedrive", false)];
    const { byLabel } = render();

    expect(byLabel("Sync with Dropbox")).toBeDefined();
    expect(byLabel("Sync with OneDrive")).toBeUndefined();
  });

  it("connects to the chosen service", async () => {
    const { byLabel } = render();

    await act(async () => byLabel("Sync with Dropbox").props.onPress());

    expect(mockConnect).toHaveBeenCalledWith("dropbox");
  });

  it("shows why connecting failed", async () => {
    mockConnect.mockRejectedValue(new Error("Sign-in was cancelled"));
    const { byLabel } = render();

    await act(async () => byLabel("Sync with Dropbox").props.onPress());

    expect(Alert.alert).toHaveBeenCalledWith(
      "Couldn't connect",
      "Sign-in was cancelled",
    );
  });

  it("shows the state and syncs on tap once connected", async () => {
    mockSync = {
      ...mockSync,
      connectedId: "dropbox",
      status: "error",
      error: "Offline",
    };
    const { byLabel, tree } = render();

    expect(JSON.stringify(tree.toJSON())).toContain("Offline");
    await act(async () => byLabel("Syncing with Dropbox").props.onPress());

    expect(mockSyncNow).toHaveBeenCalled();
    expect(byLabel("Sync with Dropbox")).toBeUndefined();
  });

  it("shows the last sync time", () => {
    mockSync = {
      ...mockSync,
      connectedId: "dropbox",
      status: "idle",
      lastSyncedAt: "2026-11-16T10:30:00.000Z",
    };
    expect(JSON.stringify(render().tree.toJSON())).toContain("Synced 16 Nov");
  });

  it("asks before disconnecting, and disconnects once confirmed", async () => {
    mockSync = { ...mockSync, connectedId: "dropbox", status: "idle" };
    const { byLabel } = render();

    act(() => byLabel("Disconnect Dropbox").props.onPress());
    expect(mockDisconnect).not.toHaveBeenCalled();

    await act(async () => byLabel("Disconnect").props.onPress());
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("keeps syncing when the disconnect is cancelled", () => {
    mockSync = { ...mockSync, connectedId: "dropbox", status: "idle" };
    const { byLabel } = render();

    act(() => byLabel("Disconnect Dropbox").props.onPress());
    act(() => byLabel("Cancel").props.onPress());

    expect(mockDisconnect).not.toHaveBeenCalled();
  });
});
