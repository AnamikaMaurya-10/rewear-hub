import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";

type SyncError = {
  error: string;
  stack: string;
  filename: string;
  lineno: number;
  colno: number;
};

type AsyncError = {
  error: string;
  stack: string;
};

type GenericError = SyncError | AsyncError;

async function reportErrorToVly(errorData: {
  error: string;
  stackTrace?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
}) {
  if (!import.meta.env.VITE_VLY_APP_ID || !import.meta.env.VITE_VLY_MONITORING_URL) {
    return;
  }

  try {
    await fetch(import.meta.env.VITE_VLY_MONITORING_URL, {
      method: "POST",
      body: JSON.stringify({
        ...errorData,
        url: window.location.href,
        projectSemanticIdentifier: import.meta.env.VITE_VLY_APP_ID,
      }),
    });
  } catch (error) {
    console.error("Failed to report error to Vly:", error);
  }
}

function ErrorDialog({
  error,
  setError,
}: {
  error: GenericError;
  setError: (error: GenericError | null) => void;
}) {
  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) setError(null);
      }}
    >
      <DialogContent className="bg-red-700 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle>Runtime Error</DialogTitle>
        </DialogHeader>
        <div className="text-sm">
          A runtime error occurred. If you are using the vly editor, open it to
          automatically debug the error.
        </div>

        <div className="mt-4">
          <Collapsible className="mt-2">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                <span className="flex items-center gap-2">
                  See error details <ChevronDown className="h-4 w-4" />
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="max-w-full">
              <div className="mt-2 p-3 bg-neutral-800 rounded text-white text-sm overflow-x-auto max-h-60 max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <pre className="whitespace-pre-wrap break-words">
                  {error.stack || JSON.stringify(error, null, 2)}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setError(null)}>
            Dismiss
          </Button>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ErrorBoundaryState = {
  hasError: boolean;
  error: GenericError | null;
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true, error: null };
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
    await reportErrorToVly({
      error: error.message,
      stackTrace: error.stack,
    });
    this.setState({
      hasError: true,
      error: {
        error: error.message,
        stack: info.componentStack ?? error.stack ?? "",
      },
    });
  }

  render() {
    if (this.state.hasError) {
      // Minimal inline fallback so app remains usable even if ErrorDialog fails
      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-white text-black max-w-lg w-full mx-4 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">An error occurred</h2>
            <p className="text-sm text-neutral-700 mb-2">
              Please reload the page. If the issue persists, contact support.
            </p>
            <pre className="text-xs max-h-64 overflow-auto bg-neutral-100 p-2 rounded">
              {this.state.error?.stack}
            </pre>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => this.setState({ hasError: false, error: null })}>
                Dismiss
              </Button>
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function InstrumentationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [error, setError] = useState<GenericError | null>(null);

  useEffect(() => {
    const handleError = async (event: ErrorEvent) => {
      try {
        event.preventDefault();
        const err: GenericError = {
          error: event.message,
          stack: event.error?.stack || "",
          filename: event.filename || "",
          lineno: event.lineno,
          colno: event.colno,
        } as SyncError;

        setError(err);

        await reportErrorToVly({
          error: event.message,
          stackTrace: event.error?.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      } catch (e) {
        console.error("Error in handleError:", e);
      }
    };

    const handleRejection = async (event: PromiseRejectionEvent) => {
      try {
        const reason: any = event.reason || {};
        if (typeof event.preventDefault === "function") event.preventDefault();

        await reportErrorToVly({
          error: reason?.message || "Unhandled promise rejection",
          stackTrace: reason?.stack,
        });

        setError({
          error: reason?.message || "Unhandled promise rejection",
          stack: reason?.stack || "",
        });
      } catch (e) {
        console.error("Error in handleRejection:", e);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <>
      <ErrorBoundary>{children}</ErrorBoundary>
      {error && <ErrorDialog error={error} setError={setError} />}
    </>
  );
}