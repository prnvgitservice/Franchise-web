import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Shield, 
  Star, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Video, 
  RefreshCw, 
  Target, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Briefcase,
  Clock,
  FileText,
  CreditCard,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">About Us</h1>
          <p className="text-lg text-gray-600 mb-6">
            Connecting service providers directly with customers
          </p>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
            <Users size={16} />
            No Middlemen - No Commissions
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8 text-gray-700 leading-relaxed">

          {/* Introduction */}
          <div>
            <p>
              At PRNV Services, we believe in direct connections between service providers and customers. 
              Our platform eliminates middlemen and hefty commissions, allowing professionals to maximize 
              their earnings while customers get the best value for their money.
            </p>
          </div>

          {/* Profile Building */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="text-blue-600" size={24} />
              Build a Profile Page as Powerful as a Website
            </h2>
            <p className="mb-4">
              Showcase your skills, expertise, and service offerings with a captivating profile page that 
              sets you apart from the competition. Our platform allows you to create a comprehensive 
              digital presence that works like a full website.
            </p>
            <p className="mb-4">
              Grab attention and leave a lasting impression by showcasing your work through images and videos. 
              Selected videos may even appear on our YouTube channel, giving you additional exposure and 
              marketing opportunities.
            </p>
            <p className="mb-4">
              You can improve your position in the listings by leveraging your joining seniority, customer 
              ratings, and volume of business. Additionally, our flexible Self-Billing Dashboard allows 
              you to set your own prices and attract more customers with special offers.
            </p>
            <p className="mb-4">
              Enjoy the freedom to choose your work schedule with our intuitive ON/OFF feature. Our platform 
              adapts to your needs, whether you prefer to work part-time or full-time, allowing you to 
              maintain a healthy work-life balance.
            </p>
          </div>

          {/* Key Features for Professionals */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserCheck className="text-blue-600" size={24} />
              Key Features for Professionals
            </h2>
            <p className="mb-4">
              <strong>Professional Enrollment:</strong> Join our platform as a skilled technician or service 
              provider in your respective field. We welcome professionals from all service industries who 
              are committed to quality work and customer satisfaction.
            </p>
            <p className="mb-4">
              <strong>Direct Connection Model:</strong> We uphold the motto of eliminating middlemen, fostering 
              direct connections between you and your customers. No commissions are charged, ensuring you keep 
              100% of your earnings.
            </p>
            <p className="mb-4">
              <strong>Social Media Marketing:</strong> Your profile is promoted based on ratings, reviews, and 
              teamwork performance. Share your profile URL across social media platforms to expand your reach 
              and attract more customers.
            </p>
            <p className="mb-4">
              <strong>Flexible Subscription Model:</strong> Renew your subscription after every 30 leads or 
              Rs. 30,000 worth of work—whichever comes first.
            </p>
            <p className="mb-4">
              <strong>Service Area Selection:</strong> Choose specific pin codes to define your working area.
            </p>
            <p className="mb-4">
              <strong>Early Joiner Advantage:</strong> Be listed at the top of search results and get more 
              visibility as an early adopter of our platform.
            </p>
            <p className="mb-4">
              <strong>Video Showcase Feature:</strong> Upload videos to showcase your work and expertise. 
            </p>
            <p className="mb-4 text-sm italic">
              <strong>Please note:</strong> Refunds are not available on professional subscriptions.
            </p>
          </div>

          {/* Key Features for Advertisers */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={24} />
              Key Features for Advertisers
            </h2>
            <p className="mb-4">
              <strong>Business Promotion:</strong> Join as an advertiser to promote your business through 
              PRNV Services.
            </p>
            <p className="mb-4">
              <strong>Targeted Advertising:</strong> Choose specific pin code areas within GHMC limits.
            </p>
            <p className="mb-4">
              <strong>Comprehensive Business Profiles:</strong> Get a detailed business profile page.
            </p>
            <p className="mb-4">
              <strong>Premium Placement Options:</strong> Ruby plan subscribers get homepage visibility.
            </p>
            <p className="mb-4">
              <strong>Plan Management:</strong> All advertising plans have a 30-day validity period.
            </p>
            <p className="mb-4">
              <strong>Digital Marketing Support:</strong> Share your profile URL across social media.
            </p>
            <p className="mb-4 text-sm italic">
              <strong>Please note:</strong> Refunds are not available for advertising subscriptions.
            </p>
          </div>

          {/* Key Features for Customers */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="text-blue-600" size={24} />
              Key Features for Customers
            </h2>
            <p className="mb-4">
              <strong>Commission-Free Services:</strong> Avail services at the lowest possible cost.
            </p>
            <p className="mb-4">
              <strong>Competitive Pricing:</strong> Internal competition ensures the best prices.
            </p>
            <p className="mb-4">
              <strong>Quality Assurance:</strong> Share feedback to help others make informed decisions.
            </p>
            <p className="mb-4">
              <strong>Work Guarantee:</strong> Damage cover and a 1-week work guarantee available.
            </p>
            <p className="mb-4">
              <strong>GST Benefits:</strong> Most providers are GST-exempt.
            </p>
            <p className="mb-4">
              <strong>Convenient Rehiring:</strong> Easily rehire trusted providers anytime.
            </p>
            <p className="mb-4">
              <strong>Choice and Negotiation:</strong> Negotiate directly with service providers.
            </p>
            <p className="mb-4 text-sm italic">
              <strong>Please note:</strong> Refunds are not available for customer transactions.
            </p>
          </div>

          {/* Platform Liability */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="text-blue-600" size={24} />
              PRNV Services Liability and Compensation
            </h2>
            <p className="mb-4">
              PRNV Services operates as a platform and directory service—not as a middleman.
            </p>
            <p className="mb-4">
              Technicians and service providers are responsible for any damages caused.
            </p>
            <p className="mb-4">
              Customers must provide documentation for compensation claims.
            </p>
            <p className="mb-4">
              <strong>Important Notice:</strong> PRNV Services will not pay direct damages.
            </p>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="text-blue-600" size={24} />
              Contact Information
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Phone className="text-blue-600" size={20} />
                <span className="text-sm font-medium">Phone</span>
                <span className="text-sm text-gray-600">+91 98765 43210</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Mail className="text-blue-600" size={20} />
                <span className="text-sm font-medium">Email</span>
                <span className="text-sm text-gray-600">info@prnvservices.com</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <MapPin className="text-blue-600" size={20} />
                <span className="text-sm font-medium">Service Area</span>
                <span className="text-sm text-gray-600">GHMC Area, Hyderabad</span>
              </div>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 mb-2">
              Join PRNV Services today and experience the difference of direct connections!
            </p>
            <p className="text-gray-600">
              Whether you're a service provider or a customer, our platform is built to serve your needs efficiently.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutUs;
