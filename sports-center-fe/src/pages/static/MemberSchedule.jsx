// Static UI exported from Stitch. Data is hardcoded until the real API is wired in.
export default function MemberSchedule() {
  return (
    <>
<div className="flex flex-col w-full">

<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-16 space-y-10">

<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
<div className="space-y-3 max-w-2xl">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/60 text-primary font-label-sm text-label-sm tracking-wide uppercase">
<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Hệ thống đặt lịch thời gian thực
        </div>
<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
          Lịch Lớp Học &amp; Đặt Chỗ Trực Tuyến
        </h1>
<p className="font-body-md text-body-md text-on-surface-variant">
          Cập nhật thời gian biểu chi tiết các bộ môn Gym, Yoga, Pilates và HIIT tại FitZone. Đặt chỗ sớm để đảm bảo suất tập cùng đội ngũ HLV hàng đầu.
        </p>
</div>

<div className="flex items-center gap-2 shrink-0 bg-surface-container-lowest p-1.5 rounded-xl shadow-sm">
<button className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors" id="btn-prev-week" title="Tuần trước">
<span className="material-symbols-outlined text-[20px]">chevron_left</span>
</button>
<div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg">
<span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
<span className="font-label-md text-label-md text-on-surface font-semibold tracking-tight">Tuần hiện tại: 17/02 - 23/02/2025</span>
</div>
<button className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors" id="btn-next-week" title="Tuần sau">
<span className="material-symbols-outlined text-[20px]">chevron_right</span>
</button>
<button className="h-9 px-3.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all" id="btn-today">
          Hôm nay
        </button>
</div>
</div>

<div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" id="category-pills">
<button className="cat-pill active-pill px-4 py-2 rounded-xl font-label-md text-label-md text-on-primary bg-primary-container shadow-sm shrink-0 transition-all flex items-center gap-2" data-cat="all">
<span>Tất cả bộ môn</span>
<span className="px-2 py-0.5 rounded-full bg-white/20 text-on-primary text-[11px] font-bold">28</span>
</button>
<button className="cat-pill px-4 py-2 rounded-xl font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-high transition-all shrink-0 flex items-center gap-2 shadow-sm" data-cat="yoga">
<span className="w-2 h-2 rounded-full bg-[#0EA5E9]"></span>
<span>Yoga &amp; Thiền</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">8</span>
</button>
<button className="cat-pill px-4 py-2 rounded-xl font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-high transition-all shrink-0 flex items-center gap-2 shadow-sm" data-cat="pilates">
<span className="w-2 h-2 rounded-full bg-[#06B6D4]"></span>
<span>Pilates Reformer</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">6</span>
</button>
<button className="cat-pill px-4 py-2 rounded-xl font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-high transition-all shrink-0 flex items-center gap-2 shadow-sm" data-cat="hiit">
<span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
<span>HIIT &amp; Cardio</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">8</span>
</button>
<button className="cat-pill px-4 py-2 rounded-xl font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-high transition-all shrink-0 flex items-center gap-2 shadow-sm" data-cat="gym">
<span className="w-2 h-2 rounded-full bg-[#4338CA]"></span>
<span>Gym &amp; Functional</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">4</span>
</button>
<button className="cat-pill px-4 py-2 rounded-xl font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-high transition-all shrink-0 flex items-center gap-2 shadow-sm" data-cat="kickfit">
<span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
<span>Kickfit &amp; Boxing</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">2</span>
</button>
</div>

<div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-sm">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">

<div className="lg:col-span-4 relative flex items-center">
<span className="material-symbols-outlined absolute left-3.5 text-secondary text-[20px] pointer-events-none">search</span>
<input className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" id="schedule-search" placeholder="Tìm kiếm lớp học, HLV..." type="text" />
</div>

<div className="lg:col-span-2">
<select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest cursor-pointer" id="filter-day">
<option value="all">Tất cả các ngày</option>
<option value="today">Thứ Hai (Hôm nay)</option>
<option value="tomorrow">Thứ Ba (Ngày mai)</option>
<option value="wed">Thứ Tư, 19/02</option>
<option value="thu">Thứ Năm, 20/02</option>
<option value="fri">Thứ Sáu, 21/02</option>
<option value="sat">Thứ Bảy, 22/02</option>
<option value="sun">Chủ Nhật, 23/02</option>
</select>
</div>

<div className="lg:col-span-2">
<select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest cursor-pointer" id="filter-coach">
<option value="all">Tất cả HLV</option>
<option value="nam">Trần Hoàng Nam (CSCS)</option>
<option value="thao">Lê Thu Thảo (RYT-500)</option>
<option value="van">Ngô Thanh Vân (Pilates)</option>
<option value="anand">Master Anand Kumar</option>
<option value="huy">Đặng Quốc Huy (Strength)</option>
</select>
</div>

<div className="lg:col-span-2">
<select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest cursor-pointer" id="filter-level">
<option value="all">Mọi cấp độ</option>
<option value="basic">Cơ bản (Beginner)</option>
<option value="intermediate">Trung cấp (Medium)</option>
<option value="advanced">Nâng cao (Pro)</option>
</select>
</div>

<div className="lg:col-span-2 flex items-center gap-2">
<select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest cursor-pointer" id="filter-slot">
<option value="all">Cả ngày (05:30 - 22:00)</option>
<option value="morning">Sáng (05:30 - 12:00)</option>
<option value="afternoon">Chiều (12:00 - 17:00)</option>
<option value="evening">Tối (17:00 - 22:00)</option>
</select>

<button className="h-10 w-10 shrink-0 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors" id="btn-reset-filters" title="Xóa toàn bộ bộ lọc">
<span className="material-symbols-outlined text-[20px]">restart_alt</span>
</button>
</div>
</div>
</div>

<div className="flex items-center justify-between gap-4 font-body-sm text-body-sm text-on-surface-variant">
<div className="flex items-center gap-2">
<span className="font-semibold text-on-surface">5 lớp học</span>
<span>được tìm thấy trong tuần này</span>
</div>
<div className="flex items-center gap-3">
<span className="font-label-md text-label-md text-secondary hidden sm:inline">Chế độ xem giả lập:</span>
<button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-label-md transition-colors" id="toggle-empty-demo">
<span className="material-symbols-outlined text-[16px]">visibility</span>
<span id="toggle-label">Xem mẫu Không có kết quả (Empty)</span>
</button>
</div>
</div>

<div className="space-y-10" id="schedule-container">

<section className="space-y-4">

<div className="flex items-center gap-3">
<div className="w-1.5 h-6 rounded-full bg-primary"></div>
<div className="flex items-center gap-2">
<h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Hôm nay - Thứ Hai, 17/02/2025
            </h2>
<span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">3 lớp</span>
</div>
</div>

<div className="grid grid-cols-1 gap-4">

<div className="class-card group bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-l-4 border-l-[#F97316]">

<div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:w-5/12">

<div className="shrink-0 space-y-0.5 sm:text-center sm:min-w-[100px] sm:pr-4 sm:border-r sm:border-surface-container-high">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold block">07:00</span>
<span className="font-label-sm text-label-sm text-secondary block">08:00 (60 phút)</span>
<span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">Buổi sáng</span>
</div>

<div className="space-y-1.5">
<div className="flex flex-wrap items-center gap-2">
<span className="px-2.5 py-0.5 rounded-full bg-[#FFEDD5] text-[#C2410C] font-label-sm text-label-sm font-bold tracking-tight">HIIT &amp; Cardio</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Trung cấp</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                  Power HIIT Cardio &amp; Core
                </h3>
<div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">pin_drop</span>
<span>Studio A - Tầng 2 (Sức chứa 20 người)</span>
</div>
</div>
</div>

<div className="flex items-center gap-3.5 lg:w-4/12">
<div className="relative shrink-0">
<img className="w-12 h-12 rounded-full object-cover shadow-sm" data-alt="Chân dung nam huấn luyện viên thể hình chuyên nghiệp Việt Nam, mặc áo thể thao sát nách đen FitZone, cơ bắp săn chắc, nụ cười tự tin trong phòng gym hiện đại ánh sáng xanh trắng neon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9fQyCDuYiglN24ITAZI0Rym2X631oWExTJRcFdspIZwWc6j5zEm6XBhuDWkMEXoO7vG_CTy8_pIWbwnR5-w1iiDHX98ZHfyxLqg2SoYQtHDXCguTOotJFhzA0tuhSxqFgotGUePntcxLrPvJpLvuxeel9jSGAjvVD7Z0qGKhpUD_qQA31eYzr3xOIXU4Ezlq1lYyHfYZAsCmmAPDq4Xzqs1H2QEPr2zy-gnrf8wRnAVX_996Ccla4" />
<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#16A34A] ring-2 ring-surface-container-lowest" title="Đang trực ca"></span>
</div>
<div className="min-w-0">
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">Huấn luyện viên</span>
<p className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">Trần Hoàng Nam</p>
<p className="font-body-sm text-body-sm text-on-surface-variant truncate">Master Trainer CSCS • 8 năm kinh nghiệm</p>
</div>
</div>

<div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-surface-container-low">
<div className="text-left lg:text-right">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] font-label-md text-label-md font-bold">
<span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                  Còn 2 chỗ
                </span>
<span className="block mt-1 font-label-sm text-label-sm text-secondary">Đã đặt: 18/20</span>
</div>
<button className="booking-btn h-10 px-5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all shadow-sm flex items-center gap-1.5 active:scale-95" data-class="Power HIIT Cardio &amp; Core">
<span>Đăng ký</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>

<div className="class-card group bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-l-4 border-l-[#0EA5E9]">

<div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:w-5/12">
<div className="shrink-0 space-y-0.5 sm:text-center sm:min-w-[100px] sm:pr-4 sm:border-r sm:border-surface-container-high">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold block">09:00</span>
<span className="font-label-sm text-label-sm text-secondary block">10:15 (75 phút)</span>
<span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">Buổi sáng</span>
</div>
<div className="space-y-1.5">
<div className="flex flex-wrap items-center gap-2">
<span className="px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] font-label-sm text-label-sm font-bold tracking-tight">Yoga &amp; Thiền</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Mọi cấp độ</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                  Vinyasa Flow &amp; Deep Relaxation
                </h3>
<div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">pin_drop</span>
<span>Studio Zen - Tầng 3 (Sức chứa 25 người)</span>
</div>
</div>
</div>

<div className="flex items-center gap-3.5 lg:w-4/12">
<div className="relative shrink-0">
<img className="w-12 h-12 rounded-full object-cover shadow-sm" data-alt="Chân dung nữ huấn luyện viên Yoga Việt Nam thanh lịch, mặc trang phục yoga màu tím nhạt thanh tao, tóc búi gọn gàng, toát lên phong thái an nhiên trong studio ánh sáng tự nhiên ấm áp" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgtlbLBGpBMtNkBuzctcjO-aTAnfIF9rhjO2RWhODiwqgjd9EQ5uE8_TC8tsxFuTSvz5gpj_6QIcXkeD98bGR5x1OidEe_Uquaw_wYogT-344JBHhPJipY7HRc7NIKT_ps4u6JICbSt57o09cxp6zK6wzSosPvheMUX1Vo--qYND_6XdKQNN3UgymgKD14kI7qntF5gG-AvZp_bkPQiwnlyQMPVNWXjSrurcsDFr6RGfdtfj3AiqxB" />
<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#16A34A] ring-2 ring-surface-container-lowest"></span>
</div>
<div className="min-w-0">
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">Huấn luyện viên</span>
<p className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">Lê Thu Thảo</p>
<p className="font-body-sm text-body-sm text-on-surface-variant truncate">Yoga Alliance RYT-500 • Trị liệu cột sống</p>
</div>
</div>

<div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-surface-container-low">
<div className="text-left lg:text-right">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] font-label-md text-label-md font-bold">
<span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                  Còn 12 chỗ
                </span>
<span className="block mt-1 font-label-sm text-label-sm text-secondary">Đã đặt: 13/25</span>
</div>
<button className="booking-btn h-10 px-5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all shadow-sm flex items-center gap-1.5 active:scale-95" data-class="Vinyasa Flow &amp; Deep Relaxation">
<span>Đăng ký</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>

<div className="class-card group bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-l-4 border-l-[#06B6D4]">

<div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:w-5/12">
<div className="shrink-0 space-y-0.5 sm:text-center sm:min-w-[100px] sm:pr-4 sm:border-r sm:border-surface-container-high">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold block">17:30</span>
<span className="font-label-sm text-label-sm text-secondary block">18:30 (60 phút)</span>
<span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">Buổi tối</span>
</div>
<div className="space-y-1.5">
<div className="flex flex-wrap items-center gap-2">
<span className="px-2.5 py-0.5 rounded-full bg-[#CCFBF1] text-[#0F766E] font-label-sm text-label-sm font-bold tracking-tight">Pilates Reformer</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Cơ bản</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                  Pilates Reformer Sculpt
                </h3>
<div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">pin_drop</span>
<span>Studio Reformer P1 (Giới hạn 10 máy)</span>
</div>
</div>
</div>

<div className="flex items-center gap-3.5 lg:w-4/12">
<div className="relative shrink-0">
<img className="w-12 h-12 rounded-full object-cover shadow-sm" data-alt="Chân dung nữ giáo viên Pilates chuyên nghiệp, phong cách trẻ trung năng động, đang mỉm cười nhẹ bên cạnh máy Reformer cao cấp tại phòng tập FitZone sang trọng chuẩn quốc tế" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXSLRckuBdW02-5aBKt8fubW26z_FxP_I78_-MULJRL23enAwbq9n0UcvY6VKQTX-HyWtxXSiXMX5D332_pwRmJRaPwsEC2dDiH7W_lm9A21qZRpvuEkFttDVNmvGEqfEVJsiEXbEleaW0ZB2LAwOX5gMa1GJu_Ks5MYHXKJKGR6ajfmZk8kcwFAddR9kdhrPboxuRD0Rt0bLxbJjaElrU4iDCO0tKwtk040xfAqlETRk3UrYXboSz" />
<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#16A34A] ring-2 ring-surface-container-lowest"></span>
</div>
<div className="min-w-0">
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">Huấn luyện viên</span>
<p className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">Ngô Thanh Vân</p>
<p className="font-body-sm text-body-sm text-on-surface-variant truncate">Senior Pilates Instructor • Balanced Body</p>
</div>
</div>

<div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-surface-container-low">
<div className="text-left lg:text-right">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE2E2] text-[#B91C1C] font-label-md text-label-md font-bold">
<span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
                  Hết chỗ
                </span>
<span className="block mt-1 font-label-sm text-label-sm text-secondary">Đã đủ 10/10 suất</span>
</div>
<button className="waitlist-btn h-10 px-4 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-lg text-label-lg transition-all flex items-center gap-1.5 active:scale-95" data-class="Pilates Reformer Sculpt">
<span className="material-symbols-outlined text-[18px]">hourglass_top</span>
<span>Vào hàng chờ</span>
</button>
</div>
</div>
</div>
</section>

<section className="space-y-4">

<div className="flex items-center gap-3">
<div className="w-1.5 h-6 rounded-full bg-secondary"></div>
<div className="flex items-center gap-2">
<h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Ngày mai - Thứ Ba, 18/02/2025
            </h2>
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">2 lớp</span>
</div>
</div>

<div className="grid grid-cols-1 gap-4">

<div className="class-card group bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-l-4 border-l-[#0EA5E9]">

<div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:w-5/12">
<div className="shrink-0 space-y-0.5 sm:text-center sm:min-w-[100px] sm:pr-4 sm:border-r sm:border-surface-container-high">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold block">06:30</span>
<span className="font-label-sm text-label-sm text-secondary block">07:30 (60 phút)</span>
<span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">Buổi sáng sớm</span>
</div>
<div className="space-y-1.5">
<div className="flex flex-wrap items-center gap-2">
<span className="px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] font-label-sm text-label-sm font-bold tracking-tight">Yoga &amp; Thiền</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Cơ bản</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                  Morning Asana Yoga
                </h3>
<div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">pin_drop</span>
<span>Studio Zen - Tầng 3 (Sức chứa 25 người)</span>
</div>
</div>
</div>

<div className="flex items-center gap-3.5 lg:w-4/12">
<div className="relative shrink-0">
<img className="w-12 h-12 rounded-full object-cover shadow-sm" data-alt="Chân dung chuyên gia Yoga Ấn Độ Master Anand Kumar, mặc áo kurta trắng giản dị, gương mặt thư thái tĩnh lặng với chuỗi hạt truyền thống, studio tập thiền ấm cúng phía sau" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpkl_ljEUvmnws5fmNAPZ--o9h2h0j5YgA3nbaJSplYi4i67noNxrnWT7kwhlhK9vQeBs_ET9IAkEK9PwsjsdPGzwmq8EFYPI0peAkWQW3syyd45-4t7mPo6IzCdilXLBKTkClkEFjzACGbSPvh-a_xHYZuiILSyib-LPieOM_RU62GQnDQWxuITEoL7Pz5mystqSmcaMf_B3vUKezATmwY2IUcybzTFMCyN2PJ3cXRSj0KIOpLVG5" />
<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#16A34A] ring-2 ring-surface-container-lowest"></span>
</div>
<div className="min-w-0">
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">Huấn luyện viên</span>
<p className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">Master Anand Kumar</p>
<p className="font-body-sm text-body-sm text-on-surface-variant truncate">Chuyên gia Yoga Ấn Độ • 14 năm thiền định</p>
</div>
</div>

<div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-surface-container-low">
<div className="text-left lg:text-right">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] font-label-md text-label-md font-bold">
<span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                  Còn 4 chỗ
                </span>
<span className="block mt-1 font-label-sm text-label-sm text-secondary">Đã đặt: 21/25</span>
</div>
<button className="booking-btn h-10 px-5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all shadow-sm flex items-center gap-1.5 active:scale-95" data-class="Morning Asana Yoga">
<span>Đăng ký</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>

<div className="class-card group bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-l-4 border-l-[#4338CA]">

<div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:w-5/12">
<div className="shrink-0 space-y-0.5 sm:text-center sm:min-w-[100px] sm:pr-4 sm:border-r sm:border-surface-container-high">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold block">18:00</span>
<span className="font-label-sm text-label-sm text-secondary block">19:00 (60 phút)</span>
<span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">Buổi tối</span>
</div>
<div className="space-y-1.5">
<div className="flex flex-wrap items-center gap-2">
<span className="px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4338CA] font-label-sm text-label-sm font-bold tracking-tight">Gym &amp; Functional</span>
<span className="px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#B91C1C] font-label-sm text-label-sm font-semibold">Nâng cao</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                  Functional Kettlebell &amp; Strength
                </h3>
<div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-primary">pin_drop</span>
<span>Khu vực Functional - Tầng 1 (Sức chứa 15 người)</span>
</div>
</div>
</div>

<div className="flex items-center gap-3.5 lg:w-4/12">
<div className="relative shrink-0">
<img className="w-12 h-12 rounded-full object-cover shadow-sm" data-alt="Chân dung huấn luyện viên sức mạnh thể hình nam người Việt Đặng Quốc Huy, cơ bắp cuồn cuộn trong khu vực tập tạ chuông Kettlebell và thảm cỏ nhân tạo, ánh sáng phòng gym tràn đầy năng lượng" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKQ6UpHVHFzBLncpq8kbHQHKojkM5C5zEOjlVu0ELUqE3OPsMrryXrEWmDiBWggPJnkL55olQHfFbP_-P980jfvDTkTxtA7ptrHwOHptAOl0NPvfsJcBS0Y6tB4m7RZ3rswBM7tJKir66O_lhmr-tEIg8tg7LxHc1Kha7Yhif2JxozJ7lWepnrHYoNnPG73z72p71Z0tDR2NDAMHzNUBy1SwyCdpZ096ADhZSM83DxGc1BjZP6d6ea" />
<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#16A34A] ring-2 ring-surface-container-lowest"></span>
</div>
<div className="min-w-0">
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">Huấn luyện viên</span>
<p className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">Đặng Quốc Huy</p>
<p className="font-body-sm text-body-sm text-on-surface-variant truncate">CSCS Strength Coach • Chuyên gia cử tạ</p>
</div>
</div>

<div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-surface-container-low">
<div className="text-left lg:text-right">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] font-label-md text-label-md font-bold">
<span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                  Còn 8 chỗ
                </span>
<span className="block mt-1 font-label-sm text-label-sm text-secondary">Đã đặt: 7/15</span>
</div>
<button className="booking-btn h-10 px-5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all shadow-sm flex items-center gap-1.5 active:scale-95" data-class="Functional Kettlebell &amp; Strength">
<span>Đăng ký</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</section>
</div>

<div className="hidden bg-surface-container-lowest rounded-2xl p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-sm my-8" id="empty-state-card">
<div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[44px]">event_busy</span>
</div>
<h3 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
        Không tìm thấy lớp học phù hợp
      </h3>
<p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed max-w-md mx-auto">
        Không có lớp học nào khớp với bộ lọc đã chọn trong khoảng thời gian này. Vui lòng thử chọn ngày khác hoặc xóa bộ lọc để xem toàn bộ lịch tập.
      </p>
<div className="flex flex-wrap items-center justify-center gap-3">
<button className="h-10 px-5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all shadow-sm flex items-center gap-2" id="btn-empty-reset">
<span className="material-symbols-outlined text-[18px]">refresh</span>
<span>Đặt lại bộ lọc</span>
</button>
<button className="h-10 px-4 rounded-lg bg-surface-container-low text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors" id="btn-empty-close">
          Quay lại danh sách
        </button>
</div>
</div>

<div className="rounded-2xl bg-gradient-to-r from-primary-container to-primary p-8 sm:p-10 text-on-primary shadow-md relative overflow-hidden">

<div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
<span className="material-symbols-outlined text-[180px]">sports_gymnastics</span>
</div>
<div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
<div className="space-y-2.5 max-w-2xl">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[16px] text-tertiary-fixed">health_and_safety</span>
<span>Tư vấn lộ trình cá nhân hóa</span>
</div>
<h2 className="font-headline-lg text-headline-lg font-bold text-white tracking-tight">
            Chưa biết bắt đầu với bộ môn nào?
          </h2>
<p className="font-body-md text-body-md text-white/90 leading-relaxed">
            Đội ngũ chuyên gia FitZone sẽ hỗ trợ đo chỉ số cơ thể InBody miễn phí 100%, tư vấn phân bổ các lớp Gym, Yoga, HIIT và Pilates khoa học phù hợp nhất với thể trạng của bạn.
          </p>
</div>
<div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 shrink-0">
<button className="w-full sm:w-auto h-11 px-5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-label-lg text-label-lg transition-all shadow-md flex items-center justify-center gap-2 active:scale-95">
<span className="material-symbols-outlined text-[18px]">fitness_center</span>
<span>Đo InBody miễn phí</span>
</button>
<a className="w-full sm:w-auto h-11 px-5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-label-lg text-label-lg transition-colors flex items-center justify-center gap-2 backdrop-blur-sm" href="tel:19008888">
<span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
<span>Gọi hotline 1900 8888</span>
</a>
</div>
</div>
</div>
</div>

<div className="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none bg-inverse-surface text-inverse-on-surface p-4 rounded-xl shadow-xl flex items-center gap-3 max-w-sm" id="booking-toast">
<div className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">check</span>
</div>
<div className="text-left">
<p className="font-label-lg text-label-lg font-bold" id="toast-title">Đã giữ chỗ thành công!</p>
<p className="font-body-sm text-body-sm text-surface-variant/80" id="toast-desc">FitZone đã gửi tin nhắn xác nhận qua điện thoại.</p>
</div>
</div>

</div>
    </>
  )
}
