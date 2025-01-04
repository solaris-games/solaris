export { };

declare global {
  interface Window {
    bootstrap: unknown,
    $: {},
    _solaris: { errors: string[] }
  }
}
