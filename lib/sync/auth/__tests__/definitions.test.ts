import { dropboxService, oneDriveService } from "../definitions";

jest.mock("expo-linking", () => ({
  createURL: (path: string) => `myapp://${path}`,
}));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe("service definitions", () => {
  it("are offered only when the build has a client ID", () => {
    expect(dropboxService(undefined).isConfigured()).toBe(false);
    expect(dropboxService("").isConfigured()).toBe(false);
    expect(dropboxService("key").isConfigured()).toBe(true);
    expect(oneDriveService("id").isConfigured()).toBe(true);
  });

  it("name themselves for the UI", () => {
    expect(dropboxService("k")).toMatchObject({
      id: "dropbox",
      label: "Dropbox",
    });
    expect(oneDriveService("k")).toMatchObject({
      id: "onedrive",
      label: "OneDrive",
    });
  });

  it("don't restore a session when nothing is saved", async () => {
    expect(await dropboxService("k").restore()).toBeNull();
  });
});
