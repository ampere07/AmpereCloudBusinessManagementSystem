import React from 'react';
import { Mail, ExternalLink, Edit, ChevronLeft, ChevronRight, Maximize2, X, Info } from 'lucide-react';

interface AdvancePaymentRecord {
  id?: string;
  fullName: string;
  dateTime: string;
  amount: number;
  contactNumber?: string;
  emailAddress?: string;
  plan?: string;
  provider?: string;
  paymentNo?: string;
  paymentDate?: string;
  paymentForMonthOf?: string;
  receivedPayment?: number;
  receivedBy?: string;
  status?: string;
  paymentMethod?: string;
  referenceNo?: string;
  orNo?: string;
}

interface AdvancePaymentDetailsProps {
  advancePaymentRecord: AdvancePaymentRecord;
}

const AdvancePaymentDetails: React.FC<AdvancePaymentDetailsProps> = ({ advancePaymentRecord }) => {
  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <h1 className="text-lg font-semibold text-white truncate pr-4 min-w-0 flex-1">
          {advancePaymentRecord.fullName}
        </h1>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit</span>
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <ChevronRight size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <Maximize2 size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-800">
          <div className="px-5 py-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Full Name</span>
              <span className="text-white">{advancePaymentRecord.fullName}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Contact Number</span>
              <span className="text-white">{advancePaymentRecord.contactNumber || "9564410416"}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Email Address</span>
              <span className="text-white">{advancePaymentRecord.emailAddress || "divinedosdos@gmail.com"}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Plan</span>
              <div className="flex items-center">
                <span className="text-white">{advancePaymentRecord.plan || "SwitchLite - P699"}</span>
                <Info size={16} className="ml-2 text-gray-500" />
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Provider</span>
              <div className="flex items-center">
                <span className="text-white">{advancePaymentRecord.provider || "SWITCH"}</span>
                <Info size={16} className="ml-2 text-gray-500" />
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Payment No.</span>
              <span className="text-white">{advancePaymentRecord.paymentNo || "202407000000000"}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Payment Date</span>
              <span className="text-white">{advancePaymentRecord.paymentDate || advancePaymentRecord.dateTime}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Payment for Month of</span>
              <span className="text-white">{advancePaymentRecord.paymentForMonthOf || "July"}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Received Payment</span>
              <span className="text-white">₱{(advancePaymentRecord.receivedPayment || advancePaymentRecord.amount).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Received By</span>
              <div className="flex items-center">
                <span className="text-white">{advancePaymentRecord.receivedBy || "Cheryll Mae Briones"}</span>
                <Info size={16} className="ml-2 text-gray-500" />
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Status</span>
              <span className="text-white">{advancePaymentRecord.status || "Used"}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Payment Method</span>
              <div className="flex items-center">
                <span className="text-white">{advancePaymentRecord.paymentMethod || "Cash"}</span>
                <Info size={16} className="ml-2 text-gray-500" />
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Reference No.</span>
              <span className="text-white">{advancePaymentRecord.referenceNo || "switchjune0174"}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">OR No.</span>
              <span className="text-white">{advancePaymentRecord.orNo || "switchjune0174"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancePaymentDetails;