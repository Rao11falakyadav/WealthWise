import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, Button } from '@/components/ui';
import { DollarSign, Users, Eye, TrendingUp, Download, ShieldCheck, Award } from 'lucide-react';

export function AccountPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'creator'>('creator');

  // Mock data for Creator Dashboard
  const metrics = [
    { label: 'Total Earnings', value: '$1,240.50', icon: DollarSign, trend: '+12.5%' },
    { label: 'Followers', value: '3,450', icon: Users, trend: '+8.2%' },
    { label: 'Post Views', value: '45.2k', icon: Eye, trend: '+24.1%' },
    { label: 'Engagement Rate', value: '4.8%', icon: TrendingUp, trend: '+1.2%' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-[#2C3329]">My Account</h1>
          <p className="text-sm text-[#788B76] mt-1">Manage your profile and creator settings.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-[#E8E2D9]">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'profile' ? 'border-[#2C3329] text-[#2C3329]' : 'border-transparent text-[#788B76] hover:text-[#2C3329]'
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('creator')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'creator' ? 'border-[#C06E52] text-[#C06E52]' : 'border-transparent text-[#788B76] hover:text-[#C06E52]'
          }`}
        >
          Creator Dashboard
          <Award className="w-3.5 h-3.5" />
        </button>
      </div>

      {activeTab === 'profile' && (
        <Card className="p-7">
          <h2 className="font-display text-xl font-semibold text-[#2C3329] mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#788B76] mb-1">Full Name</p>
              <p className="text-sm text-[#2C3329] font-medium">{profile?.full_name}</p>
            </div>
            {/* More profile settings would go here */}
            <p className="text-sm text-[#788B76] italic">Basic profile settings are here. Switch to Creator Dashboard for monetization features.</p>
          </div>
        </Card>
      )}

      {activeTab === 'creator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF0EC] flex items-center justify-center text-[#C06E52]">
                    <m.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {m.trend}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-[#2C3329] mb-1">{m.value}</p>
                <p className="text-xs text-[#788B76]">{m.label}</p>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-semibold text-[#2C3329]">Earnings Overview</h3>
                  <p className="text-xs text-[#788B76]">Your earnings from platform rewards and tips.</p>
                </div>
                <Button variant="outline" className="text-xs py-1.5 h-auto">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Export
                </Button>
              </div>
              {/* Mock Chart Area */}
              <div className="h-48 flex items-end gap-2 sm:gap-4 mt-8 pb-4 border-b border-[#E8E2D9]">
                {[40, 60, 45, 80, 65, 90, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-[#FAF0EC] group-hover:bg-[#C06E52] transition-colors rounded-t-sm" 
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-xs text-[#788B76]">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6 bg-[#2C3329] text-[#EFEBE3] border-none">
                <h3 className="font-display text-lg font-semibold mb-2 text-white">Available Balance</h3>
                <p className="text-4xl font-semibold text-[#C8BFB4] mb-6">$850.00</p>
                <Button className="w-full bg-[#C06E52] hover:bg-[#A35940] text-white border-none">
                  Withdraw Earnings
                </Button>
                <p className="text-[10px] text-center text-[#788B76] mt-3">Next payout available on Aug 1st</p>
              </Card>

              <Card className="p-5">
                <h3 className="font-display text-sm font-semibold text-[#2C3329] mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#788B76]" />
                  Monetization Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5a6354]">Creator Rewards</span>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5a6354]">Community Tips</span>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5a6354]">Sponsored Campaigns</span>
                    <span className="text-xs font-medium text-[#788B76] bg-[#E8E2D9] px-2 py-0.5 rounded-full">Pending</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
