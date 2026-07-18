"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Something Went Wrong
        </h1>
        <p className="text-gray-500 mb-2 leading-relaxed">
          We encountered an unexpected error. Our team has been notified.
        </p>
        <p className="text-xs text-gray-400 mb-8 font-mono bg-gray-50 px-3 py-2 rounded-lg inline-block">
          {error.digest ? `Error ID: ${error.digest}` : "Unknown error"}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2 justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Try Again
          </button>
          <a
            href="/"
            className="border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium hover:border-gray-400 hover:text-black transition-all inline-flex items-center justify-center"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
