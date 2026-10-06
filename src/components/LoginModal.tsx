import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUsername('');
        setPassword('');
        onLoginSuccess(data.token);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Could not reach server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-[#C5A059]" />
          <h2 className="font-serif-title font-bold text-lg text-[#1A3636]">Admin Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5DFD5] rounded-lg text-sm focus:outline-none focus:border-[#C5A059]"
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5DFD5] rounded-lg text-sm focus:outline-none focus:border-[#C5A059]"
          />
          {error && <p className="text-xs text-[#8C4A4A]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-[#1A3636] text-white text-sm font-semibold hover:bg-[#0F2323] disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};