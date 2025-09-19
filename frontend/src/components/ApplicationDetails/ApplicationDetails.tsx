import React from 'react';
import { 
  ArrowLeft, ArrowRight, Maximize2, X, Phone, MessageSquare, Info, 
  ExternalLink, Mail, Edit
} from 'lucide-react';

interface ApplicationDetailsProps {
  application: {
    id: string;
    timestamp: string;
    fullName: string;
    assignedEmail: string;
    visitStatus: string;
    applicationStatus: string;
    statusRemarks: string;
    referredBy: string;
    fullAddress: string;
    visitBy: string;
    visitWith: string;
    visitWithOther: string;
    visitRemarks: string;
    modifiedDate: string;
    modifiedBy: string;
    location: string;
    email?: string;
    mobileNumber?: string;
    secondaryMobileNumber?: string;
    desiredPlan?: string;
    governmentId?: string;
    agreementStatus?: string;
    userEmail?: string;
    houseFrontPicture?: string;
    promo?: string;
  };
  onClose: () => void;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ application, onClose }) => {
  // Default values if missing from the application object
  const defaultApplication = {
    ...application,
    email: application.email || 'johndoe@example.com',
    mobileNumber: application.mobileNumber || '9123456789',
    secondaryMobileNumber: application.secondaryMobileNumber || '9987654321',
    desiredPlan: application.desiredPlan || 'SwitchConnect - P799',
    governmentId: application.governmentId || 'https://drive.google.com/open?id=abc123...',
    agreementStatus: application.agreementStatus || 'Yes, I Agree',
    userEmail: application.userEmail || 'admin@amperecloud.com',
    houseFrontPicture: application.houseFrontPicture || 'https://drive.google.com/open?id=xyz789...',
    promo: application.promo || 'New Customer Discount'
  };
  
  return (
    <div className="w-full h-full bg-gray-950 flex flex-col overflow-hidden border-l border-white border-opacity-30">
      {/* Header */}
      <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <h2 className="text-white font-medium">{application.fullName}</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="hover:text-white text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/>
            </svg>
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-sm flex items-center">
            <Edit size={16} className="mr-1" />
            <span>Edit</span>
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
      
      {/* Application Details */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto py-1 px-4 bg-gray-950">
          <div className="space-y-1">
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Timestamp:</div>
              <div className="text-white flex-1">{application.timestamp}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Full Name:</div>
              <div className="text-white flex-1">{application.fullName}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Assigned Email:</div>
              <div className="text-white flex-1 flex items-center">
                {application.assignedEmail}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Mail size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit Status:</div>
              <div className="text-white flex-1">{application.visitStatus}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Application Status:</div>
              <div className="text-white flex-1">{application.applicationStatus}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Status Remarks:</div>
              <div className="text-white flex-1">{application.statusRemarks}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Referred By:</div>
              <div className="text-white flex-1">{application.referredBy}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Full Address:</div>
              <div className="text-white flex-1">{application.fullAddress}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit By:</div>
              <div className="text-white flex-1 flex items-center">
                {application.visitBy}
                <button className="ml-2 text-gray-400">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit With:</div>
              <div className="text-white flex-1 flex items-center">
                {application.visitWith}
                <button className="ml-2 text-gray-400">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit With (Other):</div>
              <div className="text-white flex-1 flex items-center">
                {application.visitWithOther}
                <button className="ml-2 text-gray-400">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit Remarks:</div>
              <div className="text-white flex-1">{application.visitRemarks}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Email:</div>
              <div className="text-white flex-1">{defaultApplication.email}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Mobile Number:</div>
              <div className="text-white flex-1 flex items-center">
                {defaultApplication.mobileNumber}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Phone size={16} />
                </button>
                <button className="text-gray-400 hover:text-white ml-2">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Secondary Mobile Number:</div>
              <div className="text-white flex-1 flex items-center">
                {defaultApplication.secondaryMobileNumber}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Phone size={16} />
                </button>
                <button className="text-gray-400 hover:text-white ml-2">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Desired Plan:</div>
              <div className="text-white flex-1 flex items-center">
                {defaultApplication.desiredPlan}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Government Valid ID:</div>
              <div className="text-white flex-1 truncate flex items-center">
                {defaultApplication.governmentId}
                <button className="text-gray-400 hover:text-white ml-2">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">I agree to the terms and conditions:</div>
              <div className="text-white flex-1">{defaultApplication.agreementStatus}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">User Email:</div>
              <div className="text-white flex-1 flex items-center">
                {defaultApplication.userEmail}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Mail size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">House Front Picture:</div>
              <div className="text-white flex-1 truncate flex items-center">
                {defaultApplication.houseFrontPicture}
                <button className="text-gray-400 hover:text-white ml-2">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Modified Date:</div>
              <div className="text-white flex-1">{application.modifiedDate}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Modified By:</div>
              <div className="text-white flex-1">{application.modifiedBy}</div>
            </div>
            
            <div className="flex py-2">
              <div className="w-40 text-gray-400 text-sm">Select the applicable promo:</div>
              <div className="text-white flex-1">{defaultApplication.promo}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;