import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Maximize2, X, Phone, MessageSquare, Mail, Edit, Trash2, ChevronDown } from 'lucide-react';
import { SalesAgent } from '../types/api';

interface SalesAgentDetailsProps {
  salesAgent: SalesAgent;
  onClose: () => void;
  onEdit?: (agent: SalesAgent) => void;
  onDelete?: (agent: SalesAgent) => void;
}

interface BillingDetail {
  id: number;
  fullName: string;
  address: string;
  lcp: string;
  nap: string;
  port: string;
  sim: string;
  status: 'active' | 'inactive';
}

const SalesAgentListDetails: React.FC<SalesAgentDetailsProps> = ({ 
  salesAgent, 
  onClose,
  onEdit,
  onDelete 
}) => {
  const [expandedBilling, setExpandedBilling] = useState(false);

  const billingDetails: BillingDetail[] = [
    {
      id: 1,
      fullName: 'Suzette B Carpio',
      address: '0003 Sta. Ursula Vill Subd St., Ba...',
      lcp: '',
      nap: '',
      port: '',
      sim: '',
      status: 'inactive'
    },
    {
      id: 2,
      fullName: 'Mark John P Vizcarra',
      address: '014 Camias St. Dalig, Batingan...',
      lcp: 'LCP 007',
      nap: 'NAP 001',
      port: 'PORT 006',
      sim: '',
      status: 'active'
    },
    {
      id: 3,
      fullName: 'Gilbert S Llatanda',
      address: '55 Bilog St., Batingan, Binangon...',
      lcp: 'LCP 075',
      nap: 'NAP 008',
      port: 'PORT 004',
      sim: '',
      status: 'active'
    },
    {
      id: 4,
      fullName: 'Mariam S Rimas',
      address: 'Upper Banaihaw St Sitio Wawa, L...',
      lcp: '',
      nap: '',
      port: '',
      sim: '',
      status: 'inactive'
    },
    {
      id: 5,
      fullName: 'Maricris T. Cayanan',
      address: '0002 Liwanag St., Libid, Binangon...',
      lcp: 'LCP 046',
      nap: 'NAP 006',
      port: 'PORT 001',
      sim: '',
      status: 'active'
    }
  ];

  const handleEdit = () => {
    if (onEdit) {
      onEdit(salesAgent);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(salesAgent);
    }
  };

  const handleSendMessage = () => {
    if (salesAgent.email) {
      window.open(`mailto:${salesAgent.email}`, '_blank');
    }
  };

  const handleCall = () => {
    if (salesAgent.mobile_number) {
      window.open(`tel:${salesAgent.mobile_number}`, '_blank');
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col overflow-hidden border-l border-gray-700" style={{ transition: 'none' }}>
      {/* Header */}
      <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
        <div>
          <h2 className="text-white font-medium">
            {salesAgent.name}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-400 p-1 rounded"
            title="Delete sales agent"
          >
            <Trash2 size={18} className="text-gray-400" />
          </button>
          <button 
            onClick={handleEdit}
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-sm flex items-center"
          >
            <Edit size={14} className="mr-1" />
            <span>Edit</span>
          </button>
          <button 
            onClick={handleSendMessage}
            className="text-gray-400 hover:text-white p-1"
            title="Send message"
          >
            <MessageSquare size={16} />
          </button>
          <button className="text-gray-400 hover:text-white">
            <ArrowLeft size={16} />
          </button>
          <button className="text-gray-400 hover:text-white">
            <ArrowRight size={16} />
          </button>
          <button className="text-gray-400 hover:text-white">
            <Maximize2 size={16} />
          </button>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto py-1 px-4">
          <div className="space-y-0">
            <div className="flex py-3 border-b border-gray-800">
              <div className="w-40 text-gray-400 text-sm">NAME</div>
              <div className="text-white flex-1">{salesAgent.name}</div>
            </div>
            
            <div className="flex py-3 border-b border-gray-800">
              <div className="w-40 text-gray-400 text-sm">CONTACT NO.</div>
              <div className="text-white flex-1 flex justify-between items-center">
                <span>{salesAgent.mobile_number || '9107650861'}</span>
                <button 
                  onClick={handleCall}
                  className="text-gray-400 hover:text-white ml-2"
                  title="Call"
                >
                  <Phone size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex py-3 border-b border-gray-800">
              <div className="w-40 text-gray-400 text-sm">EMAIL</div>
              <div className="text-white flex-1 flex justify-between items-center">
                <span>{salesAgent.email || 'keanu1323@gmail.com'}</span>
                <button 
                  onClick={handleSendMessage}
                  className="text-gray-400 hover:text-white ml-2"
                  title="Send email"
                >
                  <Mail size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex py-3 border-b border-gray-800">
              <div className="w-40 text-gray-400 text-sm">LOCATION</div>
              <div className="text-white flex-1">
                {salesAgent.territory?.split(',').map((line, index) => (
                  <div key={index}>{line.trim()}</div>
                )) || (
                  <>
                    <div>302 Antiporda St.</div>
                    <div>Filapila Binangnan, Rizal</div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex py-3 border-b border-gray-800">
              <div className="w-40 text-gray-400 text-sm">ID NUMBER</div>
              <div className="text-white flex-1">
                <div>National ID</div>
                <div className="text-sm text-gray-300">3962-7641-2990-8524</div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Billing Details - styled like the screenshot */}
        <div className="px-4 mt-4">
          <div className="bg-gray-900 rounded-none">
            {/* Header bar with toggle */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-white font-normal text-base">Related Billing Details</h3>
                <div className="ml-2 px-2 py-0.5 bg-[#1C2230] text-white text-xs rounded">
                  {billingDetails.length}
                </div>
              </div>
              <button 
                onClick={() => setExpandedBilling(!expandedBilling)}
                className="text-gray-400"
              >
                <ChevronDown 
                  size={16} 
                  className={expandedBilling ? 'rotate-180' : ''} 
                />
              </button>
            </div>

            {/* Table body */}
            <div className="w-full">
              <table className="w-full text-sm border-spacing-0">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-normal text-gray-400">Full Name</th>
                    <th className="px-4 py-2.5 text-left font-normal text-gray-400">_ComputedAddress</th>
                    <th className="px-4 py-2.5 text-left font-normal text-gray-400">LCP</th>
                    <th className="px-4 py-2.5 text-left font-normal text-gray-400">NAP</th>
                    <th className="px-4 py-2.5 text-left font-normal text-gray-400">PORT</th>
                    <th className="px-4 py-2.5 text-left font-normal text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-gray-500"></div>
                        Suzette B Carpio
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">0003 Sta. Ursula Vill Subd St., Ba...</td>
                    <td className="px-4 py-3 text-gray-300"></td>
                    <td className="px-4 py-3 text-gray-300"></td>
                    <td className="px-4 py-3 text-gray-300"></td>
                    <td className="px-4 py-3 text-gray-300">Inactive</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                        Mark John P Vizcarra
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">014 Camias St. Dalig, Batingan...</td>
                    <td className="px-4 py-3 text-gray-300">LCP 007</td>
                    <td className="px-4 py-3 text-gray-300">NAP 001</td>
                    <td className="px-4 py-3 text-gray-300">PORT 006</td>
                    <td className="px-4 py-3 text-green-500">Online</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                        Gilbert S Llatanda
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">55 Bilog St., Batingan, Binangon...</td>
                    <td className="px-4 py-3 text-gray-300">LCP 075</td>
                    <td className="px-4 py-3 text-gray-300">NAP 008</td>
                    <td className="px-4 py-3 text-gray-300">PORT 004</td>
                    <td className="px-4 py-3 text-green-500">Online</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-gray-500"></div>
                        Mariam S Rimas
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">Upper Banaihaw St Sitio Wawa, L...</td>
                    <td className="px-4 py-3 text-gray-300"></td>
                    <td className="px-4 py-3 text-gray-300"></td>
                    <td className="px-4 py-3 text-gray-300"></td>
                    <td className="px-4 py-3 text-gray-300">Inactive</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                        Maricris T. Cayanan
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">0002 Liwanag St., Libid, Binangon...</td>
                    <td className="px-4 py-3 text-gray-300">LCP 046</td>
                    <td className="px-4 py-3 text-gray-300">NAP 006</td>
                    <td className="px-4 py-3 text-gray-300">PORT 001</td>
                    <td className="px-4 py-3 text-green-500">Online</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer with Expand link */}
            <div className="flex justify-end p-2">
              <button 
                onClick={() => setExpandedBilling(!expandedBilling)} 
                className="text-[#e66c45] text-sm font-normal mr-2"
              >
                Expand
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAgentListDetails;