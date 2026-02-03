
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Plus, Search, Edit2, Trash2, X, Shield, Mail, Phone, User as UserIcon, Lock, BadgeCheck } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('users');
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      const defaultUsers: User[] = [
        {
          id: '1',
          fullName: 'Nguyễn Văn Admin',
          position: 'Chủ tịch Ủy ban',
          email: 'admin@election.gov.vn',
          phone: '0901234567',
          username: 'admin',
          password: '123',
          role: UserRole.ADMIN
        }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }, []);

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newUser: User = {
      id: editingUser?.id || Date.now().toString(),
      fullName: formData.get('fullName') as string,
      position: formData.get('position') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      username: formData.get('username') as string,
      password: (formData.get('password') as string) || editingUser?.password || '123456',
      role: formData.get('role') as UserRole,
    };

    let updatedList;
    if (editingUser) {
      updatedList = users.map(u => u.id === editingUser.id ? newUser : u);
    } else {
      updatedList = [...users, newUser];
    }
    
    setUsers(updatedList);
    localStorage.setItem('users', JSON.stringify(updatedList));
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.username === 'admin') {
      alert('Không thể xóa tài khoản Quản trị viên hệ thống.');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userToDelete?.fullName}"?`)) {
      const updatedList = users.filter(u => u.id !== id);
      setUsers(updatedList);
      localStorage.setItem('users', JSON.stringify(updatedList));
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Quản lý cán bộ</h1>
          <p className="text-slate-500 font-medium">Danh sách tài khoản vận hành hệ thống ({users.length})</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-100"
        >
          <Plus size={20} />
          <span>Thêm cán bộ mới</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Họ tên & Chức vụ</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Đăng nhập</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{user.fullName}</p>
                    <p className="text-xs text-slate-400 font-medium">{user.position}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 flex items-center gap-1"><Mail size={12}/> {user.email}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Phone size={12}/> {user.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-blue-600">{user.username}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      user.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      <Shield size={10} />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingUser ? 'Cập nhật tài khoản' : 'Thêm cán bộ mới'}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">Vui lòng điền đầy đủ thông tin bên dưới</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2"><UserIcon size={12}/> Họ và tên</label>
                  <input required name="fullName" defaultValue={editingUser?.fullName} placeholder="VD: Nguyễn Văn A" className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 transition-all font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2"><BadgeCheck size={12}/> Chức vụ</label>
                  <input required name="position" defaultValue={editingUser?.position} placeholder="VD: Cán bộ tổ bầu cử" className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 transition-all font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2"><Mail size={12}/> Email công vụ</label>
                  <input required type="email" name="email" defaultValue={editingUser?.email} placeholder="example@election.gov.vn" className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 transition-all font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2"><Phone size={12}/> Số điện thoại</label>
                  <input required name="phone" defaultValue={editingUser?.phone} placeholder="09xxxxxxxx" className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 transition-all font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2"><UserIcon size={12}/> Tên đăng nhập</label>
                  <input required name="username" defaultValue={editingUser?.username} placeholder="username" className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 transition-all font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2"><Lock size={12}/> Mật khẩu</label>
                  <input type="password" name="password" placeholder={editingUser ? 'Để trống nếu không đổi' : '••••••••'} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 transition-all font-medium" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2"><Shield size={12}/> Vai trò hệ thống</label>
                  <select name="role" defaultValue={editingUser?.role || UserRole.STAFF} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl bg-white outline-none focus:border-red-500 transition-all font-bold">
                    <option value={UserRole.STAFF}>Cán bộ (Staff)</option>
                    <option value={UserRole.ADMIN}>Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-xl shadow-xl shadow-red-200 transition-all active:scale-[0.98]">
                  {editingUser ? 'CẬP NHẬT THÔNG TIN' : 'TẠO TÀI KHOẢN'}
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
