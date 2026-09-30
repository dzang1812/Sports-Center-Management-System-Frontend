// Static UI exported from Stitch. Data is hardcoded until the real API is wired in.
export default function ReceptionCheckIn() {
  return (
    <>
<div className="flex flex-col w-full gap-space-lg select-none">

<section className="flex flex-col gap-space-md">

<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center gap-space-sm">
<div className="relative flex-1 flex items-center">
<span className="material-symbols-outlined absolute left-4 text-primary text-[28px] pointer-events-none">search</span>
<input className="w-full h-14 pl-14 pr-24 rounded-lg bg-surface-container-low text-on-surface font-headline-md text-headline-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-sm transition-all" id="memberSearchInput" placeholder="Tìm theo họ tên, SĐT hoặc quẹt thẻ từ/mã QR..." type="text" defaultValue="0912 345 678" />
<button className="absolute right-3 h-9 w-9 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors" title="Xóa trắng">
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
</div>

<button className="h-14 px-5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high flex items-center gap-2 font-label-lg text-label-lg active:scale-95 transition-transform shadow-sm" title="Bật/Tắt Quét QR tức thì">
<span className="material-symbols-outlined text-[26px] text-primary">qr_code_scanner</span>
<span>Quét Barcode / QR</span>
</button>
<button className="h-14 px-5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high flex items-center gap-2 font-label-lg text-label-lg active:scale-95 transition-transform shadow-sm" id="toggleKeypadBtn" title="Bàn phím số cảm ứng">
<span className="material-symbols-outlined text-[24px]">dialpad</span>
<span>Bàn phím ảo</span>
</button>
</div>

<div className="flex items-center gap-space-sm overflow-x-auto pt-1">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">history</span> Gần đây:
        </span>
<button className="px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md hover:bg-surface-container-highest flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          Nguyễn Hoàng Long (#FZ-88291)
        </button>
<button className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm">
<span className="w-1.5 h-1.5 rounded-full bg-error"></span>
          Trần Thị Bích Ngọc (#FZ-55102)
        </button>
<button className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          Đỗ Hoàng Quân (#FZ-19342)
        </button>
</div>
</div>

<div className="grid grid-cols-2 md:grid-cols-5 gap-space-sm">
<div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">contactless</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-outline truncate">Đầu đọc RFID Cổng 1 &amp; 2</span>
<span className="font-label-md text-label-md text-on-surface flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
            Online (Sẵn sàng)
          </span>
</div>
</div>
<div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">qr_code_2</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-outline truncate">Máy quét QR Code</span>
<span className="font-label-md text-label-md text-on-surface flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
            Hoạt động tốt
          </span>
</div>
</div>
<div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">fact_check</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-outline">Lượt check-in hôm nay</span>
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">142 <span className="font-label-sm text-label-sm text-outline font-normal">lượt</span></span>
</div>
</div>
<div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary-container">
<span className="material-symbols-outlined text-[22px] text-tertiary-fixed-dim">groups</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-outline">Đang trong CLB</span>
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">48 <span className="font-label-sm text-label-sm text-outline font-normal">/ 120 khách (40%)</span></span>
</div>
</div>
<div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-error">
<span className="material-symbols-outlined text-[22px]">warning</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-error">Cảnh báo hạn thẻ</span>
<span className="font-headline-sm text-headline-sm font-bold text-error">03 <span className="font-label-sm text-label-sm text-on-error-container font-normal">hội viên</span></span>
</div>
</div>
</div>
</section>

<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">

<div className="xl:col-span-8 flex flex-col gap-space-lg">

<div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-md relative overflow-hidden">

<div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>

<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="relative">
<img className="w-24 h-24 rounded-xl object-cover shadow-sm" data-alt="Athletic Vietnamese male member profile photo in gym attire smiling against gym lighting, high resolution, professional sports club badge portrait style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCz9o_8zrMPimxfzoaUx-hZDIka1aKRrs6ak5wydafafrjuIq1tlYRsC8f__kCb42BPdhRzIShW3YamhLoGd0PSt21Xtjo0HUTKFknqbhMfT69L832y8Ip9TcGOrWCyU3ZG2a0EACts2BmnVPtYqyXkfxmKHzIJxYoJeAc5sd2etsd46Y3CtBtBkK3of8xsZsFn1U5h-eo7EIN3uHIz4b_I90GQhzgDYYWI7vgcuEcQ5OSpm6uNwwXn" />
<div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#15803D] flex items-center justify-center text-white text-[14px] shadow-sm" title="Hội viên Hợp Lệ">
<span className="material-symbols-outlined text-[16px]">verified</span>
</div>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-xs flex-wrap">
<h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Nguyễn Hoàng Long</h1>
<span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm uppercase tracking-wide">
                  #FZ-88291
                </span>
</div>
<div className="flex items-center gap-space-md mt-1 font-body-md text-body-md text-on-surface-variant flex-wrap">
<span className="flex items-center gap-1 font-semibold text-on-surface">
<span className="material-symbols-outlined text-[18px] text-primary">phone_iphone</span>
                  0912 345 678
                </span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[18px]">cake</span>
                  14/08/1992 (32 tuổi)
                </span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[18px]">male</span>
                  Nam
                </span>
</div>
</div>
</div>

<div className="flex flex-col md:items-end bg-surface-container-low p-space-sm rounded-lg">
<div className="flex items-center gap-1.5">
<span className="w-2.5 h-2.5 rounded-full bg-[#15803D] animate-ping"></span>
<span className="font-label-md text-label-md font-bold text-[#15803D] uppercase">Đang hoạt động</span>
</div>
<span className="font-headline-sm text-headline-sm font-bold text-primary mt-1">Gói All-Access VIP 12 Tháng</span>
<span className="font-label-sm text-label-sm text-outline">Hạn dùng: 15/09/2025</span>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-space-sm">

<div className="bg-surface-container rounded-lg p-space-md flex flex-col justify-center">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Thời hạn thẻ</span>
<div className="flex items-baseline gap-1 mt-1">
<span className="font-display-lg text-display-lg font-bold text-on-surface">210</span>
<span className="font-label-md text-label-md text-on-surface-variant font-semibold">ngày còn lại</span>
</div>
<div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
<div className="bg-primary h-1.5 rounded-full" style={{ width: "58%" }}></div>
</div>
</div>

<div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-outline uppercase">Tủ Locker VIP</span>
<span className="material-symbols-outlined text-primary text-[20px]">lock</span>
</div>
<div className="my-1">
<span className="font-headline-lg text-headline-lg font-bold text-on-surface">Số 42</span>
<span className="font-label-sm text-label-sm text-secondary block">Khu Locker Nam Tầng 1</span>
</div>
<span className="font-label-sm text-label-sm text-[#15803D] flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">bolt</span> Tự động kích hoạt
            </span>
</div>

<div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-outline uppercase">Tiện ích kèm theo</span>
<span className="material-symbols-outlined text-primary text-[20px]">dry_cleaning</span>
</div>
<div className="my-1">
<span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Khăn tắm cao cấp</span>
<span className="font-label-sm text-label-sm text-outline block">2 chiếc / buổi</span>
</div>
<span className="font-label-sm text-label-sm text-[#15803D] flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">check_circle</span> Đã cấp phát
            </span>
</div>

<div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-outline uppercase">Gửi xe</span>
<span className="material-symbols-outlined text-primary text-[20px]">local_parking</span>
</div>
<div className="my-1">
<span className="font-headline-sm text-headline-sm font-semibold text-on-surface">B1 Miễn Phí</span>
<span className="font-label-sm text-label-sm text-outline block">Tối đa 3h / lượt</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">pin</span> Biển: 29A-884.12
            </span>
</div>
</div>

<div className="flex flex-col md:flex-row items-stretch gap-space-sm pt-2">

<button className="flex-1 h-[62px] px-8 rounded-xl bg-[#15803D] hover:bg-[#166534] active:scale-[0.99] text-white flex items-center justify-center gap-3 font-headline-md text-headline-md font-bold shadow-md transition-all cursor-pointer" id="f2CheckInBtn">
<span className="material-symbols-outlined text-[32px]">how_to_reg</span>
<span>Check-in Vào Cổng (Phím F2)</span>
</button>

<div className="flex items-center gap-space-xs">
<button className="h-[62px] px-4 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high flex flex-col items-center justify-center gap-1 font-label-md text-label-md active:scale-95 transition-all shadow-sm" title="Đổi ngăn tủ locker khác">
<span className="material-symbols-outlined text-[22px] text-primary">swap_horiz</span>
<span>Đổi Locker</span>
</button>
<button className="h-[62px] px-4 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high flex flex-col items-center justify-center gap-1 font-label-md text-label-md active:scale-95 transition-all shadow-sm" title="Xem lịch sử &amp; chi tiết">
<span className="material-symbols-outlined text-[22px]">badge</span>
<span>Hồ sơ</span>
</button>
<button className="h-[62px] px-4 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high flex flex-col items-center justify-center gap-1 font-label-md text-label-md active:scale-95 transition-all shadow-sm" title="In hóa đơn/phiếu tập ra máy in nhiệt">
<span className="material-symbols-outlined text-[22px]">print</span>
<span>In phiếu tập</span>
</button>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm relative overflow-hidden">
<div className="absolute left-0 top-0 bottom-0 w-2 bg-error"></div>

<div className="flex items-start gap-space-sm bg-error-container/40 p-space-sm rounded-lg">
<span className="material-symbols-outlined text-error text-[26px] mt-0.5">error</span>
<div className="flex-1">
<h2 className="font-headline-sm text-headline-sm text-error font-bold leading-tight">
              Cảnh báo: Thẻ hội viên đã hết hạn sử dụng!
            </h2>
<p className="font-body-md text-body-md text-on-surface mt-0.5">
              Vui lòng tư vấn hội viên gia hạn hoặc nộp phí duy trì trước khi mở cổng qua quầy. Cổng tự động sẽ từ chối thẻ.
            </p>
</div>
</div>

<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md pl-2 pt-1">
<div className="flex items-center gap-space-sm">
<img className="w-14 h-14 rounded-lg object-cover shadow-sm opacity-80" data-alt="Vietnamese female gym attendee portrait, modern casual gym look, studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEyiigqGHrv2RtUqYnFwdJXnZUjnLBtIk-wvGlGrCFy7L5K_ttzVj1hRwtFfOLMfVq0oOrJGfi3KofSSPDP8dV_evFVbZy6XjKbwL82Q2SGQRAx3kC2mPH2XldRdMw-kVlZdU_3w8Df45Ocj-H6hHricD_kS6OkeJl5tOngx2P8-TkMukfgkNlsiUIk3b_pJLog42xvA_qz08Y20LA9Bmr0ZWCwPfvn3mzFfDoJV5Xhj0qHbl5opXo" />
<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">Trần Thị Bích Ngọc</span>
<span className="px-2 py-0.5 rounded-full bg-error-container text-error font-label-sm text-label-sm font-bold">
                  Hết hạn 7 ngày
                </span>
</div>
<span className="font-body-md text-body-md text-on-surface-variant">
                Mã: <span className="font-semibold text-on-surface">#FZ-55102</span> • SĐT: 0988 776 211 • Hết hạn ngày 17/10/2024
              </span>
</div>
</div>

<div className="flex items-center gap-space-sm w-full md:w-auto">
<button className="flex-1 md:flex-initial h-12 px-5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-lg text-label-lg active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-sm">
<span className="material-symbols-outlined text-[20px]">access_time</span>
<span>Cho vào tạm (1 buổi)</span>
</button>
<button className="flex-1 md:flex-initial h-12 px-6 rounded-lg bg-tertiary-container hover:bg-tertiary text-on-tertiary font-label-lg text-label-lg font-bold active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm">
<span className="material-symbols-outlined text-[20px]">credit_card</span>
<span>Gia hạn ngay</span>
</button>
</div>
</div>
</div>
</div>

<div className="xl:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md">

<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-[#15803D] animate-pulse"></span>
<h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Lượt Check-in Hôm Nay</h2>
</div>
<span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">
            142 lượt
          </span>
</div>

<div className="flex items-center gap-1.5 overflow-x-auto pb-1">
<button className="px-3 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold whitespace-nowrap shadow-sm">
            Tất cả (142)
          </button>
<button className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-semibold whitespace-nowrap">
            Gym (98)
          </button>
<button className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-semibold whitespace-nowrap">
            Yoga (24)
          </button>
<button className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-semibold whitespace-nowrap">
            PT 1:1 (20)
          </button>
</div>
</div>

<div className="flex flex-col gap-space-xs max-h-[540px] overflow-y-auto pr-1">

<div className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md font-bold text-primary font-mono whitespace-nowrap">10:14</span>
<div className="flex flex-col min-w-0">
<span className="font-label-lg text-label-lg font-bold text-on-surface truncate">Lê Thu Trang</span>
<span className="font-body-sm text-body-sm text-outline truncate">Gói Pilates Reformer</span>
</div>
</div>
<div className="flex flex-col items-end whitespace-nowrap">
<span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-label-sm text-label-sm font-semibold">
              Cổng 1 • Tủ 18
            </span>
<span className="font-label-sm text-label-sm text-outline mt-0.5">Hợp lệ</span>
</div>
</div>

<div className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md font-bold text-primary font-mono whitespace-nowrap">10:08</span>
<div className="flex flex-col min-w-0">
<span className="font-label-lg text-label-lg font-bold text-on-surface truncate">Phạm Minh Tuấn</span>
<span className="font-body-sm text-body-sm text-outline truncate">Gym Tự Do</span>
</div>
</div>
<div className="flex flex-col items-end whitespace-nowrap">
<span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-label-sm text-label-sm font-semibold">
              Cổng 2 • Tủ 35
            </span>
<span className="font-label-sm text-label-sm text-outline mt-0.5">Hợp lệ</span>
</div>
</div>

<div className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md font-bold text-primary font-mono whitespace-nowrap">09:55</span>
<div className="flex flex-col min-w-0">
<span className="font-label-lg text-label-lg font-bold text-on-surface truncate">Trần Quốc Huy</span>
<span className="font-body-sm text-body-sm text-outline truncate">PT 1:1 HLV Hoàng Nam</span>
</div>
</div>
<div className="flex flex-col items-end whitespace-nowrap">
<span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-label-sm text-label-sm font-semibold">
              Cổng 1 • Tủ 04
            </span>
<span className="font-label-sm text-label-sm text-outline mt-0.5">Hợp lệ</span>
</div>
</div>

<div className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md font-bold text-primary font-mono whitespace-nowrap">09:42</span>
<div className="flex flex-col min-w-0">
<span className="font-label-lg text-label-lg font-bold text-on-surface truncate">Vũ Thị Mai</span>
<span className="font-body-sm text-body-sm text-outline truncate">Yoga Flow 60p</span>
</div>
</div>
<div className="flex flex-col items-end whitespace-nowrap">
<span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-label-sm text-label-sm font-semibold">
              Cổng 1 • Tủ 52
            </span>
<span className="font-label-sm text-label-sm text-outline mt-0.5">Hợp lệ</span>
</div>
</div>

<div className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md font-bold text-primary font-mono whitespace-nowrap">09:30</span>
<div className="flex flex-col min-w-0">
<span className="font-label-lg text-label-lg font-bold text-on-surface truncate">Đoàn Anh Kiên</span>
<span className="font-body-sm text-body-sm text-outline truncate">All-Access VIP</span>
</div>
</div>
<div className="flex flex-col items-end whitespace-nowrap">
<span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-label-sm text-label-sm font-semibold">
              Cổng 2 • Tủ 09
            </span>
<span className="font-label-sm text-label-sm text-outline mt-0.5">Hợp lệ</span>
</div>
</div>

<div className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md font-bold text-outline font-mono whitespace-nowrap">09:18</span>
<div className="flex flex-col min-w-0">
<span className="font-label-lg text-label-lg font-bold text-on-surface truncate">Hoàng Nhật Nam</span>
<span className="font-body-sm text-body-sm text-error truncate">Còn 2 ngày hết hạn</span>
</div>
</div>
<div className="flex flex-col items-end whitespace-nowrap">
<span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-label-sm text-label-sm font-semibold">
              Nhắc gia hạn
            </span>
<span className="font-label-sm text-label-sm text-outline mt-0.5">Cổng 1</span>
</div>
</div>
</div>

<div className="pt-space-sm flex items-center justify-between bg-surface-container-lowest">
<div className="flex items-center gap-1.5 font-label-sm text-label-sm text-outline">
<span className="material-symbols-outlined text-[16px] text-[#15803D]">sync</span>
<span>Tự động cập nhật 5s</span>
</div>
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md flex items-center gap-1.5 transition-colors shadow-sm">
<span className="material-symbols-outlined text-[18px]">file_download</span>
<span>Xuất ca trực</span>
</button>
</div>
</div>
</div>
</div>

    </>
  )
}
