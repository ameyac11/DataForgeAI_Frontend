import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      'Up to 1,000 rows per dataset',
      'Basic data types',
      'CSV & JSON export',
      'DetNest chat (limited)',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For professionals and teams',
    features: [
      'Unlimited rows',
      'All 50+ data types',
      'All export formats',
      'GPT-4.1 model access',
      'Priority support',
    ],
    cta: 'Coming Soon',
    popular: true,
    disabled: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing</h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl bg-card border-2 ${plan.popular ? 'border-primary' : 'border-border'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild={!plan.disabled}
                className="w-full h-11"
                variant={plan.popular ? 'default' : 'outline'}
                disabled={plan.disabled}
              >
                {plan.disabled ? (
                  <span>{plan.cta}</span>
                ) : (
                  <Link to="/auth">{plan.cta}</Link>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}