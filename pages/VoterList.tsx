
import React, { useState, useEffect } from 'react';
import { Voter } from '../types';
import { Search, Filter, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, UserMinus, Database } from 'lucide-react';

const VoterList: React.FC = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'voted' | 'not_voted'>('all');

  useEffect(() => {
    const loadVoters = () => {
      const saved = localStorage.getItem('voters');
      if (saved) {
        setVoters(JSON.parse(saved));
      }
    };
    loadVoters();
  }, []);

  const handleDeleteVoter = (id: string) => {
    if (confirm('Xóa cử tri này khỏi hệ thống?')) {
      const updated = voters.filter(v => v.id !== id);
      setVoters(updated);
      localStorage.setItem('voters', JSON.stringify(updated));
    }
  };

  const handleClearAll = () => {
    if (confirm('CẢNH BÁO: Hành động này sẽ xóa VĨNH VIỄN toàn bộ danh sách cử tri hiện có. Bạn có chắc chắn?')) {
      // 1. Cập nhật State trước để giao diện thay đổi ngay
      setVoters([]);
      
      // 2. Lưu mảng rỗng vào localStorage thay vì removeItem hoàn toàn 
      // để tránh Dashboard tự động nạp lại dữ liệu mẫu
      localStorage.setItem('voters', '[]');
      
      // 3. Đánh dấu hệ thống đã được initialized để Dashboard không nạp mẫu
      localStorage.setItem('app_initialized', 'true');
      
      alert('Đã xóa sạch cơ sở dữ liệu cử tri.');
    }
  };

  const filteredVoters = voters.filter(v => {
    const matchesSearch = v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         v.idCard.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'voted' && v.hasVoted) || 
                         (filterStatus === 'not_voted' && !v.hasVoted);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cơ sở dữ liệu cử tri</h1>
          <p className="text-slate-500 font-medium">Quản lý thông tin và trạng thái bỏ phiếu ({voters.length} người)</p>
        </div>
        {voters.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="flex items-center justify-center gap-2 px-5 py-3 text-red-600 bg-white hover:bg-red-50 border-2 border-red-100 rounded-xl transition-all text-sm font-black shadow-sm"
          >
            <UserMinus size={18} />
            XÓA TOÀN BỘ DANH SÁCH
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc số CCCD cử tri..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Database size={18} className="text-slate-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl text-sm px-4 py-3 outline-none focus:ring-4 focus:ring-red-50 font-bold text-slate-700"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="voted">Đã hoàn thành bỏ phiếu</option>
              <option value="not_voted">Chưa thực hiện bỏ phiếu</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredVoters.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Họ tên & CCCD</th>
                  <th className="px-6 py-4">Khu phố & Địa điểm</th>
                  <th className="px-6 py-4">Tổ / Đơn vị</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVoters.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800">{v.fullName}</p>
                        <p className="text-xs font-mono text-slate-400 font-medium">{v.idCard}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-700 font-bold">{v.votingArea}</p>
                        <p className="text-slate-400 text-xs font-medium">{v.neighborhood}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <p className="font-bold">Tổ: <span className="text-slate-400 font-medium">{v.votingGroup}</span></p>
                        <p className="font-bold">Đơn vị: <span className="text-slate-400 font-medium">{v.constituency}</span></p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                        v.hasVoted 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {v.hasVoted ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {v.hasVoted ? 'Đã bỏ phiếu' : 'Chưa bầu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteVoter(v.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-100">
                <Search className="text-slate-200" size={32} />
              </div>
              <h3 className="text-slate-800 font-bold text-lg">Không có dữ liệu cử tri</h3>
              <p className="text-slate-400 max-w-xs mx-auto text-sm mt-1">Danh sách hiện đang trống hoặc không có kết quả phù hợp với tìm kiếm của bạn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoterList;
