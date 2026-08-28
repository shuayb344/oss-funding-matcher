import { Terminal, Edit3, Check, Copy } from "lucide-react";

export interface Pitch {
  id: string;
  draft_text: string;
  edited_text: string | null;
  generated_at: string;
}

export function PitchOutputEditor({
  pitch,
  editing,
  editText,
  copied,
  saving,
  onStartEditing,
  onCancelEditing,
  onEditTextChange,
  onSaveEdit,
  onCopy,
}: {
  pitch: Pitch;
  editing: boolean;
  editText: string;
  copied: boolean;
  saving: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onEditTextChange: (text: string) => void;
  onSaveEdit: () => void;
  onCopy: (text: string) => void;
}) {
  return (
    <div className="mt-10 rounded-none border border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/20 p-6 shadow-md dark:shadow-2xl">
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {pitch.edited_text ? "[ APPLICATION PITCH DRAFT - EDITED ]" : "[ APPLICATION PITCH DRAFT ]"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {!editing && (
            <button
              onClick={onStartEditing}
              className="inline-flex items-center gap-1 rounded-none border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all font-semibold"
            >
              <Edit3 className="h-3 w-3" />
              EDIT PITCH
            </button>
          )}
          <button
            onClick={() => onCopy(pitch.edited_text || pitch.draft_text)}
            className="inline-flex items-center gap-1 rounded-none border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all font-semibold"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
                COPIED
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                COPY PITCH
              </>
            )}
          </button>
        </div>
      </div>

      {editing ? (
        <div>
          <textarea
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            className="w-full min-h-[220px] rounded-none border border-emerald-500/40 bg-white dark:bg-black/80 p-4 font-mono text-xs text-slate-900 dark:text-zinc-100 leading-relaxed focus:outline-none focus:border-emerald-500 resize-y shadow-inner"
          />
          <div className="mt-4 flex items-center gap-3 font-mono text-xs">
            <button
              onClick={onSaveEdit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-none bg-emerald-500 border border-emerald-400 px-4 py-2 font-semibold text-black hover:bg-emerald-400 transition-all disabled:opacity-50"
            >
              {saving ? "SAVING…" : "SAVE EDITS"}
            </button>
            <button
              onClick={onCancelEditing}
              className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider"
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap font-mono text-xs text-slate-900 dark:text-zinc-100 leading-relaxed bg-white dark:bg-[#060608] border border-emerald-500/30 dark:border-white/10 p-5 rounded-none shadow-inner">
          {pitch.edited_text || pitch.draft_text}
        </p>
      )}

      <p className="mt-4 font-mono text-[10px] uppercase text-slate-500 dark:text-zinc-500 border-t border-emerald-500/20 pt-3">
        [ READY FOR SUBMISSION TO FUNDER APPLICATION PORTAL OR NOMINATION EMAIL ]
      </p>
    </div>
  );
}
