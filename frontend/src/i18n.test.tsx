import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
// @ts-ignore
import i18n from './i18n';

const TestComponent = () => {
    const { t } = useTranslation();
    return <div data-testid="text">{t('welcome')}</div>;
};

describe('i18n integration', () => {
    it('renders English translation by default', () => {
        render(
            <I18nextProvider i18n={i18n}>
                <TestComponent />
            </I18nextProvider>
        );
        expect(screen.getByTestId('text')).toHaveTextContent('Welcome');
    });

    it('renders Vietnamese translation when language changes', async () => {
        await act(async () => {
            // @ts-ignore
            if (i18n.changeLanguage) {
                // @ts-ignore
                await i18n.changeLanguage('vi');
            }
        });

        // We re-render or just expect the component to update (if using the same provider tree, it should update)
        // But since testing library cleans up, we render again or just keep the previous render.
        // However, without a real i18n instance, this will definitely fail.

        render(
            <I18nextProvider i18n={i18n}>
                <TestComponent />
            </I18nextProvider>
        );
        expect(screen.getByTestId('text')).toHaveTextContent('Xin chào');
    });
});
