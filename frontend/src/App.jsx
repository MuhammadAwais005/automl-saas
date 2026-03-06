import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, CheckCircle, Download, Activity, Sparkles, User, 
  LayoutDashboard, Clock, LogOut, Settings, Camera, Trash2, XCircle, BarChart3
} from 'lucide-react';
import { 
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

// Set API base URL - change to production URL when deployed
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  // --- STATE ---
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [trainingTarget, setTrainingTarget] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingResult, setTrainingResult] = useState(null);

  const handleTrainModel = async () => {
    setIsTraining(true);
    try {
      const res = await axios.post(`${API_URL}/api/train/`, {
        file_url: result.download_url,
        target: trainingTarget
      });
      setTrainingResult(res.data);
    } catch (err) {
      alert("Training failed. Ensure target column is valid.");
    } finally {
      setIsTraining(false);
    }
  };
  
  // Profile & Auth State
  const [profile, setProfile] = useState({ full_name: '', job_title: '', company: '', avatar: null, username: '', newAvatarFile: null });
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // --- EFFECT ---
  useEffect(() => {
    if (token) { fetchHistory(); fetchProfile(); }
  }, [token]);

  const fetchHistory = async () => {
    try { const res = await axios.get(`${API_URL}/api/projects/`, { headers: { 'Authorization': `Bearer ${token}` } }); setHistory(res.data); } catch (err) { console.error(err); }
  };
  const fetchProfile = async () => {
    try { const res = await axios.get(`${API_URL}/api/profile/`, { headers: { 'Authorization': `Bearer ${token}` } }); setProfile({...res.data, newAvatarFile: null}); } catch (err) { console.error(err); }
  };

  // --- ACTIONS ---
  const handleAuth = async (e) => {
    e.preventDefault(); setAuthLoading(true); setAuthError('');
    try {
      if (!isLoginMode) await axios.post(`${API_URL}/api/register/`, { username, email, password });
      const res = await axios.post(`${API_URL}/api/token/`, { username, password });
      localStorage.setItem('access_token', res.data.access); setToken(res.data.access);
    } catch (err) { setAuthError('Authentication failed.'); } finally { setAuthLoading(false); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('full_name', profile.full_name); formData.append('job_title', profile.job_title); formData.append('company', profile.company);
    if (profile.newAvatarFile) formData.append('avatar', profile.newAvatarFile);
    try { await axios.patch(`${API_URL}/api/profile/`, formData, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }); alert("Profile Updated!"); fetchProfile(); } catch (err) { alert("Failed."); }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation(); if (!confirm("Delete this project?")) return;
    try { await axios.delete(`${API_URL}/api/projects/${projectId}/`, { headers: { 'Authorization': `Bearer ${token}` } }); setHistory(history.filter(h=>h.id!==projectId)); if(result?.id===projectId) setResult(null); } catch (err) { alert("Failed delete"); }
  };

  const handleUpload = async () => {
    if (!file) return; setIsLoading(true);
    const formData = new FormData(); formData.append('file', file);
    try {
      const res = await axios.post(`${API_URL}/api/process/`, formData, { headers: { 'Authorization': `Bearer ${token}` } });
      setResult(res.data); fetchHistory(); setActiveTab('visuals'); // Auto switch to visuals on complete
    } catch (err) { alert('Upload failed'); } finally { setIsLoading(false); }
  };

  const loadHistoryItem = (p) => {
    // Note: Old history items won't have heatmap/dist data saved in DB unless we add fields for them.
    // For now, this works for new uploads. 
    setResult({ ...p, download_url: p.processed_file.startsWith('/') ? p.processed_file : `/media/${p.processed_file}` });
    setFile(null); setActiveTab('visuals');
  };

  // --- COMPONENTS ---
  const ScoreGauge = ({ score, label, color }) => {
    const data = [{ name: 'Score', value: score, fill: color }];
    return (
      <div className="flex flex-col items-center justify-center relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={8} data={data} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} /> <RadialBar background clockWise dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white"><span className="text-2xl font-bold">{score}%</span><span className="text-[10px] opacity-70 uppercase tracking-widest">{label}</span></div>
      </div>
    );
  };

  // --- RENDER ---
  if (!token) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white bg-[#0f172a] relative overflow-hidden">
       <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
       <div className="max-w-md w-full z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
         <h2 className="text-2xl font-bold text-center mb-6">{isLoginMode ? "Welcome Back" : "Create Account"}</h2>
         <form onSubmit={handleAuth} className="space-y-4">
           <input type="text" value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="Username" required />
           {!isLoginMode && <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="Email" required />}
           <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="Password" required />
           {authError && <p className="text-red-400 text-xs text-center">{authError}</p>}
           <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-xl font-bold shadow-lg">{authLoading?"Processing...":isLoginMode?"Login":"Sign Up"}</button>
         </form>
         <p className="mt-4 text-center text-sm text-gray-400 cursor-pointer" onClick={()=>setIsLoginMode(!isLoginMode)}>{isLoginMode ? "Need an account? Sign Up" : "Have an account? Login"}</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen flex text-white bg-[#0f172a]">
      {/* SIDEBAR */}
      <motion.div initial={{ x: -50 }} animate={{ x: 0 }} className="w-80 bg-[#1e293b] border-r border-white/10 p-6 flex flex-col hidden md:flex shrink-0">
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/5 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition" onClick={() => setActiveTab('profile')}>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white/20 shrink-0">
            {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-lg font-bold">{username[0]?.toUpperCase()}</div>}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-sm truncate">{profile.full_name || username}</h3>
            <p className="text-xs text-gray-400 truncate">{profile.job_title || "Data Scientist"}</p>
          </div>
          <Settings className="w-4 h-4 text-gray-500 ml-auto" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="mb-6 space-y-1">
            <button onClick={() => {setActiveTab('dashboard'); setResult(null); setFile(null);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab==='dashboard'?'bg-blue-600':'hover:bg-white/5'}`}>
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </button>
            <button onClick={() => setActiveTab('visuals')} disabled={!result} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab==='visuals'?'bg-blue-600':'hover:bg-white/5'} ${!result ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <BarChart3 className="w-5 h-5" /> Analytics
            </button>
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab==='profile'?'bg-blue-600':'hover:bg-white/5'}`}>
              <User className="w-5 h-5" /> My Profile
            </button>
          </div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Recent Projects</h3>
          <div className="space-y-2">
            {history.length === 0 ? (<p className="text-xs text-gray-500 italic">No history yet.</p>) : history.map((p) => (
              <div key={p.id} onClick={() => loadHistoryItem(p)} className="relative bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 transition cursor-pointer group">
                <div className="flex justify-between items-center mb-1 pr-6">
                  <h4 className="font-medium text-xs truncate text-gray-200 group-hover:text-blue-400">{p.file_name}</h4>
                  <span className="text-[10px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">{p.final_score}%</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500"><Clock className="w-3 h-3" /> {new Date(p.created_at).toLocaleDateString()}</div>
                <button onClick={(e) => handleDeleteProject(e, p.id)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => {localStorage.removeItem('access_token'); setToken(null);}} className="mt-4 flex items-center gap-2 text-gray-400 hover:text-white text-sm"><LogOut className="w-4 h-4" /> Logout</button>
      </motion.div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-8 h-screen overflow-y-auto relative bg-[#0f172a]">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>

        {/* --- 1. DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto z-10 relative">
            <header className="mb-10">
              <h2 className="text-3xl font-bold">Auto ML Dashboard</h2>
              <p className="text-gray-400">Upload raw data to generate reports and visualizations.</p>
            </header>

            {!isLoading && !result && (
              <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                <div className="w-full max-w-xl mx-auto border-2 border-dashed border-white/20 rounded-2xl p-12 hover:bg-white/5 transition relative cursor-pointer">
                   <input type="file" onChange={e=>setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv" />
                   <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                   <h3 className="text-xl font-bold mb-2">{file ? file.name : "Drop CSV Here"}</h3>
                   <p className="text-gray-500 text-sm">Max size 50MB</p>
                </div>
                {file && <button onClick={handleUpload} className="mt-8 px-8 py-3 bg-blue-600 rounded-xl font-bold shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 mx-auto"><Sparkles className="w-4 h-4" /> Start Process</button>}
              </div>
            )}
            
            {isLoading && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 border-4 border-t-blue-500 border-white/10 rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-bold">Processing Data...</h3>
                <p className="text-gray-400">Generating Heatmaps & Distributions...</p>
              </div>
            )}
          </motion.div>
        )}

       {/* --- 2. ANALYTICS (VISUALS) & TRAINING --- */}
        {activeTab === 'visuals' && result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto z-10 relative pb-20">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">Data Analytics</h2>
                <p className="text-gray-400">Visual insights & AI Modeling</p>
              </div>
              <a href={`${API_URL}${result.download_url}`} download className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold flex items-center gap-2"><Download className="w-4 h-4" /> Download CSV</a>
            </header>

            {/* --- NEW: AI MODEL TRAINING SECTION --- */}
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-3xl p-8 mb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><Sparkles className="text-yellow-400" /> Train AI Model</h3>
                  <p className="text-gray-400 mb-6">Select a target column to train a Random Forest model instantly.</p>
                  
                  <div className="flex flex-wrap items-end gap-4">
                     <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm text-gray-400 mb-2">Target Column (What to predict?)</label>
                        <select 
                           className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                           onChange={(e) => setTrainingTarget(e.target.value)}
                        >
                           <option value="">Select Column...</option>
                           {result.columns && result.columns.map(col => (
                              <option key={col} value={col}>{col}</option>
                           ))}
                        </select>
                     </div>
                     <button 
                        onClick={handleTrainModel}
                        disabled={!trainingTarget || isTraining}
                        className={`px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 ${!trainingTarget ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-400'}`}
                     >
                        {isTraining ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Activity className="w-5 h-5" />}
                        {isTraining ? "Training..." : "Train Model"}
                     </button>
                  </div>

                  {/* TRAINING RESULTS */}
                  {trainingResult && (
                     <motion.div initial={{ opacity: 0, marginTop: 0 }} animate={{ opacity: 1, marginTop: 24 }} className="bg-black/30 rounded-xl p-6 border border-white/10 flex items-center justify-between mt-6">
                        <div>
                           <h4 className="text-gray-400 text-sm uppercase tracking-widest mb-1">{trainingResult.type} Model</h4>
                           <div className="text-3xl font-bold text-white">{trainingResult.accuracy}% <span className="text-sm font-normal text-gray-400">{trainingResult.metric}</span></div>
                        </div>
                        <a href={`${API_URL}${trainingResult.download_url}`} download className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold flex items-center gap-2 border border-white/10">
                           <Download className="w-4 h-4" /> Download .pkl Model
                        </a>
                     </motion.div>
                  )}
               </div>
            </div>

            {/* Top Row: Heatmap & Scores */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
               <div className="lg:col-span-2 bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col">
                  <h3 className="font-bold mb-4 flex gap-2"><Activity className="text-blue-400" /> Correlation Heatmap</h3>
                  <div className="flex-1 flex items-center justify-center bg-black/20 rounded-xl overflow-hidden min-h-[300px]">
                    {result.heatmap_url ? (
                       <img src={`${API_URL}${result.heatmap_url}`} alt="Heatmap" className="max-w-full max-h-[400px] object-contain" />
                    ) : (
                       <p className="text-gray-500 text-sm">No numeric correlation data available.</p>
                    )}
                  </div>
               </div>
               
               <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center">
                  <h3 className="font-bold mb-6">Data Health</h3>
                  <div className="flex flex-col gap-6">
                      <ScoreGauge score={result.initial_score} label="Before" color="#ef4444" />
                      <ScoreGauge score={result.final_score} label="After" color="#22c55e" />
                  </div>
               </div>
            </div>

            {/* Bottom Row: Distributions & Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution Charts */}
              <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="font-bold mb-6 flex gap-2"><BarChart3 className="text-purple-400" /> Feature Distributions</h3>
                <div className="space-y-8">
                  {result.distributions && result.distributions.length > 0 ? (
                    result.distributions.map((dist, i) => (
                      <div key={i} className="mb-4">
                        <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">{dist.column}</p>
                        <div className="h-40 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dist.data}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                              <XAxis dataKey="name" tick={{fill:'#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px'}} cursor={{fill: '#ffffff10'}} />
                              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} animationDuration={1500} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic text-center py-10">No numeric distributions available.</p>
                  )}
                </div>
              </div>

              {/* Text Report */}
              <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-y-auto max-h-[600px] custom-scrollbar">
                  <h3 className="font-bold mb-4 flex gap-2"><CheckCircle className="text-green-400" /> Processing Log</h3>
                  {result.report && result.report.length > 0 ? (
                      <ul className="space-y-2">
                      {result.report.map((item, i) => (
                          <li key={i} className="flex gap-3 text-xs text-gray-400 p-3 bg-black/20 rounded-lg border border-white/5">
                            <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" /> {item}
                          </li>
                      ))}
                      </ul>
                  ) : (
                      <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">No report details available.</div>
                  )}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- 3. PROFILE --- */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto z-10 relative">
             <header className="mb-10"><h2 className="text-3xl font-bold">My Profile</h2><p className="text-gray-400">Manage your personal information.</p></header>
             <form onSubmit={handleProfileUpdate} className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
               <div className="flex items-center gap-6">
                 <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 shrink-0">
                    {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"><Camera className="w-6 h-6 text-white" /><input type="file" className="hidden" onChange={e => {if(e.target.files[0]) {setProfile({...profile, newAvatarFile: e.target.files[0], avatar: URL.createObjectURL(e.target.files[0])})}}} /></label>
                 </div>
                 <div><h3 className="font-bold text-xl">{username}</h3><p className="text-sm text-gray-400">Upload a professional photo</p></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div><label className="block text-sm text-gray-400 mb-2">Full Name</label><input type="text" value={profile.full_name} onChange={e=>setProfile({...profile, full_name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3" /></div>
                 <div><label className="block text-sm text-gray-400 mb-2">Job Title</label><input type="text" value={profile.job_title} onChange={e=>setProfile({...profile, job_title: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3" /></div>
                 <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-2">Company</label><input type="text" value={profile.company} onChange={e=>setProfile({...profile, company: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3" /></div>
               </div>
               <div className="pt-4 border-t border-white/10 flex justify-end"><button type="submit" className="px-8 py-3 bg-blue-600 rounded-xl font-bold shadow-lg hover:bg-blue-500 transition">Save Changes</button></div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;