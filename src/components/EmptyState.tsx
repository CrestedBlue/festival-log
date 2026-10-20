export function EmptyState({ onOpenList }: { onOpenList: () => void }) {
  return (
    <section className="empty-state">
      <h2>아직 고른 페스티벌이 없어요</h2>
      <p>관리 탭의 페스티벌 목록에서 가고 싶은 페스티벌을 추가해 보세요.</p>
      <button type="button" className="btn btn--primary" onClick={onOpenList}>
        페스티벌 목록 보기
      </button>
    </section>
  )
}
