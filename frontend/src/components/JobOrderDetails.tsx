import React, { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, Maximize2, X, Phone, MessageSquare, Info, 
  ExternalLink, Mail, Edit
} from 'lucide-react';
import { updateJobOrder } from '../services/jobOrderService';
import { JobOrderDetailsProps } from '../types/jobOrder';

const JobOrderDetails: React.FC<JobOrderDetailsProps> = ({ jobOrder, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debug logging
  console.log('JobOrderDetails - Full jobOrder object:', jobOrder);
  console.log('JobOrderDetails - Secondary_Mobile_Number:', jobOrder.Secondary_Mobile_Number);
  console.log('JobOrderDetails - Second_Contact_Number:', jobOrder.Second_Contact_Number);
  
  // Format date function
  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return 'Not scheduled';
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };
  
  // Format price function
  const formatPrice = (price?: string | number | null): string => {
    if (price === null || price === undefined) return '₱0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `₱${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get client full name
  const getClientFullName = (): string => {
    return [
      jobOrder.First_Name || '',
      jobOrder.Middle_Initial ? jobOrder.Middle_Initial + '.' : '',
      jobOrder.Last_Name || ''
    ].filter(Boolean).join(' ').trim() || 'Unknown Client';
  };

  // Get client full address
  const getClientFullAddress = (): string => {
    const addressParts = [
      jobOrder.Address,
      jobOrder.Village,
      jobOrder.Barangay,
      jobOrder.City,
      jobOrder.Region
    ].filter(Boolean);
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'No address provided';
  };

  // Helper function for status text color
  const getStatusColor = (status: string | undefined | null, type: 'onsite' | 'billing') => {
    if (!status) return 'text-gray-400';
    
    if (type === 'onsite') {
      switch (status.toLowerCase()) {
        case 'done':
          return 'text-green-500';
        case 'reschedule':
          return 'text-blue-500';
        case 'inprogress':
        case 'in progress':
          return 'text-yellow-500';
        case 'failed':
          return 'text-red-500';
        default:
          return 'text-gray-400';
      }
    } else {
      switch (status.toLowerCase()) {
        case 'done':
          return 'text-green-500';
        case 'pending':
          return 'text-yellow-500';
        default:
          return 'text-gray-400';
      }
    }
  };
  
  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setLoading(true);
      
      // Check if id exists, otherwise use a fallback
      if (!jobOrder.id) {
        throw new Error('Cannot update job order: Missing ID');
      }
      
      await updateJobOrder(jobOrder.id, { 
        Onsite_Status: newStatus,
        Modified_By: 'current_user@ampere.com',
      });
      
      jobOrder.Onsite_Status = newStatus;
      
      // Show success message
      alert(`Status updated to ${newStatus}`);
    } catch (err: any) {
      setError(`Failed to update status: ${err.message}`);
      console.error('Status update error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full h-full bg-gray-950 flex flex-col overflow-hidden border-l border-white border-opacity-30">
      {/* Header */}
      <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <h2 className="text-white font-medium">{getClientFullName()}</h2>
          {loading && <div className="ml-3 animate-pulse text-orange-500 text-sm">Loading...</div>}
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-gray-800 hover:bg-gray-700 text-white p-1 rounded-sm border border-gray-700 flex items-center justify-center">
            <X size={16} />
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white p-1 rounded-sm border border-gray-700 flex items-center justify-center">
            <ExternalLink size={16} />
          </button>
          <button 
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-sm flex items-center"
            onClick={() => handleStatusUpdate('Done')}
            disabled={loading}
          >
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
      
      {/* Error display */}
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-400 p-3 m-3 rounded">
          {error}
        </div>
      )}
      
      {/* Job Order Details */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-6 px-4 bg-gray-950">
          <div className="space-y-4">
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Timestamp:</div>
              <div className="text-white flex-1">{formatDate(jobOrder.Timestamp)}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Billing Status:</div>
              <div className={`${getStatusColor(jobOrder.Billing_Status, 'billing')} flex-1 capitalize`}>
                {jobOrder.Billing_Status || 'Not set'}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Billing Day:</div>
              <div className="text-white flex-1">
                {(jobOrder.Billing_Day === '0' || Number(jobOrder.Billing_Day) === 0)
                  ? 'Every end of month' 
                  : (jobOrder.Billing_Day || 'Not set')}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Installation Fee:</div>
              <div className="text-white flex-1">{formatPrice(jobOrder.Installation_Fee)}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Referred By:</div>
              <div className="text-white flex-1">{jobOrder.Referred_By || 'None'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Full Name of Client:</div>
              <div className="text-white flex-1">{getClientFullName()}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Full Address of Client:</div>
              <div className="text-white flex-1">{getClientFullAddress()}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Contact Number:</div>
              <div className="text-white flex-1 flex items-center">
                {jobOrder.Mobile_Number || jobOrder.Contact_Number || 'Not provided'}
                {(jobOrder.Mobile_Number || jobOrder.Contact_Number) && (
                  <>
                    <button className="text-gray-400 hover:text-white ml-2">
                      <Phone size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-white ml-2">
                      <MessageSquare size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Second Contact Number:</div>
              <div className="text-white flex-1 flex items-center">
                {jobOrder.Secondary_Mobile_Number || 'Not provided'}
                {jobOrder.Secondary_Mobile_Number && (
                  <>
                    <button className="text-gray-400 hover:text-white ml-2">
                      <Phone size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-white ml-2">
                      <MessageSquare size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Email Address:</div>
              <div className="text-white flex-1 flex items-center">
                {jobOrder.Email_Address || jobOrder.Applicant_Email_Address || 'Not provided'}
                {(jobOrder.Email_Address || jobOrder.Applicant_Email_Address) && (
                  <button className="text-gray-400 hover:text-white ml-2">
                    <Mail size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Barangay:</div>
              <div className="text-white flex-1">{jobOrder.Barangay || 'Not specified'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Village:</div>
              <div className="text-white flex-1">{jobOrder.Village || 'Not specified'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">City:</div>
              <div className="text-white flex-1">{jobOrder.City || 'Not specified'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Region:</div>
              <div className="text-white flex-1">{jobOrder.Region || 'Not specified'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Choose Plan:</div>
              <div className="text-white flex-1 flex items-center">
                {jobOrder.Desired_Plan || jobOrder.Choose_Plan || 'Not specified'}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Status Remarks:</div>
              <div className="text-white flex-1">{jobOrder.Status_Remarks || 'No remarks'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Remarks:</div>
              <div className="text-white flex-1">{jobOrder.Remarks || 'No remarks'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Installation Landmark:</div>
              <div className="text-white flex-1">{jobOrder.Installation_Landmark || 'Not provided'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Connection Type:</div>
              <div className="text-white flex-1">{jobOrder.Connection_Type || 'Not specified'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Onsite Status:</div>
              <div className={`${getStatusColor(jobOrder.Onsite_Status, 'onsite')} flex-1 capitalize`}>
                {jobOrder.Onsite_Status === 'inprogress' ? 'In Progress' : (jobOrder.Onsite_Status || 'Not set')}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Contract Template:</div>
              <div className="text-white flex-1">{jobOrder.Contract_Template || 'Standard'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Contract Link:</div>
              <div className="text-white flex-1 truncate flex items-center">
                {jobOrder.Contract_Link || 'Not available'}
                {jobOrder.Contract_Link && (
                  <button className="text-gray-400 hover:text-white ml-2">
                    <ExternalLink size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Username:</div>
              <div className="text-white flex-1">{jobOrder.Username || 'Not provided'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Modified By:</div>
              <div className="text-white flex-1">{jobOrder.Modified_By || 'System'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Modified Date:</div>
              <div className="text-white flex-1">{formatDate(jobOrder.Modified_Date)}</div>
            </div>
            
            <div className="flex pb-4">
              <div className="w-40 text-gray-400 text-sm">Assigned Email:</div>
              <div className="text-white flex-1">{jobOrder.Assigned_Email || 'Not assigned'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOrderDetails;
