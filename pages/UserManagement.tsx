
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, VotingArea } from '../types';
import { 
  Plus, Search, Edit2, Trash2, X, Shield, Mail, Phone, 
  ChevronLeft, ChevronRight, AlertCircle, User as UserIcon,
  Lock, MapPin, BadgeCheck
} from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [votingAreas, setVotingAreas] = useState<VotingArea[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const loadData = () => {
      try {
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
          const parsed = JSON.parse(savedUsers);
          setUsers(Array.isArray(parsed) ? parsed : []);
        } else {
          const defaultAdmin: User = {
            id: '1',
            fullName: 'Nguyễn Văn Admin',
            position: 'Chủ tịch Ủy ban',
            email: 'admin@election.gov.vn',
            phone: '0901234567',
            username: 'admin',
            password: '123',
            role: UserRole.ADMIN
          };
          setUsers([defaultAdmin]);
          localStorage.setItem('users', JSON.stringify([defaultAdmin]));
        }

        const savedAreas = localStorage.getItem('voting_areas');
        if (savedAreas) setVotingAreas(JSON.parse(savedAreas));
      } catch (err) {
        console.error("Lỗi đọc LocalStorage:", err);
      }
    };
    loadData();
  }, []);

  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    try {
      const username = (formData.get('username') as string || '').trim();
      if (!username) {
        setError("Tên đăng nhập không được để trống");
        return;
      }

      const password = (formData.get('password') as string);
      
      const userObj: User = {
        id: editingUser?.id || Date.now().toString(),
        fullName: (formData.get('fullName') as string || '').trim(),
        position: (formData.get('position') as string || '').trim(),
        email: (formData.get('email') as string || '').trim(),
        phone: (formData.get('phone') as string || '').trim(),
        username: username,
        password: password || editingUser?.password || '123',
        role: (formData.get('role') as UserRole) || UserRole.STAFF,
        votingArea: (formData.get('votingArea') as string) || undefined
      };

      if (!editingUser && users.some(u => u.username === username)) {
        setError("Tên đăng nhập này đã tồn tại!");
        return;
      }

      let updatedUsers;
      if (editingUser) {
        updatedUsers = users.map(u => u.id === editingUser.id ? userObj : u);
      } else {
        updatedUsers = [userObj, ...users];
      }

      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      setError("Lỗi: Không thể ghi vào bộ nhớ trình duyệt.");
    }
  };

  const handleDelete = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user?.username === 'admin') return alert("Không thể xóa tài khoản admin gốc.");
    
    if (confirm(`Bạn có chắc muốn xóa tài khoản ${user?.fullName}?`)) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      localStorage.setItem('users', JSON.stringify(updated));
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Quản lý tài khoản cán bộ</h1>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setError(null); setIsModalOpen(true); }}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all text-sm uppercase tracking-wide"
        >
          <Plus size={18} /> Thêm tài khoản
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Họ tên & Chức vụ</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Khu vực phân công</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Liên hệ</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Vai trò</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">{user.fullName}</span>
                      <span className="text-xs text-slate-400">
                        {user.position} | <span className="text-blue-500 font-medium">{user.username}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight">
                      {user.votingArea ? user.votingArea : 'TOÀN QUYỀN'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Mail size={12} className="text-slate-400" /> {user.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone size={12} className="text-slate-400" /> {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      user.role === UserRole.ADMIN 
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      <Shield size={10} /> {user.role === UserRole.ADMIN ? 'Quản trị viên' : 'Cán bộ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-300 font-medium">Không tìm thấy tài khoản nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Trang {currentPage} / {totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-400"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === page 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-red-200'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-400"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form - Updated to match design */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 pt-10 pb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none mb-1">
                  {editingUser ? 'CẬP NHẬT TÀI KHOẢN' : 'THÊM CÁN BỘ MỚI'}
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.05em]">
                  PHÂN CÔNG KHU VỰC BỎ PHIẾU CỤ THỂ
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-900" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="px-10 pb-10 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-100">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Họ và tên */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <UserIcon size={14} /> Họ và tên
                  </label>
                  <input 
                    required 
                    name="fullName" 
                    defaultValue={editingUser?.fullName} 
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder:text-slate-300" 
                  />
                </div>

                {/* Chức vụ */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <BadgeCheck size={14} /> Chức vụ
                  </label>
                  <input 
                    required 
                    name="position" 
                    defaultValue={editingUser?.position} 
                    placeholder="VD: Cán bộ tổ bầu cử"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder:text-slate-300" 
                  />
                </div>

                {/* Email công vụ */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={14} /> Email công vụ
                  </label>
                  <input 
                    required 
                    type="email"
                    name="email" 
                    defaultValue={editingUser?.email} 
                    placeholder="example@election.gov.vn"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder:text-slate-300" 
                  />
                </div>

                {/* Số điện thoại */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Phone size={14} /> Số điện thoại
                  </label>
                  <input 
                    required 
                    name="phone" 
                    defaultValue={editingUser?.phone} 
                    placeholder="09xxxxxxxx"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder:text-slate-300" 
                  />
                </div>

                {/* Tên đăng nhập */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <UserIcon size={14} /> Tên đăng nhập
                  </label>
                  <input 
                    required 
                    name="username" 
                    defaultValue={editingUser?.username} 
                    placeholder="username"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all font-bold font-mono text-slate-800 placeholder:text-slate-300" 
                  />
                </div>

                {/* Mật khẩu */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Lock size={14} /> Mật khẩu
                  </label>
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="••••••••"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder:text-slate-300" 
                  />
                </div>

                {/* Vai trò hệ thống */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Shield size={14} /> Vai trò hệ thống
                  </label>
                  <select 
                    name="role" 
                    defaultValue={editingUser?.role || UserRole.STAFF} 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all font-bold text-slate-800 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.66667%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1.5rem_center] bg-no-repeat"
                  >
                    <option value={UserRole.STAFF}>Cán bộ (Staff)</option>
                    <option value={UserRole.ADMIN}>Quản trị viên (Admin)</option>
                  </select>
                </div>

                {/* Khu vực bỏ phiếu */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={14} /> Khu vực bỏ phiếu
                  </label>
                  <select 
                    name="votingArea" 
                    defaultValue={editingUser?.votingArea || ''} 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all font-bold text-slate-800 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.66667%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1.5rem_center] bg-no-repeat"
                  >
                    <option value="">-- Không phân khu vực --</option>
                    {votingAreas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-10 flex items-center justify-end gap-12">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-lg font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="px-12 py-5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xl font-bold rounded-[1.25rem] shadow-2xl shadow-red-200 transition-all active:scale-[0.98] uppercase tracking-wider"
                >
                  {editingUser ? 'CẬP NHẬT TÀI KHOẢN' : 'TẠO TÀI KHOẢN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
