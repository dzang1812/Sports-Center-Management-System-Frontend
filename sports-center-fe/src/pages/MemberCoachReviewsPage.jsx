import { MyCoachReviews } from '../components/CoachRating'

// Reused under "Lịch của tôi → Tiến độ & đánh giá"; the old URL redirects to this tab.
export default function MemberCoachReviewsPage({ embedded = false }) {
  const Heading = embedded ? 'h2' : 'h1'
  return (
    <div className="flex flex-col gap-5 max-w-[1440px] mx-auto">
      <div>
        <Heading className={embedded ? 'text-lg font-bold' : 'font-headline-xl text-headline-xl'}>Đánh giá HLV</Heading>
        <p className="text-secondary mt-2">Chấm sao và nhận xét các huấn luyện viên bạn đã học cùng.</p>
      </div>
      <MyCoachReviews standalone />
    </div>
  )
}
