
import React, { useState } from 'react';
import { 
  Layout, Clock, Settings2, Save, RefreshCw, AlertCircle
} from 'lucide-react';

const ConfigCenter: React.FC = () => {
  const [projectName, setProjectName] = useState(localStorage.getItem('app_project_name') || 'Hệ thống Bầu cử');
  const [endTime, setEndTime] = useState(localStorage.getItem('election_end_time') || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    localStorage.setItem('app_project_name', projectName.trim());
    localStorage.setItem('election_end_time', endTime);
    
    setTimeout(() => {
      setIsSaving(false);
      alert('Cấu hình đã được lưu!');
      window.location.reload();
    }, 500);
  };

  const handleResetData = () => {
    if (confirm("CẢNH BÁO: Thao tác này sẽ xóa toàn bộ danh sách cử tri và reset hệ thống về ban đầu. Bạn có chắc chắn?")) {
      localStorage.removeItem('voters');
      localStorage.removeItem('app_initialized');
      alert("Đã xóa dữ liệu cử tri. Hệ thống sẽ tải lại dữ liệu mẫu.");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white">
          <Settings2 size={24} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cài đặt Hệ thống</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layout size={14} /> Tên dự án / Đơn vị
            </label>
            <input 
              type="text" 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-red-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} /> Thời gian kết thúc
            </label>
            <input 
              type="datetime-local" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-red-500 outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            LƯU THAY ĐỔI
          </button>
        </div>
      </form>

      <div className="bg-red-50 p-6 rounded-3xl border border-red-100 space-y-4">
        <h3 className="text-red-700 font-black uppercase text-sm flex items-center gap-2">
          <AlertCircle size={18} /> Khu vực nguy hiểm
        </h3>
        <p className="text-xs text-red-600 font-medium">Xóa dữ liệu cử tri hiện tại để nhập lại danh sách mới hoặc làm sạch hệ thống.</p>
        <button 
          onClick={handleResetData}
          className="px-6 py-2 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white transition-all"
        >
          XÓA TẤT CẢ CỬ TRI
        </button>
      </div>
    </div>
  );
};

export default ConfigCenter;
