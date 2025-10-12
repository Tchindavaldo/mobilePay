// Type declarations for capacitor-secure-storage-plugin
declare module 'capacitor-secure-storage-plugin' {
  export interface SecureStoragePluginPlugin {
    set(options: { key: string; value: string }): Promise<void>;
    get(options: { key: string }): Promise<{ value: string }>;
    remove(options: { key: string }): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<{ value: string[] }>;
  }

  export const SecureStoragePlugin: SecureStoragePluginPlugin;
}
