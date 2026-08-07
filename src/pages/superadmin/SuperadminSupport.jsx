import React from 'react';
import { Headset, MessageSquare, AlertCircle } from 'lucide-react';

export function SuperadminSupport() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-500 mt-1">Centralized inbox for tenant queries and issues</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Ticket List */}
        <div className="w-1/3 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-700 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-indigo-600" />
              Open Tickets (14)
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {[
              { title: 'Cannot generate E-Way bill', company: 'Tech Solutions Inc', time: '10 mins ago', active: true },
              { title: 'GSTR-1 mismatch in reports', company: 'Global Logistics', time: '2 hours ago', active: false },
              { title: 'Need more user licenses', company: 'Retail Plus', time: '1 day ago', active: false },
            ].map((ticket, i) => (
              <div key={i} className={`p-4 cursor-pointer transition-colors ${ticket.active ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}>
                <h4 className={`font-medium ${ticket.active ? 'text-indigo-900' : 'text-gray-900'}`}>{ticket.title}</h4>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-gray-500">{ticket.company}</span>
                  <span className="text-gray-400">{ticket.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Details/Chat */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Cannot generate E-Way bill</h2>
                <p className="text-sm text-gray-500 mt-1">Reported by <span className="font-medium text-gray-700">Rahul Sharma (Tech Solutions Inc)</span></p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Urgent</span>
            </div>
          </div>
          
          <div className="flex-1 p-6 bg-gray-50 overflow-y-auto flex flex-col gap-4">
            {/* Message Bubble */}
            <div className="flex items-start max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600 text-xs">RS</div>
              <div className="ml-3 bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm text-gray-700">
                Hi, we are trying to generate an E-way bill for Invoice #1024, but the portal is throwing an API error. Can you please check?
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input type="text" placeholder="Type your reply..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              <button className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
