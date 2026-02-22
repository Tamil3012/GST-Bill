
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import logo from '@/assets/images/logo.webp';

interface LoginPageProps {
  onLogin: (success: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API delay
    setTimeout(() => {
      if (username === 'NammaTeaWorld' && password === '9030529076') {
        onLogin(true);
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-brand/20 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-10">
            <img className='w-[200px] mx-auto mb-2' src={logo} alt="logo" />

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={20} />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border  focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={20} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* <div className="flex items-center justify-between text-sm font-bold">
                <label className="flex items-center gap-2 cursor-pointer text-slate-500">
                  <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600" />
                  Remember me
                </label>
                <a href="#" className="text-indigo-600 hover:text-indigo-700">Forgot password?</a>
              </div> */}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-brand text-white rounded-xl font-bold shadow-xl shadow-indigo-100 hover:bg-brand/70 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Login to Dashboard'
                )}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
