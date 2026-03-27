export { };

declare global {
  interface Window {
    bootstrap: unknown,
    $: any,
    _solaris: { errors: string[] }
  }
}
