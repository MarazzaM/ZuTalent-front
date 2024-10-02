import type { ClientConnectionInfo } from "./useParcnetClient";

export function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

export const DEFAULT_CONNECTION_INFO: ClientConnectionInfo = {
  url: "https://staging.zupass.org",
  type: "iframe"
};

export function getConnectionInfo(): ClientConnectionInfo {
  let connectionInfo = DEFAULT_CONNECTION_INFO;
  const storedConnectionInfo = localStorage.getItem("clientConnectionInfo");
  if (storedConnectionInfo) {
    try {
      const parsedConnectionInfo = JSON.parse(
        storedConnectionInfo
      ) as ClientConnectionInfo;
      if (
        parsedConnectionInfo.type === "iframe" &&
        typeof parsedConnectionInfo.url === "string"
      ) {
        connectionInfo = parsedConnectionInfo;
      }
    } catch (e) {
      // JSON parsing failed
      console.error("Failed to parse stored connection info", e);
    }
  }
  return connectionInfo;
}
