import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const GrowthEngineContext = createContext({});

export const useGrowthEngine = () => useContext(GrowthEngineContext);

export const GrowthEngineProvider = ({ children }) => {
    const { user } = useAuth();
    const [role, setRole] = useState(null); // 'admin', 'distributor', 'vendor', 'dealer'
    const [loadingRole, setLoadingRole] = useState(true);

    // Mock Data for Intelligence Layer

    // Super Feature 1: VelocityIQ Data
    const velocityData = {
        fastMovingSkus: [
            { sku: 'MIL-2804-20', name: 'M18 Brushless Hammer Drill', region: 'Southeast', velocity: 'High', stock: 15, skuVelocityScore: 94 },
            { sku: 'ORG-5542', name: 'Premium Work Gloves', region: 'Midwest', velocity: 'Very High', stock: 42, skuVelocityScore: 98 },
        ],
        slowMovingAlerts: [
            { sku: 'VAL-101', name: 'Winter Salt Mix 50lb', region: 'South', daysInStock: 120, suggestion: 'Discount by 15%', skuVelocityScore: 32 }
        ],
        seasonalDemand: [
            { category: 'Lawn & Garden', trend: '+15%', timing: 'Starts in 3 weeks (Spring Prep)', actionableInsight: 'Stock up on trimmers and fertilizers.' },
            { category: 'Snow Removal', trend: '-45%', timing: 'End of season', actionableInsight: 'Begin clearance and markdown strategy.' }
        ],
        reorderRecommendations: [
            { sku: 'DEW-20V-BAT', name: '20V Max Battery Pack', currentStock: 8, suggestedOrder: 40, urgency: 'High' }
        ]
    };

    // Super Feature 2: ShelfReady Data
    const shelfReadyData = {
        planograms: [
            { id: 'p1', title: 'Spring Endcap Display', category: 'Outdoor Power', url: 'https://images.unsplash.com/photo-1540575467063-17ebe8624387?auto=format&fit=crop&q=80&w=800' }
        ],
        trainingVideos: [
            { id: 'v1', title: 'Milwaukee M18 Value Pitch', duration: '3:45' }
        ],
        sellSheets: [
            { id: 's1', title: 'Q2 Promo Power Tools QR Sheet' }
        ]
    };

    // Super Feature 3: VendorScore Data
    const vendorScores = [
        { vendorId: 'v1', name: 'Milwaukee', reliability: 98, margin: 22, returns: 1.2, vendorReliabilityScore: 94, status: 'Ready for Expansion' },
        { vendorId: 'v3', name: 'Valvoline', reliability: 85, margin: 15, returns: 4.5, vendorReliabilityScore: 72, status: 'Needs Improvement' },
        { vendorId: 'v4', name: 'Acme Unknown', reliability: 60, margin: 10, returns: 8.0, vendorReliabilityScore: 45, status: 'High Risk' }
    ];

    // Super Feature 4: DealerBoost Data
    const dealerBoostData = {
        categoryGrowth: [
            { category: 'Power Tools', growth: '+24%', comparedToRegion: '+5%', dealerGrowthScore: 88 },
            { category: 'Plumbing', growth: '-2%', comparedToRegion: '-8%', dealerGrowthScore: 42 }
        ],
        automatedInsights: [
            "Your outdoor power category is performing below regional average.",
            "Stock up on M18 batteries; regional demand is spiking earlier than last year."
        ]
    };

    // Super Feature 5: RetailSync Data
    const retailSyncAssets = [
        { sku: 'MIL-2804-20', seoTitle: 'Milwaukee M18 Brushless Hammer Drill Kit | Best Price', tags: 'power tools, milwaukee, hammer drill, m18', imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800' }
    ];

    // New Intelligence Features Data
    const opportunities = [
        { type: 'Category Growth', title: 'Lawn & Garden Splitting', description: 'Early spring demand spiking in Midwest region. +18% WoW.', urgency: 'High' },
        { type: 'Vendor Outperformance', title: 'Milwaukee Tool Surging', description: 'Vendor is converting at 15% above category average.', urgency: 'Medium' },
        { type: 'Underperforming', title: 'HVAC Supplies Stagnant', description: 'Dealer sales down 12% compared to regional benchmark.', urgency: 'Medium' }
    ];

    const distributorData = {
        dealerRankings: [
            { id: 'd1', name: 'Acme Hardware', region: 'Northeast', growthScore: 92, status: 'Top Performer' },
            { id: 'd2', name: 'Bob\'s Tools', region: 'South', growthScore: 45, status: 'Declining' }
        ],
        regionalMetrics: [
            { region: 'Northeast', topCategory: 'Hand Tools', underperformingCategory: 'Plumbing', growth: '+5%' },
            { region: 'South', topCategory: 'Outdoor Power', underperformingCategory: 'HVAC', growth: '-2%' }
        ]
    };

    useEffect(() => {
        async function fetchRole() {
            if (!user) {
                setLoadingRole(false);
                return;
            }

            // Bootstrap override matching AdminRoute
            if (user.email === 'ronald@cdhassociates.com') {
                setRole('admin');
                setLoadingRole(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                if (!error && data) {
                    setRole(data.role);
                } else {
                    setRole('dealer'); // Default fallback
                }
            } catch (err) {
                setRole('dealer');
            }
            setLoadingRole(false);
        }

        fetchRole();
    }, [user]);

    const value = {
        role,
        loadingRole,
        velocityData,
        shelfReadyData,
        vendorScores,
        dealerBoostData,
        retailSyncAssets,
        opportunities,
        distributorData
    };

    return (
        <GrowthEngineContext.Provider value={value}>
            {children}
        </GrowthEngineContext.Provider>
    );
};
