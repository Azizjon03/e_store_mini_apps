import { useParams, useNavigate } from 'react-router-dom';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
      <span className="text-6xl mb-4">🎉</span>
      <h1 className="text-[20px] font-semibold mb-2" style={{ color: 'var(--tg-theme-text-color)' }}>
        Buyurtma qabul qilindi!
      </h1>
      <p className="text-sm mb-6 text-center" style={{ color: 'var(--tg-theme-hint-color)' }}>
        Buyurtma #{orderId} muvaffaqiyatli yaratildi
      </p>
      <div className="flex gap-3">
        <button
          className="px-6 py-2.5 rounded-[12px] text-sm font-medium"
          style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
          onClick={() => navigate(`/orders/${orderId}`)}
        >
          Buyurtmani ko'rish
        </button>
        <button
          className="px-6 py-2.5 rounded-[12px] text-sm font-medium"
          style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
          onClick={() => navigate('/')}
        >
          Bosh sahifa
        </button>
      </div>
    </div>
  );
}
