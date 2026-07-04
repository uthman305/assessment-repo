import { useEffect, useState } from 'react';
import type { PointsBalance } from '../types';
import { getBalance, redeemPoints } from '../api/client';
import './RewardsPage.css';

interface RewardsPageProps {
  userId: string;
}

const ACTION_LABELS: Record<string, string> = {
  'check-in': 'Checked in',
  review: 'Left a review',
  referral: 'Referred a friend',
  redeem: 'Redeemed voucher',
};

export function RewardsPage({ userId }: RewardsPageProps) {
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState(50);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getBalance(userId)
      .then(setBalance)
      .finally(() => setLoading(false));
  };

  useEffect(load, [userId]);

  const handleRedeem = async () => {
    setRedeeming(true);
    setRedeemError(null);
    setVoucherCode(null);
    try {
      const result = await redeemPoints({ userId, points: redeemAmount });
      setVoucherCode(result.voucherCode);
      load();
    } catch (err: any) {
      setRedeemError(err.message ?? 'Redemption failed');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return <p className="discover__empty">Loading your rewards…</p>;
  }

  if (!balance) {
    return <p className="discover__error">Couldn't load your rewards balance.</p>;
  }

  return (
    <div className="rewards">
      <div className="rewards__balance-card">
        <span className="rewards__balance-label">Your points balance</span>
        <span className="rewards__balance-value">{balance.balance.toLocaleString()}</span>
        <span className="rewards__balance-hint">≈ ₦{(balance.balance * 10).toLocaleString()} in vouchers</span>
      </div>

      <div className="rewards__redeem-card">
        <h3>Redeem a voucher</h3>
        <p className="rewards__redeem-hint">Redeem in multiples of 50 points (50 points = ₦500 off).</p>
        <div className="rewards__redeem-controls">
          <select value={redeemAmount} onChange={(e) => setRedeemAmount(Number(e.target.value))}>
            {[50, 100, 150, 200, 250, 300].map((amt) => (
              <option key={amt} value={amt}>
                {amt} points → ₦{amt * 10} off
              </option>
            ))}
          </select>
          <button
            className="btn btn--secondary"
            onClick={handleRedeem}
            disabled={redeeming || redeemAmount > balance.balance}
          >
            {redeeming ? 'Redeeming…' : 'Redeem'}
          </button>
        </div>
        {redeemAmount > balance.balance && (
          <p className="discover__error">You don't have enough points for that yet.</p>
        )}
        {redeemError && <p className="discover__error">{redeemError}</p>}
        {voucherCode && (
          <p className="rewards__voucher">
            🎉 Voucher code: <strong>{voucherCode}</strong>
          </p>
        )}
      </div>

      <h3 className="rewards__history-title">Transaction history</h3>
      <ul className="rewards__history">
        {balance.history.length === 0 && <p className="discover__empty">No transactions yet.</p>}
        {balance.history.map((tx) => (
          <li key={tx.id} className="rewards__history-item">
            <span>{ACTION_LABELS[tx.action] ?? tx.action}</span>
            <span className={tx.points >= 0 ? 'rewards__points-positive' : 'rewards__points-negative'}>
              {tx.points >= 0 ? '+' : ''}
              {tx.points}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
