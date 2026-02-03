
import React, { useState, useEffect } from 'react';
import { Search, UserCheck, ShieldCheck, MapPin, Hash, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { Voter, User, UserRole } from '../types';

const VoterCheckin: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [voter, setVoter] = useState<Voter | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [errorInfo, setErrorInfo] = useState<{title: string, msg: string} | null>(null);

  useEffect(() => {
    const authData = localStorage.getItem('auth');
    if (authData) {
      setCurrentUser(JSON.parse(authData).user);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setHasSearched(true);
    setErrorInfo(null);
    setVoter(null);

    const voters: Voter[] = JSON.parse(localStorage.getItem('voters') || '[]');
    const found = voters.find(v => v.idCard === searchId);

    if (!found) {
      setErrorInfo({
        title: "Không tìm thấy cử tri",
        msg: `Số CCCD ${searchId} không tồn tại trong hệ thống bầu cử.`
      });
      return;
    }

    // Kiểm tra quyền hạn khu vực
    if (currentUser?.role === UserRole.STAFF) {
      if (currentUser.votingArea && found.votingArea !== currentUser.votingArea) {
        setErrorInfo({
          title: "Không thuộc phạm vi quản lý",
          msg: `Cử tri này thuộc "${found.votingArea}". Bạn chỉ được phép xác nhận cử tri thuộc "${currentUser.votingArea}".`
        });
        return;
      }
    }

    setVoter(found);
  };

  const handleMarkAsVoted = () => {
    if (!voter) return;

    setIsSaving(true);
    const voters: Voter[] = JSON.parse(localStorage.getItem('voters') || '[]');
    const updatedVoters = voters.map(v => 
      v.idCard === voter.idCard ? { ...v, hasVoted: true, votedAt: new Date().toISOString() } : v
    );
    localStorage.setItem('voters', JSON.stringify(updatedVoters));
    
    setTimeout(() => {
      setVoter({ ...voter, hasVoted: true, votedAt: new Date().toISOString() });
      setIsSaving(false);
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
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Nhập 12 số CCCD cử tri..." 
          className="block w-full pl-16 pr-32 py-5 text-xl bg-white border-2 border-slate-200 rounded-2xl shadow-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all font-mono"
        />
        <button 
          type="submit"
          className="absolute right-3 top-2 bottom-2 px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center gap-2"
        >
          TRA CỨU
        </button>
      </form>

      {hasSearched && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
          {voter ? (
            <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden border-2 ${voter.hasVoted ? 'border-green-200' : 'border-slate-100'}`}>
              <div className={`px-8 py-6 flex justify-between items-center ${voter.hasVoted ? 'bg-green-50' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${voter.hasVoted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    <UserCheck size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Thông tin chi tiết</h3>
                </div>
                {voter.hasVoted ? (
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
                  <DetailItem label="Họ và tên" value={voter.fullName} large />
                  <DetailItem label="Số CCCD" value={voter.idCard} icon={<Hash size={18} />} />
                </div>
                <div className="space-y-6">
                  <DetailItem label="Khu phố" value={voter.neighborhood} icon={<MapPin size={18} />} />
                  <DetailItem label="Tổ bầu cử" value={voter.votingGroup} />
                  <DetailItem label="Khu vực bỏ phiếu" value={voter.votingArea} icon={<MapPin size={18} />} highlight />
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100">
                {!voter.hasVoted ? (
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
                    <p className="text-green-600 font-medium">Ghi nhận vào lúc: {new Date(voter.votedAt!).toLocaleString('vi-VN')}</p>
                    <p className="text-slate-400 text-sm mt-1">Hệ thống đã khóa trạng thái cho cử tri này.</p>
                  </div>
                )}
              </div>
            </div>
          ) : errorInfo && (
            <div className="bg-white p-12 rounded-3xl shadow-xl border-2 border-amber-100 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
                {errorInfo.title.includes('phạm vi') ? <Lock size={48} /> : <AlertTriangle size={48} />}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">{errorInfo.title}</h3>
                <p className="text-slate-500 max-w-sm">{errorInfo.msg}</p>
              </div>
              <button 
                onClick={() => { setHasSearched(false); setSearchId(''); setErrorInfo(null); }}
                className="mt-4 px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Thử lại với số khác
              </button>
            </div>
          )}
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
