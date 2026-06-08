type Props = {
  previewUrl: string | null;
  error?: string | null;
};

export function PreviewFrame({ previewUrl, error }: Props) {
  return (
    <div className="flex h-full flex-col bg-[#111]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <p className="mono-label text-[10px]">PREVIEW</p>
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs text-[#00E5FF] hover:underline"
          >
            Open ↗
          </a>
        )}
      </div>
      <div className="relative flex-1">
        {error && (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-amber-200/90">
            {error}
          </p>
        )}
        {!error && previewUrl && (
          <iframe
            title="App preview"
            src={previewUrl}
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
        {!error && !previewUrl && (
          <p className="flex h-full items-center justify-center text-sm text-zinc-500">
            Start sandbox to see live preview.
          </p>
        )}
      </div>
    </div>
  );
}
