import writeExcelFile from 'write-excel-file/universal'
import { formatDate, formatTimestamp } from './dateUtils'

const HEADERS = ['STT', 'Mã HLV', 'Họ và tên', 'Số điện thoại', 'Bộ môn HLV', 'Trạng thái tài khoản', 'PT đã dạy', 'Khóa đã dạy', 'Buổi lớp đã dạy', 'Chưa xác nhận']
// Strip characters forbidden in Excel XML, preserving tabs and line breaks.
// eslint-disable-next-line no-control-regex
const text = value => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
const count = value => {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Số liệu thống kê chưa hợp lệ. Vui lòng làm mới báo cáo rồi thử lại.')
  return value
}
const cell = (value, style = {}) => ({ value: typeof value === 'number' ? count(value) : text(value), type: typeof value === 'number' ? Number : String, ...style })
const merged = (value, style = {}) => [cell(value, { columnSpan: HEADERS.length, height: 24, alignVertical: 'center', ...style }), ...Array(HEADERS.length - 1).fill(null)]
const date = value => formatDate(value, { day: '2-digit', month: '2-digit', year: 'numeric' })

// This is a snapshot of the visible report, generated locally without another API request.
// Names/filter text are explicit string cells, never Excel formulas.
export async function createCoachTeachingWorkbook(report, coaches, search = '', sport = '') {
  if (!report || !Array.isArray(coaches) || !Number.isInteger(report.year) || ![1, 2, 3, 4].includes(report.quarter))
    throw new Error('Chưa có báo cáo hợp lệ để xuất. Vui lòng tải lại dữ liệu.')
  const sum = key => coaches.reduce((total, coach) => total + count(coach[key]), 0)
  const filter = search.trim()
  const scope = [sport && `Chuyên môn HLV: ${sport}`, filter && `Từ khóa: “${filter}”`].filter(Boolean).join(' · ')
  const pt = sum('ptTaught'), classes = sum('classSessionsTaught'), unverified = sum('unverified')
  const activeCoaches = coaches.filter(coach => coach.ptTaught + coach.classSessionsTaught > 0).length
  const rows = [
    merged('FITZONE · BÁO CÁO GIẢNG DẠY HUẤN LUYỆN VIÊN', { fontWeight: 'bold', fontSize: 16, textColor: '#FFFFFF', backgroundColor: '#4338CA', height: 34 }),
    merged(`Quý ${report.quarter}/${report.year} · ${date(report.from)} – ${date(report.to)}`, { fontWeight: 'bold', fontSize: 13, textColor: '#312E81' }),
    merged(`Dữ liệu cập nhật: ${formatTimestamp(report.asOfUtc)} · Giờ Việt Nam (GMT+7)`, { textColor: '#64748B' }),
    merged(scope ? `Phạm vi: ${coaches.length} HLV · ${scope}` : `Phạm vi: toàn bộ ${coaches.length} HLV trong báo cáo`, { wrap: true, height: 32 }),
    merged(`${activeCoaches} HLV có giảng dạy · ${pt} buổi PT đã dạy · ${classes} buổi lớp đã dạy`, { fontWeight: 'bold', backgroundColor: '#EEF2FF' }),
    [],
    HEADERS.map(label => cell(label, { fontWeight: 'bold', backgroundColor: '#E2E8F0', textColor: '#0F172A', wrap: true, height: 32, alignVertical: 'center' })),
    ...coaches.map((coach, index) => {
      const values = [index + 1, count(coach.coachId), coach.fullName, coach.phone ?? '', (coach.specialties ?? []).join(' · '), coach.isActive ? 'Hoạt động' : 'Đã khóa tài khoản',
        count(coach.ptTaught), count(coach.coursesTaught), count(coach.classSessionsTaught), count(coach.unverified)]
      return values.map(value => cell(value, { backgroundColor: index % 2 ? '#F8FAFC' : '#FFFFFF', height: 30, wrap: true,
        alignVertical: 'center', ...(typeof value === 'number' && { format: '#,##0', align: 'right' }) }))
    }),
    [null, null, 'Tổng cộng theo bộ lọc', null, null, null, pt, null, classes, unverified].map(value => value == null ? null : cell(value, { fontWeight: 'bold', backgroundColor: '#EEF2FF', height: 30, ...(typeof value === 'number' && { format: '#,##0', align: 'right' }) })),
    [],
    merged('CÁCH TÍNH & GHI CHÚ', { fontWeight: 'bold', textColor: '#312E81' }),
    merged(report.countingRule, { wrap: true, height: 52, textColor: '#475569', alignVertical: 'top' }),
    merged('Khóa được đếm riêng cho từng HLV. Không cộng cột “Khóa đã dạy” để tránh trùng khóa có nhiều HLV.', { wrap: true, height: 30, textColor: '#475569' }),
    merged('Bộ môn dùng lọc chuyên môn HLV. Số buổi là tổng giảng dạy trong quý của các HLV được lọc, gồm tất cả bộ môn họ dạy.', { wrap: true, height: 30, textColor: '#475569' }),
    merged('Nguồn: báo cáo giảng dạy HLV của FitZone. Các tổng trong file chỉ tính danh sách HLV được xuất.', { wrap: true, height: 30, textColor: '#64748B' }),
  ]
  const blob = await writeExcelFile(rows, { sheet: 'Giảng dạy HLV', columns: [6, 10, 32, 20, 26, 22, 14, 14, 18, 18].map(width => ({ width })),
    stickyRowsCount: 7, stickyColumnsCount: 3, showGridLines: false, orientation: 'landscape' }, { fontFamily: 'Calibri', fontSize: 11 }).toBlob()
  return { blob, fileName: `Bao-cao-giang-day-HLV_Quy-${report.quarter}_${report.year}${scope ? '_da-loc' : ''}.xlsx` }
}
