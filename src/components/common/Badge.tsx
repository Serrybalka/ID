import { AlertCircle, CheckCircle2, Clock3, Info } from 'lucide-react';
import type { DocumentStatus } from '../../types/document';

export function StatusBadge({ status }: { status: DocumentStatus | string }) {
  const tone = getTone(status);
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'danger' ? AlertCircle : tone === 'warning' ? Clock3 : Info;
  return (
    <span className={`badge ${tone}`}>
      <Icon size={13} aria-hidden="true" />
      {status}
    </span>
  );
}

function getTone(status: string) {
  if (['Доставлен', 'Есть постановления СПИ', 'Проверена', 'Успешно'].includes(status)) return 'success';
  if (['Ошибка отправки', 'Ошибка проверки', 'Ошибка'].includes(status)) return 'danger';
  if (['Создан', 'Готов к подписанию', 'Отправляется', 'Ожидает проверки'].includes(status)) return 'warning';
  if (['Подписан', 'Отправлен', 'Принят ФССП'].includes(status)) return 'info';
  return 'neutral';
}
