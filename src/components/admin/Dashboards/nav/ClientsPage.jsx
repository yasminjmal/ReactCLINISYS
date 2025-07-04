// Dans src/components/admin/Dashboards/nav/ClientsPage.jsx

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardService from '../../../../services/dashboardService';
import { WidgetContainer, LoadingIndicator } from './TicketsPage';

const ClientsPage = () => {
    const [period, setPeriod] = useState('thismonth');
    const [clientData, setClientData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // CORRECTION : Ajout des nouveaux filtres
    const periodOptions = [
        { key: 'thismonth', label: 'Ce mois-ci' },
        { key: 'thisyear', label: 'Cette Année' },
        { key: 'lastyear', label: 'Année Dernière' },
        { key: 'alltime', label: 'Historique' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await dashboardService.getClientActivity(period);
                const processedData = response.map(client => ({
                    ...client,
                    closedTickets: client.totalTickets - client.openTickets,
                }));
                setClientData(processedData);
            } catch (e) {
                console.error("Erreur ClientsPage", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [period]);

    return (
        <div className="animate-in fade-in-0">
            <WidgetContainer title="Activité par Client">
                <div className="flex justify-start gap-2 mb-4 flex-wrap">
                    {periodOptions.map(opt => (
                        <button key={opt.key} onClick={() => setPeriod(opt.key)} className={`px-3 py-1 text-xs font-semibold rounded ${period === opt.key ? 'bg-sky-500 text-white shadow' : 'bg-slate-100 dark:bg-slate-700'}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>

                {isLoading ? <LoadingIndicator /> : (
                    <ResponsiveContainer width="100%" height={500}>
                        <BarChart 
                            data={clientData} 
                            layout="vertical" 
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="clientName" width={150} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="closedTickets" stackId="a" name="Tickets Fermés" fill="#22c55e" />
                            <Bar dataKey="openTickets" stackId="a" name="Tickets Ouverts" fill="#f97316" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </WidgetContainer>
        </div>
    );
};

export default ClientsPage;