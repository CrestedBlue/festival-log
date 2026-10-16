export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="empty-state">
      <h2>아직 페스티벌이 없어요</h2>
      <p>관리 탭에서 페스티벌을 만들거나 친구가 보낸 파일을 가져오세요.</p>
      <button type="button" className="btn btn--primary" onClick={onCreate}>
        페스티벌 추가하기
      </button>
    </section>
  )
}
