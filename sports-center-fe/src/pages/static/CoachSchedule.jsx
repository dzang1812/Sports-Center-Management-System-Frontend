// Static UI exported from Stitch. Data is hardcoded until the real API is wired in.
export default function CoachSchedule() {
  return (
    <>
<div className="flex flex-col w-full space-y-gutter">

<div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
<div className="flex flex-col space-y-1">
<nav className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
<span>Quản lý trung tâm</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span>Lịch Studio &amp; HLV</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">Thiết lập lớp học mới</span>
</nav>
<div className="flex items-center gap-space-sm pt-0.5">
<h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Thiết Lập &amp; Xếp Lịch Lớp Học (Class Scheduling)</h1>
<span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">Bản nháp v2.4</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
        Cấu hình thông tin lớp, phân bổ HLV, chu kỳ lặp và kiểm tra xung đột phòng tập tự động trong toàn hệ thống.
      </p>
</div>
<div className="flex items-center gap-space-sm self-start md:self-auto shrink-0">
<button className="h-10 px-space-md rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-lg text-label-lg flex items-center gap-1.5 shadow-sm" type="button">
<span className="material-symbols-outlined text-[18px]">bookmark_border</span>
<span>Lưu bản nháp</span>
</button>
<button className="h-10 px-space-lg rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-all font-label-lg text-label-lg flex items-center gap-1.5 shadow-md" type="button">
<span className="material-symbols-outlined text-[18px]">publish</span>
<span>Xuất bản lịch học</span>
</button>
</div>
</div>

<div className="relative overflow-hidden rounded-xl bg-error-container text-on-error-container p-space-lg shadow-sm" id="conflict-alert">
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
<div className="flex items-start gap-space-md">
<div className="w-10 h-10 rounded-lg bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm">
<span className="material-symbols-outlined text-[24px]">crisis_alert</span>
</div>
<div className="flex flex-col space-y-1">
<div className="flex items-center gap-space-xs">
<span className="font-label-lg text-label-lg font-bold uppercase tracking-wider text-error">Cảnh Báo Xung Đột Lịch Tập</span>
<span className="px-2 py-0.5 rounded bg-error text-on-error font-label-sm text-label-sm">Ưu tiên cao</span>
</div>
<p className="font-body-md text-body-md text-on-surface max-w-3xl">
            Trùng lịch phòng <strong className="font-bold text-on-surface">Studio A</strong> lúc <span className="font-semibold text-error">18:00 - 19:00 Thứ Tư (19/02/2025)</span> với lớp <span className="underline decoration-error underline-offset-2">"HIIT Cardio Burn"</span> của HLV Trần Hoàng Nam! Vui lòng chọn khung giờ khác hoặc đổi phòng tập.
          </p>
</div>
</div>
<div className="flex flex-wrap items-center gap-space-xs self-start lg:self-center shrink-0">
<button className="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors" type="button">
<span className="material-symbols-outlined text-[16px] text-tertiary">swap_horiz</span>
<span>Đổi sang Studio B (Đang trống)</span>
</button>
<button className="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors" type="button">
<span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
<span>Tự động đổi giờ (+30p)</span>
</button>
<button className="h-9 px-3 rounded-lg bg-transparent text-on-error-container hover:bg-error/10 font-label-md text-label-md flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]">close</span>
<span>Bỏ qua buổi này</span>
</button>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-gutter">

<div className="lg:col-span-4 flex flex-col space-y-gutter bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-primary-fixed text-primary flex items-center justify-center font-headline-sm text-headline-sm">1</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Thông tin bộ môn &amp; Quy mô</h2>
</div>
<span className="material-symbols-outlined text-primary text-[20px]">fitness_center</span>
</div>
<div className="space-y-space-md">

<div className="flex flex-col space-y-1.5">
<label className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between">
<span>Bộ môn thể thao <span className="text-error">*</span></span>
<span className="text-[11px] text-primary font-semibold">Theo chuẩn FitZone Pro</span>
</label>
<div className="relative">
<select className="w-full h-10 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none appearance-none cursor-pointer">
<option>HIIT &amp; Cardio Chuyên Sâu</option>
<option>Yoga &amp; Thiền Khí Công</option>
<option>Pilates Reformer Lò Xo</option>
<option>Gym &amp; Functional Bodyweight</option>
<option>Boxing &amp; Kickfit Đối Kháng</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
</div>
</div>

<div className="flex flex-col space-y-1.5">
<label className="font-label-md text-label-md text-on-surface-variant">
            Tên lớp hiển thị App học viên <span className="text-error">*</span>
</label>
<input className="w-full h-10 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none placeholder:text-outline" placeholder="VD: Dynamic Yoga Flow, Power HIIT..." type="text" defaultValue="Power HIIT &amp; Core Surge" />
</div>

<div className="flex flex-col space-y-1.5">
<label className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between">
<span>Phòng tập trung tâm <span className="text-error">*</span></span>
<span className="text-error font-label-sm text-label-sm flex items-center gap-0.5">
<span className="material-symbols-outlined text-[13px]">warning</span> Studio A có xung đột
            </span>
</label>
<div className="relative">
<select className="w-full h-10 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none appearance-none cursor-pointer" id="room-selector">
<option value="A">Studio A (Sức chứa tiêu chuẩn 25 học viên)</option>
<option value="B">Studio B (Sức chứa tiêu chuẩn 20 học viên - Đang trống)</option>
<option value="Zen">Studio Zen - Sàn gỗ thông (Sức chứa 30 học viên)</option>
<option value="P1">Studio Reformer P1 (Sức chứa 10 máy tập)</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
</div>
</div>

<div className="grid grid-cols-2 gap-space-sm pt-1">
<div className="flex flex-col space-y-1.5">
<label className="font-label-md text-label-md text-on-surface-variant">Sức chứa tối đa</label>
<div className="relative">
<input className="w-full h-10 pl-space-md pr-8 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none" max="50" min="1" type="number" defaultValue="20" />
<span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-sm text-label-sm text-on-surface-variant">HV</span>
</div>
</div>
<div className="flex flex-col justify-end">
<div className="h-10 px-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
<span className="font-label-sm text-label-sm text-on-surface-variant">Hàng chờ (5)</span>
<button className="w-8 h-4 bg-primary-container rounded-full relative p-0.5 transition-colors" type="button">
<span className="block w-3 h-3 rounded-full bg-surface-container-lowest ml-auto"></span>
</button>
</div>
</div>
</div>

<div className="flex flex-col space-y-1.5 pt-1">
<label className="font-label-md text-label-md text-on-surface-variant">Trình độ học viên</label>
<div className="grid grid-cols-2 gap-1.5">
<button className="py-2 px-space-sm rounded-lg bg-surface-container text-on-surface font-label-md text-label-md text-center hover:bg-surface-container-high transition-colors" type="button">
              Mọi cấp độ
            </button>
<button className="py-2 px-space-sm rounded-lg bg-surface-container text-on-surface font-label-md text-label-md text-center hover:bg-surface-container-high transition-colors" type="button">
              Cơ bản
            </button>
<button className="py-2 px-space-sm rounded-lg bg-primary-container text-on-primary font-label-md text-label-md text-center shadow-sm" type="button">
              Trung cấp
            </button>
<button className="py-2 px-space-sm rounded-lg bg-surface-container text-on-surface font-label-md text-label-md text-center hover:bg-surface-container-high transition-colors" type="button">
              Nâng cao
            </button>
</div>
</div>

<div className="flex flex-col space-y-1.5 pt-1">
<label className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between">
<span>Thời gian áp dụng khóa học</span>
<span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">Khóa 10 tuần</span>
</label>
<div className="grid grid-cols-2 gap-space-sm">
<div className="relative">
<input className="w-full h-10 pl-8 pr-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none" type="text" defaultValue="17/02/2025" />
<span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">calendar_today</span>
</div>
<div className="relative">
<input className="w-full h-10 pl-8 pr-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none" type="text" defaultValue="30/04/2025" />
<span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">event</span>
</div>
</div>
</div>
</div>
</div>

<div className="lg:col-span-4 flex flex-col space-y-gutter bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-primary-fixed text-primary flex items-center justify-center font-headline-sm text-headline-sm">2</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Chu kỳ lặp hàng tuần</h2>
</div>
<span className="material-symbols-outlined text-primary text-[20px]">update</span>
</div>
<div className="space-y-space-md">

<div className="flex flex-col space-y-1.5">
<label className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between">
<span>Ngày lặp trong tuần <span className="text-error">*</span></span>
<span className="font-label-sm text-label-sm text-primary">3 buổi / tuần</span>
</label>
<div className="grid grid-cols-7 gap-1">
<button className="h-10 rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm flex flex-col items-center justify-center shadow-sm" type="button">
<span>T2</span>
</button>
<button className="h-10 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-headline-sm flex flex-col items-center justify-center transition-colors" type="button">
<span>T3</span>
</button>
<button className="h-10 rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm flex flex-col items-center justify-center shadow-sm" type="button">
<span>T4</span>
</button>
<button className="h-10 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-headline-sm flex flex-col items-center justify-center transition-colors" type="button">
<span>T5</span>
</button>
<button className="h-10 rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm flex flex-col items-center justify-center shadow-sm" type="button">
<span>T6</span>
</button>
<button className="h-10 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-headline-sm flex flex-col items-center justify-center transition-colors" type="button">
<span>T7</span>
</button>
<button className="h-10 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-headline-sm flex flex-col items-center justify-center transition-colors" type="button">
<span>CN</span>
</button>
</div>
</div>

<div className="p-space-md rounded-xl bg-surface-container-low space-y-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-tertiary">pace</span>
              Khung giờ chính (Ca tối)
            </span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Thời lượng: 60 phút</span>
</div>
<div className="grid grid-cols-2 gap-space-sm">
<div className="flex flex-col space-y-1">
<span className="font-label-sm text-label-sm text-on-surface-variant">Giờ bắt đầu</span>
<div className="relative">
<input className="w-full h-10 pl-8 pr-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none" id="start-time-input" type="text" defaultValue="18:00" />
<span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">schedule</span>
</div>
</div>
<div className="flex flex-col space-y-1">
<span className="font-label-sm text-label-sm text-on-surface-variant">Giờ kết thúc</span>
<div className="relative">
<input className="w-full h-10 pl-8 pr-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none" id="end-time-input" type="text" defaultValue="19:00" />
<span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">timer</span>
</div>
</div>
</div>
</div>

<button className="w-full py-2.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md flex items-center justify-center gap-1" type="button">
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span>+ Thêm khung giờ trong ngày</span>
</button>

<div className="flex flex-col space-y-1.5 pt-1">
<label className="font-label-md text-label-md text-on-surface-variant">Quy luật chu kỳ</label>
<div className="grid grid-cols-2 gap-space-sm">
<label className="flex items-center gap-space-xs p-2.5 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
<input defaultChecked="" className="text-primary-container focus:ring-0 cursor-pointer" name="recurrence" type="radio" />
<span className="font-label-sm text-label-sm text-on-surface">Lặp lại mỗi tuần</span>
</label>
<label className="flex items-center gap-space-xs p-2.5 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
<input className="text-primary-container focus:ring-0 cursor-pointer" name="recurrence" type="radio" />
<span className="font-label-sm text-label-sm text-on-surface">Tuần chẵn / lẻ</span>
</label>
</div>
</div>

<div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[20px]">info</span>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-on-surface font-semibold">Quy định hủy buổi</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Tối thiểu 2 giờ trước khi bắt đầu</span>
</div>
</div>
<span className="material-symbols-outlined text-outline text-[18px]">lock</span>
</div>
</div>
</div>

<div className="lg:col-span-4 flex flex-col space-y-gutter bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-primary-fixed text-primary flex items-center justify-center font-headline-sm text-headline-sm">3</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Chỉ định Huấn luyện viên</h2>
</div>
<span className="material-symbols-outlined text-primary text-[20px]">sports</span>
</div>
<div className="space-y-space-sm">

<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">person_search</span>
<input className="w-full h-10 pl-10 pr-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none placeholder:text-outline" placeholder="Tìm HLV theo tên hoặc chuyên môn..." type="text" />
</div>

<div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">

<div className="relative p-space-sm rounded-xl bg-surface-container-high transition-all cursor-pointer">
<div className="flex items-start gap-space-sm">
<img className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0" data-alt="Chân dung cận cảnh nam huấn luyện viên thể hình chuyên nghiệp Việt Nam, mặc áo thể thao FitZone Pro đen, ánh sáng studio thể thao hiện đại, phong thái năng động tự tin." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyIThhsqntMqTELdmSikW_-243LDqGFigrOUKe2aFcM8il7acd8COynv7cesJrdJBXTNvJANZXFBpSKywd7EZQIotWR628RbWzW6UCNhLb1WkPtyW0bwd_0rQKXMMuCwz5c4_cIIod9xKZriBg8Co9oF51ktc257ulHpiQO5y9jhRMH5k4qTwplmiOoOmefiRjjeqv2-Dx6h2uh-j3i2NhtCfHSTsaQBnXz93WCwYlMvH8TTqHeLUY" />
<div className="flex-1 min-w-0">
<div className="flex items-center justify-between">
<h3 className="font-label-lg text-label-lg text-on-surface font-bold truncate">HLV Trần Hoàng Nam</h3>
<span className="flex items-center gap-0.5 text-tertiary-container font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 4.9
                  </span>
</div>
<p className="font-label-sm text-label-sm text-primary font-medium">Master Trainer CSCS</p>
<div className="flex flex-wrap gap-1 mt-1.5">
<span className="px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-label-sm text-[10px]">HIIT</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-label-sm text-[10px]">Cardio</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-label-sm text-[10px]">Strength</span>
</div>
</div>
<div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
<span className="material-symbols-outlined text-on-primary text-[14px]">check</span>
</div>
</div>
<div className="mt-2 pt-2 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
<span>Định mức ca trong tuần:</span>
<span className="font-semibold text-tertiary-container">14 / 20 ca (Đang tải cao)</span>
</div>
</div>

<div className="relative p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer">
<div className="flex items-start gap-space-sm">
<img className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0" data-alt="Huấn luyện viên nam thể hình trẻ trung châu Á, đeo dây đo nhịp tim thể thao, mỉm cười tự tin tại phòng gym cao cấp FitZone." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSwxUQQ3R4JT4etm0z3kkesvVeC-bR_brvqJMCZ37lE0k-YJQPhmWYJqng6JfWuP6Kw0VVZEjl9HlTv7vRLoFmsm-FBiWg3d0IatibxLJdNSUXyb6DtOUyqjyfxPIimW7dKf7lkro5vpyfcfamLtCNLVferbzHcgy_csM4avVccCNWBTnxVWWbwkT0b0NXSg95UajCvdt18p7sdHWn45-GLYeeza7dvWbILf8speI2lk1Md5uPC2gM" />
<div className="flex-1 min-w-0">
<div className="flex items-center justify-between">
<h3 className="font-label-lg text-label-lg text-on-surface font-semibold truncate">HLV Đặng Quốc Huy</h3>
<span className="flex items-center gap-0.5 text-tertiary-container font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 4.8
                  </span>
</div>
<p className="font-label-sm text-label-sm text-on-surface-variant">Functional &amp; Kettlebell Pro</p>
<div className="flex flex-wrap gap-1 mt-1.5">
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[10px]">Functional</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[10px]">Kettlebell</span>
</div>
</div>
<div className="w-5 h-5 rounded-full bg-surface-container-highest shrink-0 mt-1"></div>
</div>
<div className="mt-2 pt-2 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
<span>Định mức ca trong tuần:</span>
<span className="font-semibold text-secondary">12 / 20 ca (Sẵn sàng)</span>
</div>
</div>

<div className="relative p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer">
<div className="flex items-start gap-space-sm">
<img className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0" data-alt="Nữ huấn luyện viên Yoga và Pilates Việt Nam thanh lịch, tư thế tĩnh tại trong studio tràn ngập ánh sáng tự nhiên." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3XidHEczvAQZ7BiNTJrT0EN__VrXqGJoG_MD0nAZUf_EDdnwZK52oLItoVb7JeVgwFB9WFKmDX1jIJRrcW4COc4gYDDM0rSUaxv7W1KlBWzp5pWQp2pnaaTu8pnGrOsvOrtHvNJkKCJVHRe0LEpgeMgyMLFIEz6UIH5tWKjRhdWVMH2Z56iYi6d_KdTioZo8TVdMoQ7-kJGjZtvoHfE_a7D9IcTLXhEt54bW3NRj3IPNW0s-DM5nK" />
<div className="flex-1 min-w-0">
<div className="flex items-center justify-between">
<h3 className="font-label-lg text-label-lg text-on-surface font-semibold truncate">HLV Lê Thu Thảo</h3>
<span className="flex items-center gap-0.5 text-tertiary-container font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 5.0
                  </span>
</div>
<p className="font-label-sm text-label-sm text-on-surface-variant">Yoga Master RYT-500</p>
<div className="flex flex-wrap gap-1 mt-1.5">
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[10px]">Yoga Flow</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[10px]">Pilates Mat</span>
</div>
</div>
<div className="w-5 h-5 rounded-full bg-surface-container-highest shrink-0 mt-1"></div>
</div>
<div className="mt-2 pt-2 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
<span>Định mức ca trong tuần:</span>
<span className="font-semibold text-secondary">16 / 20 ca</span>
</div>
</div>

<div className="relative p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer">
<div className="flex items-start gap-space-sm">
<img className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0" data-alt="Nữ huấn luyện viên Pilates Reformer chuyên nghiệp với nụ cười thân thiện, phong thái kỷ luật thể thao hiện đại FitZone." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8ZBFs1J2nvvSqKjr_6c1cwB8r8upWIgSusOD3-4Kkrfw_VNi3sArkBNWoLqRMh466CrPDLMMA4ZwS6q-xvQMKZO5TTc5kDYzgcu3N7qwQvYHnGPfrHRCg4cjVtEdH4StyW7dvC3fVfUblA-JXtnIhZiFseFm_GZpqexeYng-6TGqYF6ZtSH36GAPJWQQfuKlrPtAurCHycDT00X88m99nixUzWGbrMT68oiRuofl4H1cVqNcgyG3o" />
<div className="flex-1 min-w-0">
<div className="flex items-center justify-between">
<h3 className="font-label-lg text-label-lg text-on-surface font-semibold truncate">HLV Ngô Thanh Vân</h3>
<span className="flex items-center gap-0.5 text-tertiary-container font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 4.9
                  </span>
</div>
<p className="font-label-sm text-label-sm text-on-surface-variant">Pilates Reformer Specialist</p>
<div className="flex flex-wrap gap-1 mt-1.5">
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[10px]">Reformer</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[10px]">Core Pilates</span>
</div>
</div>
<div className="w-5 h-5 rounded-full bg-surface-container-highest shrink-0 mt-1"></div>
</div>
<div className="mt-2 pt-2 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
<span>Định mức ca trong tuần:</span>
<span className="font-semibold text-secondary">8 / 20 ca</span>
</div>
</div>
</div>
</div>
</div>
</div>

<div className="flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-primary-fixed text-primary flex items-center justify-center font-headline-sm text-headline-sm">4</span>
<div className="flex flex-col">
<h2 className="font-headline-sm text-headline-sm text-on-surface">Danh sách các buổi học được tạo tự động (Generated Sessions Preview)</h2>
<span className="font-body-sm text-body-sm text-on-surface-variant">
            Tổng cộng: <strong className="font-semibold text-primary">30 buổi học</strong> được tạo tự động từ <span className="font-medium text-on-surface">17/02/2025</span> đến <span className="font-medium text-on-surface">25/04/2025</span> (3 buổi/tuần: Thứ 2, Thứ 4, Thứ 6)
          </span>
</div>
</div>
<div className="flex items-center gap-space-xs shrink-0">
<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface">
<span className="w-2 h-2 rounded-full bg-primary-container"></span>
<span>29 Hợp lệ</span>
</div>
<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-container font-label-sm text-label-sm text-on-error-container">
<span className="w-2 h-2 rounded-full bg-error"></span>
<span>1 Cần xử lý</span>
</div>
</div>
</div>

<div className="overflow-x-auto rounded-xl">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider h-11">
<th className="px-space-md py-2.5 font-semibold">STT</th>
<th className="px-space-md py-2.5 font-semibold">Ngày diễn ra</th>
<th className="px-space-md py-2.5 font-semibold">Thứ</th>
<th className="px-space-md py-2.5 font-semibold">Khung giờ</th>
<th className="px-space-md py-2.5 font-semibold">Phòng tập</th>
<th className="px-space-md py-2.5 font-semibold">HLV phụ trách</th>
<th className="px-space-md py-2.5 font-semibold">Trạng thái lịch</th>
<th className="px-space-md py-2.5 font-semibold text-right">Hành động</th>
</tr>
</thead>
<tbody className="divide-y-0 text-on-surface font-body-md text-body-md">

<tr className="h-14 hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
<td className="px-space-md font-label-md text-label-md text-on-surface-variant">Buổi 01</td>
<td className="px-space-md font-medium">17/02/2025</td>
<td className="px-space-md">Thứ Hai</td>
<td className="px-space-md font-mono text-body-sm">18:00 - 19:00</td>
<td className="px-space-md">
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm">Studio A</span>
</td>
<td className="px-space-md">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-primary"></span>
<span>HLV Trần Hoàng Nam</span>
</div>
</td>
<td className="px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
                Hợp lệ / Sẵn sàng
              </span>
</td>
<td className="px-space-md text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-sm text-label-sm" type="button">
                  Đổi giờ
                </button>
<button className="px-2.5 py-1 rounded-lg bg-transparent text-error hover:bg-error-container/40 transition-colors font-label-sm text-label-sm" type="button">
                  Hủy buổi
                </button>
</div>
</td>
</tr>

<tr className="h-14 bg-error-container/40 hover:bg-error-container/60 transition-colors" id="conflict-row">
<td className="px-space-md font-label-md text-label-md text-error font-bold">Buổi 02</td>
<td className="px-space-md font-semibold text-error">19/02/2025</td>
<td className="px-space-md font-medium text-error">Thứ Tư</td>
<td className="px-space-md font-mono text-body-sm text-error font-semibold">18:00 - 19:00</td>
<td className="px-space-md">
<span className="px-2 py-0.5 rounded bg-error text-on-error font-label-sm text-label-sm font-semibold" id="session-room-badge">Studio A (Trùng)</span>
</td>
<td className="px-space-md text-on-error-container">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-error"></span>
<span className="font-medium">HLV Trần Hoàng Nam</span>
</div>
</td>
<td className="px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error text-on-error font-label-sm text-label-sm font-semibold shadow-sm" id="conflict-status-badge">
<span className="material-symbols-outlined text-[14px]">warning</span>
                Xung đột lịch phòng!
              </span>
</td>
<td className="px-space-md text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="px-2.5 py-1 rounded-lg bg-tertiary-container text-on-tertiary hover:opacity-90 transition-opacity font-label-sm text-label-sm shadow-sm" type="button">
                  Đổi giờ
                </button>
<button className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors font-label-sm text-label-sm shadow-sm" type="button">
                  Đổi phòng
                </button>
<button className="px-2.5 py-1 rounded-lg bg-transparent text-error hover:bg-error-container transition-colors font-label-sm text-label-sm" type="button">
                  Hủy buổi
                </button>
</div>
</td>
</tr>

<tr className="h-14 hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
<td className="px-space-md font-label-md text-label-md text-on-surface-variant">Buổi 03</td>
<td className="px-space-md font-medium">21/02/2025</td>
<td className="px-space-md">Thứ Sáu</td>
<td className="px-space-md font-mono text-body-sm">18:00 - 19:00</td>
<td className="px-space-md">
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm">Studio A</span>
</td>
<td className="px-space-md">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-primary"></span>
<span>HLV Trần Hoàng Nam</span>
</div>
</td>
<td className="px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
                Hợp lệ / Sẵn sàng
              </span>
</td>
<td className="px-space-md text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-sm text-label-sm" type="button">
                  Đổi giờ
                </button>
<button className="px-2.5 py-1 rounded-lg bg-transparent text-error hover:bg-error-container/40 transition-colors font-label-sm text-label-sm" type="button">
                  Hủy buổi
                </button>
</div>
</td>
</tr>

<tr className="h-14 hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
<td className="px-space-md font-label-md text-label-md text-on-surface-variant">Buổi 04</td>
<td className="px-space-md font-medium">24/02/2025</td>
<td className="px-space-md">Thứ Hai</td>
<td className="px-space-md font-mono text-body-sm">18:00 - 19:00</td>
<td className="px-space-md">
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm">Studio A</span>
</td>
<td className="px-space-md">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-primary"></span>
<span>HLV Trần Hoàng Nam</span>
</div>
</td>
<td className="px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
                Hợp lệ / Sẵn sàng
              </span>
</td>
<td className="px-space-md text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-sm text-label-sm" type="button">
                  Đổi giờ
                </button>
<button className="px-2.5 py-1 rounded-lg bg-transparent text-error hover:bg-error-container/40 transition-colors font-label-sm text-label-sm" type="button">
                  Hủy buổi
                </button>
</div>
</td>
</tr>

<tr className="h-14 hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
<td className="px-space-md font-label-md text-label-md text-on-surface-variant">Buổi 05</td>
<td className="px-space-md font-medium">26/02/2025</td>
<td className="px-space-md">Thứ Tư</td>
<td className="px-space-md font-mono text-body-sm">18:00 - 19:00</td>
<td className="px-space-md">
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm">Studio A</span>
</td>
<td className="px-space-md">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-primary"></span>
<span>HLV Trần Hoàng Nam</span>
</div>
</td>
<td className="px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
                Hợp lệ / Sẵn sàng
              </span>
</td>
<td className="px-space-md text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-sm text-label-sm" type="button">
                  Đổi giờ
                </button>
<button className="px-2.5 py-1 rounded-lg bg-transparent text-error hover:bg-error-container/40 transition-colors font-label-sm text-label-sm" type="button">
                  Hủy buổi
                </button>
</div>
</td>
</tr>
</tbody>
</table>
</div>

<div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-xs font-label-md text-label-md text-on-surface-variant">
<span>Hiển thị 5 / 30 buổi đã xếp lịch tự động</span>
<div className="flex items-center gap-1">
<button className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
<span className="px-3 py-1 rounded-lg bg-primary-container text-on-primary font-semibold">1</span>
<button className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors" type="button">2</button>
<button className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors" type="button">3</button>
<button className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors" type="button">...</button>
<button className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors" type="button">6</button>
<button className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
</div>
</div>
</div>


</div>
    </>
  )
}
