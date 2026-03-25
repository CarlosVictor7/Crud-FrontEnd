// @ts-nocheck
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { 
  User, Lock, Mail, Phone, Trash2, Edit, Plus, 
  Menu, X, Home, Users, Package, Settings, LogOut, 
  Moon, Sun, ChevronLeft, Activity, 
  CheckCircle2, XCircle, AlertTriangle, Search, ShieldCheck, Sparkles,
  Eye, EyeOff, UserCog, Calendar, SortDesc, Save, Info,
  ChevronDown
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import { runtimeApi } from '../services/runtime-api';
import { profileService } from '../services/profile-service';
import { tokenStorage } from '../lib/http';
import { BRAND_ASSETS } from '../branding/assets';
import {
  canAccessView,
  canDeleteClients,
  canDeleteProducts,
  canDeleteUsers,
  getDefaultViewByRole,
} from '../lib/rbac';
import { filterAndSortUsers, formatLastLoginDateTime, formatUserDate, usersRoleNames } from '../features/users/users-utils';
import { deleteClientAction, loadClientsAction, submitClientAction, toggleClientStatusAction } from '../features/clients/clients-actions';
import { filterAndSortClients } from '../features/clients/clients-utils';
import { deleteProductAction, loadProductsAction, submitProductAction, toggleProductStatusAction } from '../features/products/products-actions';
import { filterAndSortProducts } from '../features/products/products-utils';
import { formatProfileDate, formatProfileLastLogin, profileRoleNames } from '../features/profile/profile-utils';
import { pathViewMap, viewPathMap } from '../features/navigation/view-routing';
import { dashboardService } from '../features/dashboard/dashboard-service';
import { buildDashboardComputedData, formatDashboardDate, formatDashboardDateTime } from '../features/dashboard/dashboard-utils';

// ==========================================
// 1. MOCK API & INITIAL DATA
// ==========================================

const delay = (ms) => new Promise(res => setTimeout(res, ms));
const api = runtimeApi;
const THEME_STORAGE_KEY = 'lobocore_theme';
const SKU_PREFIX = 'PRD-';
const SKU_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SKU_LENGTH = 6;

const generateSkuPreview = () => {
  let block = '';

  for (let index = 0; index < SKU_LENGTH; index += 1) {
    const randomIndex = Math.floor(Math.random() * SKU_CHARS.length);
    block += SKU_CHARS[randomIndex];
  }

  return `${SKU_PREFIX}${block}`;
};

const onlyDigits = (value = '') => value.replace(/\D/g, '');

const formatBrazilPhone = (value = '') => {
  const digits = onlyDigits(value).slice(0, 11);

  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCpfCnpj = (value = '') => {
  const digits = onlyDigits(value).slice(0, 14);

  if (!digits) return '';

  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

const ToastContext = createContext();
const useToast = () => useContext(ToastContext);

const callGemini = async (prompt) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
  const apiBaseUrl = import.meta.env.VITE_GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com';

  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini não configurado: defina VITE_GEMINI_API_KEY no .env');
  }

  const url = `${apiBaseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  const fetchWithRetry = async (retries = 5, delay = 1000) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let apiMessage = '';
        try {
          const errorBody = await response.json();
          apiMessage = errorBody?.error?.message || '';
        } catch {
          apiMessage = '';
        }

        if (response.status === 403) {
          throw new Error(`Gemini recusou acesso (403). Verifique chave, permissões da API e restrições de origem. ${apiMessage}`.trim());
        }

        throw new Error(apiMessage ? `Erro Gemini (${response.status}): ${apiMessage}` : `Erro Gemini (${response.status})`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('Gemini não configurado') || message.includes('Gemini recusou acesso (403)')) {
        throw error;
      }

      if (retries > 0) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(retries - 1, delay * 2); 
      }
      throw new Error('Falha ao conectar com a IA após várias tentativas.');
    }
  };
  return fetchWithRetry();
};

// ==========================================
// 3. UI COMPONENTS
// ==========================================

const Button = ({ children, variant = 'primary', className = '', loading = false, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 focus:ring-cyan-500 border border-transparent",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 focus:ring-slate-500 dark:bg-[#181C26] dark:hover:bg-[#202634]",
    outline: "border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141821] focus:ring-cyan-500",
    ghost: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#151923] focus:ring-slate-500",
    destructive: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/30 focus:ring-rose-500 border border-transparent"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : null}
      {children}
    </button>
  );
};

// COMPONENTE SELECT PREMIUM COM SETA INTERATIVA (ROTACAO AO ABRIR)
const Select = ({ icon: Icon, children, className = '', ...props }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative group ${className}`}>
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-500 transition-colors">
          <Icon size={16} />
        </div>
      )}
      <select
        className={`w-full py-2 ${Icon ? 'pl-9' : 'pl-3'} pr-10 text-sm rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0E121B] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer appearance-none transition-all hover:border-slate-400 dark:hover:border-white/20`}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onChange={(e) => {
          setIsOpen(false);
          props.onChange?.(e);
        }}
        {...props}
      >
        {children}
      </select>
      <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-hover:text-slate-300 transition-all duration-300 transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
        <ChevronDown size={16} />
      </div>
    </div>
  );
};

const Input = ({ label, icon: Icon, rightElement, error, className = '', ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {props.required ? <span className="text-rose-500 ml-1">*</span> : null}
      </label>
    )}
    <div className="relative group">
      {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-500 transition-colors"><Icon size={18} /></div>}
      <input 
        className={`w-full rounded-lg border bg-white dark:bg-[#0E121B] px-3 py-2 text-sm text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 ${Icon ? 'pl-10' : ''} ${rightElement ? 'pr-10' : ''} ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-white/10 focus:border-cyan-500'}`}
        {...props}
      />
      {rightElement && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{rightElement}</div>}
    </div>
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-[#181C26] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: "bg-slate-100 text-slate-800 dark:bg-[#151923] dark:text-slate-300 border border-slate-200 dark:border-white/5",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/30",
    info: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/30",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800/30",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>{children}</span>;
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#181C26] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão">
    <div className="flex flex-col items-center text-center py-2">
      <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 animate-bounce">
        <AlertTriangle size={32} />
      </div>
      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Exclusão Definitiva</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 px-4">
        Você está prestes a excluir permanentemente <span className="font-bold text-slate-700 dark:text-slate-200">"{itemName}"</span>. Esta ação não pode ser desfeita.
      </p>
      <div className="flex gap-3 w-full">
        <Button variant="ghost" onClick={onClose} className="flex-1" disabled={loading}>Cancelar</Button>
        <Button variant="destructive" onClick={onConfirm} className="flex-1" loading={loading}>Excluir Agora</Button>
      </div>
    </div>
  </Modal>
);

const BrandImage = ({ type = 'large', className = '' }) => {
  const [error, setError] = useState(false);

  if (error) {
    if (type === 'large' || type === 'compact') {
      return <div className={`flex items-center justify-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest ${className}`} style={{ fontFamily: 'system-ui, sans-serif' }}>LOBOCORE</div>;
    }
    return <div className={`flex items-center justify-center font-bold text-white bg-gradient-to-br from-cyan-600 to-blue-700 shadow-inner border border-cyan-400/30 ${className}`}>LC</div>;
  }

  let src = '';
  if (type === 'large') src = BRAND_ASSETS.horizontalLarge;
  if (type === 'compact') src = BRAND_ASSETS.horizontalCompact;
  if (type === 'icon') src = BRAND_ASSETS.icon;

  return <img src={src} alt="LoboCore" className={className} onError={() => setError(true)} />;
};

// ==========================================
// 4. VIEWS
// ==========================================

const LoginView = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0E121B] relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 dark:bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <button onClick={toggleTheme} className="absolute top-6 right-6 p-2 rounded-full bg-white dark:bg-[#141821] text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-white/5 z-10 hover:bg-slate-50 dark:hover:bg-[#151923] transition-all">
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <Card className="w-full max-w-md p-8 relative z-10 shadow-2xl shadow-cyan-900/5 dark:shadow-none border-white/20 dark:border-white/5 backdrop-blur-xl bg-white/80 dark:bg-[#141821]/90">
        <div className="flex flex-col items-center mb-8">
          <div className="py-6 px-4 bg-[#0E121B] rounded-2xl mb-8 shadow-lg w-full flex justify-center border border-slate-800 dark:border-white/5 overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
             <BrandImage type="large" className="h-20 md:h-24 w-auto object-contain relative z-10 drop-shadow-2xl text-4xl transform group-hover:scale-105 transition-transform duration-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Acesso ao Painel</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center">Painel Administrativo Tecnológico</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="E-mail Corporativo" type="email" icon={Mail} value={email} onChange={e => setEmail(e.target.value)} required placeholder="Digite seu e-mail corporativo" />
          <Input 
            label="Senha" 
            type={showPassword ? "text" : "password"} 
            icon={Lock} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            placeholder="Digite sua senha de acesso" 
            rightElement={
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 focus:outline-none transition-colors"
                title={showPassword ? "Ocultar senha" : "Ver senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          <Button type="submit" className="w-full py-2.5 mt-2" loading={loading}>
            Autenticar Sistema
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-slate-200 dark:border-white/5 pt-6">
          <p className="text-xs text-slate-500 dark:text-slate-500">Acesso restrito</p>
          <p className="text-[11px] text-slate-400 mt-2">Use somente credenciais corporativas ativas liberadas pela administracão 🐺</p>
        </div>
      </Card>
    </div>
  );
};

const DashboardView = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [aiInsights, setAiInsights] = useState('');
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  const loadDashboard = async () => {
    setDashboardLoading(true);
    setDashboardError('');

    try {
      const rawData = await dashboardService.fetchRawData();
      setDashboardData(buildDashboardComputedData(rawData));
    } catch (error) {
      setDashboardError(error?.message || 'Falha ao carregar métricas do dashboard.');
      showToast(error?.message || 'Falha ao carregar métricas do dashboard.', 'error');
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const generateInsights = async () => {
    if (!dashboardData) {
      showToast('Carregue os dados do dashboard antes de gerar insights.', 'warning');
      return;
    }

    const roleSummary = dashboardData.roleDistribution
      .map((item) => `${item.label}: ${item.value}`)
      .join(', ');

    const statusSummary = dashboardData.systemStatus
      .map((item) => `${item.label} (ativos: ${item.active}, inativos: ${item.inactive})`)
      .join('; ');

    setGeneratingInsights(true);
    try {
      const prompt = `Atue como analista operacional do sistema administrativo LoboCore. Considere os seguintes dados reais: ${dashboardData.kpis[0].title}: ${dashboardData.kpis[0].value}; ${dashboardData.kpis[1].title}: ${dashboardData.kpis[1].value}; ${dashboardData.kpis[2].title}: ${dashboardData.kpis[2].value}; ${dashboardData.kpis[3].title}: ${dashboardData.kpis[3].value}. Distribuição por perfis: ${roleSummary}. Status do sistema: ${statusSummary}. Escreva um insight curto (máximo 4 linhas), profissional e acionável para ${user.name}, destacando prioridades operacionais imediatas.`;
      const insight = await callGemini(prompt);
      setAiInsights(insight);
      showToast('Insights gerados com sucesso!', 'success');
    } catch (e) {
      showToast('Erro ao gerar insights', 'error');
    } finally {
      setGeneratingInsights(false);
    }
  };

  const stats = dashboardData?.kpis || [
    { title: 'Usuários cadastrados', value: '0', colorClass: 'text-cyan-500' },
    { title: 'Clientes ativos', value: '0', colorClass: 'text-emerald-500' },
    { title: 'Produtos registrados', value: '0', colorClass: 'text-blue-500' },
    { title: 'Produtos ativos', value: '0', colorClass: 'text-indigo-500' },
  ];

  const roleData = dashboardData?.roleDistribution || [];
  const systemStatus = dashboardData?.systemStatus || [];
  const lastLogins = dashboardData?.lastLogins || [];
  const recentUsers = dashboardData?.recentUsers || [];
  const statsIcons = [UserCog, Users, Package, CheckCircle2];

  const roleBadgeVariant = (role) => {
    if (role === 'super_admin') return 'purple';
    if (role === 'admin') return 'info';
    return 'default';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Bem-vindo de volta, <span className="text-cyan-600 dark:text-cyan-400 font-medium">{user.name}</span>. Aqui está o status do sistema.</p>
        </div>
        <Button onClick={generateInsights} loading={generatingInsights} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-none shadow-lg shadow-purple-500/20 text-white">
          <Sparkles size={16} className="mr-2" />
          Gerar Insights com IA ✨
        </Button>
      </div>

      {aiInsights && (
        <Card className="p-5 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-500/10 animate-in slide-in-from-top-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-100 dark:bg-[#151923] text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Análise da Inteligência Artificial</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{aiInsights}</p>
            </div>
          </div>
        </Card>
      )}

      {dashboardError && (
        <Card className="p-4 border-rose-200 dark:border-rose-500/20 bg-rose-50/60 dark:bg-rose-900/10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-rose-700 dark:text-rose-300">{dashboardError}</p>
            <Button variant="outline" onClick={loadDashboard}>Tentar novamente</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 flex items-start justify-between group hover:border-cyan-500/50 dark:hover:border-white/10 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</h3>
              <p className={`text-xs font-medium mt-2 ${stat.colorClass}`}>{dashboardLoading ? 'Atualizando...' : 'Dados reais do sistema'}</p>
            </div>
            <div className={`p-3 rounded-lg bg-slate-50 dark:bg-[#0E121B] group-hover:scale-110 transition-transform`}>
              {React.createElement(statsIcons[i] || Activity, { size: 24, className: stat.colorClass })}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Distribuição de usuários por perfil</h3>
          <div className="h-72">
            {dashboardLoading ? (
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Activity className="animate-spin mr-2" size={18} /> Carregando distribuição...
              </div>
            ) : roleData.every((item) => item.value === 0) ? (
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">Nenhum usuário encontrado para distribuição.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#141821', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff' }} cursor={{ fill: 'rgba(6,182,212,0.08)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {roleData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="col-span-1 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Resumo de status do sistema</h3>
          <div className="space-y-4">
            {dashboardLoading ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center"><Activity className="animate-spin mr-2" size={16} /> Carregando status...</div>
            ) : (
              systemStatus.map((item) => {
                const total = item.active + item.inactive;
                const activePercent = total > 0 ? Math.round((item.active / total) * 100) : 0;

                return (
                  <div key={item.label} className="p-4 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-[#0E121B]/50">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{total} registros</p>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#181C26] overflow-hidden mb-2">
                      <div className="h-full bg-cyan-500" style={{ width: `${activePercent}%` }} />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="success">Ativos: {item.active}</Badge>
                      <Badge variant="default">Inativos: {item.inactive}</Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Últimos acessos</h3>
          {dashboardLoading ? (
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center"><Activity className="animate-spin mr-2" size={16} /> Carregando acessos...</div>
          ) : lastLogins.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">Nenhum acesso registrado ainda. Assim que os usuários fizerem login, os eventos aparecerão aqui.</div>
          ) : (
            <div className="space-y-3">
              {lastLogins.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-[#141821] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#181C26] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs uppercase shadow-sm">
                      {item.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                      <div className="mt-1"><Badge variant={roleBadgeVariant(item.role)}>{usersRoleNames[item.role]}</Badge></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDashboardDateTime(item.lastLoginAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="col-span-1 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Cadastros recentes</h3>
          {dashboardLoading ? (
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center"><Activity className="animate-spin mr-2" size={16} /> Carregando cadastros...</div>
          ) : recentUsers.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">Nenhum cadastro recente disponível.</div>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-[#0E121B]/50">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Badge variant={roleBadgeVariant(item.role)}>{usersRoleNames[item.role]}</Badge>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDashboardDate(item.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="col-span-1 p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-900 to-slate-950 dark:from-[#181C26] dark:to-[#141821] border-slate-800 dark:border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
        <BrandImage type="icon" className="w-24 h-24 rounded-2xl mb-6 shadow-2xl shadow-cyan-500/20 border border-slate-700 dark:border-white/10 text-4xl" />
        <h3 className="text-xl font-bold text-white mb-2">LoboCore System</h3>
        <p className="text-slate-400 text-sm mb-6">Painel Administrativo Tecnológico de Alta Performance.</p>
        <Badge variant="info">Versão 2.4.0-stable</Badge>
      </Card>
    </div>
  );
};

// ==========================================
// 4.1 USERS VIEW
// ==========================================
const UsersView = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // State
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'client', status: 'active' });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.users.get();
      setUsersList(data);
    } catch (e) {
      showToast('Erro ao carregar usuários.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (userData = null) => {
    setEditingUser(userData);
    setShowPassword(false);
    if (userData) {
      setFormData({ name: userData.name, email: userData.email, password: '', role: userData.role, status: userData.active ? 'active' : 'inactive' });
    } else {
      setFormData({ name: '', email: '', password: '', role: 'client', status: 'active' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const nextActive = formData.status === 'active';

    try {
      if (editingUser) {
        await api.users.put(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        });

        if (editingUser.active !== nextActive) {
          await api.users.patchStatus(editingUser.id, nextActive);
        }

        if (formData.password.trim()) {
          await api.users.patchPassword(editingUser.id, formData.password.trim());
        }

        showToast('Usuário atualizado com sucesso.', 'success');
      } else {
        await api.users.post({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          active: nextActive,
        });
        showToast('Usuário criado com sucesso.', 'success');
      }
      setModalOpen(false);
      await loadUsers();
    } catch (e) {
      showToast(e?.message || 'Erro ao salvar usuário.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.users.patchStatus(id, !currentStatus);
      showToast(`Usuário ${!currentStatus ? 'ativado' : 'inativado'}.`, 'success');
      setUsersList(usersList.map(u => u.id === id ? { ...u, active: !currentStatus } : u));
    } catch (e) {
      showToast(e?.message || 'Erro ao alterar status.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setSaving(true);
    try {
      await api.users.delete(itemToDelete.id);
      showToast('Usuário excluído.', 'success');
      setUsersList(usersList.filter(u => u.id !== itemToDelete.id));
      setDeleteModalOpen(false);
    } catch (e) {
      showToast(e?.message || 'Erro ao excluir usuário.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return filterAndSortUsers(usersList, {
      searchTerm,
      roleFilter,
      statusFilter,
      sortBy,
    });
  }, [usersList, searchTerm, roleFilter, statusFilter, sortBy]);

  if (!canAccessView(user.role, 'users')) return <div className="text-center p-12 text-slate-500">Acesso Restrito.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Usuários</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Administre as contas e níveis de acesso ao painel.</p>
        </div>
        <Button onClick={() => handleOpenModal()}><Plus size={18} className="mr-2" /> Novo Usuário</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/5 flex flex-col lg:flex-row gap-4 bg-slate-50/50 dark:bg-[#0E121B]/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar por nome ou e-mail..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0E121B] focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} icon={UserCog} className="min-w-[160px]">
              <option value="all">Todas as Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
            </Select>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="min-w-[150px]">
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </Select>
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)} icon={SortDesc} className="min-w-[170px]">
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="nameAsc">Nome (A-Z)</option>
              <option value="nameDesc">Nome (Z-A)</option>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#151923] uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Data de Criação</th>
                <th className="px-6 py-4 font-medium">Último acesso</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500"><Activity className="animate-spin mx-auto mb-3" size={24} /> Carregando usuários...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="bg-white dark:bg-[#141821] hover:bg-slate-50 dark:hover:bg-[#181C26] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#181C26] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs uppercase shadow-sm">
                          {u.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Badge variant={u.role === 'super_admin' ? 'purple' : u.role === 'admin' ? 'info' : 'default'}>{usersRoleNames[u.role]}</Badge></td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleStatus(u.id, u.active)} className="focus:outline-none hover:scale-105 transition-transform" title="Alterar status">
                        <Badge variant={u.active ? 'success' : 'default'}>{u.active ? 'Ativo' : 'Inativo'}</Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs"><div className="flex items-center gap-1.5"><Calendar size={13} /> {formatUserDate(u.createdAt)}</div></td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{formatLastLoginDateTime(u.lastLoginAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button onClick={() => handleOpenModal(u)} title="Editar" className="flex items-center justify-center w-8 h-8 rounded-md bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/40 transition-colors border border-transparent dark:border-cyan-500/20"><Edit size={16} /></button>
                        {canDeleteUsers(user.role) && <button onClick={() => { setItemToDelete(u); setDeleteModalOpen(true); }} title="Excluir" className="flex items-center justify-center w-8 h-8 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors border border-transparent dark:border-rose-500/20"><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? "Editar Usuário" : "Novo Usuário"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Digite o nome completo do usuário" />
          <Input label="E-mail" type="email" icon={Mail} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="Digite o e-mail corporativo do usuário" />
          <Input
            label={editingUser ? 'Nova Senha (opcional)' : 'Senha Temporária'}
            type={showPassword ? "text" : "password"}
            icon={Lock}
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            required={!editingUser}
            placeholder={editingUser ? 'Deixe em branco para manter a senha atual' : 'Defina uma senha temporaria de acesso'}
            rightElement={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-cyan-500 focus:outline-none transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nível de Acesso<span className="text-rose-500 ml-1">*</span></label>
              <Select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
                {canDeleteUsers(user.role) && <option value="super_admin">Super Admin</option>}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status Inicial<span className="text-rose-500 ml-1">*</span></label>
              <Select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </Select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 mt-6">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editingUser ? 'Salvar Alterações' : 'Criar Usuário'}</Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} itemName={itemToDelete?.name} loading={saving} />
    </div>
  );
};

// ==========================================
// 4.2 CLIENTS VIEW
// ==========================================
const ClientsView = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', document: '' });

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    await loadClientsAction({
      setLoading,
      setClients,
      showToast,
    });
  };

  const handleOpenModal = (client = null) => {
    setEditingClient(client);
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: formatBrazilPhone(client.phone || ''),
        document: formatCpfCnpj(client.document || ''),
      });
    } else {
      setFormData({ name: '', email: '', phone: '', document: '' });
    }
    setModalOpen(true);
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: formatBrazilPhone(value) }));
  };

  const handleDocumentChange = (value) => {
    setFormData((prev) => ({ ...prev, document: formatCpfCnpj(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitClientAction({
      editingClient,
      formData,
      setSaving,
      showToast,
      closeModal: () => setModalOpen(false),
      reload: loadClients,
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await toggleClientStatusAction({
      id,
      currentStatus,
      clients,
      setClients,
      showToast,
    });
  };

  const handleConfirmDelete = async () => {
    await deleteClientAction({
      itemToDelete,
      setSaving,
      clients,
      setClients,
      closeDeleteModal: () => setDeleteModalOpen(false),
      showToast,
    });
  };

  const filteredClients = useMemo(() => {
    return filterAndSortClients(clients, {
      searchTerm,
      statusFilter,
      sortBy,
    });
  }, [clients, searchTerm, statusFilter, sortBy]);

  if (!canAccessView(user.role, 'clients')) return <div className="text-center p-12 text-slate-500">Acesso Restrito.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Clientes</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie a base de clientes do sistema.</p>
        </div>
        <Button onClick={() => handleOpenModal()}><Plus size={18} className="mr-2" /> Novo Cliente</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row gap-4 bg-slate-50/50 dark:bg-[#0E121B]/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar por nome ou documento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0E121B] focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="min-w-[150px]">
              <option value="all">Todos Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </Select>
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)} icon={SortDesc} className="min-w-[170px]">
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="nameAsc">Nome (A-Z)</option>
              <option value="nameDesc">Nome (Z-A)</option>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#151923] uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Contato</th>
                <th className="px-6 py-4 font-medium">Documento</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500"><Activity className="animate-spin mx-auto mb-2" /> Carregando base...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Nenhum cliente encontrado.</td></tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="bg-white dark:bg-[#141821] hover:bg-slate-50 dark:hover:bg-[#181C26] transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{client.name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2"><Mail size={14}/> {client.email}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs"><Phone size={14}/> {formatBrazilPhone(client.phone || '')}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatCpfCnpj(client.document || '')}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleStatus(client.id, client.active)} className="focus:outline-none hover:scale-105 transition-transform">
                        <Badge variant={client.active ? 'success' : 'danger'}>{client.active ? 'Ativo' : 'Inativo'}</Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button onClick={() => handleOpenModal(client)} title="Editar" className="flex items-center justify-center w-8 h-8 rounded-md bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/40 transition-colors border border-transparent dark:border-cyan-500/20"><Edit size={16} /></button>
                        {canDeleteClients(user.role) && <button onClick={() => { setItemToDelete(client); setDeleteModalOpen(true); }} title="Excluir" className="flex items-center justify-center w-8 h-8 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors border border-transparent dark:border-rose-500/20"><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingClient ? "Editar Cliente" : "Novo Cliente"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Razão Social / Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="E-mail" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            <Input label="Telefone" value={formData.phone} onChange={e => handlePhoneChange(e.target.value)} inputMode="numeric" placeholder={onlyDigits(formData.phone).length > 10 ? '(00) 00000-0000' : '(00) 0000-0000'} required />
          </div>
          <Input label="Documento (CPF/CNPJ)" value={formData.document} onChange={e => handleDocumentChange(e.target.value)} inputMode="numeric" placeholder={onlyDigits(formData.document).length > 11 ? '00.000.000/0000-00' : '000.000.000-00'} required />
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 mt-6">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editingClient ? 'Salvar Alterações' : 'Criar Cliente'}</Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} itemName={itemToDelete?.name} loading={saving} />
    </div>
  );
};

// ==========================================
// 4.3 PRODUCTS VIEW
// ==========================================
const ProductsView = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [formData, setFormData] = useState({ name: '', sku: '', price: '', stock: '', category: 'Informática', description: '' });
  const [saving, setSaving] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const isClient = !canAccessView(user.role, 'clients');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    await loadProductsAction({
      isClient,
      setLoading,
      setProducts,
      showToast,
    });
  };

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setFormData({ name: product.name, sku: product.sku, price: product.price.toString(), stock: product.stock.toString(), category: product.category, description: product.description });
    } else {
      const generateSKU = generateSkuPreview();
      setFormData({ name: '', sku: generateSKU, price: '', stock: '', category: 'Informática', description: '' });
    }
    setModalOpen(true);
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      showToast('Preencha o nome do produto primeiro para a IA ter contexto.', 'warning');
      return;
    }
    setGeneratingDesc(true);
    try {
      const prompt = `Escreva uma descrição comercial curta e atrativa (máximo de 3 linhas) para um produto chamado "${formData.name}" da categoria "${formData.category}". Seja profissional, direto e foque em vendas B2B. Responda apenas com o texto da descrição, sem aspas ou introduções.`;
      const desc = await callGemini(prompt);
      setFormData(prev => ({ ...prev, description: desc.trim() }));
      showToast('Descrição gerada com IA! ✨', 'success');
    } catch (e) {
      showToast('Falha ao gerar descrição com IA', 'error');
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitProductAction({
      editingProduct,
      formData,
      setSaving,
      showToast,
      closeModal: () => setModalOpen(false),
      reload: loadProducts,
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await toggleProductStatusAction({
      id,
      currentStatus,
      products,
      setProducts,
      showToast,
    });
  };

  const handleConfirmDelete = async () => {
    await deleteProductAction({
      itemToDelete,
      setSaving,
      products,
      setProducts,
      closeDeleteModal: () => setDeleteModalOpen(false),
      showToast,
    });
  };

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, {
      searchTerm,
      categoryFilter,
      statusFilter,
      sortBy,
    });
  }, [products, searchTerm, categoryFilter, statusFilter, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Catálogo de Produtos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{isClient ? 'Navegue pelos nossos produtos e serviços disponíveis.' : 'Gerencie o catálogo de produtos e serviços do sistema.'}</p>
        </div>
        {!isClient && <Button onClick={() => handleOpenModal()}><Plus size={18} className="mr-2" /> Novo Produto</Button>}
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/5 flex flex-col lg:flex-row gap-4 bg-slate-50/50 dark:bg-[#0E121B]/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar por nome ou SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0E121B] focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="min-w-[150px]">
              <option value="all">Categorias</option>
              <option value="Informática">Informática</option>
              <option value="Periféricos">Periféricos</option>
              <option value="Acessórios">Acessórios</option>
              <option value="Escritório">Escritório</option>
              <option value="Redes">Redes</option>
              <option value="Energia">Energia</option>
              <option value="Outros">Outros</option>
            </Select>
            {!isClient && (
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="min-w-[130px]">
                <option value="all">Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </Select>
            )}
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)} icon={SortDesc} className="min-w-[170px]">
              <option value="newest">Lançamentos</option>
              <option value="priceAsc">Menor Preço</option>
              <option value="priceDesc">Maior Preço</option>
              <option value="stockLow">Baixo Estoque</option>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#151923] uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Produto</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Preço / Estoque</th>
                {!isClient && <th className="px-6 py-4 font-medium">Status</th>}
                {!isClient && <th className="px-6 py-4 font-medium text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan={isClient ? 4 : 6} className="px-6 py-8 text-center text-slate-500"><Activity className="animate-spin mx-auto mb-2" /> Carregando catálogo...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={isClient ? 4 : 6} className="px-6 py-8 text-center text-slate-500">Nenhum produto encontrado.</td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="bg-white dark:bg-[#141821] hover:bg-slate-50 dark:hover:bg-[#181C26] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{product.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 cursor-help w-fit group" title={product.description}>
                        <span className="line-clamp-1 max-w-[200px]">{product.description}</span>
                        <Info size={12} className="shrink-0 opacity-40 group-hover:opacity-100 group-hover:text-cyan-500 transition-all" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{product.sku}</td>
                    <td className="px-6 py-4"><Badge variant={product.category === 'Informática' ? 'info' : product.category === 'Periféricos' ? 'warning' : 'default'}>{product.category}</Badge></td>
                    <td className="px-6 py-4"><div className="font-medium text-cyan-600 dark:text-cyan-400">{formatMoney(product.price)}</div><div className={`text-xs mt-1 ${product.stock < 10 ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>{product.stock} un disponíveis</div></td>
                    {!isClient && (
                      <td className="px-6 py-4">
                        <button onClick={() => handleToggleStatus(product.id, product.active)} className="focus:outline-none hover:scale-105 transition-transform">
                          <Badge variant={product.active ? 'success' : 'danger'}>{product.active ? 'Ativo' : 'Inativo'}</Badge>
                        </button>
                      </td>
                    )}
                    {!isClient && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <button onClick={() => handleOpenModal(product)} title="Editar" className="flex items-center justify-center w-8 h-8 rounded-md bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/40 transition-colors border border-transparent dark:border-cyan-500/20"><Edit size={16} /></button>
                          {canDeleteProducts(user.role) && <button onClick={() => { setItemToDelete(product); setDeleteModalOpen(true); }} title="Excluir" className="flex items-center justify-center w-8 h-8 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors border border-transparent dark:border-rose-500/20"><Trash2 size={16} /></button>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? "Editar Produto" : "Novo Produto"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome do Produto" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU (Apenas Leitura)" value={formData.sku} readOnly className="bg-slate-50 dark:bg-[#141821] cursor-not-allowed text-slate-500" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoria<span className="text-rose-500 ml-1">*</span></label>
              <Select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                <option value="Informática">Informática</option>
                <option value="Periféricos">Periféricos</option>
                <option value="Acessórios">Acessórios</option>
                <option value="Escritório">Escritório</option>
                <option value="Redes">Redes</option>
                <option value="Energia">Energia</option>
                <option value="Outros">Outros</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Preço (R$)" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
            <Input label="Estoque" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição<span className="text-rose-500 ml-1">*</span></label>
              <button type="button" onClick={handleGenerateDescription} disabled={generatingDesc} className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors disabled:opacity-50">
                {generatingDesc ? <Activity size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Auto-completar com IA ✨
              </button>
            </div>
            <textarea className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0E121B] px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none h-24"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 mt-6">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editingProduct ? 'Salvar Alterações' : 'Criar Produto'}</Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} itemName={itemToDelete?.name} loading={saving} />
    </div>
  );
};

const ProfileView = () => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const fullUser = useMemo(() => {
    return profileService.findProfileByEmail(user.email, user);
  }, [user]);

  const [formData, setFormData] = useState({ name: fullUser.name, email: fullUser.email, password: '' });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await delay(800); 
      await profileService.updateProfileByEmail(user.email, { name: formData.name, email: formData.email });
      if (setUser) setUser({ ...user, name: formData.name, email: formData.email });
      showToast('Perfil atualizado com sucesso!', 'success');
      setIsEditing(false);
      setFormData(prev => ({...prev, password: ''}));
    } catch (error) {
      showToast('Erro ao atualizar perfil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Visualize e gerencie as suas informações de conta.</p>
        </div>
        {!isEditing && <Button onClick={() => setIsEditing(true)}><Edit size={16} className="mr-2" /> Editar Perfil</Button>}
      </div>
      
      <Card className="overflow-hidden">
        <div className="h-32 bg-slate-950 dark:bg-[#0E121B] flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/50 to-blue-900/50"></div>
           <BrandImage type="large" className="h-12 relative z-10 opacity-90 mix-blend-screen text-4xl" />
        </div>
        
        <div className="p-8 relative">
          <div className="absolute -top-12 left-8 p-1.5 bg-white dark:bg-[#181C26] rounded-full">
            <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg uppercase">
              {fullUser.name.charAt(0)}
            </div>
          </div>
          
          <div className="mt-12">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-white/5 pb-2">Informações Editáveis</h3>
                    <Input label="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required icon={User} />
                    <Input label="E-mail de Acesso" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required icon={Mail} />
                    <Input label="Nova Senha (opcional)" type={showPassword ? "text" : "password"} icon={Lock} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Deixe em branco para manter" 
                      rightElement={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-cyan-500 focus:outline-none transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-white/5 pb-2">Informações do Sistema (Leitura)</h3>
                    <div className="bg-slate-50 dark:bg-[#141821] p-4 rounded-lg border border-slate-200 dark:border-white/5 space-y-5">
                      <div><p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Nível de Acesso (Role)</p><Badge variant={fullUser.role === 'super_admin' ? 'purple' : fullUser.role === 'admin' ? 'info' : 'default'}>{profileRoleNames[fullUser.role]}</Badge></div>
                      <div><p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Status da Conta</p><Badge variant={fullUser.active ? 'success' : 'danger'}>{fullUser.active ? 'Ativo' : 'Inativo'}</Badge></div>
                      <div><p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Membro Desde</p><p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> {formatProfileDate(fullUser.createdAt)}</p></div>
                      <div><p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Último acesso</p><p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Activity size={14} className="text-slate-400" /> {formatProfileLastLogin(fullUser.lastLoginAt)}</p></div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <Button type="submit" loading={saving}><Save size={16} className="mr-2" /> Salvar Alterações</Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                <div className="space-y-6">
                  <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Nome Completo</p><p className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"><User size={18} className="text-slate-400"/> {fullUser.name}</p></div>
                  <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">E-mail de Acesso</p><p className="text-slate-900 dark:text-white flex items-center gap-2"><Mail size={18} className="text-slate-400"/> {fullUser.email}</p></div>
                  <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Membro Desde</p><p className="text-slate-900 dark:text-white flex items-center gap-2"><Calendar size={18} className="text-slate-400"/> {formatProfileDate(fullUser.createdAt)}</p></div>
                </div>
                <div className="space-y-6">
                  <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Nível de Acesso (Role)</p><Badge variant={fullUser.role === 'super_admin' ? 'purple' : fullUser.role === 'admin' ? 'info' : 'default'} className="text-sm px-3 py-1">{profileRoleNames[fullUser.role]}</Badge>{fullUser.role === 'super_admin' && <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><ShieldCheck size={14}/> Acesso irrestrito ao sistema.</p>}</div>
                  <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Status da Conta</p><Badge variant={fullUser.active ? 'success' : 'danger'} className="text-sm px-3 py-1">{fullUser.active ? 'Ativo' : 'Inativo'}</Badge></div>
                  <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Último acesso</p><p className="text-slate-900 dark:text-white flex items-center gap-2"><Activity size={18} className="text-slate-400"/> {formatProfileLastLogin(fullUser.lastLoginAt)}</p></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const Layout = ({ children, currentView, setCurrentView }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 1024) setSidebarOpen(false); };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, show: canAccessView(user.role, 'dashboard') },
    { id: 'users', label: 'Usuários', icon: UserCog, show: canAccessView(user.role, 'users') },
    { id: 'clients', label: 'Clientes', icon: Users, show: canAccessView(user.role, 'clients') },
    { id: 'products', label: 'Produtos', icon: Package, show: canAccessView(user.role, 'products') },
    { id: 'profile', label: 'Meu Perfil', icon: Settings, show: canAccessView(user.role, 'profile') },
  ].filter(item => item.show);

  const renderSidebar = (isMobile = false) => (
    <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-[#141821] border-r border-slate-200 dark:border-white/5 transition-all duration-300 ${isMobile ? (mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64') : (sidebarOpen ? 'translate-x-0 w-64' : 'translate-x-0 w-20')} lg:relative lg:translate-x-0 h-full`}>
      <div className={`h-16 flex items-center justify-center border-b border-[#0E121B] dark:border-white/5 transition-all duration-300 bg-[#0E121B] dark:bg-transparent ${(!sidebarOpen && !isMobile) ? 'px-2' : 'px-4'}`}>
        <div className="w-full h-full flex justify-center items-center py-2">
          {(!sidebarOpen && !isMobile) ? <BrandImage type="icon" className="w-10 h-10 rounded-lg object-contain text-lg" /> : <BrandImage type="compact" className="w-full h-11 object-contain drop-shadow-md text-2xl" />}
        </div>
      </div>
      <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const active = currentView === item.id;
          return (
            <button key={item.id} onClick={() => { setCurrentView(item.id); if (isMobile) setMobileMenuOpen(false); }}
              className={`flex items-center rounded-lg transition-all duration-200 group ${(!sidebarOpen && !isMobile) ? 'justify-center p-3' : 'px-4 py-3 gap-4'} ${active ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 shadow-[inset_4px_0_0_0_#06b6d4]' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#181C26] border border-transparent'}`}
              title={(!sidebarOpen && !isMobile) ? item.label : undefined}
            >
              <item.icon size={20} className={active ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-slate-300'} />
              {(sidebarOpen || isMobile) && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-white/5">
        <button onClick={logout} className={`w-full flex items-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ${(!sidebarOpen && !isMobile) ? 'justify-center p-3' : 'px-4 py-3 gap-4'}`}>
          <LogOut size={20} />
          {(sidebarOpen || isMobile) && <span className="font-medium text-sm">Sair do Sistema</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-[#0E121B] flex overflow-hidden transition-colors duration-500 text-slate-900 dark:text-slate-100 font-sans selection:bg-cyan-500/30">
      <div className="hidden lg:block h-full">{renderSidebar(false)}</div>
      {mobileMenuOpen && <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-30 lg:hidden animate-in fade-in" onClick={() => setMobileMenuOpen(false)}></div>}
      <div className="lg:hidden">{renderSidebar(true)}</div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white/80 dark:bg-[#141821]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 lg:px-8 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white"><Menu size={24} /></button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block text-slate-500 hover:text-slate-900 dark:hover:text-white transition-transform">{sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}</button>
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 font-medium"><span>LoboCore</span><span className="text-slate-300 dark:text-slate-700">/</span><span className="text-cyan-600 dark:text-cyan-400 capitalize">{currentView.replace('-', ' ')}</span></div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-[#181C26] transition-colors">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="h-6 w-px bg-slate-200 dark:bg-white/5"></div>
            <div className="flex items-center gap-3" onClick={() => setCurrentView('profile')} role="button">
              <div className="text-right hidden sm:block"><p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user.name}</p><p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">{user.role.replace('_', ' ')}</p></div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md uppercase">{user.name.charAt(0)}</div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">{children}</main>
      </div>
    </div>
  );
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    const persisted = localStorage.getItem(THEME_STORAGE_KEY);
    if (persisted === 'light' || persisted === 'dark') {
      return persisted;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('lobocore_token');
      if (token) {
        try {
          const data = await api.auth.me(token);
          setUser(data.user);
        } catch {
          tokenStorage.clear();
          setUser(null);
        }
      }
      setLoadingAuth(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (loadingAuth) {
      return;
    }

    if (!user) {
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
      return;
    }

    const requestedView = pathViewMap[location.pathname];
    const fallbackView = getDefaultViewByRole(user.role);

    if (!requestedView) {
      navigate(viewPathMap[fallbackView], { replace: true });
      return;
    }

    if (!canAccessView(user.role, requestedView)) {
      navigate(viewPathMap[fallbackView], { replace: true });
      return;
    }

    setCurrentView(requestedView);
  }, [loadingAuth, user, location.pathname]);

  const navigateToView = (view) => {
    setCurrentView(view);
    const targetPath = viewPathMap[view] || viewPathMap.dashboard;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    localStorage.setItem('lobocore_token', data.token);
    setUser(data.user);
    const targetView = getDefaultViewByRole(data.user.role);
    navigate(viewPathMap[targetView], { replace: true });
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
    setCurrentView('dashboard');
    navigate('/login', { replace: true });
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 3000);
  };

  const renderView = () => {
    if (!canAccessView(user.role, currentView)) {
      const fallbackView = getDefaultViewByRole(user.role);

      if (fallbackView === 'dashboard') return <DashboardView />;
      if (fallbackView === 'clients') return <ClientsView />;
      return <ProductsView />;
    }

    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'users': return <UsersView />;
      case 'clients': return <ClientsView />;
      case 'products': return <ProductsView />;
      case 'profile': return <ProfileView />;
      default: {
        const defaultView = getDefaultViewByRole(user.role);
        if (defaultView === 'dashboard') return <DashboardView />;
        if (defaultView === 'clients') return <ClientsView />;
        return <ProductsView />;
      }
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0E121B] flex items-center justify-center flex-col gap-6 transition-colors duration-500">
        <BrandImage type="icon" className="w-20 h-20 rounded-2xl shadow-2xl shadow-cyan-500/20 animate-pulse text-3xl" />
        <Activity className="text-cyan-500 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, setUser, login, logout }}>
        <ToastContext.Provider value={{ showToast }}>
          
          <div className="fixed top-0 right-0 w-full md:w-auto md:top-6 md:right-6 z-[100] flex flex-col gap-3 p-4 pointer-events-none">
            {toasts.map(toast => {
              const isError = toast.type === 'error';
              const isSuccess = toast.type === 'success';
              const isWarning = toast.type === 'warning';
              return (
                <div key={toast.id} className={`flex items-start gap-3 p-4 md:min-w-[320px] max-w-sm w-full mx-auto md:mx-0 rounded-xl shadow-2xl backdrop-blur-xl border border-slate-200/50 dark:border-white/5 pointer-events-auto overflow-hidden relative animate-in fade-in slide-in-from-top-5 md:slide-in-from-right-8 duration-300 bg-white/95 dark:bg-[#181C26]/95 ${isError ? 'border-l-4 border-l-rose-500' : isSuccess ? 'border-l-4 border-l-emerald-500' : isWarning ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-cyan-500'}`}>
                  <div className={`shrink-0 rounded-full p-1.5 mt-0.5 ${isError ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : isSuccess ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : isWarning ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400'}`}>
                    {isSuccess && <CheckCircle2 size={16} />}
                    {isError && <XCircle size={16} />}
                    {isWarning && <AlertTriangle size={16} />}
                    {(!isSuccess && !isError && !isWarning) && <Activity size={16} />}
                  </div>
                  <div className="flex-1"><p className="text-sm font-bold text-slate-900 dark:text-white">{isSuccess ? 'Sucesso' : isError ? 'Erro' : isWarning ? 'Aviso' : 'Informação'}</p><p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p></div>
                  <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors shrink-0 mt-0.5"><X size={14} /></button>
                </div>
              );
            })}
          </div>

          {!user ? <LoginView /> : <Layout currentView={currentView} setCurrentView={navigateToView}>{renderView()}</Layout>}

          <style dangerouslySetInnerHTML={{__html: `
            .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-track-piece { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
          `}} />
        </ToastContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}