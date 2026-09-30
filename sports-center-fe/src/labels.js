// Vietnamese labels for the enums the API returns as strings.
export const ROLE_LABEL = { Manager: 'Quản lý trung tâm', Coach: 'Huấn luyện viên', Member: 'Hội viên', Receptionist: 'Lễ tân' }
export const GOAL_LABEL = { WeightLoss: 'Giảm cân', MuscleGain: 'Tăng cơ', Endurance: 'Sức bền', GeneralHealth: 'Sức khoẻ chung' }
export const LEVEL_LABEL = { Beginner: 'Mới bắt đầu', Intermediate: 'Trung bình', Advanced: 'Nâng cao' }
export const GENDER_LABEL = { Male: 'Nam', Female: 'Nữ', Other: 'Khác' }
export const SPORTS = ['Gym', 'Boxing', 'Yoga', 'GroupX']

export const AUDIT_ACTIONS = {
  'User.Create': 'Tạo tài khoản',
  'User.Update': 'Sửa tài khoản',
  'User.Lock': 'Khoá tài khoản',
  'User.Unlock': 'Mở khoá tài khoản',
}

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
export const PASSWORD_HINT = 'Mật khẩu tối thiểu 8 ký tự, gồm chữ và số'
