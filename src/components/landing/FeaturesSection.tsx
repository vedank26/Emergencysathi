import React from 'react';
import { 
  Users, 
  Map, 
  AlertTriangle, 
  Truck, 
  PawPrint, 
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Role-Based Interfaces',
    description: 'Citizens, Coordinators, and Agencies each get tailored dashboards optimized for their needs.',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: 'Live Crisis Map',
    description: 'Real-time visualization of all incidents, emergency vehicles, and response progress.',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: 'Smart Incident Handling',
    description: 'Automated severity scoring, duplicate detection, and priority-based dispatch.',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: 'Vehicle Tracking',
    description: 'Live GPS tracking of ambulances, fire engines, police, and disaster response vehicles.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: <PawPrint className="w-6 h-6" />,
    title: 'Wildlife Conflict Management',
    description: 'Specialized alerts for human-wildlife encounters with geo-fenced warning zones.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Analytics Dashboard',
    description: 'Response time analysis, heatmaps, and data-driven preparedness planning.',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Everything You Need for
            <span className="text-gradient-emergency"> Crisis Management</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform designed for real emergencies with real-time coordination.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl gradient-card border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Visual accent */}
        <div className="mt-16 flex justify-center">
          <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-secondary/50 border border-border">
            <Shield className="w-5 h-5 text-success" />
            <span className="text-muted-foreground">Enterprise-grade security & reliability</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
