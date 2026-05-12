import { useEffect, useState } from "react";
import { api } from "../../services/api-client";
import { Card } from "../ui/card";

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCampaigns().then(setCampaigns).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading campaigns...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ad Campaigns</h1>
      <div className="grid gap-4">
        {campaigns.map(c => (
          <Card key={c.id} className="p-4 flex justify-between">
            <div>
              <div className="font-bold">{c.name}</div>
              <div className="text-sm text-gray-500">{c.platform}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-orange-600">Spend: AED {c.spend}</div>
              <div className="text-sm text-emerald-600">Rev: AED {c.revenue}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
