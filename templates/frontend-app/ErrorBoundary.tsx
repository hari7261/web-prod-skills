export interface ErrorBoundaryProps {
  fallbackMessage?: string;
  onReport?: (error: Error, componentStack: string) => void;
}

export function createErrorState(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected UI error";
  return { hasError: true, safeMessage: "Something went wrong. Please retry.", diagnostic: message };
}
