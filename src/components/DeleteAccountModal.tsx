import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onAccountDeleted: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAccountDeleted,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toLowerCase() === 'delete';

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/auth/account/${currentUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser.token ? { Authorization: `Bearer ${currentUser.token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete account. Please try again.');
      }

      onAccountDeleted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-spatial-lg border border-[#e5e0d8] overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#7d8798] hover:text-[#181b22] hover:bg-[#f3f1ec] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-[#16191f]">
              Delete Creator Account
            </h3>
            <p className="text-xs text-[#717b8c]">
              Permanently remove your studio profile and credentials
            </p>
          </div>
        </div>

        {/* Account summary to be deleted */}
        <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#dedad0] mb-5 flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-black/10"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#16191f] truncate">{currentUser.name}</div>
            <div className="text-[11px] text-[#636f82] truncate">{currentUser.email || 'Preset / Custom Account'}</div>
            <div className="text-[10px] text-[#8e98a7] font-mono mt-0.5">{currentUser.role}</div>
          </div>
        </div>

        {/* Warning text */}
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs mb-5 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            This action is <strong>irreversible</strong>. Once deleted, your account credentials, saved preferences, and private collection records will be purged from the studio database.
          </p>
        </div>

        {/* Confirmation Input */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-[#2f3542] mb-1.5">
            Type <strong className="text-rose-600 font-mono">DELETE</strong> to confirm:
          </label>
          <input
            type="text"
            id="delete-account-confirm-input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            disabled={isDeleting}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f6] border border-[#dedad0] text-xs font-mono text-[#181c24] focus:outline-none focus:border-rose-500 transition-all uppercase"
          />
        </div>

        {error && (
          <div className="mb-4 text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-[#f0eee7] hover:bg-[#e4e1d7] text-xs font-semibold text-[#3d4554] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            id="confirm-delete-account-btn"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting Account...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
