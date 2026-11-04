// Vietnamese labels for the enums the API returns as strings.
export const ROLE_LABEL = { Manager: 'Quản lý trung tâm', Coach: 'Huấn luyện viên', Member: 'Hội viên', Receptionist: 'Lễ tân' }
export const GOAL_LABEL = { WeightLoss: 'Giảm cân', MuscleGain: 'Tăng cơ', Endurance: 'Sức bền', GeneralHealth: 'Sức khoẻ chung' }
export const LEVEL_LABEL = { Beginner: 'Mới bắt đầu', Intermediate: 'Trung bình', Advanced: 'Nâng cao' }
export const GENDER_LABEL = { Male: 'Nam', Female: 'Nữ', Other: 'Khác' }

export const AUDIT_ACTIONS = {
  'User.Create': 'Tạo tài khoản',
  'User.Update': 'Sửa tài khoản',
  'User.Lock': 'Khoá tài khoản',
  'User.Unlock': 'Mở khoá tài khoản',
}

export const CLASS_STATUS_LABEL = { Draft: 'Bản nháp', Open: 'Đang mở', Closed: 'Đã đóng', Cancelled: 'Đã huỷ' }
export const SESSION_STATUS_LABEL = { Scheduled: 'Đã lên lịch', Completed: 'Đã hoàn thành', Cancelled: 'Đã huỷ' }
export const BOOKING_STATUS_LABEL = { Confirmed: 'Đã xác nhận', Cancelled: 'Đã huỷ', Completed: 'Đã hoàn thành' }
export const SPORT_STATUS_LABEL = { Active: 'Hoạt động', Inactive: 'Ngừng hoạt động' }
export const ROOM_STATUS_LABEL = { Active: 'Hoạt động', Maintenance: 'Đang bảo trì', Inactive: 'Ngừng hoạt động' }
export const ATTENDANCE_STATUS_LABEL = { Present: 'Có mặt', Absent: 'Vắng', Late: 'Đi muộn', Excused: 'Có phép' }
// Class roster check-in state (self check-in flow), distinct from the Absent/Present attendance status.
export const CHECK_IN_STATE_LABEL = { NotCheckedIn: 'Chưa điểm danh', Present: 'Có mặt', Late: 'Đi muộn', Absent: 'Vắng' }
export const CHECK_IN_SOURCE_LABEL = { MemberSelfCheckIn: 'Tự check-in', LegacyCoachMarked: 'HLV điểm danh' }
export const SUBSCRIPTION_STATUS_LABEL = { Pending: 'Chờ thanh toán', Active: 'Đang hoạt động', Expired: 'Đã hết hạn', Cancelled: 'Đã huỷ' }
export const PAYMENT_STATUS_LABEL = { Pending: 'Chờ thanh toán', Paid: 'Đã thanh toán', Failed: 'Thất bại', Refunded: 'Đã hoàn tiền' }
export const PLAN_TYPE_LABEL = { TimeBased: 'Theo thời hạn', PersonalTraining: 'PT cá nhân', Hybrid: 'Kết hợp' }
export const PAYMENT_METHOD_LABEL = { Cash: 'Tiền mặt', BankTransfer: 'Chuyển khoản', Card: 'Thẻ' }

// .NET DayOfWeek: Sunday = 0 .. Saturday = 6.
export const DAY_OF_WEEK_LABEL = {
  Sunday: 'Chủ nhật',
  Monday: 'Thứ Hai',
  Tuesday: 'Thứ Ba',
  Wednesday: 'Thứ Tư',
  Thursday: 'Thứ Năm',
  Friday: 'Thứ Sáu',
  Saturday: 'Thứ Bảy',
}
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
export const PASSWORD_HINT = 'Mật khẩu tối thiểu 8 ký tự, gồm chữ và số'

export const PHONE_RULE = /^(0|\+84)(3|5|7|8|9)\d{8}$/
export const PHONE_HINT = 'Số điện thoại Việt Nam không hợp lệ (vd: 0912345678)'

export const GYM_CARD_STATUS_LABEL = {
  Active: 'Đang hoạt động',
  PaymentPending: 'Chờ thanh toán',
  PaymentFailed: 'Thanh toán thất bại',
  NotYetActive: 'Chưa đến ngày hiệu lực',
  Expired: 'Đã hết hạn',
  Inactive: 'Không hoạt động',
  NoEntitlement: 'Không có quyền vào Gym',
  Blocked: 'Tài khoản bị khoá',
}
