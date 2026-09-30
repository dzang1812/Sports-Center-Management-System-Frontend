// Static UI exported from Stitch. Data is hardcoded until the real API is wired in.
export default function ManagerDashboard() {
  return (
    <>
<div className="flex flex-col w-full space-y-space-lg">

<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
<div className="flex flex-col space-y-1">
<div className="flex items-center gap-space-sm">
<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Tổng Quan &amp; Báo Cáo Quản Trị</h1>
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm uppercase tracking-wider">Thời gian thực</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">Theo dõi doanh thu, tăng trưởng hội viên và hiệu suất phòng tập theo thời gian thực</p>
</div>

<div className="flex flex-wrap items-center gap-space-sm">

<div className="flex items-center bg-surface-container p-1 rounded-lg">
<button className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors">Hôm nay</button>
<button className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors">7 ngày qua</button>
<button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary shadow-sm font-label-md text-label-md">Tháng này</button>
<button className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors">Quý này</button>
<button className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors">Năm nay</button>
</div>

<div className="flex items-center gap-2 h-10 px-3.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors">
<span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
<span>Tháng này: 01/10/2024 - 31/10/2024</span>
<span className="material-symbols-outlined text-on-surface-variant text-[18px]">arrow_drop_down</span>
</div>

<button className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-sm hover:opacity-90 active:scale-[0.98] transition-all">
<span className="material-symbols-outlined text-[18px]">download</span>
<span>Xuất báo cáo (Excel/PDF)</span>
</button>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">

<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface-variant">Doanh thu tháng</span>
<span className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">1.428.500.000 đ</span>
</div>
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">payments</span>
</div>
</div>
<div className="mt-4 pt-3 flex flex-col space-y-2">
<div className="flex items-center gap-1.5">
<span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            +14.8%
          </span>
<span className="font-label-sm text-label-sm text-on-surface-variant">so với tháng trước</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
<div className="bg-primary-container h-1.5 rounded-full" style={{ width: "95.2%" }}></div>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate">Mục tiêu tháng: 1.500.000.000 đ (Đạt 95.2%)</span>
</div>
</div>

<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface-variant">Thành viên đang active</span>
<span className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">1.842 hội viên</span>
</div>
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">badge</span>
</div>
</div>
<div className="mt-4 pt-3 flex flex-col space-y-2">
<div className="flex items-center gap-1.5">
<span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            +8.2%
          </span>
<span className="font-label-sm text-label-sm text-on-surface-variant">so với tháng trước</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
<div className="bg-primary h-1.5 rounded-full" style={{ width: "85.6%" }}></div>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate">Đang hoạt động trên tổng số 2.150 thẻ</span>
</div>
</div>

<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface-variant">Thành viên mới</span>
<span className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">235 hội viên mới</span>
</div>
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">person_add</span>
</div>
</div>
<div className="mt-4 pt-3 flex flex-col space-y-2">
<div className="flex items-center gap-1.5">
<span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            +18.5%
          </span>
<span className="font-label-sm text-label-sm text-on-surface-variant">so với tháng trước</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden flex">
<div className="bg-primary-container h-1.5" style={{ width: "63%" }}></div>
<div className="bg-secondary h-1.5" style={{ width: "37%" }}></div>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate">148 gói All-Access, 87 gói Gym/Yoga</span>
</div>
</div>

<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface-variant">Tỷ lệ lấp đầy lớp</span>
<span className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">86.4%</span>
</div>
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">event_seat</span>
</div>
</div>
<div className="mt-4 pt-3 flex flex-col space-y-2">
<div className="flex items-center gap-1.5">
<span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px]">arrow_downward</span>
            -2.1%
          </span>
<span className="font-label-sm text-label-sm text-on-surface-variant">so với tuần trước</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
<div className="bg-tertiary-container h-1.5 rounded-full" style={{ width: "86.4%" }}></div>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate">Trung bình 18.2 / 20 học viên mỗi ca</span>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">

<div className="lg:col-span-8 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
<div>
<h2 className="font-headline-md text-headline-md text-on-surface">Biểu Đồ Doanh Thu 12 Tháng</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">So sánh tăng trưởng doanh thu theo tháng 2024 so với 2023</p>
</div>
<div className="flex items-center gap-4">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-primary-container"></span>
<span className="font-label-sm text-label-sm text-on-surface">Năm 2024 (Thực tế)</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-slate-300"></span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Năm 2023 (Cùng kỳ)</span>
</div>
</div>
</div>

<div className="relative w-full h-72">
<svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 740 260">
<defs>
<linearGradient id="revenueGradient2024" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#4338ca" stopOpacity="0.28"></stop>
<stop offset="100%" stopColor="#4338ca" stopOpacity="0.0"></stop>
</linearGradient>
</defs>

<line stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" x1="45" x2="720" y1="30" y2="30"></line>
<line stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" x1="45" x2="720" y1="85" y2="85"></line>
<line stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" x1="45" x2="720" y1="140" y2="140"></line>
<line stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" x1="45" x2="720" y1="195" y2="195"></line>
<line stroke="#e2e8f0" strokeWidth="1" x1="45" x2="720" y1="240" y2="240"></line>

<text className="fill-slate-400 font-label-sm text-[11px]" textAnchor="end" x="35" y="34">1.5 Tỷ</text>
<text className="fill-slate-400 font-label-sm text-[11px]" textAnchor="end" x="35" y="89">1.0 Tỷ</text>
<text className="fill-slate-400 font-label-sm text-[11px]" textAnchor="end" x="35" y="144">500 Tr</text>
<text className="fill-slate-400 font-label-sm text-[11px]" textAnchor="end" x="35" y="199">250 Tr</text>
<text className="fill-slate-400 font-label-sm text-[11px]" textAnchor="end" x="35" y="244">0 đ</text>


<path d="M 60 185 L 120 175 L 180 165 L 240 155 L 300 148 L 360 135 L 420 130 L 480 120 L 540 115 L 600 105 L 660 98 L 710 90" fill="none" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth="2"></path>

<path d="M 60 170 C 90 160, 90 150, 120 150 C 150 150, 150 140, 180 135 C 210 130, 210 125, 240 120 C 270 115, 270 110, 300 100 C 330 90, 330 92, 360 88 C 390 84, 390 75, 420 70 C 450 65, 450 60, 480 58 C 510 56, 510 50, 540 45 C 570 40, 580 38, 600 37 L 600 240 L 60 240 Z" fill="url(#revenueGradient2024)"></path>

<path d="M 60 170 C 90 160, 90 150, 120 150 C 150 150, 150 140, 180 135 C 210 130, 210 125, 240 120 C 270 115, 270 110, 300 100 C 330 90, 330 92, 360 88 C 390 84, 390 75, 420 70 C 450 65, 450 60, 480 58 C 510 56, 510 50, 540 45 C 570 40, 580 38, 600 37" fill="none" stroke="#4338ca" strokeWidth="3"></path>

<path d="M 600 37 L 660 32 L 710 26" fill="none" opacity="0.6" stroke="#4338ca" strokeDasharray="3 3" strokeWidth="2"></path>

<circle cx="60" cy="170" fill="#ffffff" r="3.5" stroke="#4338ca" strokeWidth="2"></circle>
<circle cx="120" cy="150" fill="#ffffff" r="3.5" stroke="#4338ca" strokeWidth="2"></circle>
<circle cx="180" cy="135" fill="#ffffff" r="3.5" stroke="#4338ca" strokeWidth="2"></circle>
<circle cx="240" cy="120" fill="#ffffff" r="3.5" stroke="#4338ca" strokeWidth="2"></circle>
<circle cx="300" cy="100" fill="#ffffff" r="3.5" stroke="#4338ca" strokeWidth="2"></circle>
<circle cx="360" cy="88" fill="#ffffff" r="3.5" stroke="#4338ca" strokeWidth="2"></circle>
<circle cx="420" cy="70" fill="#ffffff" r="3.5" stroke="#4338ca" strokeWidth="2"></circle>
<circle cx="480" cy="58" fill="#ffffff" r="3.5" stroke="#4338ca" strokeWidth="2"></circle>
<circle cx="540" cy="45" fill="#ffffff" r="3.5" stroke="#4338ca" strokeWidth="2"></circle>

<circle cx="600" cy="37" fill="#4338ca" r="6"></circle>
<circle cx="600" cy="37" fill="#4338ca" opacity="0.25" r="10"></circle>

<g transform="translate(540, -10)">
<rect className="shadow-lg" fill="#0f172a" height="34" rx="6" width="120" x="0" y="0"></rect>
<text className="font-label-sm text-[10px]" fill="#94a3b8" textAnchor="middle" x="60" y="15">T10/2024</text>
<text className="font-label-md text-[12px] font-bold" fill="#ffffff" textAnchor="middle" x="60" y="28">1.428.500.000 đ</text>
</g>

<text className="fill-slate-500 font-label-sm text-[11px]" textAnchor="middle" x="60" y="258">T1</text>
<text className="fill-slate-500 font-label-sm text-[11px]" textAnchor="middle" x="120" y="258">T2</text>
<text className="fill-slate-500 font-label-sm text-[11px]" textAnchor="middle" x="180" y="258">T3</text>
<text className="fill-slate-500 font-label-sm text-[11px]" textAnchor="middle" x="240" y="258">T4</text>
<text className="fill-slate-500 font-label-sm text-[11px]" textAnchor="middle" x="300" y="258">T5</text>
<text className="fill-slate-500 font-label-sm text-[11px]" textAnchor="middle" x="360" y="258">T6</text>
<text className="fill-slate-500 font-label-sm text-[11px]" textAnchor="middle" x="420" y="258">T7</text>
<text className="fill-slate-500 font-label-sm text-[11px]" textAnchor="middle" x="480" y="258">T8</text>
<text className="fill-slate-500 font-label-sm text-[11px]" textAnchor="middle" x="540" y="258">T9</text>
<text className="fill-primary font-label-md text-[12px] font-bold" textAnchor="middle" x="600" y="258">T10</text>
<text className="fill-slate-400 font-label-sm text-[11px]" textAnchor="middle" x="660" y="258">T11 (DK)</text>
<text className="fill-slate-400 font-label-sm text-[11px]" textAnchor="middle" x="710" y="258">T12 (DK)</text>
</svg>
</div>

<div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-3 rounded-lg">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">trending_up</span>
<span className="font-body-sm text-body-sm text-on-surface">Tốc độ tăng trưởng trung bình: <strong className="text-primary font-label-md">+16.2%/quý</strong></span>
</div>
<div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm">
<span>Cao nhất: <strong>T10 (1.428 Tỷ)</strong></span>
<span>Thấp nhất: <strong>T1 (620 Tr)</strong></span>
</div>
</div>
</div>

<div className="lg:col-span-4 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-4">
<div>
<h2 className="font-headline-md text-headline-md text-on-surface">Cơ Cấu Doanh Thu</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Phân bổ nguồn thu theo gói dịch vụ</p>
</div>
<button className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" title="Tùy chọn">
<span className="material-symbols-outlined text-[20px]">more_vert</span>
</button>
</div>

<div className="relative flex items-center justify-center my-4">
<svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">

<circle cx="80" cy="80" fill="transparent" r="62" stroke="#eff4ff" strokeWidth="18"></circle>

<circle cx="80" cy="80" fill="transparent" r="62" stroke="#4338ca" strokeDasharray="175.3 389.56" strokeDashoffset="0" strokeWidth="18"></circle>

<circle cx="80" cy="80" fill="transparent" r="62" stroke="#10b981" strokeDasharray="97.4 389.56" strokeDashoffset="-175.3" strokeWidth="18"></circle>

<circle cx="80" cy="80" fill="transparent" r="62" stroke="#f59e0b" strokeDasharray="77.9 389.56" strokeDashoffset="-272.7" strokeWidth="18"></circle>

<circle cx="80" cy="80" fill="transparent" r="62" stroke="#ef4444" strokeDasharray="38.96 389.56" strokeDashoffset="-350.6" strokeWidth="18"></circle>
</svg>

<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
<span className="font-headline-lg text-headline-lg text-on-surface font-bold leading-none">1.428 Tỷ</span>
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Tổng thu</span>
</div>
</div>
</div>

<div className="flex flex-col space-y-2.5 mt-2">
<div className="flex items-center justify-between text-body-sm">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-[#4338ca]"></span>
<span className="font-body-sm text-on-surface">All-Access VIP 12T</span>
</div>
<div className="flex items-center gap-2">
<span className="font-label-md text-label-md text-on-surface font-semibold">642.8 Tr</span>
<span className="font-label-sm text-label-sm text-on-surface-variant w-9 text-right font-medium">45%</span>
</div>
</div>
<div className="flex items-center justify-between text-body-sm">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
<span className="font-body-sm text-on-surface">Gym &amp; Functional</span>
</div>
<div className="flex items-center gap-2">
<span className="font-label-md text-label-md text-on-surface font-semibold">357.1 Tr</span>
<span className="font-label-sm text-label-sm text-on-surface-variant w-9 text-right font-medium">25%</span>
</div>
</div>
<div className="flex items-center justify-between text-body-sm">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
<span className="font-body-sm text-on-surface">Yoga &amp; Pilates Reformer</span>
</div>
<div className="flex items-center gap-2">
<span className="font-label-md text-label-md text-on-surface font-semibold">285.7 Tr</span>
<span className="font-label-sm text-label-sm text-on-surface-variant w-9 text-right font-medium">20%</span>
</div>
</div>
<div className="flex items-center justify-between text-body-sm">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
<span className="font-body-sm text-on-surface">Dịch vụ PT 1:1 &amp; Khác</span>
</div>
<div className="flex items-center gap-2">
<span className="font-label-md text-label-md text-on-surface font-semibold">142.9 Tr</span>
<span className="font-label-sm text-label-sm text-on-surface-variant w-9 text-right font-medium">10%</span>
</div>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">

<div className="lg:col-span-8 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
<div>
<h2 className="font-headline-md text-headline-md text-on-surface">Tăng Trưởng Hội Viên Mới Theo Tháng</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Phân tách thành viên gói Phổ thông và VIP 6 tháng gần nhất</p>
</div>
<div className="flex items-center gap-4">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-sm bg-primary-container"></span>
<span className="font-label-sm text-label-sm text-on-surface">Hội viên VIP</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-sm bg-secondary-fixed-dim"></span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Phổ thông</span>
</div>
</div>
</div>

<div className="w-full pt-6 pb-2">
<div className="grid grid-cols-6 gap-3 sm:gap-6 items-end h-52">

<div className="flex flex-col items-center h-full justify-end group">
<span className="font-label-sm text-label-sm text-on-surface-variant mb-1 group-hover:text-primary transition-colors">168</span>
<div className="w-full max-w-[42px] flex flex-col items-center rounded-t-md overflow-hidden bg-surface-container">
<div className="w-full bg-primary-container hover:opacity-90 transition-all rounded-t-sm" style={{ height: "62px" }} title="VIP: 62"></div>
<div className="w-full bg-secondary-fixed-dim hover:opacity-90 transition-all" style={{ height: "70px" }} title="Phổ thông: 106"></div>
</div>
<span className="mt-2 font-label-md text-label-md text-on-surface-variant">T5</span>
</div>

<div className="flex flex-col items-center h-full justify-end group">
<span className="font-label-sm text-label-sm text-on-surface-variant mb-1 group-hover:text-primary transition-colors">182</span>
<div className="w-full max-w-[42px] flex flex-col items-center rounded-t-md overflow-hidden bg-surface-container">
<div className="w-full bg-primary-container hover:opacity-90 transition-all rounded-t-sm" style={{ height: "74px" }} title="VIP: 74"></div>
<div className="w-full bg-secondary-fixed-dim hover:opacity-90 transition-all" style={{ height: "72px" }} title="Phổ thông: 108"></div>
</div>
<span className="mt-2 font-label-md text-label-md text-on-surface-variant">T6</span>
</div>

<div className="flex flex-col items-center h-full justify-end group">
<span className="font-label-sm text-label-sm text-on-surface-variant mb-1 group-hover:text-primary transition-colors">195</span>
<div className="w-full max-w-[42px] flex flex-col items-center rounded-t-md overflow-hidden bg-surface-container">
<div className="w-full bg-primary-container hover:opacity-90 transition-all rounded-t-sm" style={{ height: "85px" }} title="VIP: 85"></div>
<div className="w-full bg-secondary-fixed-dim hover:opacity-90 transition-all" style={{ height: "75px" }} title="Phổ thông: 110"></div>
</div>
<span className="mt-2 font-label-md text-label-md text-on-surface-variant">T7</span>
</div>

<div className="flex flex-col items-center h-full justify-end group">
<span className="font-label-sm text-label-sm text-on-surface-variant mb-1 group-hover:text-primary transition-colors">210</span>
<div className="w-full max-w-[42px] flex flex-col items-center rounded-t-md overflow-hidden bg-surface-container">
<div className="w-full bg-primary-container hover:opacity-90 transition-all rounded-t-sm" style={{ height: "98px" }} title="VIP: 98"></div>
<div className="w-full bg-secondary-fixed-dim hover:opacity-90 transition-all" style={{ height: "78px" }} title="Phổ thông: 112"></div>
</div>
<span className="mt-2 font-label-md text-label-md text-on-surface-variant">T8</span>
</div>

<div className="flex flex-col items-center h-full justify-end group">
<span className="font-label-sm text-label-sm text-on-surface-variant mb-1 group-hover:text-primary transition-colors">198</span>
<div className="w-full max-w-[42px] flex flex-col items-center rounded-t-md overflow-hidden bg-surface-container">
<div className="w-full bg-primary-container hover:opacity-90 transition-all rounded-t-sm" style={{ height: "92px" }} title="VIP: 92"></div>
<div className="w-full bg-secondary-fixed-dim hover:opacity-90 transition-all" style={{ height: "72px" }} title="Phổ thông: 106"></div>
</div>
<span className="mt-2 font-label-md text-label-md text-on-surface-variant">T9</span>
</div>

<div className="flex flex-col items-center h-full justify-end group">
<span className="font-label-md text-label-md text-primary font-bold mb-1">235</span>
<div className="w-full max-w-[42px] flex flex-col items-center rounded-t-md overflow-hidden bg-surface-container shadow-sm">
<div className="w-full bg-primary hover:opacity-90 transition-all rounded-t-sm" style={{ height: "120px" }} title="VIP: 148"></div>
<div className="w-full bg-secondary-fixed-dim hover:opacity-90 transition-all" style={{ height: "60px" }} title="Phổ thông: 87"></div>
</div>
<span className="mt-2 font-label-md text-label-md text-primary font-bold">T10</span>
</div>
</div>
</div>
<div className="mt-3 flex items-center justify-between pt-3 text-body-sm text-on-surface-variant">
<span className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
          Tỷ lệ chuyển đổi thẻ VIP tăng <strong className="text-on-surface font-semibold ml-1">28.4%</strong> sau chiến dịch mùa thu
        </span>
<span className="font-label-sm text-label-sm text-primary cursor-pointer hover:underline">Xem báo cáo chi tiết →</span>
</div>
</div>

<div className="lg:col-span-4 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<h2 className="font-headline-md text-headline-md text-on-surface">Tiêu Điểm Vận Hành</h2>
<span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Các chỉ số cốt lõi trong ca trực hôm nay</p>

<div className="space-y-3">
<div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">how_to_reg</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">Check-in hôm nay</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Tính đến 16:30</span>
</div>
</div>
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">542 lượt</span>
</div>
<div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">fitness_center</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">Buổi tập PT hoàn tất</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">38/42 buổi theo lịch</span>
</div>
</div>
<span className="font-headline-sm text-headline-sm text-emerald-700 font-bold">90.5%</span>
</div>
<div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">Hài lòng hội viên (CSAT)</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Dựa trên 112 đánh giá</span>
</div>
</div>
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">4.9 / 5.0</span>
</div>
</div>
</div>
<div className="mt-4 pt-3 flex items-center justify-between">
<span className="font-label-sm text-label-sm text-on-surface-variant">Cập nhật tự động 60s/lần</span>
<button className="font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">sync</span> Làm mới
        </button>
</div>
</div>
</div>

<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col space-y-space-md">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
<div>
<div className="flex items-center gap-2">
<h2 className="font-headline-md text-headline-md text-on-surface">Lớp Sắp Đầy &amp; Cần Mở Thêm Suất</h2>
<span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">5 Lớp Cần Xử Lý</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Danh sách các lớp có tỷ lệ đăng ký trên 80% trong 24 giờ tới cần điều phối phòng tập hoặc thêm huấn luyện viên</p>
</div>
<div className="flex items-center gap-2">
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
<span>Bộ môn: Tất cả</span>
</button>
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md">
<span className="material-symbols-outlined text-[18px]">schedule</span>
<span>Hôm nay &amp; Ngày mai</span>
</button>
</div>
</div>

<div className="w-full overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider h-11">
<th className="px-4 rounded-l-lg font-semibold">Tên Lớp &amp; Bộ Môn</th>
<th className="px-4 font-semibold">Huấn Luyện Viên</th>
<th className="px-4 font-semibold">Khung Giờ &amp; Phòng</th>
<th className="px-4 font-semibold min-w-[200px]">Tỷ Lệ Đặt Chỗ</th>
<th className="px-4 font-semibold">Trạng Thái</th>
<th className="px-4 rounded-r-lg font-semibold text-right">Thao Tác</th>
</tr>
</thead>
<tbody className="divide-y-0">

<tr className="h-16 hover:bg-surface-container-low/60 transition-colors">
<td className="px-4 py-3">
<div className="flex items-center gap-3">
<span className="w-1.5 h-10 rounded-full bg-[#f97316]"></span>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-on-surface font-semibold">Power HIIT &amp; Core</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">HIIT Cardio</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-md text-primary font-bold">
                  TN
                </div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">Trần Hoàng Nam</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Senior Trainer</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">07:00 - 08:00</span>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">meeting_room</span> Studio A (Tầng 1)
                </span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col space-y-1.5">
<div className="flex items-center justify-between font-label-sm text-label-sm">
<span className="font-semibold text-tertiary-container">95%</span>
<span className="text-on-surface-variant">19 / 20 chỗ</span>
</div>
<div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
<div className="bg-[#f97316] h-2 rounded-full" style={{ width: "95%" }}></div>
</div>
</div>
</td>
<td className="px-4 py-3">
<span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-label-sm text-label-sm font-semibold">
                Sắp kín chỗ
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                  Chi tiết
                </button>
<button className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity">
                  Mở thêm ca
                </button>
</div>
</td>
</tr>

<tr className="h-16 hover:bg-surface-container-low/60 transition-colors bg-error-container/10">
<td className="px-4 py-3">
<div className="flex items-center gap-3">
<span className="w-1.5 h-10 rounded-full bg-[#0ea5e9]"></span>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-on-surface font-semibold">Pilates Reformer Pro</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Pilates Thiết Bị</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-md text-primary font-bold">
                  NV
                </div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">Ngô Thanh Vân</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Master Pilates</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">17:30 - 18:30</span>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">meeting_room</span> Studio P1 (Tầng 2)
                </span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col space-y-1.5">
<div className="flex items-center justify-between font-label-sm text-label-sm">
<span className="font-semibold text-error">100% (Full)</span>
<span className="text-error font-medium">10 / 10 chỗ (+3 chờ)</span>
</div>
<div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
<div className="bg-error h-2 rounded-full" style={{ width: "100%" }}></div>
</div>
</div>
</td>
<td className="px-4 py-3">
<span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-label-sm text-label-sm font-semibold">
                Hết chỗ - Chờ 3
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                  Chi tiết
                </button>
<button className="px-3 py-1.5 rounded-lg bg-[#f97316] text-white font-label-md text-label-md hover:opacity-90 transition-opacity">
                  Chuyển phòng lớn
                </button>
</div>
</td>
</tr>

<tr className="h-16 hover:bg-surface-container-low/60 transition-colors">
<td className="px-4 py-3">
<div className="flex items-center gap-3">
<span className="w-1.5 h-10 rounded-full bg-[#0ea5e9]"></span>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-on-surface font-semibold">Vinyasa Yoga Flow</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Yoga Asana</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-md text-primary font-bold">
                  LT
                </div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">Lê Thu Thảo</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Yoga Specialist</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">09:00 - 10:15</span>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">meeting_room</span> Studio Zen (Tầng 3)
                </span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col space-y-1.5">
<div className="flex items-center justify-between font-label-sm text-label-sm">
<span className="font-semibold text-amber-600">88%</span>
<span className="text-on-surface-variant">22 / 25 chỗ</span>
</div>
<div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
<div className="bg-amber-500 h-2 rounded-full" style={{ width: "88%" }}></div>
</div>
</div>
</td>
<td className="px-4 py-3">
<span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-label-sm text-label-sm font-semibold">
                Còn 3 chỗ
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                  Chi tiết
                </button>
</div>
</td>
</tr>

<tr className="h-16 hover:bg-surface-container-low/60 transition-colors">
<td className="px-4 py-3">
<div className="flex items-center gap-3">
<span className="w-1.5 h-10 rounded-full bg-[#4338ca]"></span>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-on-surface font-semibold">Functional Kickfit</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Võ thuật &amp; Thể lực</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-md text-primary font-bold">
                  DQ
                </div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">Đặng Quốc Huy</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Kickfit Head Coach</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">18:00 - 19:00</span>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">meeting_room</span> Khu Functional (Tầng 1)
                </span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col space-y-1.5">
<div className="flex items-center justify-between font-label-sm text-label-sm">
<span className="font-semibold text-tertiary-container">93.3%</span>
<span className="text-on-surface-variant">14 / 15 chỗ</span>
</div>
<div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
<div className="bg-amber-600 h-2 rounded-full" style={{ width: "93.3%" }}></div>
</div>
</div>
</td>
<td className="px-4 py-3">
<span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-label-sm text-label-sm font-semibold">
                Còn 1 chỗ
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                  Chi tiết
                </button>
<button className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity">
                  Mở thêm ca
                </button>
</div>
</td>
</tr>

<tr className="h-16 hover:bg-surface-container-low/60 transition-colors">
<td className="px-4 py-3">
<div className="flex items-center gap-3">
<span className="w-1.5 h-10 rounded-full bg-[#0ea5e9]"></span>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg text-on-surface font-semibold">Morning Asana Yoga</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Hatha Yoga</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-md text-primary font-bold">
                  AK
                </div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">Master Anand Kumar</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Senior Yoga Master</span>
</div>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">06:30 - 07:30</span>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">meeting_room</span> Studio Zen (Tầng 3)
                </span>
</div>
</td>
<td className="px-4 py-3">
<div className="flex flex-col space-y-1.5">
<div className="flex items-center justify-between font-label-sm text-label-sm">
<span className="font-semibold text-primary">84%</span>
<span className="text-on-surface-variant">21 / 25 chỗ</span>
</div>
<div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
<div className="bg-primary-container h-2 rounded-full" style={{ width: "84%" }}></div>
</div>
</div>
</td>
<td className="px-4 py-3">
<span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold">
                Đang nhận khách
              </span>
</td>
<td className="px-4 py-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                  Chi tiết
                </button>
</div>
</td>
</tr>
</tbody>
</table>
</div>

<div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
<span className="font-body-sm text-body-sm text-on-surface-variant">Hiển thị 5 trên tổng số 18 lớp hôm nay</span>
<div className="flex items-center gap-2">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors">
          Xem toàn bộ lịch Studio
        </button>
<button className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm hover:opacity-90 transition-opacity flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">add_circle</span>
          Tạo lớp tăng cường
        </button>
</div>
</div>
</div>
</div>
    </>
  )
}
