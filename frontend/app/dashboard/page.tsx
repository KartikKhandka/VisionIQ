"use client";

import { useScans } from "@/hooks/useScans"
import { ImageUploader } from "@/components/upload/ImageUploader"
import { ScanCard } from "@/components/dashboard/ScanCard"
import { Loader2, TrendingUp, Image as ImageIcon, MessageSquare, Database, FileText, HardDrive, ArrowUpRight } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import { motion } from "framer-motion"

const mockTimeData = [
  { name: 'Mon', uploads: 4 },
  { name: 'Tue', uploads: 7 },
  { name: 'Wed', uploads: 3 },
  { name: 'Thu', uploads: 12 },
  { name: 'Fri', uploads: 8 },
  { name: 'Sat', uploads: 15 },
  { name: 'Sun', uploads: 5 },
]

const mockTypeData = [
  { name: 'Images', value: 75, color: '#06b6d4' },
  { name: 'PDFs', value: 25, color: '#71717a' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as any },
  }),
};

export default function DashboardPage() {
  const { data: scans, isLoading, error } = useScans(0, 10);

  const totalScans = scans ? scans.length : 0;
  const storageUsed = scans ? scans.reduce((acc: number, s: any) => acc + (s.file_size || 0), 0) / (1024 * 1024) : 0;

  return (
    <div className="space-y-12 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-start text-left mb-8"
      >
        <span className="text-[10px] font-bold text-brandAccent uppercase tracking-widest mb-2">
          Overview
        </span>
        <h1 className="h1 text-white">Dashboard</h1>
        <p className="text-white/60 mt-3 text-sm">Welcome back to VisionIQ. Here is an overview of your workspace.</p>
      </motion.div>

      {/* Top Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Scans", value: totalScans, change: "12%", icon: ImageIcon },
          { label: "Chat Conversations", value: 24, change: "8%", icon: MessageSquare },
          { label: "Knowledge Docs", value: 12, change: null, icon: Database },
          { label: "Storage Used", value: `${storageUsed.toFixed(1)}`, unit: "MB", change: null, icon: HardDrive },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="vision-card p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.10] transition-opacity">
              <stat.icon className="w-16 h-16 text-brandAccent" />
            </div>
            <p className="text-[12px] font-semibold text-muted mb-2 uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-[36px] font-extrabold text-white tracking-tight leading-none">
                {stat.value}
                {stat.unit && <span className="text-lg text-muted font-medium ml-1">{stat.unit}</span>}
              </h2>
              {stat.change && (
                <span className="flex items-center text-[11px] font-bold text-brandAccent bg-brandAccent/10 px-2.5 py-0.5 rounded-full border border-brandAccent/20">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" /> {stat.change}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="lg:col-span-2 vision-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="h3 text-white">Uploads Over Time</h3>
              <p className="text-[14px] text-muted mt-1">Activity for the past 7 days</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-brandAccent/10 flex items-center justify-center border border-brandAccent/20">
              <TrendingUp className="w-5 h-5 text-brandAccent-light" />
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#09090b', color: '#fafafa', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} 
                />
                <Area type="monotone" dataKey="uploads" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="vision-card p-8"
        >
          <div className="mb-6">
            <h3 className="h3 text-white">Document Types</h3>
            <p className="text-[14px] text-muted mt-1">Distribution by format</p>
          </div>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mockTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#09090b', color: '#fafafa' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-3xl font-extrabold text-white">100%</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-muted">Total</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-6">
            {mockTypeData.map((t) => (
              <div key={t.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: t.color }}></div>
                <span className="text-sm font-medium text-muted">{t.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Upload Section */}
      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="vision-card p-2"
      >
        <ImageUploader />
      </motion.section>

      {/* Recent Scans Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="h2 text-[28px]">Recent Scans</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brandAccent" />
          </div>
        ) : error ? (
          <div className="text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl font-medium">
            Failed to load scans. Please try again.
          </div>
        ) : scans && scans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scans.map((scan: any, i: number) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
              >
                <ScanCard scan={scan} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="vision-card p-12 text-center">
            <div className="w-20 h-20 bg-white/[0.04] rounded-[16px] flex items-center justify-center mx-auto mb-6 border border-white/[0.06]">
              <FileText className="w-10 h-10 text-muted-2" />
            </div>
            <h3 className="h3 mb-2 text-white">No recent activity</h3>
            <p className="text-muted text-[15px] max-w-sm mx-auto">Upload an image or document above to begin your VisionIQ journey.</p>
          </div>
        )}
      </section>
    </div>
  );
}
