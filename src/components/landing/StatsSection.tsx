import React from 'react';

const stats = [
  { value: '< 30s', label: 'Average Response Time' },
  { value: '50+', label: 'Emergency Vehicles Tracked' },
  { value: '99.9%', label: 'System Uptime' },
  { value: '24/7', label: 'Live Monitoring' },
];

const StatsSection: React.FC = () => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-gradient-emergency mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
