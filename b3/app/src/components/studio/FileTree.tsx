type FileRow = { path: string; content: string };

type Props = {
  files: FileRow[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
};

export function FileTree({ files, selectedPath, onSelect }: Props) {
  return (
    <div className="flex h-full flex-col border-r border-white/10 bg-[#080808]">
      <div className="border-b border-white/10 px-3 py-2">
        <p className="mono-label text-[10px]">FILES</p>
      </div>
      <ul className="flex-1 overflow-y-auto p-2 text-xs">
        {files.map((f) => (
          <li key={f.path}>
            <button
              type="button"
              onClick={() => onSelect(f.path)}
              className={`w-full truncate rounded px-2 py-1 text-left font-mono ${
                selectedPath === f.path
                  ? "bg-[#00E5FF]/15 text-[#00E5FF]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              {f.path}
            </button>
          </li>
        ))}
      </ul>
      {selectedPath && (
        <pre className="max-h-48 overflow-auto border-t border-white/10 p-2 text-[10px] text-zinc-500">
          {files.find((f) => f.path === selectedPath)?.content ?? ""}
        </pre>
      )}
    </div>
  );
}
