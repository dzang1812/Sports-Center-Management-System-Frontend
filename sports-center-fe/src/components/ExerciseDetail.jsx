import { Badge, Icon, Modal } from './ui'

const LEVEL = { Beginner: 'Người mới', Intermediate: 'Trung cấp', Advanced: 'Nâng cao' }
const LEVEL_TONE = { Beginner: 'green', Intermediate: 'amber', Advanced: 'red' }

const Row = ({ icon, label, children }) =>
  children ? (
    <div className="flex items-start gap-2">
      <Icon name={icon} className="text-[20px] text-secondary mt-0.5" />
      <p>
        <span className="text-secondary">{label}: </span>
        {children}
      </p>
    </div>
  ) : null

export default function ExerciseDetailModal({ exercise: e, onClose }) {
  return (
    <Modal title={e.name} onClose={onClose}>
      <div className="flex flex-col gap-3">
        {e.imageUrl ? (
          <img src={e.imageUrl} alt={e.name} className="w-full max-h-72 object-contain rounded-xl bg-surface-container" />
        ) : (
          <div className="w-full h-40 rounded-xl bg-surface-container flex items-center justify-center">
            <Icon name="fitness_center" className="text-5xl text-outline" />
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <Badge tone={LEVEL_TONE[e.level] ?? 'slate'}>{LEVEL[e.level] ?? e.level}</Badge>
          {e.muscleGroup && <Badge tone="slate">{e.muscleGroup}</Badge>}
        </div>
        <Row icon="exercise" label="Dụng cụ">{e.equipment}</Row>
        <Row icon="repeat" label="Mức gợi ý">
          {e.defaultSets ? `${e.defaultSets} hiệp × ${e.defaultReps ?? '10'} lần` : null}
        </Row>
        <Row icon="timer" label="Nghỉ giữa hiệp">{e.restSeconds ? `${e.restSeconds} giây` : null}</Row>
        <Row icon="info" label="Mô tả">{e.description}</Row>
        {e.videoUrl && (
          <video src={e.videoUrl} controls className="w-full rounded-xl" preload="none" />
        )}
      </div>
    </Modal>
  )
}
