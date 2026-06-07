"use client";

export function ConfirmModal({ open, title, children, onCancel, onConfirm, confirmLabel = "Delete Card" }: { open: boolean; title: string; children: React.ReactNode; onCancel: () => void; onConfirm: () => void; confirmLabel?: string }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="max-w-md rounded-3xl bg-white p-6 shadow-soft"><h2 className="text-xl font-black text-graphite">{title}</h2><div className="mt-4 text-sm text-gray-600">{children}</div><div className="mt-6 flex justify-end gap-3"><button onClick={onCancel} className="rounded-full border px-5 py-2 font-bold">Cancel</button><button onClick={onConfirm} className="rounded-full bg-red-600 px-5 py-2 font-bold text-white">{confirmLabel}</button></div></div></div>;
}
