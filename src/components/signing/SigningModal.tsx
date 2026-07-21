import { CheckCircle2, Loader2, RotateCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ExecutiveDocument, SigningResult } from '../../types/document';
import { canSign } from '../../utils/documentLogic';
import { Modal } from '../common/Modal';

const steps = ['Проверка документов', 'Формирование подписей', 'Подписание', 'Отправка в ФССП', 'Получение подтверждения'];

export function SigningModal({
  documents,
  onClose,
  onComplete,
}: {
  documents: ExecutiveDocument[];
  onClose: () => void;
  onComplete: (results: SigningResult[]) => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [results, setResults] = useState<SigningResult[]>([]);
  const signable = useMemo(() => documents.filter(canSign), [documents]);
  const excluded = documents.filter((doc) => !canSign(doc));

  useEffect(() => {
    if (!running) return;
    if (step >= steps.length) {
      const nextResults = signable.map((doc, index) => ({
        documentId: doc.id,
        documentNumber: doc.documentNumber,
        debtorName: doc.debtor.fullName,
        status: index % 7 === 0 ? 'failed' : 'success',
        message: index % 7 === 0 ? 'Не получено подтверждение доставки от ФССП' : 'Подписан и отправлен в ФССП',
      })) satisfies SigningResult[];
      setResults(nextResults);
      onComplete(nextResults);
      setRunning(false);
      return;
    }
    const timeout = window.setTimeout(() => setStep((current) => current + 1), 650);
    return () => window.clearTimeout(timeout);
  }, [running, step, signable, onComplete]);

  const successCount = results.filter((result) => result.status === 'success').length;
  const failedCount = results.filter((result) => result.status === 'failed').length;

  return (
    <Modal
      title="Подписание исполнительных документов"
      onClose={onClose}
      describedBy="signing-desc"
      footer={
        results.length ? (
          <button className="button primary" type="button" onClick={onClose}>
            Закрыть
          </button>
        ) : (
          <>
            <button className="button primary" type="button" disabled={!confirmed || running || signable.length === 0} onClick={() => { setRunning(true); setStep(0); }}>
              {running ? <Loader2 size={16} /> : <CheckCircle2 size={16} />} Подписать {signable.length} документов
            </button>
            <button className="button tertiary" type="button" onClick={onClose}>
              Отмена
            </button>
          </>
        )
      }
    >
      <div id="signing-desc">
        <p>
          Выбрано: <strong>{documents.length}</strong>. Доступно для подписания: <strong>{signable.length}</strong>. Исключено: <strong>{excluded.length}</strong>.
        </p>
        {excluded.length > 0 && <p className="badge warning">Исключены документы со статусами, которые не допускают подписание.</p>}
        <div className="info-section">
          <h3>Сертификат УКЭП</h3>
          <div className="kv"><span>Владелец</span><strong>Егорова Ольга Николаевна</strong></div>
          <div className="kv"><span>Серийный номер</span><span>02 AF 74 91 30 6B</span></div>
          <div className="kv"><span>Срок действия</span><span>до 18.04.2027</span></div>
        </div>
        {!running && results.length === 0 && (
          <label className="field">
            <span>
              <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> Я проверил выбранные документы и подтверждаю подписание
            </span>
          </label>
        )}
        {(running || step >= 0) && (
          <div className="progress-list">
            {steps.map((item, index) => (
              <div className={`progress-step ${index <= step ? 'done' : ''}`} key={item}>
                {index <= step ? <CheckCircle2 size={16} /> : <RotateCw size={16} />} {item}
              </div>
            ))}
          </div>
        )}
        {results.length > 0 && (
          <>
            <h3>{successCount} документов подписаны и отправлены, {failedCount} не отправлены</h3>
            <table>
              <thead><tr><th>Номер ИД</th><th>Должник</th><th>Результат</th><th>Действие</th></tr></thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.documentId}>
                    <td>{result.documentNumber}</td>
                    <td>{result.debtorName}</td>
                    <td><span className={`badge ${result.status === 'success' ? 'success' : 'danger'}`}>{result.message}</span></td>
                    <td>{result.status === 'failed' && <button className="button" type="button">Повторить отправку</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </Modal>
  );
}
