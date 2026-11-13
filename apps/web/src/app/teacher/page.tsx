'use client';

import React, { useState } from 'react';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import { useAuthStore } from '../../store/useAuthStore';
import { GraduationCap, Users, BookOpen, Award, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function TeacherPortalPage() {
  const { user, profile } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#07110D] text-[#EAF7EF] font-sans selection:bg-[#39FF6A] selection:text-black">
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(57,255,106,0.12)]">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#EAF7EF] flex items-center gap-3">
                <GraduationCap className="w-7 h-7 text-[#39FF6A]" />
                <span>Teacher &amp; Faculty Console</span>
              </h1>
              <p className="text-xs text-[#8FA99B] font-mono mt-1">
                Classroom telemetry, student roster progress, curriculum assignment, and lab performance.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.25)] text-[#39FF6A]">
              FACULTY ROLE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#39FF6A]" />
                <span className="text-xs text-[#8FA99B] font-mono font-bold">Assigned Cohorts</span>
              </div>
              <p className="text-2xl font-black text-[#EAF7EF] mt-2">3 Classes</p>
              <p className="text-[11px] text-[#8FA99B] mt-1">Robotics 101, Embedded IoT, Rover Design</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#7FE7D6]" />
                <span className="text-xs text-[#8FA99B] font-mono font-bold">Active Students</span>
              </div>
              <p className="text-2xl font-black text-[#EAF7EF] mt-2">84 Students</p>
              <p className="text-[11px] text-[#8FA99B] mt-1">92% completion rate across lessons</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-[#FF9A1F]" />
                <span className="text-xs text-[#8FA99B] font-mono font-bold">Certificates Awarded</span>
              </div>
              <p className="text-2xl font-black text-[#EAF7EF] mt-2">32 Verified</p>
              <p className="text-[11px] text-[#8FA99B] mt-1">Foundation Arduino &amp; Sensors</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-[#EAF7EF] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#39FF6A]" />
              <span>Real-Time Student Activity</span>
            </h3>
            <p className="text-xs text-[#8FA99B] font-mono">
              Monitor your students' live lab progress, schematic debug runs, and Rituu AI questions.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
