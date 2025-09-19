import React from 'react';
import { 
  ArrowLeft, ArrowRight, Maximize2, X, Phone, MessageSquare, Info, 
  ExternalLink, Mail, Edit
} from 'lucide-react';

interface JobOrderDetailsProps {
  jobOrder: {
    id: string;
    timestamp: string;
    clientName: string;
    clientAddress: string;
    onsiteStatus: string;
    billingStatus: string;
    statusRemarks: string;
    assignedEmail: string;
    contractTemplate: string;
    billingDay: string;
    installationFee: string;
    modifiedBy: string;
    modifiedDate: string;
    contactNumber?: string;
    secondContactNumber?: string;
    applicantEmail?: string;
    barangay?: string;
    city?: string;
    choosePlan?: string;
    status?: string;
    remarks?: string;
    installationLandmark?: string;
    provider?: string;
    contractLink?: string;
    username?: string;
    referredBy?: string;
  };
  onClose: () => void;
}

const JobOrderDetails: React.FC<JobOrderDetailsProps> = ({ jobOrder, onClose }) => {
  // Default values if missing from the job order object
  const defaultJobOrder = {
    ...jobOrder,
    contactNumber: jobOrder.contactNumber || '9107632537',
    secondContactNumber: jobOrder.secondContactNumber || '9709295892',
    applicantEmail: jobOrder.applicantEmail || 'john.doe@example.com',
    barangay: jobOrder.barangay || 'Sample Barangay',
    city: jobOrder.city || 'Sample City',
    choosePlan: jobOrder.choosePlan || 'SwitchNet - P999',
    status: jobOrder.status || 'Confirmed',
    remarks: jobOrder.remarks || 'Sample remarks',
    installationLandmark: jobOrder.installationLandmark || '1ZIA1KjEkZ-h8tg8kVa37fE5YDKY9gLET',
    provider: jobOrder.provider || 'SWITCH',
    contractLink: jobOrder.contractLink || '1HU1-pHtYl0cNMAnRDKGfMrw0CWZJtMt/view?usp=sharing',
    username: jobOrder.username || 'user0918251440',
    referredBy: jobOrder.referredBy || 'Jane Smith'
  };

  // Helper function for status text color
  const getStatusColor = (status: string, type: 'onsite' | 'billing') => {
    if (type === 'onsite') {
      switch (status) {
        case 'done':
          return 'text-green-500';
        case 'reschedule':
          return 'text-blue-500';
        case 'inProgress':
          return 'text-yellow-500';
        case 'failed':
          return 'text-red-500';
        default:
          return 'text-gray-400';
      }
    } else {
      switch (status) {
        case 'done':
          return 'text-green-500';
        case 'pending':
          return 'text-yellow-500';
        default:
          return 'text-gray-400';
      }
    }
  };
  
  return (
    <div className="w-full h-full bg-gray-950 flex flex-col overflow-hidden border-l border-white border-opacity-30">
      {/* Header */}
      <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <h2 className="text-white font-medium">{jobOrder.clientName}</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-gray-800 hover:bg-gray-700 text-white p-1 rounded-sm border border-gray-700 flex items-center justify-center">
            <X size={16} />
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white p-1 rounded-sm border border-gray-700 flex items-center justify-center">
            <ExternalLink size={16} />
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-sm flex items-center">
            <span>Done</span>
          </button>
          <button className="hover:text-white text-gray-400"><ArrowLeft size={16} /></button>
          <button className="hover:text-white text-gray-400"><ArrowRight size={16} /></button>
          <button className="hover:text-white text-gray-400"><Maximize2 size={16} /></button>
          <button 
            onClick={onClose}
            className="hover:text-white text-gray-400"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="bg-gray-900 py-3 border-b border-gray-700 flex items-center justify-center px-4">
        <button className="flex flex-col items-center text-center p-2 rounded-md">
          <div className="bg-orange-600 p-2 rounded-full">
            <div className="text-white">
              <Edit size={18} />
            </div>
          </div>
          <span className="text-xs mt-1 text-gray-300">Edit</span>
        </button>
      </div>
      
      {/* Job Order Details */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-6 px-4 bg-gray-950">
          <div className="space-y-4">
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Timestamp:</div>
              <div className="text-white flex-1">{jobOrder.timestamp}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Billing Status:</div>
              <div className={`${getStatusColor(jobOrder.billingStatus, 'billing')} flex-1 capitalize`}>
                {jobOrder.billingStatus}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Billing Day:</div>
              <div className="text-white flex-1">{defaultJobOrder.billingDay}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Installation Fee:</div>
              <div className="text-white flex-1">{jobOrder.installationFee}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Referred By:</div>
              <div className="text-white flex-1">{defaultJobOrder.referredBy}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Full Name of Client:</div>
              <div className="text-white flex-1">{jobOrder.clientName}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Full Address of Client:</div>
              <div className="text-white flex-1">{jobOrder.clientAddress}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Contact Number:</div>
              <div className="text-white flex-1 flex items-center">
                {defaultJobOrder.contactNumber}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Phone size={16} />
                </button>
                <button className="text-gray-400 hover:text-white ml-2">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Second Contact Number:</div>
              <div className="text-white flex-1 flex items-center">
                {defaultJobOrder.secondContactNumber}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Phone size={16} />
                </button>
                <button className="text-gray-400 hover:text-white ml-2">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Applicant Email Address:</div>
              <div className="text-white flex-1 flex items-center">
                {defaultJobOrder.applicantEmail}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Mail size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Barangay:</div>
              <div className="text-white flex-1">{defaultJobOrder.barangay}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">City:</div>
              <div className="text-white flex-1">{defaultJobOrder.city}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Choose Plan:</div>
              <div className="text-white flex-1 flex items-center">
                {defaultJobOrder.choosePlan}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Status:</div>
              <div className="text-white flex-1">{defaultJobOrder.status}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Remarks:</div>
              <div className="text-white flex-1">{defaultJobOrder.remarks}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Installation Landmark:</div>
              <div className="text-white flex-1">{defaultJobOrder.installationLandmark}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Provider:</div>
              <div className="text-white flex-1">{defaultJobOrder.provider}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Onsite Status:</div>
              <div className={`${getStatusColor(jobOrder.onsiteStatus, 'onsite')} flex-1 capitalize`}>
                {jobOrder.onsiteStatus === 'inProgress' ? 'In Progress' : jobOrder.onsiteStatus}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Contract Link:</div>
              <div className="text-white flex-1 truncate flex items-center">
                {defaultJobOrder.contractLink}
                <button className="text-gray-400 hover:text-white ml-2">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Username:</div>
              <div className="text-white flex-1">{defaultJobOrder.username}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Modified By:</div>
              <div className="text-white flex-1">{jobOrder.modifiedBy}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Modified Date:</div>
              <div className="text-white flex-1">{jobOrder.modifiedDate}</div>
            </div>
            
            <div className="flex pb-4">
              <div className="w-40 text-gray-400 text-sm">Assigned Email:</div>
              <div className="text-white flex-1">{jobOrder.assignedEmail}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOrderDetails;