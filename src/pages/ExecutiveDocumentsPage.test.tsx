import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ExecutiveDocumentsPage } from './ExecutiveDocumentsPage';

function renderPage() {
  return render(
    <BrowserRouter>
      <ExecutiveDocumentsPage />
    </BrowserRouter>,
  );
}

describe('ExecutiveDocumentsPage', () => {
  it('opens filters modal and closes it', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /Фильтры/i }));
    expect(screen.getByRole('dialog', { name: /Фильтры исполнительных документов/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Отмена' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps sign button disabled without selected documents', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /^Подписать$/ })).toBeDisabled();
  });

  it('opens document drawer after row click', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getAllByText(/035614080500/i)[0]);
    expect(screen.getByLabelText('Карточка исполнительного документа')).toBeInTheDocument();
  });
});
