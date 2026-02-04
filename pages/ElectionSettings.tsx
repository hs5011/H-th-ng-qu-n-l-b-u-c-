
import React, { useState, useEffect } from 'react';
import { Calendar, Save, AlertCircle, Timer, RefreshCcw } from 'lucide-react';

const ElectionSettings: React.FC = () => {
  const [endTime, setEndTime] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedEndTime = localStorage.getItem('election_end_time');
    if (savedEndTime) {
      setEndTime(savedEndTime);
    } else {
      const now = new Date();
      now.setHours(19, 0, 0, 0);
      const defaultTime = now.toISOString().slice(0, 16);
      setEndTime(defaultTime);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('election_end_time', endTime);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      alert('Cập nhật thời gian thành công!');
    } catch (err) {
      alert('Lỗi: Không thể lưu dữ liệu vào trình duyệt.');
    }
  };

  const resetAllData = () => {
    if (confirm("CẢNH BÁO: Thao tác này sẽ xóa sạch danh sách cử tri để bạn nhập lại từ đầu. Bạn có chắc chắn?")) {
      localStorage.removeItem('voters');
      localStorage.removeItem('app_initialized');
      alert("Đã làm sạch dữ liệu. Vui lòng F5 hoặc vào trang Nhập cử tri.");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cấu hình hệ thống</h1>
        <p className="text-slate-500 font-medium">Thiết lập thời điểm kết thúc nhận phiếu bầu</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-red-600 p-8 text-white flex items-center gap-6">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
            <Timer size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Thời gian kết thúc</h3>
            <p className="opacity-80 text-sm">Hệ thống sẽ hiển thị trạng thái "Đã kết thúc" khi đến giờ này.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
              <Calendar size={14} /> Ngày và giờ kết thúc
            </label>
            <input 
              type="datetime-local" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-bold text-slate-800 focus:border-red-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 text-amber-800">
            <AlertCircle className="shrink-0" size={20} />
            <p className="text-sm font-medium">
              Lưu ý: Thời gian này sẽ được dùng để hiển thị đồng hồ đếm ngược trên Dashboard.
            </p>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Save size={20} />
            {isSaved ? 'ĐÃ LƯU THÀNH CÔNG' : 'LƯU CÀI ĐẶT'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200">
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Quản lý dữ liệu</h4>
        <button 
          onClick={resetAllData}
          className="flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCcw size={16} /> Xóa sạch danh sách cử tri hiện tại
        </button>
      </div>
    </div>
  );
};

export default ElectionSettings;
