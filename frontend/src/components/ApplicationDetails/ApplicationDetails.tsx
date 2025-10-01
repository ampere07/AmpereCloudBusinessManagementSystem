import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Maximize2, X, Phone, MessageSquare, Info, 
  ExternalLink, Mail, Edit, Newspaper, ArrowRightFromLine, Calendar, 
  Ban, XCircle, RotateCw, CheckCircle, Loader, Square
} from 'lucide-react';
import { getApplication, updateApplication } from '../../services/applicationService';
import ConfirmationModal from '../../modals/MoveToJoModal';
import JOAssignFormModal from '../../modals/JOAssignFormModal';
import ApplicationVisitFormModal from '../../modals/ApplicationVisitFormModal';
import { JobOrderData } from '../../services/jobOrderService';
import { ApplicationVisitData } from '../../services/applicationVisitService';

interface ApplicationDetailsProps {
  application: {
    id: string;
    customerName: string;
    timestamp: string;
    address: string;
    action?: 'Schedule' | 'Duplicate';
    location: string;
    cityId?: number | null;
    regionId?: number | null;
    boroughId?: number | null;
    villageId?: number | null;
    addressLine?: string;
    fullAddress?: string;
    email?: string;
    mobileNumber?: string;
  };
  onClose: () => void;
  onApplicationUpdate?: () => void;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ application, onClose, onApplicationUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedApplication, setDetailedApplication] = useState<any>(null);
  const [showMoveConfirmation, setShowMoveConfirmation] = useState(false);
  const [showJOAssignForm, setShowJOAssignForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');

  const handleMoveToJO = () => {
    setShowMoveConfirmation(true);
  };

  const handleConfirmMoveToJO = () => {
    setShowMoveConfirmation(false);
    setShowJOAssignForm(true);
  };

  const handleScheduleVisit = () => {
    setShowVisitForm(true);
  };

  const handleStatusChange = (newStatus: string) => {
    setPendingStatus(newStatus);
    setShowStatusConfirmation(true);
  };

  const handleConfirmStatusChange = async () => {
    try {
      setLoading(true);
      
      // Call API to update application status
      await updateApplication(application.id, { status: pendingStatus });
      
      // Refetch the application details from database to ensure we have the latest status
      const updatedApplication = await getApplication(application.id);
      setDetailedApplication(updatedApplication);
      
      setShowStatusConfirmation(false);
      setPendingStatus('');
      
      // Call the callback to refresh the application list
      if (onApplicationUpdate) {
        onApplicationUpdate();
      }
      
      // Show success message
      alert(`Status updated to ${pendingStatus}`);
    } catch (err: any) {
      setError(`Failed to update status: ${err.message}`);
      console.error('Status update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelStatusChange = () => {
    setShowStatusConfirmation(false);
    setPendingStatus('');
  };

  const handleSaveJOForm = (formData: JobOrderData) => {
    console.log('Job Order saved successfully:', formData);
    console.log('Application ID:', application.id);
    // Job order has already been saved by the modal
    setShowJOAssignForm(false);
  };

  const handleSaveVisitForm = (formData: ApplicationVisitData) => {
    console.log('Visit scheduled successfully:', formData);
    console.log('Application ID:', application.id);
    // Visit has already been saved by the modal
    setShowVisitForm(false);
  };

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getApplication(application.id);
        setDetailedApplication(result);
      } catch (err: any) {
        console.error('Error fetching application details:', err);
        setError(err.message || 'Failed to load application details');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [application.id]);

  const applicationDetails = {
    ...application,
    id: detailedApplication?.id || application.id || '',
    create_date: detailedApplication?.create_date || '',
    create_time: detailedApplication?.create_time || '',
    update_date: detailedApplication?.update_date || '',
    update_time: detailedApplication?.update_time || '',
    email: detailedApplication?.email || application.email || '',
    first_name: detailedApplication?.first_name || '',
    middle_initial: detailedApplication?.middle_initial || '',
    last_name: detailedApplication?.last_name || '',
    mobileNumber: detailedApplication?.mobile || application.mobileNumber || '',
    mobile_alt: detailedApplication?.mobile_alt || '',  // Explicitly include mobile_alt
    secondaryNumber: detailedApplication?.mobile_alt || '',  // Add this as secondaryNumber too
    status: detailedApplication?.status || (application.action === 'Schedule' ? 'Schedule' : 'In Progress'),
    // Region data
    region_id: detailedApplication?.region_id,
    city_id: detailedApplication?.city_id,
    borough_id: detailedApplication?.borough_id,
    village_id: detailedApplication?.village_id,
    address_line: detailedApplication?.address_line || application.address || '',
    // Landmarks
    landmark: detailedApplication?.landmark || '',
    nearest_landmark1: detailedApplication?.nearest_landmark1 || '',
    nearest_landmark2: detailedApplication?.nearest_landmark2 || '',
    // Plan, promo, docs
    plan_id: detailedApplication?.plan_id || '',
    promo_id: detailedApplication?.promo_id || '',
    proof_of_billing: detailedApplication?.proof_of_billing || '',
    gov_id_primary: detailedApplication?.gov_id_primary || '',
    gov_id_secondary: detailedApplication?.gov_id_secondary || '',
    house_front_pic: detailedApplication?.house_front_pic || '',
    room_pic: detailedApplication?.room_pic || '',
    // Consent
    primary_consent: detailedApplication?.primary_consent || false,
    primary_consent_at: detailedApplication?.primary_consent_at || '',
    // Source
    source: detailedApplication?.source || '',
    ip_address: detailedApplication?.ip_address || '',
    user_agent: detailedApplication?.user_agent || '',
    portal_id: detailedApplication?.portal_id || '',
    group_id: detailedApplication?.group_id || '',
    
    fullName: [
      detailedApplication?.first_name,
      detailedApplication?.middle_initial,
      detailedApplication?.last_name
    ].filter(Boolean).join(' ') || application.customerName || '',
    
    fullAddress: detailedApplication?.address_line || application.address || '',
    
    landmarks: [
      detailedApplication?.landmark,
      detailedApplication?.nearest_landmark1,
      detailedApplication?.nearest_landmark2
    ].filter(Boolean).join(', ') || '',
    
    timestamp: detailedApplication?.create_date && detailedApplication?.create_time 
      ? `${detailedApplication.create_date} ${detailedApplication.create_time}` 
      : application.timestamp || '',
  };


  
  return (
    <div className="w-full h-full bg-gray-950 flex flex-col overflow-hidden border-l border-white border-opacity-30">
      <div className="bg-gray-900 p-3 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center">
          <h2 className="text-white font-semibold text-lg">
            {detailedApplication?.first_name || application.customerName.split(' ')[0] || 'None'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="bg-transparent text-gray-400 hover:text-white p-1 rounded">
            <Newspaper size={20} />
          </button>
          <button 
            className="bg-transparent text-gray-400 hover:text-white p-1 rounded"
            onClick={handleMoveToJO}
          >
            <ArrowRightFromLine size={20} />
          </button>
          <button 
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded flex items-center"
            onClick={handleScheduleVisit}
          >
            <Calendar size={16} className="mr-1" />
            <span>Schedule</span>
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
      <div className="bg-gray-900 py-4 border-b border-gray-800 flex items-center justify-center space-x-8">
        <button 
          className="flex flex-col items-center text-center hover:bg-gray-800 rounded-lg p-2 transition-colors"
          onClick={() => handleStatusChange('No Facility')}
          disabled={loading}
        >
          <div className="bg-orange-600 p-3 rounded-full">
            <Ban className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">No Facility</span>
        </button>
        
        <button 
          className="flex flex-col items-center text-center hover:bg-gray-800 rounded-lg p-2 transition-colors"
          onClick={() => handleStatusChange('Cancelled')}
          disabled={loading}
        >
          <div className="bg-orange-600 p-3 rounded-full">
            <XCircle className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">Cancelled</span>
        </button>
        
        <button 
          className="flex flex-col items-center text-center hover:bg-gray-800 rounded-lg p-2 transition-colors"
          onClick={() => handleStatusChange('No Slot')}
          disabled={loading}
        >
          <div className="bg-orange-600 p-3 rounded-full">
            <RotateCw className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">No Slot</span>
        </button>
        
        <button 
          className="flex flex-col items-center text-center hover:bg-gray-800 rounded-lg p-2 transition-colors"
          onClick={() => handleStatusChange('Duplicate')}
          disabled={loading}
        >
          <div className="bg-orange-600 p-3 rounded-full">
            <Square className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">Duplicate</span>
        </button>
        
        <button 
          className="flex flex-col items-center text-center hover:bg-gray-800 rounded-lg p-2 transition-colors"
          onClick={() => handleStatusChange('In Progress')}
          disabled={loading}
        >
          <div className="bg-orange-600 p-3 rounded-full">
            <CheckCircle className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">Clear Status</span>
        </button>
      </div>
      
      {/* Application Details */}
      <div className="flex-1 overflow-y-auto bg-gray-900">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="animate-spin text-orange-500" size={32} />
            <span className="ml-3 text-gray-400">Loading application details...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={() => {
                setError(null);
                window.location.reload();
              }} 
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded">
              Retry
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="space-y-0">
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">Referred by:</div>
                <div className="text-white flex-1">{detailedApplication?.referred_by || detailedApplication?.Referred_by || 'None'}</div>
              </div>
              
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">Status</div>
                <div className="text-green-500 flex-1">{detailedApplication?.status || detailedApplication?.Status || 'None'}</div>
              </div>
              
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">Timestamp</div>
                <div className="text-white flex-1">
                  {detailedApplication?.timestamp || detailedApplication?.Timestamp || 'None'}
                </div>
              </div>
              
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">Full Name</div>
                <div className="text-white flex-1">
                  {detailedApplication?.customer_name || 
                   [detailedApplication?.first_name || detailedApplication?.First_Name, 
                    detailedApplication?.middle_initial || detailedApplication?.Middle_Initial, 
                    detailedApplication?.last_name || detailedApplication?.Last_Name].filter(Boolean).join(' ') || 
                   application.customerName || 'None'}
                </div>
              </div>
              
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">Full Address</div>
                <div className="text-white flex-1">
                  {application.fullAddress || detailedApplication?.address_line || detailedApplication?.Installation_Address || application.address || 'No address'}
                </div>
              </div>
              
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">Landmark</div>
                <div className="text-white flex-1">{detailedApplication?.landmark || detailedApplication?.Landmark || 'None'}</div>
              </div>
              
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">First Nearest Landmark</div>
                <div className="text-white flex-1">{detailedApplication?.first_nearest_landmark || detailedApplication?.First_Nearest_landmark || 'None'}</div>
              </div>
              
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">Second Nearest Landmark</div>
                <div className="text-white flex-1">{detailedApplication?.second_nearest_landmark || detailedApplication?.Second_Nearest_landmark || 'None'}</div>
              </div>
              
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">Email Address</div>
                <div className="text-white flex-1">{detailedApplication?.email || detailedApplication?.Email_Address || application.email || 'None'}</div>
              </div>
              
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">Mobile Number</div>
                <div className="text-white flex-1 flex justify-between items-center">
                  <span>{detailedApplication?.mobile || detailedApplication?.Mobile_Number || application.mobileNumber || 'None'}</span>
                  {(detailedApplication?.mobile || detailedApplication?.Mobile_Number || application.mobileNumber) && (
                    <div>
                      <button className="text-gray-400 hover:text-white ml-2">
                        <Phone size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-white ml-2">
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">Second Mobile Number</div>
                <div className="text-white flex-1 flex justify-between items-center">
                  <span>{detailedApplication?.secondary_number || detailedApplication?.mobile_alt || detailedApplication?.Secondary_Mobile_Number || 'None'}</span>
                  {(detailedApplication?.secondary_number || detailedApplication?.mobile_alt || detailedApplication?.Secondary_Mobile_Number) && (
                    <div>
                      <button className="text-gray-400 hover:text-white ml-2">
                        <Phone size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-white ml-2">
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">Desired Plan</div>
                <div className="text-white flex-1 flex justify-between items-center">
                  <span>{detailedApplication?.desired_plan || detailedApplication?.Desired_Plan || detailedApplication?.plan || 'None'}</span>
                  {(detailedApplication?.desired_plan || detailedApplication?.Desired_Plan || detailedApplication?.plan) && (
                    <button className="text-gray-400 hover:text-white">
                      <Info size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {(detailedApplication?.gov_id_primary || detailedApplication?.Government_Valid_ID) && (
                <div className="flex py-3 border-b border-gray-800">
                  <div className="w-40 text-gray-400 text-sm">Government Valid ID</div>
                  <div className="text-white flex-1 flex justify-between items-center truncate">
                    <span className="truncate">{detailedApplication.gov_id_primary || detailedApplication.Government_Valid_ID}</span>
                    <button 
                      className="text-gray-400 hover:text-white"
                      onClick={() => window.open(detailedApplication.gov_id_primary || detailedApplication.Government_Valid_ID)}
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              )}
              
              {(detailedApplication?.terms_agreement || detailedApplication?.I_agree_to_the_terms_and_conditions) && (
                <div className="flex py-3 border-b border-gray-800">
                  <div className="w-40 text-gray-400 text-sm">I agree to the terms and conditions</div>
                  <div className="text-white flex-1">Yes, I Agree</div>
                </div>
              )}
              
              <div className="flex py-3 border-b border-gray-800">
                <div className="w-40 text-gray-400 text-sm">User Email</div>
                <div className="text-white flex-1 flex justify-between items-center">
                  <span>{detailedApplication?.email || detailedApplication?.Email_Address || application.email || 'None'}</span>
                  {(detailedApplication?.email || detailedApplication?.Email_Address || application.email) && (
                    <button className="text-gray-400 hover:text-white">
                      <Mail size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {(detailedApplication?.house_front_pic || detailedApplication?.House_Front_Picture) && (
                <div className="flex py-3 border-b border-gray-800">
                  <div className="w-40 text-gray-400 text-sm">House Front Picture</div>
                  <div className="text-white flex-1 flex justify-between items-center truncate">
                    <span className="truncate">{detailedApplication.house_front_pic || detailedApplication.House_Front_Picture}</span>
                    <button 
                      className="text-gray-400 hover:text-white"
                      onClick={() => window.open(detailedApplication.house_front_pic || detailedApplication.House_Front_Picture)}
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex py-3">
                <div className="w-40 text-gray-400 text-sm">Select the applicable promo</div>
                <div className="text-white flex-1">{detailedApplication?.promo || detailedApplication?.Select_the_applicable_promo || 'None'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Use the ConfirmationModal component */}
      <ConfirmationModal
        isOpen={showMoveConfirmation}
        title="Confirm"
        message="Are you sure you want to move this application to JO?"
        confirmText="Move to JO"
        cancelText="Cancel"
        onConfirm={handleConfirmMoveToJO}
        onCancel={() => setShowMoveConfirmation(false)}
      />

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={showStatusConfirmation}
        title="Confirm Status Change"
        message={`Are you sure you want to change the status to "${pendingStatus}"?`}
        confirmText="Change Status"
        cancelText="Cancel"
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
      />

      {/* Use the JOAssignFormModal component */}
      <JOAssignFormModal
        isOpen={showJOAssignForm}
        onClose={() => setShowJOAssignForm(false)}
        onSave={handleSaveJOForm}
        applicationData={detailedApplication}
      />

      {/* Use the ApplicationVisitFormModal component */}
      <ApplicationVisitFormModal
        isOpen={showVisitForm}
        onClose={() => setShowVisitForm(false)}
        onSave={handleSaveVisitForm}
        applicationData={{
          ...detailedApplication,
          // Explicitly ensure secondaryNumber is included
          secondaryNumber: detailedApplication?.mobile_alt || '',
          // Log what's being passed
          __debug: console.log('DEBUG - Data passed to Visit Modal:', {
            applicationId: application.id,
            mobile_alt: detailedApplication?.mobile_alt,
            secondaryNumber: detailedApplication?.mobile_alt || ''
          })
        }}
      />
    </div>
  );
};

export default ApplicationDetails;