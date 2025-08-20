// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Icon, Button, Typography, UniversalHeader } from '../../../components/atoms';
// import { SUBSCRIPTION_PLANS, HealthCard } from '../../../types/healthCard';

// const HealthCardDisplayPage: React.FC = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [isFlipped, setIsFlipped] = useState(false);
//   const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
//   const [healthCard, setHealthCard] = useState<HealthCard | null>(null);

//   useEffect(() => {
//     // Check if user just upgraded
//     const upgraded = searchParams.get('upgraded');
//     if (upgraded === 'true') {
//       // Show success message or animation
//       setShowUpgradePrompt(false);
//     }

//     // Mock health card data - in real app, fetch from API
//     const mockCard: HealthCard = {
//       id: 'card-001',
//       userId: 'user-001',
//       cardNumber: 'HC-2024-001234',
//       holderName: 'John Doe',
//       holderPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
//       planType: upgraded === 'true' ? 'monthly' : 'free',
//       planName: upgraded === 'true' ? 'Monthly Plan' : 'Basic Free',
//       issueDate: '2024-01-15',
//       expiryDate: upgraded === 'true' ? '2024-02-15' : 'Never',
//       qrCode: 'QR_CODE_DATA_HERE',
//       benefits: upgraded === 'true' 
//         ? SUBSCRIPTION_PLANS.find(p => p.type === 'monthly')?.benefits || []
//         : SUBSCRIPTION_PLANS.find(p => p.type === 'free')?.benefits || [],
//       status: 'active'
//     };

//     setHealthCard(mockCard);
//     setShowUpgradePrompt(mockCard.planType === 'free');
//   }, [searchParams]);

//   const handleGoBack = () => {
//     router.back();
//   };

//   const handleFlipCard = () => {
//     setIsFlipped(!isFlipped);
//   };

//   const handleDownloadPDF = () => {
//     // Implement PDF download functionality
//     console.log('Downloading PDF...');
//   };

//   const handleShareCard = () => {
//     // Implement share functionality
//     if (navigator.share) {
//       navigator.share({
//         title: 'My Health Card',
//         text: 'Check out my digital health card!',
//         url: window.location.href,
//       });
//     } else {
//       // Fallback for browsers that don't support Web Share API
//       navigator.clipboard.writeText(window.location.href);
//       alert('Link copied to clipboard!');
//     }
//   };

//   const handleUpgrade = () => {
//     router.push('/health-card');
//   };

//   if (!healthCard) {
//     return (
//       <div className="min-h-screen bg-bg-white>
//         <UniversalHeader
//           title="My Health Card"
//           subtitle="Loading your health card..."
//           variant="gradient"
//           icon="health-card"
//           showBackButton={true}
//           onBackPress={handleGoBack}
//         />
//         <div className="flex items-center justify-center pt-20">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E3293] mx-auto mb-4"></div>
//             <Typography variant="body1" className="text-gray-600">
//               Loading your health card...
//             </Typography>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const isFreePlan = healthCard.planType === 'free';

//   return (
//     <div className="min-h-screen bg-bg-white>
//       {/* Header */}
//       <UniversalHeader
//         title="My Health Card"
//         subtitle={`${healthCard.planName} • ${healthCard.status === 'active' ? 'Active' : 'Inactive'}`}
//         variant="gradient"
//         icon="health-card"
//         showBackButton={true}
//         onBackPress={handleGoBack}
//       />

//       {/* Main Content */}
//       <div className="px-4 md:px-6 py-8">
//         <div className="max-w-2xl mx-auto">
//           {/* Health Card */}
//           <div className="mb-8">
//             <div className="perspective-1000">
//               <div
//                 className={`relative w-full h-64 md:h-80 transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
//                   isFlipped ? 'rotate-y-180' : ''
//                 }`}
//                 onClick={handleFlipCard}
//               >
//                 {/* Front of Card */}
//                 <div className="absolute inset-0 w-full h-full backface-hidden">
//                   <div className={`w-full h-full rounded-3xl shadow-2xl p-6 ${
//                     isFreePlan 
//                       ? 'bg-gradient-to-br from-gray-400 to-gray-600' 
//                       : 'bg-gradient-to-br from-[#0E3293] to-blue-600'
//                   } text-white relative overflow-hidden`}>
//                     {/* Background Pattern */}
//                     <div className="absolute inset-0 opacity-10">
//                       <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white/20"></div>
//                       <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full border-2 border-white/20"></div>
//                     </div>

//                     {/* Card Content */}
//                     <div className="relative z-10 h-full flex flex-col justify-between">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <Typography variant="h6" className="font-bold mb-1">
//                             HYGO HEALTH CARD
//                           </Typography>
//                           <Typography variant="body2" className="opacity-80">
//                             {healthCard.planName}
//                           </Typography>
//                         </div>
//                         <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
//                           <Icon name="health-card" size="medium" color="white" />
//                         </div>
//                       </div>

//                       <div className="flex items-center space-x-4">
//                         <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30">
//                           <img
//                             src={healthCard.holderPhoto}
//                             alt={healthCard.holderName}
//                             className="w-full h-full object-cover"
//                             onError={(e) => {
//                               const target = e.target as HTMLImageElement;
//                               target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(healthCard.holderName)}&background=ffffff&color=0e3293&size=400`;
//                             }}
//                           />
//                         </div>
//                         <div className="flex-1">
//                           <Typography variant="h6" className="font-bold">
//                             {healthCard.holderName}
//                           </Typography>
//                           <Typography variant="body2" className="opacity-80">
//                             Card No: {healthCard.cardNumber}
//                           </Typography>
//                         </div>
//                       </div>

//                       <div className="flex items-center justify-between">
//                         <div>
//                           <Typography variant="caption" className="opacity-60">
//                             Valid Until
//                           </Typography>
//                           <Typography variant="body2" className="font-semibold">
//                             {healthCard.expiryDate === 'Never' ? 'Never' : new Date(healthCard.expiryDate).toLocaleDateString()}
//                           </Typography>
//                         </div>
//                         <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
//                           <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
//                             <Typography variant="caption" className="text-[#0E3293] font-bold text-xs">
//                               QR
//                             </Typography>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Back of Card */}
//                 <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
//                   <div className={`w-full h-full rounded-3xl shadow-2xl p-6 ${
//                     isFreePlan 
//                       ? 'bg-gradient-to-br from-gray-400 to-gray-600' 
//                       : 'bg-gradient-to-br from-[#0E3293] to-blue-600'
//                   } text-white`}>
//                     <div className="h-full flex flex-col">
//                       <div className="text-center mb-6">
//                         <Typography variant="h6" className="font-bold mb-2">
//                           Benefits & Features
//                         </Typography>
//                         <Typography variant="body2" className="opacity-80">
//                           {healthCard.planName}
//                         </Typography>
//                       </div>

//                       <div className="flex-1 space-y-3">
//                         {healthCard.benefits.map((benefit, index) => (
//                           <div key={index} className="flex items-center">
//                             <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3 flex-shrink-0">
//                               <Icon name={isFreePlan ? "x" : "check"} size="small" color="white" />
//                             </div>
//                             <Typography variant="body2" className="opacity-90">
//                               {benefit}
//                             </Typography>
//                           </div>
//                         ))}
//                       </div>

//                       <div className="text-center mt-4">
//                         <Typography variant="caption" className="opacity-60">
//                           Tap to flip card
//                         </Typography>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="text-center mt-4">
//               <Typography variant="body2" className="text-gray-600">
//                 Tap the card to see benefits on the back
//               </Typography>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//             <Button
//               onClick={handleDownloadPDF}
//               className="flex items-center justify-center px-6 py-4 bg-white border-2 border-[#0E3293] text-[#0E3293] font-semibold rounded-2xl hover:bg-[#0E3293] hover:text-white transition-all duration-200"
//             >
//               <Icon name="download" size="medium" color="currentColor" className="mr-2" />
//               Download PDF
//             </Button>
//             <Button
//               onClick={handleShareCard}
//               className="flex items-center justify-center px-6 py-4 bg-white border-2 border-[#0E3293] text-[#0E3293] font-semibold rounded-2xl hover:bg-[#0E3293] hover:text-white transition-all duration-200"
//             >
//               <Icon name="share" size="medium" color="currentColor" className="mr-2" />
//               Share Card
//             </Button>
//           </div>

//           {/* Upgrade Prompt for Free Users */}
//           {showUpgradePrompt && (
//             <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-200 rounded-2xl p-6">
//               <div className="text-center">
//                 <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                   <Icon name="star" size="medium" color="white" />
//                 </div>
//                 <Typography variant="h6" className="text-gray-900 font-bold mb-2">
//                   Unlock Premium Benefits
//                 </Typography>
//                 <Typography variant="body2" className="text-gray-600 mb-6">
//                   Upgrade your health card to access doctor consultations, medicine discounts, and exclusive health benefits.
//                 </Typography>
//                 <Button
//                   onClick={handleUpgrade}
//                   className="px-8 py-3 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
//                 >
//                   Upgrade Now
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

export default function HealthCardCardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center text-gray-700">
        <p className="text-lg font-semibold">Health Card</p>
        <p className="text-sm mt-2">This page is under construction.</p>
      </div>
    </div>
  );
}
