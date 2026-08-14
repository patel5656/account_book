import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, X } from 'lucide-react';
import apiClient from '../api/apiClient';

export function Gstr3bSummary() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('This Month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRangeStr, setDateRangeStr] = useState('');
  const [isCustomRangeModalOpen, setIsCustomRangeModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchSummary = async (selectedPeriod, customStart, customEnd) => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      if (selectedPeriod === 'Last Month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      } else if (selectedPeriod === 'This Quarter') {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
        endDate = new Date(now.getFullYear(), quarterMonth + 3, 0);
      } else if (selectedPeriod === 'Last Quarter') {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3 - 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
        endDate = new Date(now.getFullYear(), quarterMonth + 3, 0);
      } else if (selectedPeriod === 'Custom Range' && customStart && customEnd) {
        startDate = new Date(customStart);
        endDate = new Date(customEnd);
      }

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      setDateRangeStr(`${startDate.toLocaleDateString('en-GB', options).replace(/ /g, '-')} to ${endDate.toLocaleDateString('en-GB', options).replace(/ /g, '-')}`);

      const res = await apiClient.get(`/gstr/gstr-3b?startDate=${startStr}&endDate=${endStr}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching GSTR-3B summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(period && period !== 'Custom Range' && period !== 'Select') {
        fetchSummary(period);
    }
  }, [period]);

  const formatNumber = (num) => (num || 0).toFixed(2);

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] p-4 flex flex-col relative pb-[80px]">
      
      {/* Top Control */}
      <div className="mb-4 flex flex-col gap-1.5 w-full sm:max-w-[250px]">
        <label className="text-[13px] font-bold text-gray-800">Select Period</label>
        <select 
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            if (e.target.value === 'Custom Range') {
              setIsCustomRangeModalOpen(true);
            }
          }}
          className="h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white"
        >
          <option value="">Select</option>
          <option value="This Month">This Month</option>
          <option value="Last Month">Last Month</option>
          <option value="This Quarter">This Quarter</option>
          <option value="Last Quarter">Last Quarter</option>
          <option value="Custom Range">Custom Range</option>
        </select>
      </div>

      {/* Main Card */}
      <div className="bg-white shadow-sm border border-gray-200 w-full overflow-hidden">
        
        {/* Header */}
        <div className="text-center py-4">
          <h2 className="text-[18px] text-gray-800 mb-1">GSTR-3B</h2>
          <p className="text-[13px] text-gray-600">Period: {dateRangeStr || 'Select a period'}</p>
        </div>

        {/* Content Portions */}
        <div className="px-4 pb-4 w-full">

          {/* Section 3.1 */}
          <div className="mb-4">
            <div className="bg-[#4F46E5] text-white text-center py-1.5 text-[13px] font-bold border border-[#4F46E5]">
              3.1 Details of Outward Supplies and inward supplies liable to reverse charge
            </div>
            <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-center">
              <thead>
                <tr className="bg-[#4F46E5] text-white">
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold whitespace-nowrap">Name of Supplies</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold leading-tight whitespace-nowrap">Total Taxable<br/>Value</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold whitespace-nowrap">IGST</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold whitespace-nowrap">CGST</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold whitespace-nowrap">SGST/UT TAX</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold whitespace-nowrap">Cess</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(a) Outward taxable supplies (other than zero rated, Nil Rated and exempted)</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.a?.taxable)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.a?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.a?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.a?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.a?.cess)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(b) Outward taxable supplies (zero rated)</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.b?.taxable)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.b?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.b?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.b?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.b?.cess)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(c) Other Outward supplies (Nil Rated, exempted)</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.c?.taxable)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.c?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.c?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.c?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.c?.cess)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(d) Inward supplies (liable to reverse charge)</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.d?.taxable)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.d?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.d?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.d?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.d?.cess)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(e) Non-GST Outward supplies</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.e?.taxable)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.e?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.e?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.e?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.e?.cess)}</td>
                </tr>
                <tr className="bg-[#d1ecf1]">
                  <td className="py-1.5 px-3 border border-[#bee5eb] text-[12px] font-bold text-gray-800 text-center uppercase">TOTAL</td>
                  <td className="py-1.5 px-3 border border-[#bee5eb] text-[12px] font-bold text-gray-800">{formatNumber(data?.s31?.total?.taxable)}</td>
                  <td className="py-1.5 px-3 border border-[#bee5eb] text-[12px] font-bold text-gray-800">{formatNumber(data?.s31?.total?.igst)}</td>
                  <td className="py-1.5 px-3 border border-[#bee5eb] text-[12px] font-bold text-gray-800">{formatNumber(data?.s31?.total?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-[#bee5eb] text-[12px] font-bold text-gray-800">{formatNumber(data?.s31?.total?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-[#bee5eb] text-[12px] font-bold text-gray-800">{formatNumber(data?.s31?.total?.cess)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>

          {/* Section 3.2 */}
          <div className="mb-4">
            <div className="bg-[#4F46E5] text-white text-center py-1.5 text-[13px] font-bold border border-[#4F46E5]">
              3.2 Of the supplies shown in 3.1(a) above, details of inter-State supplies made to unregistered persons, composition taxable persons and UIN holders
            </div>
            <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-center">
              <thead>
                <tr className="bg-[#4F46E5] text-white">
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-1/3 whitespace-nowrap">Place of Supplies</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-1/3 whitespace-nowrap">Total Taxable Value</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-1/3 whitespace-nowrap">Amount of IGST</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">Inter-State</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.a?.taxable)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s31?.a?.igst)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>

          {/* Section 4 */}
          <div className="mb-4">
            <div className="bg-[#4F46E5] text-white text-center py-1.5 text-[13px] font-bold border border-[#4F46E5]">
              4 Eligible ITC
            </div>
            <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-center">
              <thead>
                <tr className="bg-[#4F46E5] text-white">
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[40%] whitespace-nowrap">Details</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[15%] whitespace-nowrap">IGST</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[15%] whitespace-nowrap">CGST</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[15%] whitespace-nowrap">SGST/UT TAX</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[15%] whitespace-nowrap">Cess</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(A) ITC available supplies (whether in full or apart)</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800"></td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800"></td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800"></td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800"></td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(1) Import of Goods</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.importOfGoods?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.importOfGoods?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.importOfGoods?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.importOfGoods?.cess)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(2) Import of Services</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.importOfServices?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.importOfServices?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.importOfServices?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.importOfServices?.cess)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(3) Inward supplies liable to reverse charge (other 1 & 2 above)</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.inwardReverseCharge?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.inwardReverseCharge?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.inwardReverseCharge?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.inwardReverseCharge?.cess)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(4) Inward supplies from ISD</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.inwardIsd?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.inwardIsd?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.inwardIsd?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.inwardIsd?.cess)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(5) All other ITC</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.allOtherItc?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.allOtherItc?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.allOtherItc?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.allOtherItc?.cess)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(B) ITC Reversed</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.itcReversed?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.itcReversed?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.itcReversed?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.itcReversed?.cess)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">(C) Net ITC available(A)-(B)</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.netItc?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.netItc?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.netItc?.sgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s4?.netItc?.cess)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>

          {/* Section 5 */}
          <div className="mb-4">
            <div className="bg-[#4F46E5] text-white text-center py-1.5 text-[13px] font-bold border border-[#4F46E5]">
              5 Values of exempt, nil-rated and non-GST inward supplies
            </div>
            <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-center">
              <thead>
                <tr className="bg-[#4F46E5] text-white">
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[50%] whitespace-nowrap">Nature of Supplies</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[25%] whitespace-nowrap">Inter-State supplies</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[25%] whitespace-nowrap">Intra-State supplies</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">From a supplier under composition scheme, Exempt and Nil rated supply</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s5?.compositionExemptNil?.inter)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s5?.compositionExemptNil?.intra)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">Non GST supply</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s5?.nonGst?.inter)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s5?.nonGst?.intra)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>

          {/* Section 6.1 */}
          <div className="mb-4">
            <div className="bg-[#4F46E5] text-white text-center py-1.5 text-[13px] font-bold border border-[#4F46E5]">
              6.1 Payment of Tax
            </div>
            <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-center">
              <thead>
                <tr className="bg-[#4F46E5] text-white">
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[12.5%] whitespace-nowrap" rowSpan="2">Description</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[12.5%] whitespace-nowrap" rowSpan="2">Tax Payable</th>
                  <th className="py-1 px-3 border border-gray-200 text-[12px] font-bold whitespace-nowrap" colSpan="4">Paid through ITC</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[12.5%] whitespace-nowrap" rowSpan="2">Tax Paid<br/>TDS/TCS</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[12.5%] whitespace-nowrap" rowSpan="2">Tax/Cess<br/>paid in cash</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[10%] whitespace-nowrap" rowSpan="2">Interest</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[10%] whitespace-nowrap" rowSpan="2">Late<br/>Fee</th>
                </tr>
                <tr className="bg-[#4F46E5] text-white">
                  <th className="py-1 px-2 border border-gray-200 text-[11px] font-bold leading-tight whitespace-nowrap">Integrated<br/>Tax</th>
                  <th className="py-1 px-2 border border-gray-200 text-[11px] font-bold leading-tight whitespace-nowrap">CGST</th>
                  <th className="py-1 px-2 border border-gray-200 text-[11px] font-bold leading-tight whitespace-nowrap">SGST/UT<br/>TAX</th>
                  <th className="py-1 px-2 border border-gray-200 text-[11px] font-bold leading-tight whitespace-nowrap">Cess</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">IGST</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.igst?.taxPayable)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.igst?.itcIgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.igst?.itcCgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.igst?.itcSgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.igst?.itcCess)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.igst?.tdsTcs)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.igst?.cashPaid)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.igst?.interest)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.igst?.lateFee)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">CGST</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cgst?.taxPayable)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cgst?.itcIgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cgst?.itcCgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cgst?.itcSgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cgst?.itcCess)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cgst?.tdsTcs)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cgst?.cashPaid)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cgst?.interest)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cgst?.lateFee)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">SGST/UT TAX</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.sgst?.taxPayable)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.sgst?.itcIgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.sgst?.itcCgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.sgst?.itcSgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.sgst?.itcCess)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.sgst?.tdsTcs)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.sgst?.cashPaid)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.sgst?.interest)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.sgst?.lateFee)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">Cess</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cess?.taxPayable)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cess?.itcIgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cess?.itcCgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cess?.itcSgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cess?.itcCess)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cess?.tdsTcs)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cess?.cashPaid)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cess?.interest)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.s61?.cess?.lateFee)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>

          {/* Section 6.1 TDS/TCS Credit */}
          <div>
            <div className="bg-[#4F46E5] text-white text-center py-1.5 text-[13px] font-bold border border-[#4F46E5]">
              6.1 TDS/TCS Credit
            </div>
            <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-center">
              <thead>
                <tr className="bg-[#4F46E5] text-white">
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[40%] whitespace-nowrap">Details</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[20%] whitespace-nowrap">IGST</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[20%] whitespace-nowrap">CGST</th>
                  <th className="py-2 px-3 border border-gray-200 text-[12px] font-bold w-[20%] whitespace-nowrap">SGST/UT TAX</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">TDS</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.tdsTcs?.tds?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.tdsTcs?.tds?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.tdsTcs?.tds?.sgst)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-700 text-center">TCS</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.tdsTcs?.tcs?.igst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.tdsTcs?.tcs?.cgst)}</td>
                  <td className="py-1.5 px-3 border border-gray-200 text-[12px] text-gray-800">{formatNumber(data?.tdsTcs?.tcs?.sgst)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>

        </div>
      </div>

      {/* Custom Range Modal */}
      {isCustomRangeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-[450px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-[#4F46E5] flex items-center justify-between pl-4 pr-1 py-1.5">
              <h2 className="text-[15px] text-white font-medium">Select Date Range</h2>
              <button 
                onClick={() => setIsCustomRangeModalOpen(false)}
                className="text-[#dc3545] hover:text-[#c82333] transition-colors p-1"
              >
                <X className="w-6 h-6 stroke-[3px]" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[14px] font-bold text-gray-800">From Date</label>
                  <input 
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] outline-none focus:border-blue-500 bg-[#a6cdec]"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[14px] font-bold text-gray-800">To Date</label>
                  <input 
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white px-5 py-3 flex justify-end gap-2 border-t border-gray-100">
              <button 
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    setIsCustomRangeModalOpen(false);
                    fetchSummary('Custom Range', customStartDate, customEndDate);
                  } else {
                    alert("Please select both dates");
                  }
                }}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="absolute bottom-0 left-0 bg-transparent p-4 flex justify-start pl-6">
        <button 
          onClick={() => window.print()}
          className="bg-[#6c757d] hover:bg-[#5a6268] text-white text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

    </div>
  );
}
