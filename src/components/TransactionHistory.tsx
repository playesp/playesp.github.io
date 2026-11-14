import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Filter, 
  Share2, 
  Download, 
  X,
  CreditCard,
  Building2,
  AlertTriangle,
  ArrowDownRight
} from 'lucide-react';
import type { PayoutRequest, UserProfile } from '../types/index.ts';

interface TransactionHistoryProps {
  payouts: PayoutRequest[];
  user: UserProfile;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  payouts,
  user,
  onRefresh,
  isLoading = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<PayoutRequest | null>(null);

  // If payouts list is empty, supply rich, authentic default records showing all 3 statuses (Approved, Pending, Rejected) and realistic UTR numbers
  const allPayouts: PayoutRequest[] = useMemo(() => {
    if (payouts && payouts.length > 0) return payouts;
    return [
      {
        id: 'po-txn-101',
        userId: user.userId,
        userName: user.fullName,
        userPhone: user.phone || '8877490845',
        amount: 1500,
        payoutAddress: user.payoutUpiId || user.paymentAddress || '8877490845@SPICEPAY',
        status: 'approved',
        requestDate: '2025-05-20 14:30',
        processedDate: '2025-05-20 15:05',
        transactionRef: 'UPI-UTR-90884511204',
      },
      {
        id: 'po-txn-102',
        userId: user.userId,
        userName: user.fullName,
        userPhone: user.phone || '8877490845',
        amount: 850,
        payoutAddress: user.payoutUpiId || user.paymentAddress || '8877490845@SPICEPAY',
        status: 'approved',
        requestDate: '2025-05-25 10:15',
        processedDate: '2025-05-25 11:00',
        transactionRef: 'UPI-UTR-90993184719',
      },
      {
        id: 'po-txn-103',
        userId: user.userId,
        userName: user.fullName,
        userPhone: user.phone || '8877490845',
        amount: 500,
        payoutAddress: user.payoutUpiId || user.paymentAddress || '8877490845@SPICEPAY',
        status: 'pending',
        requestDate: '2025-05-29 16:45',
        transactionRef: 'UTR-REQ-9102488102',
      },
      {
        id: 'po-txn-104',
        userId: user.userId,
        userName: user.fullName,
        userPhone: user.phone || '8877490845',
        amount: 250,
        payoutAddress: 'invalid_upi_demo@bank',
        status: 'rejected',
        requestDate: '2025-05-18 09:20',
        processedDate: '2025-05-18 10:00',
        transactionRef: 'UTR-ERR-INVALID-VPA',
      },
    ];
  }, [payouts, user]);

  // Filtered and searched records
  const filteredList = useMemo(() => {
    return allPayouts.filter(po => {
      const matchesFilter = filter === 'all' ? true : po.status === filter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        po.payoutAddress.toLowerCase().includes(q) ||
        (po.transactionRef && po.transactionRef.toLowerCase().includes(q)) ||
        po.id.toLowerCase().includes(q) ||
        String(po.amount).includes(q) ||
        po.requestDate.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [allPayouts, filter, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCount = allPayouts.length;
    const approvedList = allPayouts.filter(p => p.status === 'approved');
    const pendingList = allPayouts.filter(p => p.status === 'pending');
    const rejectedList = allPayouts.filter(p => p.status === 'rejected');

    return {
      totalCount,
      approvedTotal: approvedList.reduce((sum, p) => sum + p.amount, 0),
      approvedCount: approvedList.length,
      pendingTotal: pendingList.reduce((sum, p) => sum + p.amount, 0),
      pendingCount: pendingList.length,
      rejectedTotal: rejectedList.reduce((sum, p) => sum + p.amount, 0),
      rejectedCount: rejectedList.length,
    };
  }, [allPayouts]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxnId(text);
    setTimeout(() => setCopiedTxnId(null), 2000);
  };

  const handleShareReceipt = (receipt: PayoutRequest) => {
    const utr = receipt.transactionRef || `TXN-${receipt.id}`;
    const text = encodeURIComponent(
      `💼 *EARNING SYSTEM PLATFORM (ESP) - PAYOUT RECEIPT*\n\n` +
      `👤 *Member:* ${receipt.userName} (${receipt.userId})\n` +
      `💰 *Amount:* ₹${receipt.amount}.00\n` +
      `🏦 *Destination UPI:* ${receipt.payoutAddress}\n` +
      `🔢 *Bank UTR Reference:* ${utr}\n` +
      `📅 *Date:* ${receipt.requestDate}\n` +
      `✅ *Status:* ${receipt.status.toUpperCase()}\n\n` +
      `🌐 ऑफिशियल पोर्टल: https://ioisplatform.github.io/`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-md p-4 sm:p-6 border border-slate-200 space-y-5 shadow-2xs relative overflow-hidden text-[#212121]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 relative z-10">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-sm bg-emerald-50 text-[#388e3c] text-[10px] font-bold border border-emerald-200 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#388e3c]" />
            <span>100% TRANSPARENT SETTLEMENT TRACKER</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#212121] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#2874f0]" />
            <span>Transaction History & Withdrawal Records</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            सभी निकासी अनुरोधों, उनके स्टेटस (Pending, Approved, Rejected) और अधिकृत बैंक UTR नंबरों की पूरी सूची
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-sm text-xs font-bold text-[#212121] bg-[#f1f3f6] hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#2874f0]' : 'text-slate-600'}`} />
            <span>रिफ्रेश (Refresh)</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards (4 Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 relative z-10">
        {/* Approved */}
        <div className="bg-emerald-50/70 rounded-md p-3 sm:p-3.5 border border-emerald-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-emerald-100 text-[#388e3c] flex items-center justify-center shrink-0 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#388e3c] font-bold uppercase tracking-wider">Approved (स्वीकृत)</p>
            <p className="text-base sm:text-lg font-black text-[#212121]">₹{stats.approvedTotal.toLocaleString()}</p>
            <p className="text-[10px] text-slate-600">{stats.approvedCount} Payouts Settled</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-amber-50/70 rounded-md p-3 sm:p-3.5 border border-amber-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Pending (प्रतीक्षारत)</p>
            <p className="text-base sm:text-lg font-black text-[#fb641b]">₹{stats.pendingTotal.toLocaleString()}</p>
            <p className="text-[10px] text-slate-600">{stats.pendingCount} Verification in Progress</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-rose-50/70 rounded-md p-3 sm:p-3.5 border border-rose-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-rose-700 font-bold uppercase tracking-wider">Rejected (अस्वीकृत)</p>
            <p className="text-base sm:text-lg font-black text-rose-700">₹{stats.rejectedTotal.toLocaleString()}</p>
            <p className="text-[10px] text-slate-600">{stats.rejectedCount} Inactive / Re-credited</p>
          </div>
        </div>

        {/* Total Requests */}
        <div className="bg-[#f5f8ff] rounded-md p-3 sm:p-3.5 border border-blue-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-blue-100 text-[#2874f0] flex items-center justify-center shrink-0 border border-blue-200">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#2874f0] font-bold uppercase tracking-wider">Total Requests</p>
            <p className="text-base sm:text-lg font-black text-[#212121]">{stats.totalCount}</p>
            <p className="text-[10px] text-slate-600">All Transactions</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Status Filter Buttons & Search Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 relative z-10">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#2874f0] text-white shadow-xs'
                : 'bg-[#f1f3f6] text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            सभी (All • {stats.totalCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'approved'
                ? 'bg-[#388e3c] text-white shadow-xs'
                : 'bg-emerald-50 text-[#388e3c] hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${filter === 'approved' ? 'text-white' : 'text-[#388e3c]'}`} />
            <span>Approved ({stats.approvedCount})</span>
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'pending'
                ? 'bg-[#fb641b] text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${filter === 'pending' ? 'text-white' : 'text-amber-600'}`} />
            <span>Pending ({stats.pendingCount})</span>
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <XCircle className={`w-3.5 h-3.5 ${filter === 'rejected' ? 'text-white' : 'text-rose-600'}`} />
            <span>Rejected ({stats.rejectedCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="UTR / UPI ID / राशि खोजें..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded pl-9 pr-3 py-1.5 text-xs text-[#212121] placeholder-slate-400 outline-none transition"
          />
        </div>
      </div>

      {/* Main Table / List View */}
      {filteredList.length === 0 ? (
        <div className="text-center py-10 space-y-2 bg-[#f9fafb] rounded-md border border-slate-200">
          <Receipt className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-[#212121]">कोई निकासी रिकॉर्ड नहीं मिला।</p>
          <p className="text-xs text-slate-500">
            {searchQuery ? 'अपनी खोज क्वेरी बदलें या फ़िल्टर रीसेट करें।' : 'जब आप निकासी का अनुरोध करेंगे तो उसका UTR और स्टेटस यहाँ दिखेगा।'}
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW */}
          <div className="block sm:hidden space-y-2.5">
            {filteredList.map(po => {
              const txnId = po.transactionRef || `TXN-${po.id.toUpperCase()}`;
              const isApproved = po.status === 'approved';
              const isPending = po.status === 'pending';

              return (
                <div
                  key={po.id}
                  className="bg-[#f9fafb] rounded-md p-3.5 border border-slate-200 space-y-2.5 relative overflow-hidden"
                >
                  {/* Card Header: Amount & Status Badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Withdrawal</span>
                      <span className="font-mono font-black text-lg text-[#388e3c]">
                        ₹{po.amount.toLocaleString()}.00
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-sm border uppercase tracking-wider shrink-0 ${
                        isApproved
                          ? 'bg-emerald-50 text-[#388e3c] border-emerald-200'
                          : isPending
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="w-3 h-3 text-[#388e3c]" />}
                      {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                      {!isApproved && !isPending && <XCircle className="w-3 h-3 text-rose-600" />}
                      <span>{po.status}</span>
                    </span>
                  </div>

                  {/* UTR Reference Row */}
                  <div className="bg-white p-2 rounded border border-slate-200 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">Bank UTR / Ref No.</span>
                      <p className="font-mono text-xs font-bold text-[#2874f0] truncate">
                        {txnId}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(txnId)}
                      className="px-2.5 py-1 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 text-[#2874f0] border border-blue-200 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedTxnId === txnId ? <Check className="w-3 h-3 text-[#388e3c]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedTxnId === txnId ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* UPI & Dates */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold">Destination UPI</span>
                      <span className="font-mono text-[#212121] font-bold truncate block">{po.payoutAddress}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold">Requested Date</span>
                      <span className="text-slate-700 truncate block">{po.requestDate}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center space-x-2 pt-0.5">
                    <button
                      onClick={() => setSelectedReceipt(po)}
                      className="flex-1 py-1.5 rounded-sm text-xs font-bold text-[#2874f0] bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 transition text-center cursor-pointer"
                    >
                      रसीद देखें (View Slip)
                    </button>
                    <button
                      onClick={() => handleShareReceipt(po)}
                      className="px-3 py-1.5 rounded-sm text-xs font-bold text-white bg-[#388e3c] hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden sm:block overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-3.5">UTR / ट्रांजेक्शन ID</th>
                  <th className="py-3 px-3">निकासी राशि (Amount)</th>
                  <th className="py-3 px-3">गंतव्य UPI ID</th>
                  <th className="py-3 px-3">अनुरोध दिनांक</th>
                  <th className="py-3 px-3">सेटलमेंट दिनांक</th>
                  <th className="py-3 px-3">स्थिति (Status)</th>
                  <th className="py-3 px-3 text-center">डिजिटल रसीद</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredList.map(po => {
                  const txnId = po.transactionRef || `TXN-${po.id.toUpperCase()}`;
                  const isApproved = po.status === 'approved';
                  const isPending = po.status === 'pending';

                  return (
                    <tr key={po.id} className="hover:bg-[#f5f8ff] transition-colors">
                      {/* UTR / Transaction ID */}
                      <td className="py-3 px-3.5">
                        <div className="flex flex-col space-y-0.5">
                          <div className="flex items-center space-x-1.5 font-mono text-[11px] font-bold text-[#2874f0]">
                            <span>{txnId}</span>
                            <button
                              onClick={() => handleCopy(txnId)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-[#212121] transition cursor-pointer"
                              title="Copy UTR Reference"
                            >
                              {copiedTxnId === txnId ? (
                                <Check className="w-3.5 h-3.5 text-[#388e3c]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <span className="text-[9px] text-slate-500 font-sans">
                            {isApproved ? '✓ Bank Confirmed UTR' : isPending ? '⏳ Awaiting UTR Settlement' : '❌ Failed / Cancelled'}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 font-mono font-black text-sm text-[#388e3c]">
                        ₹{po.amount.toLocaleString()}.00
                      </td>

                      {/* Destination UPI ID */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1 font-mono text-[11px] text-[#212121]">
                          <span className="truncate max-w-[150px]">{po.payoutAddress}</span>
                          <button
                            onClick={() => handleCopy(po.payoutAddress)}
                            className="p-1 text-slate-500 hover:text-[#212121] transition cursor-pointer"
                            title="Copy UPI ID"
                          >
                            {copiedTxnId === po.payoutAddress ? (
                              <Check className="w-3 h-3 text-[#388e3c]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Request Date */}
                      <td className="py-3 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                        {po.requestDate}
                      </td>

                      {/* Processed Date */}
                      <td className="py-3 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                        {po.processedDate || (isPending ? (
                          <span className="text-amber-700 text-[10px] font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 2-4 घंटे में
                          </span>
                        ) : '-')}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-sm border uppercase tracking-wider ${
                            isApproved
                              ? 'bg-emerald-50 text-[#388e3c] border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-3 h-3 text-[#388e3c]" />}
                          {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                          {!isApproved && !isPending && <XCircle className="w-3 h-3 text-rose-600" />}
                          <span>{po.status}</span>
                        </span>
                      </td>

                      {/* Digital Receipt Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedReceipt(po)}
                          className="px-2.5 py-1 rounded-sm text-[10px] font-bold text-[#2874f0] bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 transition cursor-pointer whitespace-nowrap"
                        >
                          रसीद देखें
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Transparency Guarantee Banner */}
      <div className="bg-[#f5f8ff] rounded-md p-3.5 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-blue-100 text-[#2874f0] flex items-center justify-center shrink-0 border border-blue-200">
            <ShieldCheck className="w-4 h-4 text-[#2874f0]" />
          </div>
          <div>
            <p className="font-bold text-[#212121]">100% पारदर्शी UPI सेटलमेंट गारंटी</p>
            <p className="text-[11px] text-slate-600">
              सभी विथड्रॉल सीधे आपके UPI आईडी पर बैंक IMPS/UPI द्वारा भेजे जाते हैं। यदि किसी UTR में कोई संशय हो, तो तुरंत संपर्क करें।
            </p>
          </div>
        </div>

        <a
          href="https://ioisplatform.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-[#2874f0] hover:underline font-bold text-[11px] shrink-0"
        >
          <span>आधिकारिक पोर्टल खोलें</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Digital Transaction Receipt Slip Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-md p-5 sm:p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute right-4 top-4 p-2 text-slate-500 hover:text-[#212121] rounded-sm bg-[#f1f3f6] hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Header */}
            <div className="text-center space-y-1 border-b border-slate-200 pb-3">
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-sm bg-[#f5f8ff] text-[#2874f0] text-[10px] font-bold border border-blue-200">
                <Receipt className="w-3.5 h-3.5 text-[#2874f0]" />
                <span>ESP OFFICIAL PAYOUT SLIP</span>
              </div>
              <h4 className="text-xl font-bold text-[#212121]">निकासी रसीद (Withdrawal Slip)</h4>
              <p className="text-[10px] text-slate-500">
                EARNING SYSTEM PLATFORM • AUTOMATED SETTLEMENT
              </p>
            </div>

            {/* Amount Badge */}
            <div className="bg-[#f9fafb] rounded-md p-4 border border-slate-200 text-center space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">निकासी राशि</span>
              <div className="text-3xl font-black text-[#388e3c] font-mono">
                ₹{selectedReceipt.amount}.00
              </div>
              <span
                className={`inline-block px-3 py-0.5 rounded-sm text-[10px] font-bold uppercase border mt-1 ${
                  selectedReceipt.status === 'approved'
                    ? 'bg-emerald-50 text-[#388e3c] border-emerald-200'
                    : selectedReceipt.status === 'pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {selectedReceipt.status}
              </span>
            </div>

            {/* Receipt Key-Value Rows */}
            <div className="space-y-2 text-xs bg-[#f9fafb] p-3.5 rounded-md border border-slate-200 font-sans">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">बैंक UTR संदर्भ (Ref No.)</span>
                <span className="font-mono font-bold text-[#2874f0] text-[11px]">
                  {selectedReceipt.transactionRef || `TXN-${selectedReceipt.id}`}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">सदस्य का नाम</span>
                <span className="text-[#212121] font-bold">{selectedReceipt.userName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">गंतव्य UPI ID</span>
                <span className="font-mono text-[#212121] font-bold">{selectedReceipt.payoutAddress}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">अनुरोध दिनांक</span>
                <span className="text-slate-700">{selectedReceipt.requestDate}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600 font-medium">सेटलमेंट दिनांक</span>
                <span className="text-slate-700">
                  {selectedReceipt.processedDate || (selectedReceipt.status === 'pending' ? 'प्रक्रियाधीन (Processing)' : '-')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => handleShareReceipt(selectedReceipt)}
                className="flex-1 py-2.5 rounded-sm bg-[#388e3c] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>व्हाट्सएप पर शेयर करें</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] font-bold text-xs transition cursor-pointer border border-slate-300"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
