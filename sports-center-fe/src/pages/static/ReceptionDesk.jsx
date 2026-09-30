// Static UI exported from Stitch. Data is hardcoded until the real API is wired in.
export default function ReceptionDesk() {
  return (
    <>
<div className="flex flex-col w-full pb-10">

<div className="grid grid-cols-12 gap-space-lg mb-space-lg">

<div className="col-span-12 xl:col-span-6 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-[26px]">terminal</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-xs">
<span className="font-headline-sm text-headline-sm text-on-surface">Quầy Tiếp Đón #01</span>
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-primary-container">Khu A - Tầng 1</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant">Lễ tân ca trực: <strong className="text-on-surface font-semibold">Nguyễn Thu Hằng</strong> • Ca sáng</span>
</div>
</div>

<div className="text-right">
<div className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight" id="liveClock">10:28:45</div>
<div className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Thứ Hai, 24/10/2024</div>
</div>
</div>

<div className="grid grid-cols-3 gap-space-sm mt-space-md pt-space-sm">
<div className="bg-surface-container-low px-space-md py-space-xs rounded-lg flex items-center gap-space-sm">
<span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-on-surface-variant">RFID Reader</span>
<span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">Cổng 01: Sẵn Sàng</span>
</div>
</div>
<div className="bg-surface-container-low px-space-md py-space-xs rounded-lg flex items-center gap-space-sm">
<span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-on-surface-variant">QR Scanner</span>
<span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">Cổng Tự Động On</span>
</div>
</div>
<div className="bg-surface-container-low px-space-md py-space-xs rounded-lg flex items-center gap-space-sm">
<span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed"></span>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-on-surface-variant">Tủ Locker POS</span>
<span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">Kết nối 100%</span>
</div>
</div>
</div>
</div>

<div className="col-span-12 xl:col-span-6 grid grid-cols-3 gap-space-md">

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface-variant">Lượt Check-in</span>
<div className="w-9 h-9 rounded-lg bg-surface-container-low text-primary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">how_to_reg</span>
</div>
</div>
<div className="my-space-xs">
<span className="font-headline-xl text-headline-xl text-on-surface font-bold">142</span>
<span className="font-body-sm text-body-sm text-secondary ml-1">lượt</span>
</div>
<div className="flex items-center gap-1 font-label-sm text-label-sm text-emerald-600">
<span className="material-symbols-outlined text-[14px]">trending_up</span>
<span>+14.8% vs hôm qua</span>
</div>
</div>

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface-variant">Đang trong CLB</span>
<div className="w-9 h-9 rounded-lg bg-surface-container-low text-primary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">directions_run</span>
</div>
</div>
<div className="my-space-xs">
<span className="font-headline-xl text-headline-xl text-primary font-bold">48</span>
<span className="font-body-sm text-body-sm text-secondary ml-1">/ 120 chỗ</span>
</div>
<div className="flex items-center gap-1 font-label-sm text-label-sm text-primary">
<span className="material-symbols-outlined text-[14px]">speed</span>
<span>40% công suất tải</span>
</div>
</div>

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface-variant">Cảnh báo hạn</span>
<div className="w-9 h-9 rounded-lg bg-error-container text-error flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">warning</span>
</div>
</div>
<div className="my-space-xs">
<span className="font-headline-xl text-headline-xl text-error font-bold">03</span>
<span className="font-body-sm text-body-sm text-error ml-1">thẻ cần xử lý</span>
</div>
<div className="flex items-center gap-1 font-label-sm text-label-sm text-error">
<span className="material-symbols-outlined text-[14px]">priority_high</span>
<span>Hết hạn / Cần gia hạn</span>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-12 gap-space-lg">

<div className="col-span-12 xl:col-span-8 flex flex-col gap-space-lg">

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
<div className="flex flex-col sm:flex-row items-center gap-space-sm">

<div className="relative w-full">
<div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-on-surface-variant">
<span className="material-symbols-outlined text-[26px]">search</span>
</div>
<input className="w-full h-14 pl-12 pr-12 rounded-xl bg-surface-container-low text-on-surface font-body-lg text-body-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-inner" id="memberSearchInput" placeholder="Tìm theo tên hội viên, số điện thoại, mã thẻ FZ-..." type="text" defaultValue="0912 345 678" />
<button className="absolute inset-y-0 right-0 pr-space-md flex items-center text-on-surface-variant hover:text-on-surface" title="Xóa tìm kiếm">
<span className="material-symbols-outlined text-[20px]">cancel</span>
</button>
</div>

<div className="flex items-center gap-space-xs w-full sm:w-auto shrink-0">
<button className="flex-1 sm:flex-initial h-14 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-sm hover:opacity-95 transition-opacity active:scale-95">
<span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
<span>Quét QR / Thẻ</span>
</button>
<button className="h-14 px-space-md rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg flex items-center justify-center hover:bg-surface-container-high transition-colors active:scale-95" title="Mở bàn phím số">
<span className="material-symbols-outlined text-[22px]">dialpad</span>
</button>
</div>
</div>

<div className="flex items-center flex-wrap gap-space-sm pt-space-xs">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Hội viên vừa tìm:</span>
<button className="flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all">
<span className="material-symbols-outlined text-[16px]">person</span>
<span>Nguyễn Hoàng Long (#FZ-88291)</span>
</button>
<button className="flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container text-secondary font-label-md text-label-md hover:bg-secondary hover:text-on-secondary transition-all">
<span className="material-symbols-outlined text-[16px]">history</span>
<span>Trần Thị Bích Ngọc (#FZ-55102)</span>
</button>
<button className="flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container text-secondary font-label-md text-label-md hover:bg-secondary hover:text-on-secondary transition-all">
<span className="material-symbols-outlined text-[16px]">history</span>
<span>Đỗ Hoàng Quân (#FZ-19342)</span>
</button>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden relative">
<div className="h-2 w-full bg-emerald-500"></div>
<div className="p-space-lg flex flex-col gap-space-lg">

<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md pb-space-md">
<div className="flex items-center gap-space-md">
<div className="relative">
<img className="w-24 h-24 rounded-2xl object-cover shadow-md" data-alt="Athletic Vietnamese young male member smiling warmly in a sports gym environment, wearing a sleek navy compression t-shirt, clean studio lighting with soft indigo sports ambient glow in background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP_MK1cdWRYXbcSrfL_KAhqLy89MzBPze_6uuSs04XSE3SOKyqz5SvfkVWPfyYnTGEkjbqtY33bsN69tkfWr412IapHBgnHLIKU41j12vN7iwN21DJZkm50TiqLEIFCSCIyCAkytgb86AVpJsRR7x4PC-OKKq5FSawSYo-sNdMO7SoIGIXHe0i6O4-c-GOa1HBl1VqPmtTSL5FFltjT4u9z7gszXsQ0kyHckqxL2UWHA0SyGFbo05F" />
<span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-sm flex items-center justify-center">
<span className="material-symbols-outlined text-[14px]">check</span>
</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-sm flex-wrap">
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Nguyễn Hoàng Long</h2>
<span className="px-space-sm py-0.5 rounded-full font-label-sm text-label-sm bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Gói tập Đang hoạt động
                  </span>
<span className="px-space-sm py-0.5 rounded-full font-label-sm text-label-sm bg-orange-100 text-orange-800 font-bold">VIP GOLD</span>
</div>
<div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant mt-1">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">badge</span>
                    Mã thẻ: <strong className="text-on-surface font-semibold">#FZ-88291</strong>
</span>
<span>•</span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">call</span>
                    0912 345 678
                  </span>
<span>•</span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">cake</span>
                    1994 (30 tuổi)
                  </span>
</div>
</div>
</div>

<div className="flex items-center md:flex-col items-end bg-surface-container-low px-space-lg py-space-sm rounded-xl">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Thời hạn thẻ còn lại</span>
<div className="flex items-baseline gap-1 my-0.5">
<span className="font-display-lg text-display-lg text-emerald-600 font-bold leading-none">210</span>
<span className="font-label-lg text-label-lg text-emerald-700 font-semibold">ngày</span>
</div>
<span className="font-body-sm text-body-sm text-secondary">Hạn đến: 15/09/2025</span>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">

<div className="bg-surface-container-low p-space-md rounded-xl flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-sm">
<span className="material-symbols-outlined text-[22px]">fitness_center</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-on-surface-variant">Gói hội viên</span>
<span className="font-label-lg text-label-lg text-on-surface truncate">All-Access VIP 12 Tháng</span>
<span className="font-body-sm text-body-sm text-secondary">Gym, Yoga, Xông hơi</span>
</div>
</div>

<div className="bg-surface-container-low p-space-md rounded-xl flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-sm">
<span className="material-symbols-outlined text-[22px]">lock</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm text-on-surface-variant">Tủ Locker VIP</span>
<span className="font-label-lg text-label-lg text-on-surface">Tủ Số #42 (Nam)</span>
<span className="font-body-sm text-body-sm text-emerald-600 font-medium">Khóa điện tử sẵn sàng</span>
</div>
</div>
<button className="px-space-sm py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-semibold">
                Đổi tủ
              </button>
</div>

<div className="bg-surface-container-low p-space-md rounded-xl flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-orange-600 flex items-center justify-center shrink-0 shadow-sm">
<span className="material-symbols-outlined text-[22px]">workspace_premium</span>
</div>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-on-surface-variant">Đặc quyền cấp phát</span>
<div className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface font-medium">
<span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Khăn tắm VIP • Bãi đỗ xe B1
                </div>
<span className="font-body-sm text-body-sm text-secondary">Nước ion kiềm miễn phí</span>
</div>
</div>
</div>

<div className="flex flex-col sm:flex-row items-stretch gap-space-md pt-space-xs">
<button className="flex-1 h-16 rounded-xl bg-emerald-600 text-white font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm shadow-md hover:bg-emerald-700 active:scale-[0.99] transition-all">
<span className="material-symbols-outlined text-[28px]">sensor_door</span>
<span>CHECK-IN CỔNG TỰ ĐỘNG (Phím F2)</span>
</button>
<button className="h-16 px-space-lg rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-space-xs hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-[20px]">assignment_ind</span>
<span>Hồ Sơ Chi Tiết</span>
</button>
<button className="h-16 px-space-md rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg flex items-center justify-center hover:bg-surface-container-high transition-colors" title="In phiếu lượt">
<span className="material-symbols-outlined text-[22px]">print</span>
</button>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden relative">
<div className="h-2 w-full bg-error"></div>
<div className="p-space-lg flex flex-col gap-space-md">

<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="relative">
<img className="w-16 h-16 rounded-xl object-cover filter grayscale contrast-125" data-alt="Vietnamese female gym member portrait, medium shot in modern bright athletic lounge, wearing casual athletic top, professional studio lighting with indigo and soft warm tones" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWv4MrWOwrRTje4hCOHvT_LjT12q7sVeAOCIoxCr4uVYJZLCwM4oW4EENCU57cSaczNvycFfjn21wETkjkPmZhe5RAN9GlZCaHPy33Ul35An54sT37gG-E1CA7SUZmkP_eTFCEcGttQl36TQuxtRmPvBCX0545_E74lFfmzCsdm5TJPCfnfd03flufumwdL77eEtOCPHRd-z1hjXTVrwTmjKkdZ5ltJwBTN_QxTU37unBua4hfZ7Hj" />
<span className="absolute -bottom-1 -right-1 bg-error text-white rounded-full p-0.5 shadow-sm flex items-center justify-center">
<span className="material-symbols-outlined text-[12px]">close</span>
</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-sm">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Trần Thị Bích Ngọc</h3>
<span className="px-space-sm py-0.5 rounded-full font-label-sm text-label-sm bg-red-100 text-error font-bold">
                    Hết Hạn 07 Ngày
                  </span>
</div>
<div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant mt-0.5">
<span>Mã: <strong>#FZ-55102</strong></span>
<span>•</span>
<span>SĐT: 0988 776 543</span>
<span>•</span>
<span>Gói cũ: Yoga &amp; Pilates 6 Tháng</span>
</div>
</div>
</div>

<div className="bg-red-50 text-error px-space-md py-1.5 rounded-lg flex items-center gap-space-xs font-label-md text-label-md">
<span className="material-symbols-outlined text-[18px]">event_busy</span>
<span>Đã hết hạn ngày: 17/10/2024</span>
</div>
</div>

<div className="bg-error-container text-on-error-container p-space-md rounded-xl flex items-start gap-space-sm">
<span className="material-symbols-outlined text-error text-[24px] shrink-0 mt-0.5">error</span>
<div className="flex flex-col">
<span className="font-label-lg text-label-lg font-bold">Cảnh báo: Thẻ hội viên đã hết hạn sử dụng!</span>
<p className="font-body-md text-body-md mt-0.5 opacity-90">
                Vui lòng tư vấn hội viên gia hạn gói hoặc nộp phí duy trì trước khi mở cổng qua quầy. Cổng tự động đã bị tạm khóa đối với mã thẻ này.
              </p>
</div>
</div>

<div className="flex flex-col sm:flex-row items-center justify-end gap-space-sm pt-space-xs">
<button className="w-full sm:w-auto h-12 px-space-lg rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-sm transition-colors">
<span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
<span>Gia Hạn Gói Ngay</span>
</button>
<button className="w-full sm:w-auto h-12 px-space-lg rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-space-xs hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-[20px]">door_open</span>
<span>Cho Vào Tạm (1 Buổi Lẻ)</span>
</button>
<button className="w-full sm:w-auto h-12 px-space-md rounded-xl bg-surface-container text-secondary font-label-md text-label-md hover:bg-surface-container-high transition-colors">
              Bỏ qua
            </button>
</div>
</div>
</div>
</div>

<div className="col-span-12 xl:col-span-4 flex flex-col gap-space-lg">

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
<span className="font-label-lg text-label-lg text-on-surface">Công Suất Sàn Hiện Tại</span>
</div>
<span className="font-label-sm text-label-sm font-bold text-primary">40% / 120 MAX</span>
</div>

<div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden flex">
<div className="bg-primary h-full transition-all duration-500 rounded-full" style={{ width: "40%" }}></div>
</div>
<div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
<span>Tầng 1 (Gym &amp; Card): 26 người</span>
<span>Tầng 2 (Yoga/Pil): 22 người</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">

<div className="p-space-md flex flex-col gap-space-sm bg-surface-container-low">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[22px]">history</span>
<span className="font-headline-sm text-headline-sm text-on-surface">Lượt Check-in Hôm Nay</span>
</div>
<span className="font-label-sm text-label-sm bg-primary text-on-primary px-2 py-0.5 rounded-full font-bold">142</span>
</div>

<div className="flex items-center gap-space-xs overflow-x-auto pb-1">
<button className="px-space-md py-1 rounded-full font-label-sm text-label-sm bg-primary-container text-on-primary font-semibold shrink-0">
              Tất cả (142)
            </button>
<button className="px-space-md py-1 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface hover:bg-surface-container-high font-medium shrink-0">
              Gym (98)
            </button>
<button className="px-space-md py-1 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface hover:bg-surface-container-high font-medium shrink-0">
              Yoga (24)
            </button>
<button className="px-space-md py-1 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface hover:bg-surface-container-high font-medium shrink-0">
              PT 1:1 (20)
            </button>
</div>
</div>

<div className="divide-y divide-surface-container overflow-y-auto max-h-[580px] p-space-sm flex flex-col gap-1">

<div className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md text-primary font-bold bg-surface-container px-2 py-1 rounded">10:14</span>
<div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary shrink-0">
                LT
              </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface font-semibold truncate">Lê Thu Trang</span>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate">Gói Pilates Classic • Tủ #12</span>
</div>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
              Cổng 1 OK
            </span>
</div>

<div className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md text-primary font-bold bg-surface-container px-2 py-1 rounded">10:08</span>
<div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary shrink-0">
                PM
              </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface font-semibold truncate">Phạm Minh Tuấn</span>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate">Gym Tự Do • Tủ #08</span>
</div>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
              Cổng 2 OK
            </span>
</div>

<div className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-between bg-primary-fixed/30">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md text-primary font-bold bg-surface-container-lowest px-2 py-1 rounded">09:55</span>
<div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold shrink-0">
                QH
              </div>
<div className="flex flex-col min-w-0">
<div className="flex items-center gap-1">
<span className="font-label-md text-label-md text-on-surface font-semibold truncate">Trần Quốc Huy</span>
<span className="px-1.5 py-0.2 bg-primary text-on-primary rounded text-[10px] font-bold">PT 1:1</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate">HLV: Hoàng Nam • Tủ VIP #03</span>
</div>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
              Xác nhận
            </span>
</div>

<div className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md text-primary font-bold bg-surface-container px-2 py-1 rounded">09:42</span>
<div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary shrink-0">
                VM
              </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface font-semibold truncate">Vũ Thị Mai</span>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate">Yoga Flow 60p • Tủ #19</span>
</div>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
              Cổng 1 OK
            </span>
</div>

<div className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md text-primary font-bold bg-surface-container px-2 py-1 rounded">09:30</span>
<div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary shrink-0">
                ĐK
              </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface font-semibold truncate">Đoàn Anh Khoa</span>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate">All-Access Premium • Tủ #55</span>
</div>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
              Cổng 2 OK
            </span>
</div>

<div className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-between bg-error-container/30">
<div className="flex items-center gap-space-sm min-w-0">
<span className="font-label-md text-label-md text-error font-bold bg-surface-container-lowest px-2 py-1 rounded">09:18</span>
<div className="w-9 h-9 rounded-full bg-error-container text-error flex items-center justify-center font-bold shrink-0">
                HA
              </div>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface font-semibold truncate">Hoàng Nhật Ánh</span>
<span className="font-body-sm text-body-sm text-error truncate">Thẻ sắp hết hạn (còn 2 ngày)</span>
</div>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 shrink-0">
              Nhắc gia hạn
            </span>
</div>
</div>

<div className="p-space-sm bg-surface-container-low flex items-center justify-between">
<button className="font-label-sm text-label-sm text-primary hover:underline font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">file_download</span>
            Xuất file ca trực (Excel)
          </button>
<span className="font-body-sm text-body-sm text-secondary">Cập nhật tự động 10s</span>
</div>
</div>
</div>
</div>
</div>


    </>
  )
}
