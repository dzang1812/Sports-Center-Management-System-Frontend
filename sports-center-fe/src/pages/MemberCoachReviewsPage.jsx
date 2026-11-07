import { MyCoachReviews } from '../components/CoachRating'

// Member's own coach reviews (GET/PUT /me/coach-reviews), split out of "Lịch của tôi" into its own tab.
export default function MemberCoachReviewsPage() {
  return (
    <div className="flex flex-col gap-5 max-w-[1440px] mx-auto">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Đánh giá HLV</h1>
        <p className="text-secondary mt-2">Chấm sao và nhận xét các huấn luyện viên bạn đã học cùng.</p>
      </div>
      <MyCoachReviews standalone />
    </div>
  )
}
