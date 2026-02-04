
import React, { useState, useEffect, useMemo } from 'react';
import { Voter, User, UserRole } from '../types';
import { 
  Search, Trash2, Edit3, X, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';

const VoterList: React.FC = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'voted' | 'not_voted'>('all');
  
  // Modal state
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    try {
      const authData = localStorage.getItem('auth');
      if (authData) setCurrentUser(JSON.parse(authData).user);
      
      const saved = localStorage.getItem('voters');
      if (saved) {
        const parsed = JSON.parse(saved);
        setVoters(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.error("Lỗi tải dữ liệu cử tri:", e);
    }
  }, []);

  const handleUpdateVoter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingVoter) return;
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const updatedVoter: Voter = {
        ...editingVoter,
        fullName: (formData.get('fullName') as string || '').trim(),
        idCard: (formData.get('idCard') as string || '').trim(),
        address: (formData.get('address') as string || '').trim(),
        neighborhood: (formData.get('neighborhood') as string || '').trim(),
        votingArea: (formData.get('votingArea') as string || '').trim(),
        votingGroup: (formData.get('votingGroup') as string || '').trim(),
      };

      const updatedList = voters.map(v => v.id === updatedVoter.id ? updatedVoter : v);
      localStorage.setItem('voters', JSON.stringify(updatedList));
      setVoters(updatedList);
      setEditingVoter(null);
      alert('Đã cập nhật thông tin cử tri!');
    } catch (err: any) {
      console.error("Lỗi cập nhật cử tri:", err);
      setError("Không thể lưu thay đổi. Vui lòng thử lại.");
    }
  };

  const handleDeleteVoter = (id: string) => {
    if (confirm('Xóa cử tri này khỏi hệ thống?')) {
      try {
        const updated = voters.filter(v => v.id !== id);
        localStorage.setItem('voters', JSON.stringify(updated));
        setVoters(updated);
      } catch (e) {
        alert("Lỗi bộ nhớ khi thực hiện xóa.");
      }
    }
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const roleBaseVoters = useMemo(() => {
    if (isAdmin) return voters;
    return voters.filter(v => v.votingArea === currentUser?.votingArea);
  }, [voters, isAdmin, currentUser]);

  const filteredVoters = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return roleBaseVoters.filter(v => {
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'voted' && v.hasVoted) || 
                           (filterStatus === 'not_voted' && !v.hasVoted);
      if (!matchesFilter) return false;
      if (!term) return true;
      return (v.fullName || '').toLowerCase().includes(term) || (v.idCard || '').includes(term);
    });
  }, [roleBaseVoters, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredVoters.length / itemsPerPage);
  const paginatedVoters = filteredVoters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cơ sở dữ liệu cử tri</h1>
          <p className="text-slate-500 font-medium">Quản lý Thông tin - Chỉnh sửa - Xóa cử tri</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc CCCD..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50 font-medium"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl text-sm px-4 py-3 outline-none font-bold text-slate-700"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="voted">Đã bầu</option>
            <option value="not_voted">Chưa bầu</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Họ tên & CCCD</th>
                <th className="px-6 py-4">Khu vực / Tổ</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedVoters.length > 0 ? paginatedVoters.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{v.fullName}</p>
                    <p className="text-xs font-mono text-slate-400 font-medium">{v.idCard}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700 font-bold">{v.votingArea}</p>
                    <p className="text-xs text-slate-400">Tổ {v.votingGroup}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${v.hasVoted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {v.hasVoted ? 'Đã bầu' : 'Chưa bầu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditingVoter(v)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={16} /></button>
                      {isAdmin && <button onClick={() => handleDeleteVoter(v.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400 font-bold">Không tìm thấy dữ liệu cử tri.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-400">Trang {currentPage} / {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30"><ChevronLeft size={20}/></button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30"><ChevronRight size={20}/></button>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa Cử tri */}
      {editingVoter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black uppercase tracking-tight text-slate-800">Cập nhật thông tin cử tri</h3>
              <button onClick={() => setEditingVoter(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleUpdateVoter} className="p-6 grid grid-cols-2 gap-4">
              {error && (
                <div className="col-span-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Họ và tên</label>
                <input name="fullName" defaultValue={editingVoter.fullName} required className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Số CCCD</label>
                <input name="idCard" defaultValue={editingVoter.idCard} required className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Tổ bầu cử</label>
                <input name="votingGroup" defaultValue={editingVoter.votingGroup} className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Khu vực bỏ phiếu</label>
                <input name="votingArea" defaultValue={editingVoter.votingArea} className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Địa chỉ nhà</label>
                <input name="address" defaultValue={editingVoter.address} className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500" />
              </div>
              <div className="col-span-2 mt-4 flex gap-3">
                <button type="button" onClick={() => setEditingVoter(null)} className="flex-1 py-3 font-bold text-slate-500">Hủy bỏ</button>
                <button type="submit" className="flex-[2] py-3 bg-red-600 text-white font-black rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all">
                  LƯU THAY ĐỔI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoterList;
