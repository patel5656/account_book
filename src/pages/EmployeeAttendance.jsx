import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Plus, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../api/apiClient';

const YoutubeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
  </svg>
);

// Status cycle order: '' -> Present -> Absent -> Half-Day -> Leave -> ''
const STATUS_CYCLE = ['', 'Present', 'Absent', 'Half-Day', 'Leave'];

const STATUS_STYLE = {
  'Present':  { bg: '#22c55e', text: '#fff',      label: 'P',  full: 'Present'  },
  'Absent':   { bg: '#ef4444', text: '#fff',      label: 'A',  full: 'Absent'   },
  'Half-Day': { bg: '#eab308', text: '#1a1a1a',   label: 'H',  full: 'Half-Day' },
  'Leave':    { bg: '#3b82f6', text: '#fff',      label: 'L',  full: 'Leave'    },
  '':         { bg: '#f1f5f9', text: '#94a3b8',   label: '–',  full: 'Not Set'  },
};

const AVATAR_COLORS = ['#4F46E5','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#db2777'];

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export function EmployeeAttendance() {
  const navigate = useNavigate();
  const [isEmployeeMasterOpen, setIsEmployeeMasterOpen] = useState(false);
  const [summaryEmployee, setSummaryEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const monthInputRef = useRef(null);
  const [employees, setEmployees] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [savingCell, setSavingCell] = useState(null);

  const [formData, setFormData] = useState({
    name: '', mobile: '', city: '', joiningDate: '', designation: '',
    salaryType: 'Month', salary: 0, paidHoliday: 0, commission: 0,
    specialCommission: 0, totalSaleCommission: 0, commissionOnManufacturing: 0, isActive: true
  });

  const fetchData = async () => {
    try {
      const [empRes, attRes] = await Promise.all([
        apiClient.get('/employees'),
        apiClient.get(`/employees/attendance/month?month=${selectedMonth}`)
      ]);
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (attRes.data.success) setAttendances(attRes.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [selectedMonth]);

  // Month navigation
  const changeMonth = (delta) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const getDaysInMonth = (monthStr) => {
    if (!monthStr) return [];
    const [y, m] = monthStr.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    const arr = [];
    while (date.getMonth() === m - 1) {
      const dow = date.getDay();
      arr.push({
        num: date.getDate(),
        day: DAY_NAMES[dow],
        iso: new Date(y, m - 1, date.getDate(), 12).toISOString(),
        isSun: dow === 0,
        isSat: dow === 6,
      });
      date.setDate(date.getDate() + 1);
    }
    return arr;
  };

  const formatMonthDisplay = (ms) => {
    if (!ms) return '';
    const [y, m] = ms.split('-');
    return new Date(y, +m - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const days = getDaysInMonth(selectedMonth);
  const todayStr = new Date().toISOString().substring(0, 10);

  const getStatus = (empId, iso) => {
    const d = iso.substring(0, 10);
    const att = attendances.find(a => a.employeeId === empId && a.date.substring(0, 10) === d);
    return att ? att.status : '';
  };

  const cycleStatus = async (empId, iso) => {
    const key = `${empId}-${iso}`;
    if (savingCell === key) return;
    const current = getStatus(empId, iso);
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setSavingCell(key);
    // Optimistic update
    setAttendances(prev => {
      const d = iso.substring(0, 10);
      const ex = prev.findIndex(a => a.employeeId === empId && a.date.substring(0, 10) === d);
      if (next === '') {
        return ex !== -1 ? prev.filter((_, i) => i !== ex) : prev;
      }
      if (ex !== -1) {
        const u = [...prev]; u[ex] = { ...u[ex], status: next }; return u;
      }
      return [...prev, { employeeId: empId, date: iso, status: next }];
    });
    try {
      await apiClient.post('/employees/attendance/mark', { employeeId: empId, date: iso, status: next });
    } catch (err) {
      console.error(err); fetchData();
    } finally {
      setSavingCell(null);
    }
  };

  const getSummary = (empId) => {
    const s = { Present: 0, Absent: 0, 'Half-Day': 0, Leave: 0 };
    days.forEach(d => { const st = getStatus(empId, d.iso); if (s[st] !== undefined) s[st]++; });
    return s;
  };

  const handleCreateEmployee = async () => {
    if (!formData.name) return alert('Employee Name is required');
    try {
      const res = await apiClient.post('/employees', formData);
      if (res.data.success) {
        setIsEmployeeMasterOpen(false);
        setFormData({ name:'', mobile:'', city:'', joiningDate:'', designation:'', salaryType:'Month', salary:0, paidHoliday:0, commission:0, specialCommission:0, totalSaleCommission:0, commissionOnManufacturing:0, isActive:true });
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 45px)', display: 'flex', flexDirection: 'column', padding: '12px' }}>
      <div style={{ background: '#fff', borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── HEADER ── */}
        <div style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366f1 100%)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>Employee Attendance</h2>
            <span style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', fontSize: 12, padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>
              {employees.length} Employees
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ background: '#fff', border: 'none', borderRadius: 4, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <YoutubeIcon className="w-5 h-5" style={{ color: '#ff0000', width: 20, height: 20 }} />
            </button>
            <button onClick={() => setIsEmployeeMasterOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={15} strokeWidth={3} /> Create New
            </button>
            <button onClick={() => navigate('/dashboard')} style={{ background: '#ef4444', border: 'none', borderRadius: 4, padding: '6px 8px', cursor: 'pointer', display: 'flex' }}>
              <X size={18} color="#fff" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* ── CONTROLS BAR ── */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: '#fafafa' }}>
          {/* Month navigator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => changeMonth(-1)} style={{ background: '#e0e7ff', border: 'none', borderRadius: 4, padding: '5px 8px', cursor: 'pointer', display: 'flex' }}>
              <ChevronLeft size={16} color="#4F46E5" />
            </button>
            <div
              onClick={() => monthInputRef.current?.showPicker?.() || monthInputRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1.5px solid #c7d2fe', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', minWidth: 160 }}
            >
              <Calendar size={14} color="#4F46E5" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#4F46E5' }}>{formatMonthDisplay(selectedMonth)}</span>
              <input type="month" ref={monthInputRef} value={selectedMonth}
                onChange={e => e.target.value && setSelectedMonth(e.target.value)}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} />
            </div>
            <button onClick={() => changeMonth(1)} style={{ background: '#e0e7ff', border: 'none', borderRadius: 4, padding: '5px 8px', cursor: 'pointer', display: 'flex' }}>
              <ChevronRight size={16} color="#4F46E5" />
            </button>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Click cell to change status:</span>
            {[
              { color: '#22c55e', label: 'P = Present' },
              { color: '#ef4444', label: 'A = Absent' },
              { color: '#eab308', label: 'H = Half-Day' },
              { color: '#3b82f6', label: 'L = Leave' },
            ].map(i => (
              <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: i.color }} />
                <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{i.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABLE ── */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {employees.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#9ca3af', padding: 60 }}>
              <Users size={56} style={{ opacity: 0.25 }} />
              <p style={{ fontSize: 15, fontWeight: 600 }}>No employees found</p>
              <button onClick={() => setIsEmployeeMasterOpen(true)} style={{ background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={15} strokeWidth={3} /> Add First Employee
              </button>
            </div>
          ) : (
            <table style={{ borderCollapse: 'collapse', minWidth: `${210 + days.length * 46}px`, width: '100%' }}>
              {/* ── THEAD ── */}
              <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
                <tr>
                  {/* Employee col header */}
                  <th style={{ position: 'sticky', left: 0, zIndex: 30, background: '#1e293b', color: '#fff', padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap', minWidth: 200, borderRight: '2px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Users size={14} style={{ opacity: 0.7 }} />
                      EMPLOYEE
                    </div>
                  </th>
                  {/* Date cols */}
                  {days.map(d => {
                    const isToday = d.iso.substring(0, 10) === todayStr;
                    const bg = d.isSun ? '#7f1d1d' : isToday ? '#3730a3' : '#1e293b';
                    return (
                      <th key={d.iso} style={{ background: bg, padding: '6px 2px', textAlign: 'center', minWidth: 44, maxWidth: 44, borderRight: '1px solid #334155' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{d.num}</div>
                        <div style={{ fontSize: 9, color: d.isSun ? '#fca5a5' : '#94a3b8', lineHeight: 1.4, fontWeight: 600 }}>{d.day}</div>
                      </th>
                    );
                  })}

                </tr>
              </thead>

              {/* ── TBODY ── */}
              <tbody>
                {employees.map((emp, idx) => {
                  const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                  return (
                    <tr key={emp.id} style={{ background: rowBg }}>
                      {/* Employee name — sticky left */}
                      <td
                        style={{ position: 'sticky', left: 0, zIndex: 10, background: rowBg, padding: '8px 12px', borderRight: '2px solid #e2e8f0', whiteSpace: 'nowrap', boxShadow: '3px 0 6px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                        onClick={() => setSummaryEmployee(emp)}
                        title="Click to view full month report"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            {emp.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#4F46E5', textDecoration: 'underline', textUnderlineOffset: 2 }}>{emp.name}</div>
                            {emp.designation && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{emp.designation}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Attendance cells */}
                      {days.map(d => {
                        const status = getStatus(emp.id, d.iso);
                        const st = STATUS_STYLE[status] || STATUS_STYLE[''];
                        const key = `${emp.id}-${d.iso}`;
                        const isSaving = savingCell === key;
                        const isToday = d.iso.substring(0, 10) === todayStr;
                        const cellBg = d.isSun ? '#fef2f2' : isToday ? '#eef2ff' : rowBg;

                        return (
                          <td key={d.iso} style={{ background: cellBg, padding: '6px 3px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                            {isSaving ? (
                              <div style={{ width: 36, height: 32, margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 14, height: 14, border: '2px solid #e2e8f0', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                              </div>
                            ) : (
                              <button
                                onClick={() => cycleStatus(emp.id, d.iso)}
                                title={`${d.num} ${d.day} — ${st.full}\nClick to change`}
                                style={{
                                  width: 36, height: 32, borderRadius: 5, border: 'none',
                                  background: st.bg, color: st.text,
                                  fontSize: 12, fontWeight: 700,
                                  cursor: 'pointer', transition: 'all 0.15s',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto',
                                  boxShadow: status ? '0 1px 3px rgba(0,0,0,0.18)' : 'none',
                                  outline: isToday && !status ? '2px solid #818cf8' : 'none',
                                  outlineOffset: 1,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.zIndex = 5; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = 'auto'; }}
                              >
                                {st.label}
                              </button>
                            )}
                          </td>
                        );
                      })}


                    </tr>
                  );
                })}
              </tbody>

              {/* ── TFOOT: Day totals ── */}
              <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 20 }}>
                <tr>
                  <td style={{ position: 'sticky', left: 0, zIndex: 30, background: '#1e293b', color: '#fff', padding: '8px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', borderRight: '2px solid #334155' }}>
                    Day Total (Present)
                  </td>
                  {days.map(d => {
                    const count = employees.filter(e => getStatus(e.id, d.iso) === 'Present').length;
                    const bg = d.isSun ? '#7f1d1d' : '#1e293b';
                    return (
                      <td key={d.iso} style={{ background: bg, textAlign: 'center', borderRight: '1px solid #334155', padding: '8px 0' }}>
                        {count > 0 ? (
                          <span style={{ background: '#22c55e', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>{count}</span>
                        ) : (
                          <span style={{ color: '#475569', fontSize: 11 }}>–</span>
                        )}
                      </td>
                    );
                  })}

                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280' }}>
            <span>Employees: <strong style={{ color: '#1e293b' }}>{employees.length}</strong></span>
            <span>Days: <strong style={{ color: '#1e293b' }}>{days.length}</strong></span>
            <span style={{ color: '#94a3b8', fontSize: 11 }}>Tip: Click any cell to cycle P → A → H → L → –</span>
          </div>
          <button onClick={() => navigate(-1)} style={{ background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            ‹‹ Go back
          </button>
        </div>
      </div>

      {/* CSS for spin */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── EMPLOYEE MONTHLY DETAIL MODAL ── */}
      {summaryEmployee && (() => {
        const emp = summaryEmployee;
        const s = getSummary(emp.id);
        const total = days.length;
        const marked = s.Present + s.Absent + s['Half-Day'] + s.Leave;
        const working = s.Present + s['Half-Day'] * 0.5;
        const pct = total > 0 ? Math.round((working / total) * 100) : 0;
        const empIdx = employees.findIndex(e => e.id === emp.id);
        const avatarColor = AVATAR_COLORS[empIdx % AVATAR_COLORS.length];
        const firstDayOfMonth = new Date(selectedMonth + '-01').getDay();

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.7)', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 25px 80px rgba(0,0,0,0.35)', width: '100%', maxWidth: 660, display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '95vh' }}>

              {/* ── Modal Header ── */}
              <div style={{ background: `linear-gradient(135deg, ${avatarColor} 0%, #6366f1 100%)`, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff', border: '2px solid rgba(255,255,255,0.4)' }}>
                    {emp.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: 0.3 }}>{emp.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 }}>
                      {emp.designation || 'Employee'} &nbsp;&bull;&nbsp; {formatMonthDisplay(selectedMonth)}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSummaryEmployee(null)} style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <X size={20} color="#fff" strokeWidth={3} />
                </button>
              </div>

              {/* ── Scrollable content ── */}
              <div style={{ overflowY: 'auto', flex: 1 }}>

                {/* Attendance bar */}
                <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Overall Attendance Rate</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: pct >= 75 ? '#16a34a' : pct >= 50 ? '#ca8a04' : '#dc2626' }}>{pct}%</span>
                  </div>
                  <div style={{ background: '#e0e7ff', borderRadius: 8, height: 12, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct >= 75 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444', borderRadius: 8, transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
                    Effective working: <strong style={{ color: '#374151' }}>{working} days</strong> &nbsp;|&nbsp; Total days: <strong style={{ color: '#374151' }}>{total}</strong>
                  </div>
                </div>

                {/* 4 Big Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '16px 20px 0' }}>
                  {[
                    { label: 'Present',  val: s.Present,     bg: '#22c55e', darkBg: '#15803d', emoji: '✅' },
                    { label: 'Absent',   val: s.Absent,      bg: '#ef4444', darkBg: '#b91c1c', emoji: '❌' },
                    { label: 'Half Day', val: s['Half-Day'], bg: '#eab308', darkBg: '#a16207', emoji: '🌓' },
                    { label: 'Leave',    val: s.Leave,       bg: '#3b82f6', darkBg: '#1d4ed8', emoji: '🏖️' },
                  ].map(c => (
                    <div key={c.label} style={{ background: `linear-gradient(160deg, ${c.bg}, ${c.darkBg})`, borderRadius: 10, padding: '14px 8px', textAlign: 'center', color: '#fff', boxShadow: `0 4px 14px ${c.bg}55` }}>
                      <div style={{ fontSize: 22 }}>{c.emoji}</div>
                      <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.1, marginTop: 6 }}>{c.val}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.9, marginTop: 3 }}>{c.label}</div>
                    </div>
                  ))}
                </div>

                {/* Stats strip */}
                <div style={{ display: 'flex', gap: 0, margin: '14px 20px', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  {[
                    { label: 'Total Days', val: total, color: '#1e293b', bg: '#f8fafc' },
                    { label: 'Marked', val: marked, color: '#4F46E5', bg: '#eef2ff' },
                    { label: 'Pending', val: total - marked, color: (total-marked) > 0 ? '#f97316' : '#22c55e', bg: '#fff7ed' },
                  ].map((r, i) => (
                    <div key={r.label} style={{ flex: 1, background: r.bg, padding: '10px 6px', textAlign: 'center', borderRight: i < 2 ? '1px solid #e5e7eb' : 'none' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: r.color }}>{r.val}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{r.label}</div>
                    </div>
                  ))}
                </div>

                {/* ── Full Month Calendar ── */}
                <div style={{ padding: '0 20px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>📅 Full Month Attendance — {formatMonthDisplay(selectedMonth)}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[
                        { bg: '#22c55e', label: 'P' },
                        { bg: '#ef4444', label: 'A' },
                        { bg: '#eab308', label: 'H' },
                        { bg: '#3b82f6', label: 'L' },
                        { bg: '#f1f5f9', label: '–', text: '#94a3b8' },
                      ].map(l => (
                        <div key={l.label} style={{ width: 22, height: 22, background: l.bg, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: l.text || '#fff' }}>
                          {l.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Day-name header row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, marginBottom: 5 }}>
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                      <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: d === 'Sun' ? '#ef4444' : '#94a3b8', padding: '4px 0' }}>{d}</div>
                    ))}
                  </div>

                  {/* Calendar boxes */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
                    {/* Offset blank cells */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`blank-${i}`} style={{ aspectRatio: '1' }} />
                    ))}

                    {/* Actual day cells */}
                    {days.map(d => {
                      const st = getStatus(emp.id, d.iso);
                      const cfg = STATUS_STYLE[st] || STATUS_STYLE[''];
                      const isToday = d.iso.substring(0, 10) === todayStr;
                      const isSun = d.isSun;

                      return (
                        <button
                          key={d.iso}
                          onClick={() => cycleStatus(emp.id, d.iso)}
                          title={`${d.num} ${d.day} — ${cfg.full}. Click to change.`}
                          style={{
                            aspectRatio: '1',
                            background: cfg.bg,
                            border: isToday ? '2.5px solid #4F46E5' : isSun && !st ? '1px dashed #fca5a5' : '1px solid rgba(0,0,0,0.08)',
                            borderRadius: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                            boxShadow: st ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                            transition: 'transform 0.12s, box-shadow 0.12s',
                            position: 'relative',
                            outline: 'none',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.zIndex = 5; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = 'auto'; }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 800, color: cfg.text, lineHeight: 1 }}>{d.num}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: cfg.text, opacity: st ? 1 : 0.5, lineHeight: 1.4 }}>{cfg.label}</span>
                          {isToday && (
                            <div style={{ position: 'absolute', top: 2, right: 3, width: 5, height: 5, borderRadius: '50%', background: '#4F46E5' }} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                    💡 Click any date box to change attendance status
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: '#f8fafc', borderTop: '1px solid #e5e7eb', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {formatMonthDisplay(selectedMonth)} &nbsp;&bull;&nbsp; {emp.name}
                </div>
                <button onClick={() => setSummaryEmployee(null)} style={{ background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3 }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── EMPLOYEE MASTER MODAL ── */}
      {isEmployeeMasterOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 6, boxShadow: '0 20px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: 820, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: '#4F46E5', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>Employee Master</h2>
              <button onClick={() => setIsEmployeeMasterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={22} color="#fff" strokeWidth={3} />
              </button>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', maxHeight: '75vh' }}>
              {/* Employee name + Active toggle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Employee Name *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      style={{ width: 36, height: 20, borderRadius: 10, background: formData.isActive ? '#4F46E5' : '#cbd5e1', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                      <div style={{ width: 14, height: 14, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: formData.isActive ? 19 : 3, transition: 'left 0.2s' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{formData.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter Employee Name"
                  style={{ width: '100%', background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 4, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Mobile Number', key: 'mobile', type: 'text', placeholder: 'Enter Mobile Number' },
                  { label: 'City', key: 'city', type: 'text', placeholder: 'Enter City' },
                ].map(f => (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{f.label}</label>
                    <input type={f.type} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      style={{ height: 34, border: '1px solid #d1d5db', borderRadius: 4, padding: '0 10px', fontSize: 13, outline: 'none' }} />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Joining Date</label>
                  <input type="date" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                    style={{ height: 34, border: '1px solid #d1d5db', borderRadius: 4, padding: '0 10px', fontSize: 13, outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Designation</label>
                  <input type="text" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Manager"
                    style={{ height: 34, border: '1px solid #d1d5db', borderRadius: 4, padding: '0 10px', fontSize: 13, outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Salary</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>Day</span>
                      <div onClick={() => setFormData({ ...formData, salaryType: formData.salaryType === 'Month' ? 'Day' : 'Month' })}
                        style={{ width: 30, height: 16, borderRadius: 8, background: '#4F46E5', position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: 12, height: 12, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: formData.salaryType === 'Month' ? 16 : 2, transition: 'left 0.2s' }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>Month</span>
                    </div>
                  </div>
                  <input type="number" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })}
                    style={{ height: 34, border: '1px solid #d1d5db', borderRadius: 4, padding: '0 10px', fontSize: 13, outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Paid Holiday', key: 'paidHoliday' },
                  { label: 'Commission', key: 'commission' },
                  { label: 'Special Commission', key: 'specialCommission' },
                  { label: 'Total Sale Commission', key: 'totalSaleCommission' },
                  { label: 'Commission on Mfg (%)', key: 'commissionOnManufacturing' },
                ].map(f => (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{f.label}</label>
                    <input type="number" value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      style={{ height: 34, border: '1px solid #d1d5db', borderRadius: 4, padding: '0 10px', fontSize: 13, outline: 'none' }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderTop: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={handleCreateEmployee} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Submit</button>
              <button onClick={() => setIsEmployeeMasterOpen(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
