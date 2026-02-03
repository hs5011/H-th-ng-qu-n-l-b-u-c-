
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { Voter } from '../types';
import { Users, UserCheck, Clock, TrendingUp, Timer } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>('--:--:--');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('voters');
    const isInitialized = localStorage.getItem('app_initialized');

    if (saved && saved !== '[]') {
      setVoters(JSON.parse(saved));
    } else if (!isInitialized) {
      const sampleVoters: Voter[] = Array.from({ length: 100 }, (_, i) => ({
        id: `v-${i}`,
        fullName: `Cử tri Mẫu ${i + 1}`,
        idCard: `${100000000000 + i}`,
        neighborhood: `Khu phố ${Math.ceil((i + 1) / 20)}`,
        constituency: `Đơn vị ${Math.ceil((i + 1) / 50)}`,
        votingGroup: `Tổ ${Math.ceil((i + 1) / 10)}`,
        votingArea: `Khu vực ${Math.ceil((i + 1) / 25)}`,
        hasVoted: Math.random() > 0.4,
        votedAt: new Date().toISOString()
      }));
      setVoters(sampleVoters);
      localStorage.setItem('voters', JSON.stringify(sampleVoters));
      localStorage.setItem('app_initialized', 'true');
    } else {
      setVoters([]);
    }

    // Logic đếm ngược
    const timer = setInterval(() => {
      const savedEndTime = localStorage.getItem('election_end_time');
      if (!savedEndTime) {
        setTimeLeft('Chưa thiết lập');
        return;
      }

      const end = new Date(savedEndTime).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Đã kết thúc');
        setIsFinished(true);
        clearInterval(timer);
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const h = hours < 10 ? `0${hours}` : hours;
        const m = minutes < 10 ? `0${minutes}` : minutes;
        const s = seconds < 10 ? `0${seconds}` : seconds;
        
        setTimeLeft(`${h}:${m}:${s}`);
        setIsFinished(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const totalVoters = voters.length;
  const votedCount = voters.filter(v => v.hasVoted).length;
  const progress = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;

  const neighborhoodData = Object.values(
    voters.reduce((acc, v) => {
      if (!acc[v.neighborhood]) acc[v.neighborhood] = { name: v.neighborhood, total: 0, voted: 0 };
      acc[v.neighborhood].total++;
      if (v.hasVoted) acc[v.neighborhood].voted++;
      return acc;
    }, {} as Record<string, any>)
  ).map((val: any) => ({
    ...val,
    percentage: val.total > 0 ? Math.round((val.voted / val.total) * 100) : 0
  }));

  const groupData = Object.values(
    voters.reduce((acc, v) => {
      if (!acc[v.votingGroup]) acc[v.votingGroup] = { name: v.votingGroup, total: 0, voted: 0 };
      acc[v.votingGroup].total++;
      if (v.hasVoted) acc[v.votingGroup].voted++;
      return acc;
    }, {} as Record<string, any>)
  ).slice(0, 10).map((val: any) => ({
    ...val,
    percentage: val.total > 0 ? Math.round((val.voted / val.total) * 100) : 0
  }));

  const pieData = [
    { name: 'Đã bầu', value: votedCount, color: '#ef4444' },
    { name: 'Chưa bầu', value: totalVoters - votedCount, color: '#e2e8f0' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Thống kê tổng quan</h1>
          <p className="text-slate-500 font-medium">Theo dõi tiến độ bầu cử thời gian thực</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cập nhật lần cuối</p>
          <p className="text-lg font-bold text-slate-700">{new Date().toLocaleTimeString('vi-VN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tổng cử tri" value={totalVoters.toLocaleString()} icon={<Users size={24} />} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard title="Đã đi bầu" value={votedCount.toLocaleString()} icon={<UserCheck size={24} />} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard title="Tỷ lệ bỏ phiếu" value={`${progress}%`} icon={<TrendingUp size={24} />} color="text-red-600" bgColor="bg-red-50" />
        <StatCard 
          title="Thời gian còn lại" 
          value={timeLeft} 
          icon={<Clock size={24} />} 
          color={isFinished ? "text-slate-400" : "text-amber-600"} 
          bgColor={isFinished ? "bg-slate-50" : "bg-amber-50"} 
          isTimer
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">Tình hình theo Khu phố (%)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={neighborhoodData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="percentage" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-800 mb-6 self-start">Tỷ lệ hoàn thành</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-600"><div className="w-3 h-3 rounded-full bg-red-500"></div> Đã bầu</span>
              <span className="font-bold text-slate-800">{votedCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-600"><div className="w-3 h-3 rounded-full bg-slate-200"></div> Chưa bầu</span>
              <span className="font-bold text-slate-800">{totalVoters - votedCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Tiến độ theo Tổ bầu cử (Top 10)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={100} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="voted" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} name="Đã bầu" />
              <Bar dataKey="total" stackId="a" fill="#f1f5f9" radius={[0, 6, 6, 0]} name="Tổng số" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, bgColor, isTimer }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div className={`${bgColor} ${color} p-3 rounded-xl`}>{icon}</div>
      {isTimer && <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>}
    </div>
    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</p>
    <h4 className={`text-3xl font-black ${isTimer ? 'font-mono' : ''} text-slate-800 mt-1`}>{value}</h4>
  </div>
);

export default Dashboard;
