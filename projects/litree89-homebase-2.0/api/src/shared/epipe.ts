let registered = false;

export function registerEpipeHandler(): void {
  if (registered) {
    return;
  }
  registered = true;

  const handler = (err: NodeJS.ErrnoException): void => {
    if (err?.code === "EPIPE") {
      process.exit(0);
    }
  };

  process.stdout?.on("error", handler);
  process.stderr?.on("error", handler);
}
