import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, useLocation } from 'react-router-dom';
import PaymentPage from './c2_tunnel_tape_2_paiement_solde_suffisant';
import { bookingsAPI, vehiclesAPI, walletAPI } from '../services/api';

jest.mock('./DesignShell', () => ({ children }) => <div>{children}</div>);
jest.mock('../services/api', () => ({
  bookingsAPI: { quote: jest.fn(), create: jest.fn() },
  vehiclesAPI: { detail: jest.fn() },
  walletAPI: { topup: jest.fn() },
}));

const query = 'vehicle=8&start=2026-11-18&end=2026-11-21&stime=08%3A30&etime=12%3A30&driver=1&delivery=0';
const quotation = {
  days: 4, daily_rate: '45000', rental_amount: '180000', driver_fee: '40000',
  delivery_fee: '0', subtotal: '220000', deposit_amount: '120000',
  required_balance: '340000', balance: '400000', remaining_balance: '60000', shortfall: '0',
};
const Location = () => <output data-testid="location">{useLocation().pathname}{useLocation().search}</output>;
const mount = () => render(<MemoryRouter initialEntries={[`/client/booking/paiement?${query}`]}><PaymentPage/><Location/></MemoryRouter>);

beforeEach(() => {
  jest.clearAllMocks(); localStorage.clear();
  vehiclesAPI.detail.mockResolvedValue({ data: { id: 8, brand: 'Kia', model: 'Sorento', year: 2022, city: 'Yaoundé', category: 'SUV', plate: 'LT-8899-K', photos: [{ image: '/media/sorento.jpg' }] } });
  bookingsAPI.quote.mockResolvedValue({ data: quotation });
  bookingsAPI.create.mockResolvedValue({ data: { id: 42 } });
});

test('displays the authoritative quote and requires both consents before payment', async () => {
  localStorage.setItem('alp_booking_notes', 'Merci de me contacter.');
  mount();
  const pay = await screen.findByRole('button', { name: /Confirmer et Payer/ });
  expect(pay).toBeDisabled();
  expect(screen.getByText(/Durée : 76 heures/)).toHaveTextContent('4 jour(s)');
  expect(screen.getByAltText('Kia Sorento 2022')).toHaveAttribute('src', '/media/sorento.jpg');
  const checks = screen.getAllByRole('checkbox');
  fireEvent.click(checks[0]); expect(pay).toBeDisabled();
  fireEvent.click(checks[1]); expect(pay).toBeEnabled();
  fireEvent.click(pay);
  await waitFor(() => expect(bookingsAPI.create).toHaveBeenCalledWith(expect.objectContaining({
    start_time: '08:30', end_time: '12:30', driver_type: 'internal', delivery_requested: false,
    notes: 'Merci de me contacter.', terms_accepted: true, debit_authorized: true,
  })));
  await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/client/booking/confirmation?booking=42'));
  expect(localStorage.getItem('alp_booking_notes')).toBeNull();
});

test('keeps the current booking parameters when returning to the recap', async () => {
  mount();
  const back = await screen.findByRole('link', { name: /Revenir à l’étape 1/ });
  expect(back).toHaveAttribute('href', `/client/booking/recap?${query}`);
});

test('opens readable rental terms without leaving the current booking', async () => {
  mount();
  fireEvent.click(await screen.findByRole('button', { name: /Conditions Générales de Location/ }));
  expect(screen.getByRole('dialog', { name: /Conditions Générales/ })).toBeInTheDocument();
  expect(screen.getByText('Durée et prix')).toBeInTheDocument();
});

test('requires enough balance for the rental and deposit and resumes after recharge', async () => {
  bookingsAPI.quote.mockResolvedValue({ data: { ...quotation, balance: '300000', remaining_balance: '-40000', shortfall: '40000' } });
  walletAPI.topup.mockResolvedValue({ data: { status: 'completed' } });
  mount();
  fireEvent.click(await screen.findByRole('button', { name: 'Recharger mon portefeuille' }));
  fireEvent.change(screen.getByLabelText('Numéro Mobile Money'), { target: { value: '+237699123456' } });
  bookingsAPI.quote.mockResolvedValue({ data: quotation });
  fireEvent.click(screen.getByRole('button', { name: 'Recharger', exact: true }));
  await waitFor(() => expect(walletAPI.topup).toHaveBeenCalledWith(40000, 'mtn', '237699123456'));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(bookingsAPI.create).not.toHaveBeenCalled();
});
