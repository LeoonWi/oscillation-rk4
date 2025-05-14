export {};

declare global {
    interface Window {
        runtime: {
            BrowserOpenURL(url: string): void;
        }
    }
}