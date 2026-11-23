export default function Rating({ value, count }) {
  return (
    <span className="rating-wrap">
      <span className={`rating-pill ${value < 3 ? 'low' : ''}`}>{Number(value).toFixed(1)} ★</span>
      {count != null && <span className="rating-count">({count.toLocaleString('en-IN')})</span>}
    </span>
  )
}
