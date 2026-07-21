import { describe, expect, it } from 'vitest';
import { documents } from '../data/documents';
import { canSign, emptyFilter, filterDocuments } from './documentLogic';

describe('document logic', () => {
  it('filters documents by quick search', () => {
    const target = documents[0];
    const result = filterDocuments(documents, target.caseNumber, emptyFilter, 'Все');
    expect(result.map((doc) => doc.id)).toContain(target.id);
  });

  it('filters documents by status tab', () => {
    const result = filterDocuments(documents, '', emptyFilter, 'Ошибка отправки');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((doc) => doc.status === 'Ошибка отправки')).toBe(true);
  });

  it('allows signing only created or ready documents', () => {
    expect(canSign({ ...documents[0], status: 'Создан' })).toBe(true);
    expect(canSign({ ...documents[0], status: 'Готов к подписанию' })).toBe(true);
    expect(canSign({ ...documents[0], status: 'Подписан' })).toBe(false);
  });

  it('filters by amount range and debtor', () => {
    const result = filterDocuments(documents, '', { ...emptyFilter, amountFrom: '100000', debtor: 'Иванов' }, 'Все');
    expect(result.every((doc) => doc.amount >= 100000 && doc.debtor.fullName.includes('Иванов'))).toBe(true);
  });
});
