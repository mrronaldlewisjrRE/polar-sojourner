import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    PackageSearch,
    ShieldCheck,
    BarChart3,
    Globe,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    AlertCircle,
    Activity,
    ShoppingCart,
    Map,
    ChevronRight,
    Info,
    Rocket,
    CloudSun,
    Trophy
} from 'lucide-react';
import { useGrowthEngine } from '../../contexts/GrowthEngineContext';

export default function GrowthEngineDashboard() {
    const {
        role,
        loadingRole,
        velocityData,
        shelfReadyData,
        vendorScores,
        dealerBoostData,
        retailSyncAssets,
        opportunities,
        distributorData
    } = useGrowthEngine();

    const [expandedPanels, setExpandedPanels] = useState({
        opportunities: true,
        inventory: true,
        seasonal: false,
        merchandising: false,
        vendor: true,
        dealer: false,
        digital: false,
        distributor: role === 'admin' || role === 'distributor'
    });

    if (loadingRole) {
        return <div className="p-8 text-center text-gray-500">Loading Channel Growth Engine...</div>;
    }

    const unreadyVendors = (Array.isArray(vendorScores) ? vendorScores : []).filter(v => v.status === 'Needs Improvement' || v.status === 'High Risk').length;

    // Safety Fallbacks for context data
    const safeVelocity = velocityData || { fastMovingSkus: [], slowMovingAlerts: [], seasonalDemand: [], reorderRecommendations: [] };
    const safeShelf = shelfReadyData || { planograms: [], trainingVideos: [], sellSheets: [] };
    const safeDealer = dealerBoostData || { categoryGrowth: [], automatedInsights: [] };
    const safeSync = retailSyncAssets || [];
    const safeOpps = opportunities || [];
    const safeDistributor = distributorData || { dealerRankings: [], regionalMetrics: [] };

    const togglePanel = (panelId) => {
        setExpandedPanels(prev => ({
            ...prev,
            [panelId]: !prev[panelId]
        }));
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cdh-red/10 rounded-lg">
                            <Activity className="text-cdh-red" size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Channel Growth Engine</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Unified intelligence for velocity, readiness, and dealer success.
                        Role constraints active: <span className="uppercase text-xs font-bold tracking-wider ml-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{role}</span>
                    </p>
                </div>
            </header>

            {/* Intelligence Bar */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <InsightCard
                    title="High Velocity Items"
                    value={safeVelocity.fastMovingSkus.length.toString()}
                    subtitle="Fast turning SKUs"
                    icon={<TrendingUp className="text-green-500" size={24} />}
                />
                <InsightCard
                    title="Slow Movers"
                    value={safeVelocity.slowMovingAlerts.length.toString()}
                    subtitle="Below target velocity"
                    icon={<BarChart3 className="text-blue-500" size={24} />}
                />
                <InsightCard
                    title="Growth Opps"
                    value={safeOpps.length.toString()}
                    subtitle="Emerging market trends"
                    icon={<Rocket className="text-indigo-500" size={24} />}
                />
                <InsightCard
                    title="Reorder Alerts"
                    value={safeVelocity.reorderRecommendations.length.toString()}
                    subtitle="Immediate action required"
                    icon={<AlertCircle className="text-orange-500" size={24} />}
                />
                <InsightCard
                    title="Vendor Alerts"
                    value={unreadyVendors.toString()}
                    subtitle="Reliability risks flagged"
                    icon={<AlertTriangle className="text-red-500" size={24} />}
                />
            </div>

            {/* Unified Panels */}
            <div className="space-y-4 pt-4">

                {/* Growth Opportunities */}
                <CollapsiblePanel
                    id="opportunities"
                    title="Growth Opportunities"
                    icon={<Rocket size={20} className="text-indigo-500" />}
                    isExpanded={expandedPanels.opportunities}
                    onToggle={() => togglePanel('opportunities')}
                    allowedRoles={['admin', 'distributor', 'dealer', 'vendor']}
                    userRole={role}
                    infoNote="Surfaces emerging trends and revenue opportunities requiring immediate attention."
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(Array.isArray(safeOpps) ? safeOpps : []).map((opp, i) => (
                            <div key={i} className="bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-gray-800 border border-indigo-100 dark:border-indigo-900/50 p-5 rounded-lg flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase rounded">{opp.type}</span>
                                        {opp.urgency === 'High' && <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 uppercase"><Activity size={12} /> High Urgency</span>}
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">{opp.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{opp.description}</p>
                                </div>
                                <button className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all">
                                    Explore Opportunity <ChevronRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </CollapsiblePanel>

                {/* Seasonal Intelligence */}
                <CollapsiblePanel
                    id="seasonal"
                    title="Seasonal Intelligence"
                    icon={<CloudSun size={20} className="text-yellow-600 dark:text-yellow-500" />}
                    isExpanded={expandedPanels.seasonal}
                    onToggle={() => togglePanel('seasonal')}
                    allowedRoles={['admin', 'distributor', 'dealer', 'vendor']}
                    userRole={role}
                    infoNote="Reveals seasonal demand patterns to help plan inventory and promotions ahead of time."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(Array.isArray(safeVelocity?.seasonalDemand) ? safeVelocity?.seasonalDemand : []).map((season, i) => {
                            const isPositive = season.trend.startsWith('+');
                            return (
                                <div key={i} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${isPositive ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                                        <TrendingUp size={24} className={isPositive ? '' : 'transform rotate-180'} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900 dark:text-white">{season.category}</h3>
                                            <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{season.trend}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Timing: {season.timing}</p>
                                        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-2 text-xs text-yellow-800 dark:text-yellow-300 rounded font-medium">
                                            💡 {season.actionableInsight}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CollapsiblePanel>

                {/* Inventory & Velocity Insights */}
                <CollapsiblePanel
                    id="inventory"
                    title="Inventory & Velocity Insights"
                    icon={<TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />}
                    isExpanded={expandedPanels.inventory}
                    onToggle={() => togglePanel('inventory')}
                    allowedRoles={['admin', 'distributor', 'vendor']}
                    userRole={role}
                    infoNote="Identifies fast-moving items, slow stock, and when to reorder to maintain optimal inventory."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Fast-Moving SKUs</h3>
                            <div className="space-y-2">
                                {(Array.isArray(safeVelocity?.fastMovingSkus) ? safeVelocity?.fastMovingSkus : []).map((sku, i) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3 border border-gray-100 dark:border-gray-800">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-sm dark:text-gray-200">{sku.name}</p>
                                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded">
                                                    Velocity: {sku.velocity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">SKU: {sku.sku} • Stock: {sku.stock} • Region: {sku.region}</p>
                                            <div className="mt-2 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                SKU Velocity Score:
                                                <ScoreBadge score={sku.skuVelocityScore} />
                                            </div>
                                        </div>
                                        <Link to="/new-order" className="shrink-0 text-xs font-bold bg-white text-cdh-red border border-cdh-red/30 px-3 py-1.5 rounded hover:bg-cdh-red hover:text-white transition-colors text-center dark:bg-gray-800 dark:hover:bg-cdh-red">
                                            Reorder Now
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <AlertCircle size={16} className="text-orange-500" /> Actionable Reorder Alerts
                            </h3>
                            <div className="space-y-2">
                                {(Array.isArray(safeVelocity?.reorderRecommendations) ? safeVelocity?.reorderRecommendations : []).map((rec, i) => (
                                    <div key={i} className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{rec.name}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Stock Left: <span className="text-red-600 font-bold">{rec.currentStock}</span> • Suggested: {rec.suggestedOrder}</p>
                                        </div>
                                        <Link to="/vendors" className="shrink-0 text-xs font-bold bg-white dark:bg-gray-800 text-orange-600 border border-orange-200 dark:border-orange-800 px-3 py-1.5 rounded hover:bg-orange-600 hover:text-white transition-colors text-center">
                                            View Supplier Options
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CollapsiblePanel>

                {/* Distributor Performance View */}
                <CollapsiblePanel
                    id="distributor"
                    title="Distributor Performance View"
                    icon={<Trophy size={20} className="text-emerald-600 dark:text-emerald-400" />}
                    isExpanded={expandedPanels.distributor}
                    onToggle={() => togglePanel('distributor')}
                    allowedRoles={['admin', 'distributor']}
                    userRole={role}
                    infoNote="Compares dealer and regional performance to support strategic growth decisions."
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Dealer Rankings</h3>
                            <div className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500">
                                        <tr>
                                            <th className="px-4 py-2 font-semibold">Dealer</th>
                                            <th className="px-4 py-2 font-semibold">Region</th>
                                            <th className="px-4 py-2 font-semibold">Growth Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                        {(Array.isArray(safeDistributor?.dealerRankings) ? safeDistributor?.dealerRankings : []).map((dealer, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{dealer.name}</td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{dealer.region}</td>
                                                <td className="px-4 py-3">
                                                    <ScoreBadge score={dealer.growthScore} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Regional Category Metrics</h3>
                            <div className="space-y-3">
                                {(Array.isArray(safeDistributor?.regionalMetrics) ? safeDistributor?.regionalMetrics : []).map((rm, i) => (
                                    <div key={i} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Map size={16} className="text-cdh-red" /> {rm.region}
                                            </h4>
                                            <span className={`font-bold text-xs px-2 py-0.5 rounded ${rm.growth.startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                                                {rm.growth} Overall
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-2 mt-3">
                                            <p><strong className="block text-gray-900 dark:text-gray-300">Top Category</strong> {rm.topCategory}</p>
                                            <p><strong className="block text-gray-900 dark:text-gray-300">Underperforming</strong> {rm.underperformingCategory}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CollapsiblePanel>

                {/* Dealer Growth Insights */}
                <CollapsiblePanel
                    id="dealer"
                    title="Dealer Growth Insights"
                    icon={<BarChart3 size={20} className="text-blue-600 dark:text-blue-400" />}
                    isExpanded={expandedPanels.dealer}
                    onToggle={() => togglePanel('dealer')}
                    allowedRoles={['admin', 'distributor', 'dealer']}
                    userRole={role}
                    infoNote="Highlights growth opportunities and category improvements based on regional benchmarks."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Performance vs Benchmarks</h3>
                            <div className="space-y-3">
                                {(Array.isArray(safeDealer?.categoryGrowth) ? safeDealer?.categoryGrowth : []).map((g, i) => {
                                    const isPositive = g.comparedToRegion.startsWith('+');
                                    return (
                                        <div key={i} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-sm dark:text-gray-200">{g.category}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-gray-500">Growth: {g.growth}</p>
                                                    <span className="text-[10px] text-gray-400">|</span>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">Score: <ScoreBadge score={g.dealerGrowthScore} small /></p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {g.comparedToRegion}
                                                </p>
                                                <p className="text-[10px] text-gray-400 uppercase">vs Region</p>
                                                {!isPositive && (
                                                    <button onClick={() => togglePanel('merchandising')} className="mt-1 text-[10px] font-bold text-blue-600 hover:underline">
                                                        View Merchandising Guidance &rarr;
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <Activity size={16} className="text-purple-500" /> Automated AI Insights
                            </h3>
                            <div className="space-y-2">
                                {(Array.isArray(safeDealer?.automatedInsights) ? safeDealer?.automatedInsights : []).map((insight, i) => (
                                    <div key={i} className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-lg text-sm text-purple-900 dark:text-purple-300">
                                        {insight}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CollapsiblePanel>

                {/* Vendor Performance Intelligence */}
                <CollapsiblePanel
                    id="vendor"
                    title="Vendor Performance Intelligence"
                    icon={<ShieldCheck size={20} className="text-red-600 dark:text-red-400" />}
                    isExpanded={expandedPanels.vendor}
                    onToggle={() => togglePanel('vendor')}
                    allowedRoles={['admin', 'distributor', 'vendor']}
                    userRole={role}
                    infoNote="Evaluates supplier reliability, margins, and performance to reduce risk and improve profitability."
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Vendor / Manufacturer</th>
                                    <th className="px-4 py-3 font-semibold">Reliability</th>
                                    <th className="px-4 py-3 font-semibold">Reliability Score</th>
                                    <th className="px-4 py-3 font-semibold">Return Rate</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {(Array.isArray(vendorScores) ? vendorScores : []).map((v, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">{v.name}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className={`h-full ${v.reliability > 90 ? 'bg-green-500' : v.reliability > 75 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${v.reliability}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-500">{v.reliability}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><ScoreBadge score={v.vendorReliabilityScore} /></td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.returns}%</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded ${v.status === 'Ready for Expansion' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    v.status === 'High Risk' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {v.status === 'High Risk' && (
                                                <Link to="/vendors" className="text-xs font-bold text-cdh-red hover:underline flex items-center gap-1 border border-cdh-red/30 px-2 py-1 rounded hover:bg-cdh-red/10 w-fit">
                                                    View Alternatives <ChevronRight size={14} />
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CollapsiblePanel>

                {/* Merchandising & Sell-Through Resources */}
                <CollapsiblePanel
                    id="merchandising"
                    title="Merchandising & Sell-Through Resources"
                    icon={<PackageSearch size={20} className="text-teal-600 dark:text-teal-400" />}
                    isExpanded={expandedPanels.merchandising}
                    onToggle={() => togglePanel('merchandising')}
                    allowedRoles={['admin', 'distributor', 'dealer']}
                    userRole={role}
                    infoNote="Provides display guidance and training tools to improve in-store product visibility and sales."
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Active Planograms</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(Array.isArray(safeShelf?.planograms) ? safeShelf?.planograms : []).map((p, i) => (
                                    <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group">
                                        <div className="h-32 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                            <img src={p.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-3 bg-white dark:bg-gray-800">
                                            <p className="font-semibold text-sm dark:text-white">{p.title}</p>
                                            <p className="text-xs text-gray-500">{p.category}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Quick Resources</h3>
                            <div className="space-y-2">
                                {(Array.isArray(safeShelf?.trainingVideos) ? safeShelf?.trainingVideos : []).map((v, i) => (
                                    <button key={i} className="w-full text-left p-3 text-sm bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-lg transition-colors flex justify-between items-center">
                                        <span className="dark:text-gray-300 font-medium">{v.title}</span>
                                        <span className="text-xs text-gray-400">{v.duration}</span>
                                    </button>
                                ))}
                                {(Array.isArray(safeShelf?.sellSheets) ? safeShelf?.sellSheets : []).map((s, i) => (
                                    <button key={i} className="w-full text-left p-3 text-sm bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium border border-blue-100 dark:border-blue-900/30">
                                        Download: {s.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CollapsiblePanel>

                {/* Digital Sales Acceleration */}
                <CollapsiblePanel
                    id="digital"
                    title="Digital Sales Acceleration"
                    icon={<Globe size={20} className="text-purple-600 dark:text-purple-400" />}
                    isExpanded={expandedPanels.digital}
                    onToggle={() => togglePanel('digital')}
                    allowedRoles={['admin', 'distributor', 'dealer', 'vendor']}
                    userRole={role}
                    infoNote="Supplies ready-to-use product content and tools to help dealers sell online quickly."
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(Array.isArray(safeSync) ? safeSync : []).map((asset, i) => (
                            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
                                <div className="h-40 bg-gray-100 dark:bg-gray-800 p-2 flex items-center justify-center">
                                    <img src={asset.imageUrl} alt={asset.sku} className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-800 flex-1 flex flex-col">
                                    <p className="text-xs font-bold text-gray-400 mb-1">{asset.sku}</p>
                                    <p className="font-semibold text-sm dark:text-white leading-tight mb-2 line-clamp-2">{asset.seoTitle}</p>
                                    <p className="text-xs text-gray-500 line-clamp-2 flex-1">Tags: {asset.tags}</p>
                                    <button className="w-full mt-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded hover:opacity-90 transition-opacity">
                                        Export CSV for Shopify
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsiblePanel>

            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------

function InsightCard({ title, value, subtitle, icon }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-start justify-between hover:border-cdh-red/30 transition-colors cursor-pointer">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {icon}
            </div>
        </div>
    );
}

function ScoreBadge({ score, small = false }) {
    const isGood = score >= 80;
    const isWarn = score >= 60 && score < 80;

    return (
        <span className={`font-bold rounded-full ${small ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'} ${isGood ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                isWarn ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {score}
        </span>
    );
}

function CollapsiblePanel({ title, icon, isExpanded, onToggle, allowedRoles, userRole, infoNote, children }) {
    const isAllowed = allowedRoles.includes(userRole) || userRole === 'admin';

    if (!isAllowed) return null;

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
            <button
                onClick={onToggle}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 rounded-lg">
                        {icon}
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {title}
                        </h2>
                        {infoNote && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 tracking-wide font-normal max-w-xl">
                                {infoNote}
                            </p>
                        )}
                    </div>
                </div>
                <div className="text-gray-400 dark:text-gray-500 ml-4 shrink-0">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </button>
            <div
                className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100 block' : 'max-h-0 opacity-0 hidden'}`}
            >
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                    {children}
                </div>
            </div>
        </div>
    );
}
