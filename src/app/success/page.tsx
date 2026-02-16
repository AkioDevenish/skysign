import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-stone-100">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-stone-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-stone-500 mb-8 leading-relaxed">
          Thank you for your purchase. Your account has been upgraded to Pro. You can now access all premium features.
        </p>
        
        <Link 
          href="/" 
          className="block w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
