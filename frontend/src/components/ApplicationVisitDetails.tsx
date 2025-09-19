import React from 'react';
import { 
  ArrowLeft, ArrowRight, Maximize2, X, Phone, MessageSquare, Info, 
  ExternalLink, Mail, Edit, Trash2, ArrowRightToLine, Trash, XOctagon, RotateCw
} from 'lucide-react';

interface ApplicationVisitDetailsProps {
  applicationVisit: {
    id: string;
    fullName: string;
    timestamp: string;
    referredBy: string;
    contactNumber: string;
    secondContactNumber: string;
    applicantEmail: string;
    fullAddress: string;
    choosePlan: string;
    remarks: string;
    installationLandmark: string;
    assignedEmail: string;
    applicationStatus: string;
    modifiedBy: string;
    modifiedDate: string;
  };
  onClose: () => void;
}

const ApplicationVisitDetails: React.FC<ApplicationVisitDetailsProps> = ({ applicationVisit, onClose }) => {
  return (
    <div className="w-full h-full bg-gray-950 flex flex-col overflow-hidden border-l border-white border-opacity-30">
      {/* Header */}
      <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <h2 className="text-white font-medium">{applicationVisit.fullName}</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="hover:text-white text-gray-400">
            <Trash2 size={16} />
          </button>
          <button className="hover:text-white text-gray-400">
            <ArrowRightToLine size={16} />
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-sm flex items-center">
            <Edit size={16} className="mr-1" />
            <span>Visit Status</span>
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
      
      {/* Status Buttons */}
      <div className="bg-gray-900 py-4 border-b border-gray-700 flex items-center justify-center space-x-8">
        <button className="flex flex-col items-center text-center">
          <div className="bg-orange-600 p-3 rounded-full">
            <Trash className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">Clear Status</span>
        </button>
        
        <button className="flex flex-col items-center text-center">
          <div className="bg-orange-600 p-3 rounded-full">
            <XOctagon className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">Failed</span>
        </button>
        
        <button className="flex flex-col items-center text-center">
          <div className="bg-orange-600 p-3 rounded-full">
            <RotateCw className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">Visit In Progress</span>
        </button>
      </div>
      
      {/* Application Visit Details */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto py-1 px-4 bg-gray-950">
          <div className="space-y-1">
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Timestamp</div>
              <div className="text-white flex-1">{applicationVisit.timestamp}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Referred By:</div>
              <div className="text-white flex-1">{applicationVisit.referredBy}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Full Name</div>
              <div className="text-white flex-1">{applicationVisit.fullName}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Contact Number</div>
              <div className="text-white flex-1 flex items-center">
                {applicationVisit.contactNumber}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Phone size={16} />
                </button>
                <button className="text-gray-400 hover:text-white ml-2">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Second Contact Number</div>
              <div className="text-white flex-1 flex items-center">
                {applicationVisit.secondContactNumber}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Phone size={16} />
                </button>
                <button className="text-gray-400 hover:text-white ml-2">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Applicant Email Address</div>
              <div className="text-white flex-1 flex items-center">
                {applicationVisit.applicantEmail}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Mail size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Full Address</div>
              <div className="text-white flex-1">{applicationVisit.fullAddress}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Choose Plan</div>
              <div className="text-white flex-1 flex items-center">
                {applicationVisit.choosePlan}
                <button className="ml-2 text-gray-400">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Remarks :</div>
              <div className="text-white flex-1">{applicationVisit.remarks}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Installation Landmark</div>
              <div className="text-white flex-1">{applicationVisit.installationLandmark}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Assigned Email</div>
              <div className="text-white flex-1 flex items-center">
                {applicationVisit.assignedEmail}
                <button className="ml-2 text-gray-400">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Application Status</div>
              <div className={`text-green-500 flex-1`}>{applicationVisit.applicationStatus}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Modified By</div>
              <div className="text-white flex-1">{applicationVisit.modifiedBy}</div>
            </div>
            
            <div className="flex py-2">
              <div className="w-40 text-gray-400 text-sm">Modified Date</div>
              <div className="text-white flex-1">{applicationVisit.modifiedDate}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationVisitDetails;