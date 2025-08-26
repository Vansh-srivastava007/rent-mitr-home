import { Shield, Zap, Home } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "KYP Verified Properties",
    description: "Rent with confidence"
  },
  {
    icon: Zap,
    title: "Blockchain-backed", 
    description: "Secure transactions"
  },
  {
    icon: Home,
    title: "Seamless Rental Experience",
    description: "Enjoy a hassle-free rental journey"
  }
];

export const TrustSection = () => {
  return (
    <section className="px-4 py-8 bg-muted">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8 text-foreground">How it Works</h2>
        <div className="space-y-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="bg-primary rounded-full p-3">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};