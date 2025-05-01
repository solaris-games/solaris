import type {MessageIntegration} from "@/integration/messages";

export interface SolarisIntegration {
  messages: MessageIntegration;
}

declare global {
  interface Window {
    solaris?: SolarisIntegration;
  }
}
