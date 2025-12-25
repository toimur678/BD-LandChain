import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useApp } from '../context/AppContext';

const mockAddress = '0xAbCDEF1234567890';

// Minimal mock for window.ethereum so connectWallet succeeds without a real wallet
Object.defineProperty(window, 'ethereum', {
  value: {
    request: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  },
  writable: true,
});

vi.mock('ethers', async () => {
  const actual = await vi.importActual<typeof import('ethers')>('ethers');

  class MockProvider {
    async getNetwork() {
      return { chainId: 11155111 };
    }
    async getSigner() {
      return {
        getAddress: async () => mockAddress,
      };
    }
    async getBalance() {
      return BigInt(1e18); // 1 ETH in wei
    }
  }

  class MockContract {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_address: string, _abi: any, _provider: any) {}
    async getLandCount() {
      return 0n;
    }
  }

  return {
    ...actual,
    ethers: {
      ...actual.ethers,
      BrowserProvider: MockProvider,
      Contract: MockContract,
      formatEther: (wei: bigint | number) => {
        const value = typeof wei === 'bigint' ? Number(wei) : wei;
        return (value / 1e18).toString();
      },
    },
  };
});

const TestConsumer: React.FC = () => {
  const { wallet, language, toggleLanguage } = useApp();
  return (
    <div>
      <div>wallet-address:{wallet.address ?? 'none'}</div>
      <div>lang:{language}</div>
      <button onClick={toggleLanguage}>toggle</button>
    </div>
  );
};

describe('AppContext', () => {
  it('connects wallet on mount and sets address', async () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    await waitFor(() =>
      expect(screen.getByText(/wallet-address:/i).textContent).toContain(mockAddress)
    );
  });

  it('toggles language between en and tr', async () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    expect(screen.getByText(/lang:/i).textContent).toContain('en');
    await userEvent.click(screen.getByText('toggle'));
    expect(screen.getByText(/lang:/i).textContent).toContain('tr');
  });
});
