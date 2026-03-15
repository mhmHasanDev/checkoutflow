import React, { useEffect, useState } from 'react';
import { Page, Card, Layout, Text, Spinner, Banner } from '@shopify/polaris';
import axios from 'axios';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('/admin/dashboard')
            .then(res => { setStats(res.data); setLoading(false); })
            .catch(() => { setError('Failed to load dashboard'); setLoading(false); });
    }, []);

    if (loading) return <div style={{padding:'2rem',textAlign:'center'}}><Spinner /></div>;
    if (error) return <Banner tone="critical">{error}</Banner>;

    return (
        <Page title="CheckoutFlow Dashboard">
            <Layout>
                <Layout.Section>
                    <Card>
                        <div style={{padding:'1rem'}}>
                            <Text variant="headingMd">Store Overview</Text>
                            <div style={{marginTop:'1rem',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem'}}>
                                {[
                                    {label:'Plan', value: stats?.plan?.toUpperCase()},
                                    {label:'Total Forms', value: stats?.total_forms},
                                    {label:'Active Forms', value: stats?.active_forms},
                                    {label:'Submissions This Month', value: stats?.this_month},
                                ].map(({label, value}) => (
                                    <div key={label} style={{background:'#f6f6f7',borderRadius:'8px',padding:'1rem',textAlign:'center'}}>
                                        <Text tone="subdued">{label}</Text>
                                        <Text variant="headingLg">{value}</Text>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
