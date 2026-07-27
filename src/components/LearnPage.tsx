import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Modal, ProgressBar, Spinner } from '@/components/ui';
import type { Course, CourseProgress } from '@/lib/types';
import { GraduationCap, Clock, CheckCircle2, BookOpen, ArrowRight } from 'lucide-react';

const LEVEL_STYLES: Record<string, string> = {
  Beginner: 'bg-[#EBF4EB] text-[#788B76]',
  Intermediate: 'bg-[#FAF5EE] text-[#B5895C]',
  Advanced: 'bg-[#FAF0EC] text-[#C06E52]',
};

const TRACKS = ['Budgeting', 'Savings', 'Investing', 'Earning', 'Retirement'];

export function LearnPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeTrack, setActiveTrack] = useState<string>('All');
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!user) return;
    const [cRes, pRes] = await Promise.all([
      supabase.from('courses').select('*').order('created_at', { ascending: true }),
      supabase.from('course_progress').select('*'),
    ]);
    setCourses((cRes.data as Course[]) || []);
    const map: Record<string, CourseProgress> = {};
    (pRes.data as CourseProgress[] || []).forEach((p) => { map[p.course_id] = p; });
    setProgress(map);
    setLoading(false);
  }

  useEffect(() => { load(); }, [user]);

  async function upsertProgress(courseId: string, percent: number, completed: boolean) {
    setBusy(true);
    const existing = progress[courseId];
    if (existing) {
      await supabase.from('course_progress').update({
        progress_percent: percent, completed, updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('course_progress').insert({
        course_id: courseId, progress_percent: percent, completed,
      });
    }
    setBusy(false);
    await load();
  }

  async function markComplete(course: Course) {
    await upsertProgress(course.id, 100, true);
    setActiveCourse(null);
  }

  async function markInProgress(course: Course) {
    const existing = progress[course.id];
    const newPct = existing ? Math.min(99, existing.progress_percent + 25) : 25;
    await upsertProgress(course.id, newPct, false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="w-7 h-7 text-[#788B76]" />
      </div>
    );
  }

  const completedCount = Object.values(progress).filter((p) => p.completed).length;
  const inProgressCount = Object.values(progress).filter((p) => !p.completed && p.progress_percent > 0).length;
  const filtered = activeTrack === 'All' ? courses : courses.filter((c) => c.track === activeTrack);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-[#2C3329]">Learn</h1>
        <p className="text-sm text-[#788B76] mt-1">Short editorial lessons on money, in your voice.</p>
      </div>

      {/* Progress banner */}
      <div className="rounded-2xl border border-[#E8E2D9] bg-white p-8 relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-[#EFEBE3] flex items-center justify-center text-[#C06E52]">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-[#2C3329]">
                {completedCount} <span className="text-xl text-[#788B76] font-normal">completed</span>
              </p>
              <p className="text-[#788B76] text-sm mt-0.5">{inProgressCount} in progress · {courses.length} total</p>
            </div>
          </div>
          {courses.length > 0 && (
            <div className="text-right">
              <p className="text-[#788B76] text-xs uppercase tracking-widest">Completion</p>
              <p className="font-display text-3xl font-semibold text-[#2C3329]">{Math.round((completedCount / courses.length) * 100)}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Track filter */}
      <div className="flex flex-wrap gap-2">
        {['All', ...TRACKS].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTrack(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTrack === t
                ? 'bg-[#2C3329] text-[#EFEBE3]'
                : 'bg-white border border-[#E8E2D9] text-[#788B76] hover:border-[#788B76] hover:text-[#2C3329]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {filtered.map((course) => {
          const p = progress[course.id];
          const pct = p?.progress_percent ?? 0;
          const done = p?.completed ?? false;
          return (
            <Card key={course.id} className="p-6 flex flex-col hover:border-[#C8BFB4] transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${LEVEL_STYLES[course.level] || 'bg-[#F5F2EC] text-[#788B76]'}`}>
                  {course.level}
                </span>
                {done && (
                  <span className="flex items-center gap-1.5 text-xs text-[#788B76] font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                )}
              </div>

              <p className="text-xs uppercase tracking-widest text-[#C06E52] mb-2">{course.track}</p>
              <h3 className="font-display text-xl font-semibold text-[#2C3329] mb-2 leading-snug">{course.title}</h3>
              <p className="text-sm text-[#788B76] leading-relaxed mb-5 flex-1">{course.description}</p>

              <div className="flex items-center gap-4 text-xs text-[#788B76] mb-4">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {course.duration_minutes} min</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {course.category}</span>
              </div>

              {pct > 0 && !done && (
                <div className="mb-4">
                  <ProgressBar value={pct} max={100} color="#C06E52" />
                  <p className="text-xs text-[#788B76] mt-1.5">{pct}% complete</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 text-sm" onClick={() => setActiveCourse(course)}>
                  <span className="flex items-center justify-center gap-1.5">Read <ArrowRight className="w-3.5 h-3.5" /></span>
                </Button>
                {!done && (
                  <Button variant="ghost" className="text-sm bg-[#F5F2EC] hover:bg-[#E8E2D9]" onClick={() => markComplete(course)} disabled={busy}>Mark done</Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={!!activeCourse} onClose={() => setActiveCourse(null)} title={activeCourse?.title || ''}>
        {activeCourse && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${LEVEL_STYLES[activeCourse.level]}`}>{activeCourse.level}</span>
              <span className="text-xs text-[#788B76] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {activeCourse.duration_minutes} min</span>
              <span className="text-xs uppercase tracking-widest text-[#C06E52]">{activeCourse.track}</span>
            </div>
            <p className="text-sm text-[#788B76] italic border-l-2 border-[#C06E52]/40 pl-4">{activeCourse.description}</p>
            <div className="pt-2">
              <p className="text-sm text-[#2C3329] leading-relaxed whitespace-pre-line bg-[#FAF8F4] p-5 rounded-xl border border-[#E8E2D9]">{activeCourse.content}</p>
            </div>
            <div className="pt-4 border-t border-[#E8E2D9] flex gap-3">
              {!progress[activeCourse.id]?.completed && (
                <Button variant="outline" className="flex-1 text-sm" onClick={() => markInProgress(activeCourse)} disabled={busy}>Save progress</Button>
              )}
              <Button variant="secondary" className="flex-1 text-sm" onClick={() => markComplete(activeCourse)} disabled={busy}>
                {progress[activeCourse.id]?.completed ? 'Completed ✓' : 'Mark complete'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
