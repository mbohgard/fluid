export * from "./math";
export * from "./misc";
export * from "./factories";
export * from "./styles";

export { w as window, d as document } from "./ssr";

export type Timer = number | NodeJS.Timeout;

export const rect = (el: HTMLElement) => el.getBoundingClientRect();
