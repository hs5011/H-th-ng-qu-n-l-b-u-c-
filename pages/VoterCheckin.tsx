
import React, { useState, useEffect } from 'react';
import { Search, UserCheck, ShieldCheck, MapPin, Hash, CheckCircle, AlertTriangle, Lock, User as UserIcon } from 'lucide-react';
import { Voter, User, UserRole } from '../types';

const VoterCheckin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Voter[]>([]);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const authData = localStorage.getItem('auth');
    if (authData) {
      setCurrentUser(JSON.parse(authData).user);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;

    setHasSearched(true);
    setSelectedVoter(null);

    const voters: Voter[] = JSON.parse(localStorage.getItem('voters') || '[]');
    
    // Tìm kiếm linh hoạt: CCCD, Họ tên, hoặc Địa chỉ
    let results = voters.filter(v => 
      v.idCard.toLowerCase().includes(term) || 
      v.fullName.toLowerCase().includes(term) ||
      (v.address && v.address.toLowerCase().includes(term))
    );

    // Lọc theo khu vực nếu là Staff
    if (currentUser?.role === UserRole.STAFF && currentUser.votingArea) {
      results = results.filter(v => v.votingArea === currentUser.votingArea);
    }

    setSearchResults(results);
    
    // Nếu chỉ có 1 kết quả duy nhất, chọn luôn
    if (results.length === 1) {
      setSelectedVoter(results[0]);
    }
  };

  const handleMarkAsVoted = () => {
    if (!selectedVoter) return;

    setIsSaving(true);
    const voters: Voter[] = JSON.parse(localStorage.getItem('voters') || '[]');
    const updatedVoters = voters.map(v => 
      v.id === selectedVoter.id ? { ...v, hasVoted: true, votedAt: new Date().toISOString() } : v
    );
    localStorage.setItem('voters', JSON.stringify(updatedVoters));
    
    setTimeout(() => {
      setSelectedVoter({ ...selectedVoter, hasVoted: true, votedAt: new Date().toISOString() });
      setIsSaving(false);
      // Cập nhật lại kết quả trong danh sách tìm kiếm nếu có
      setSearchResults(prev => prev.map(v => v.id === selectedVoter.id ? { ...v, hasVoted: true, votedAt: new Date().toISOString() } : v));
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-3">
          <UserCheck size={32} className="text-red-600" />
          Xác nhận cử tri đi bầu
        </h1>
        {currentUser?.role === UserRole.STAFF && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-bold border border-red-100">
            <MapPin size={16} />
            Phạm vi quản lý: {currentUser.votingArea || 'Toàn bộ hệ thống'}
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="text-slate-400 group-focus-within:text-red-600 transition-colors" size={24} />
        </div>
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nhập Họ tên, Số CCCD hoặc Địa chỉ cử tri..." 
          className="block w-full pl-16 pr-32 py-5 text-xl bg-white border-2 border-slate-200 rounded-2xl shadow-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all font-medium"
        />
        <button 
          type="submit"
          className="absolute right-3 top-2 bottom-2 px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center gap-2"
        >
          TÌM KIẾM
        </button>
      </form>

      {hasSearched && !selectedVoter && searchResults.length > 1 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Kết quả tìm kiếm ({searchResults.length})</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {searchResults.map(v => (
              <div 
                key={v.id} 
                onClick={() => setSelectedVoter(v)}
                className="p-4 flex items-center justify-between hover:bg-red-50 transition-colors cursor-pointer group"
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${v.hasVoted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{v.fullName}</p>
                    <p className="text-xs text-slate-400 font-mono">CCCD: {v.idCard} | Tổ: {v.votingGroup}</p>
                    <p className="text-xs text-slate-500 mt-1 italic">{v.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   {v.hasVoted ? (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase">Đã bầu</span>
                   ) : (
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100 uppercase">Chưa bầu</span>
                   )}
                   <Search size={16} className="text-slate-300 group-hover:text-red-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSearched && selectedVoter && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden border-2 ${selectedVoter.hasVoted ? 'border-green-200' : 'border-slate-100'}`}>
            <div className={`px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 ${selectedVoter.hasVoted ? 'bg-green-50' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedVoter.hasVoted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Thông tin chi tiết cử tri</h3>
                  {searchResults.length > 1 && (
                    <button onClick={() => setSelectedVoter(null)} className="text-xs text-blue-600 font-bold hover:underline">← Quay lại danh sách kết quả</button>
                  )}
                </div>
              </div>
              {selectedVoter.hasVoted ? (
                <div className="flex items-center gap-2 text-green-700 font-bold bg-green-100 px-4 py-2 rounded-full border border-green-200">
                  <CheckCircle size={20} />
                  ĐÃ BỎ PHIẾU
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 font-bold bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
                  <ShieldCheck size={20} />
                  CHƯA BỎ PHIẾU
                </div>
              )}
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <DetailItem label="Họ và tên" value={selectedVoter.fullName} large />
                <DetailItem label="Số CCCD" value={selectedVoter.idCard} icon={<Hash size={18} />} />
                <DetailItem label="Địa chỉ nhà" value={selectedVoter.address || 'Chưa cập nhật'} />
              </div>
              <div className="space-y-6">
                <DetailItem label="Khu phố" value={selectedVoter.neighborhood} icon={<MapPin size={18} />} />
                <DetailItem label="Tổ / Nhóm" value={selectedVoter.votingGroup} />
                <DetailItem label="Khu vực bỏ phiếu" value={selectedVoter.votingArea} icon={<MapPin size={18} />} highlight />
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100">
              {!selectedVoter.hasVoted ? (
                <button 
                  onClick={handleMarkAsVoted}
                  disabled={isSaving}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-black rounded-2xl shadow-xl shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {isSaving ? 'Đang lưu...' : (
                    <>
                      <CheckCircle size={28} />
                      XÁC NHẬN ĐÃ BỎ PHIẾU
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center p-4 bg-white rounded-xl border border-green-200 shadow-inner">
                  <p className="text-green-600 font-medium">Ghi nhận vào lúc: {new Date(selectedVoter.votedAt!).toLocaleString('vi-VN')}</p>
                  <p className="text-slate-400 text-sm mt-1">Hệ thống đã khóa trạng thái cho cử tri này.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {hasSearched && searchResults.length === 0 && (
        <div className="bg-white p-12 rounded-3xl shadow-xl border-2 border-amber-100 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
            <AlertTriangle size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-800">Không tìm thấy cử tri</h3>
            <p className="text-slate-500 max-w-sm">Dữ liệu "{searchTerm}" không khớp với bất kỳ cử tri nào trong phạm vi quản lý của bạn.</p>
          </div>
          <button 
            onClick={() => { setHasSearched(false); setSearchTerm(''); setSearchResults([]); }}
            className="mt-4 px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
          >
            Thực hiện tìm kiếm khác
          </button>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value, icon, large, highlight }: { label: string, value: string, icon?: React.ReactNode, large?: boolean, highlight?: boolean }) => (
  <div className="space-y-1">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {icon} {label}
    </p>
    <p className={`font-semibold ${highlight ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-lg inline-block' : 'text-slate-800'} ${large ? 'text-2xl' : 'text-lg'}`}>{value}</p>
  </div>
);

export default VoterCheckin;
